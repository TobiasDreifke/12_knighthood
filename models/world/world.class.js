/**
 * Orchestrates the entire game: level assembly, rendering, collisions, projectiles,
 * game state transitions, and hero lifecycle management.
 */
class World {
	levelAssembler = new LevelAssembler();
	worldInitializer = new WorldInitializer(EntityUtils);
	collisionSystem = new CollisionSystem();
	throwController = new ThrowController();
	renderLoop = new RenderLoop();
	enemyActivationSystem = new EnemyActivationSystem();
	intervalManager = new IntervalManager();
	gameStateUI = new GameStateUI();
	entityUtils = EntityUtils;
	gameStats = new GameStats();

	heroCharacter = new Hero();
	statusBarHealth = new StatusbarHealth();
	StatusbarHoly = new StatusbarHoly();
	StatusbarDark = null;

	throwableHoly = [];
	throwableDark = [];
	darkAmmo = [];
	holyAmmo = [];
	heroinventory = [];
	overlayObjects = [];
	lastDarkThrow = 0;
	lastHolyThrow = 0;
	darkCooldownMs = 1000;
	holyCooldownMs = 500;

	winSequenceStarted = false;
	gameOverSequenceStarted = false;
	inputLocked = false;
	isWinSequenceActive = false;
	isLoseSequenceActive = false;
	isPaused = false;
	hasStarted = false;

	levelIndex = 0;
	level = null;

	canvas;
	ctx;
	keyboard;
	camera_x = 0;

	/**
	 * @param {HTMLCanvasElement} canvasPara
	 * @param {KeyboardMapping} keyboardPara
	 * @param {number} [levelIndex=0]
	 */
	constructor(canvasPara, keyboardPara, levelIndex = 0) {
		this.ctx = canvasPara.getContext("2d");
		this.canvas = canvasPara;
		this.keyboard = keyboardPara;
		this.levelIndex = levelIndex;
		this.level = this.resolveLevel(levelIndex);
		const levelOverlays = Array.isArray(this.level?.overlays) ? this.level.overlays : [];
		this.overlayObjects = levelOverlays;
		if (this.level && !Array.isArray(this.level.overlays)) {
			this.level.overlays = levelOverlays;
		}
		this.StatusbarDark = new StatusbarDark();
		this.setWorld();
	}

	/**
	 * Builds the requested level using the configured builders/data tables.
	 *
	 * @param {number} index
	 * @returns {Level}
	 */
	resolveLevel(index) {
		const builders = typeof GAME_LEVEL_BUILDERS !== "undefined" ? GAME_LEVEL_BUILDERS : null;
		const levels = typeof GAME_LEVELS !== "undefined" ? GAME_LEVELS : null;
		return this.levelAssembler.buildLevel(index, builders, levels);
	}

	/**
	 * Boots the world: resumes audio, starts rendering and interval loops.
	 */
	start() {
		this.hasStarted = true;
		this.isPaused = false;
		this.isRunning = true;
		this.gameStats?.markGameStart();
		AudioHub.playGameplayMusic();
		this.draw();  
		this.run();   
	}

	/**
	 * Invokes the world initializer so hero, UI, and systems receive references.
	 */
	setWorld() {
		this.worldInitializer.initialize(this);
	}

	/**
	 * Starts the recurring intervals that drive collisions and projectile cooldowns.
	 */
	run() {
		this.intervalManager.start(() => {
			if (this.isPaused) return;
			this.checkCollisions();
		}, 80);

		this.intervalManager.start(() => {
			if (this.isPaused) return;
			this.throwHoly();
			this.throwDark();
		}, 10);
	}

	/**
	 * Stops every interval managed by the world.
	 */
	stopAllIntervals() {
		this.intervalManager.stopAll();
	}

	/**
	 * Stops each enemy's timers/intervals, optionally skipping some via predicate.
	 *
	 * @param {(enemy:any) => boolean|null} [excludePredicate=null]
	 */
	stopAllEnemyActivity(excludePredicate = null) {
		if (!this.level || !Array.isArray(this.level.enemies)) return;
		this.level.enemies.forEach(enemy => {
			if (!enemy) return;
			if (typeof excludePredicate === 'function' && excludePredicate(enemy)) {
				return;
			}
			if (typeof enemy.stopAllActivity === 'function') {
				enemy.stopAllActivity();
			} else if (enemy.animationInterval) {
				clearInterval(enemy.animationInterval);
				enemy.animationInterval = null;
			}
		});
	}

	/**
	 * Stops all activity and clears transient world state without reloading the page.
	 */
	destroy() {
		this.stopAllIntervals();
		this.renderLoop?.stop?.();
		this.stopAllEnemyActivity();
		this.gameStateUI?.hideScreens?.();
		this.throwableHoly = [];
		this.throwableDark = [];
		this.darkAmmo = [];
		this.holyAmmo = [];
		this.overlayObjects = [];
		this.unlockInput();
		this.inputLocked = false;
		this.isPaused = false;
		this.hasStarted = false;
		this.isRunning = false;
	}

	/**
	 * Prevents further keyboard input and clears any pressed keys.
	 */
	lockInput() {
		this.inputLocked = true;
		if (this.keyboard) {
			for (const key in this.keyboard) {
				if (Object.prototype.hasOwnProperty.call(this.keyboard, key)) {
					this.keyboard[key] = false;
				}
			}
		}
	}

	/**
	 * Allows keyboard input again after a pause or modal interaction.
	 */
	unlockInput() {
		this.inputLocked = false;
	}

	/**
	 * Pauses the game if possible, locking inputs and stopping idle loops.
	 *
	 * @returns {boolean}
	 */
	pauseGame() {
		if (this.isPaused || !this.hasStarted || this.gameOverSequenceStarted || this.winSequenceStarted || this.isWinSequenceActive) return false;
		this.isPaused = true;
		this.lockInput();
		if (this.heroCharacter) {
			this.heroCharacter.setControlsLocked(true);
		}
		AudioHub.stopHeroIdleLoop();
		return true;
	}

	/**
	 * Resumes gameplay after a pause if the world is in a resumable state.
	 *
	 * @returns {boolean}
	 */
	resumeGame() {
		if (!this.isPaused) return false;
		this.isPaused = false;
		this.unlockInput();
		if (this.heroCharacter) {
			this.heroCharacter.setControlsLocked(false);
		}
		return true;
	}

	/**
	 * Syncs dark/holy ammo counters to the HUD.
	 */
	updateAmmoBars() {
		if (this.StatusbarDark?.setAmmoCount) {
			this.StatusbarDark.setAmmoCount(this.darkAmmo.length);
		}
		if (this.StatusbarHoly?.setAmmoCount) {
			this.StatusbarHoly.setAmmoCount(this.holyAmmo.length);
		}
	}

	/**
	 * Attempts to spawn a holy projectile if cooldown/ammo allow it.
	 */
	throwHoly() {
		this.throwController.tryHoly(this);
	}

	/**
	 * Attempts to spawn a dark projectile if cooldown/ammo allow it.
	 */
	throwDark() {
		this.throwController.tryDark(this);
	}

	/**
	 * @returns {boolean} True if a dark projectile can currently be thrown.
	 */
	canThrowDark() {
		return this.throwController.canThrowDark(this);
	}

	/**
	 * @returns {boolean} True if a holy projectile can currently be thrown.
	 */
	canThrowHoly() {
		return this.throwController.canThrowHoly(this);
	}

	/**
	 * Runs the collision system once for the current world state.
	 */
	checkCollisions() {
		this.collisionSystem.update(this);
	}

	/**
	 * Delegates rendering to the render loop while keeping reference to this world.
	 */
	draw() {
		this.renderLoop.render(this);
	}

	/**
	 * Runs the enemy activation system to wake/hibernate enemies as needed.
	 */
	updateEnemyActivation() {
		this.enemyActivationSystem.update(this);
	}

	/**
	 * Locks controls, stops enemies, and schedules the win screen animation flow.
	 *
	 * @param {object|null} finalEnemy
	 */
	startWinSequence(finalEnemy = null) {
		if (this.winSequenceStarted) return;
		this.winSequenceStarted = true;
		this.gameStats?.markWin();
		this.lockInput();
		this.stopAllIntervals();
		this.stopAllEnemyActivity(enemy => enemy?.constructor?.name === 'SkeletonBoss');
		this.isWinSequenceActive = true;
		this.heroCharacter.setControlsLocked(true);
		this.heroCharacter.startWinCelebration();
		AudioHub.stopAll();
		this.playFinalEnemyDeathSound(finalEnemy);
		AudioHub.playGameplayMusic();
		const celebrationDuration = (this.heroCharacter.getCelebrationDuration() || 0) + 500;
		this.gameStateUI.scheduleWinScreen(this, celebrationDuration);
	}

	/**
	 * Initiates the lose state, freezing input and waiting for death animations.
	 */
	startGameOverSequence() {
		if (this.gameOverSequenceStarted) return;
		this.gameOverSequenceStarted = true;
		this.lockInput();
		this.heroCharacter.setControlsLocked(true);
		this.isLoseSequenceActive = true;
		const loseDelay = Math.max(
			1000,
			this.heroCharacter?.getDeathAnimationDuration?.() ?? 0
		);
		setTimeout(() => this.finishGameOverSequence(), loseDelay);
	}

	/**
	 * Cleans up after the lose delay and shows the game over overlay.
	 */
	finishGameOverSequence() {
		this.stopAllIntervals();
		this.stopAllEnemyActivity();
		this.isLoseSequenceActive = false;
		AudioHub.stopAll();
		this.gameStateUI.showGameOverScreen(this);
	}

	/**
	 * Plays the bespoke death sound for the last defeated boss, if defined.
	 *
	 * @param {object|null} enemy
	 */
	playFinalEnemyDeathSound(enemy) {
		if (!enemy) return;
		const soundMap = {
			SkeletonBoss: AudioHub.SKELETON_DEAD,
		};
		const key = enemy.constructor?.name;
		const sound = key ? soundMap[key] : null;
		if (sound) {
			AudioHub.playOne(sound);
		}
	}
}

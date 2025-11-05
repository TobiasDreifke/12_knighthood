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
	isPaused = false;
	hasStarted = false;

	levelIndex = 0;
	level = null;

	canvas;
	ctx;
	keyboard;
	camera_x = 0;

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

	resolveLevel(index) {
		const builders = typeof GAME_LEVEL_BUILDERS !== "undefined" ? GAME_LEVEL_BUILDERS : null;
		const levels = typeof GAME_LEVELS !== "undefined" ? GAME_LEVELS : null;
		return this.levelAssembler.buildLevel(index, builders, levels);
	}

	start() {
		this.hasStarted = true;
		this.isPaused = false;
		this.isRunning = true;
		AudioHub.playGameplayMusic();
		this.draw();  // start rendering loop
		this.run();   // start intervals (collision checking, throwing, etc.)
	}
	setWorld() {
		this.worldInitializer.initialize(this);
	}

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

	stopAllIntervals() {
		this.intervalManager.stopAll();
	}

	stopAllEnemyActivity() {
		if (!this.level || !Array.isArray(this.level.enemies)) return;
		this.level.enemies.forEach(enemy => {
			if (!enemy) return;
			if (typeof enemy.stopAllActivity === 'function') {
				enemy.stopAllActivity();
			} else if (enemy.animationInterval) {
				clearInterval(enemy.animationInterval);
				enemy.animationInterval = null;
			}
		});
	}

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

	unlockInput() {
		this.inputLocked = false;
	}

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

	resumeGame() {
		if (!this.isPaused) return false;
		this.isPaused = false;
		this.unlockInput();
		if (this.heroCharacter) {
			this.heroCharacter.setControlsLocked(false);
		}
		return true;
	}

	togglePause() {
		if (this.isPaused) {
			return this.resumeGame();
		}
		return this.pauseGame();
	}

	updateAmmoBars() {
		if (this.StatusbarDark?.setAmmoCount) {
			this.StatusbarDark.setAmmoCount(this.darkAmmo.length);
		}
		if (this.StatusbarHoly?.setAmmoCount) {
			this.StatusbarHoly.setAmmoCount(this.holyAmmo.length);
		}
	}

	throwHoly() {
		this.throwController.tryHoly(this);
	}

	throwDark() {
		this.throwController.tryDark(this);
	}

	canThrowDark() {
		return this.throwController.canThrowDark(this);
	}

	canThrowHoly() {
		return this.throwController.canThrowHoly(this);
	}



	checkInventory() {
		CurrentInventory = this.heroinventory;
		console.log("current inventory list" + CurrentInventory);
	}

	checkCollisions() {
		this.collisionSystem.update(this);
	}


	draw() {
		this.renderLoop.render(this);
	}
	updateEnemyActivation() {
		this.enemyActivationSystem.update(this);
	}

	startWinSequence() {
		if (this.winSequenceStarted) return;
		this.winSequenceStarted = true;
		this.lockInput();
		this.stopAllIntervals();
		this.stopAllEnemyActivity();
		this.isWinSequenceActive = true;
		this.heroCharacter.setControlsLocked(true);
		this.heroCharacter.startWinCelebration();
		AudioHub.stopAll();
		const celebrationDuration = (this.heroCharacter.getCelebrationDuration() || 0) + 500;
		this.gameStateUI.scheduleWinScreen(this, celebrationDuration);
	}

	startGameOverSequence() {
		if (this.gameOverSequenceStarted) return;
		this.gameOverSequenceStarted = true;
		this.lockInput();
		this.stopAllIntervals();
		this.stopAllEnemyActivity();
		this.heroCharacter.setControlsLocked(true);
		AudioHub.stopAll();
		this.gameStateUI.showGameOverScreen(this);
	}
}


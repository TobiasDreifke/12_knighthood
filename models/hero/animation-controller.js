/**
 * Runs the hero's animation finite-state machine, syncing sprite playback with movement,
 * combat, casting, celebration, and accompanying AudioHub cues.
 */
class HeroAnimationController {
	/**
	 * @param {Hero} hero - Instance whose animation state should be orchestrated.
	 */
	constructor(hero) {
		this.hero = hero;
		this.intervalId = null;
		this.animationFps = 25;
	}

	/**
	 * Starts the animation polling loop, ensuring any previous interval is cleared first.
	 */
	start() {
		this.stop();
		const frameMs = 1000 / this.animationFps;
		this.intervalId = setInterval(() => this.updateFrame(), frameMs);
	}

	/**
	 * Stops the polling loop if one is currently active.
	 */
	stop() {
		if (!this.intervalId) return;
		clearInterval(this.intervalId);
		this.intervalId = null;
	}

	/**
	 * Evaluates keyboard input, updates movement state, and selects the highest-priority animation.
	 */
	updateFrame() {
		if (this.shouldSkipAnimation()) return;
		const hero = this.hero;
		const keyboard = hero.world?.keyboard ?? {};
		const movementState = hero.applyMovementInput(keyboard);
		this.updateGroundState(hero);
		if (!this.playPriorityAnimation(keyboard, movementState)) {
			this.playMovementAnimation(keyboard);
		}
		hero.updateCameraPosition();
	}

	/**
	 * @returns {boolean} Whether animation should be paused (e.g., sword draw or paused world).
	 */
	shouldSkipAnimation() {
		const hero = this.hero;
		if (hero.world?.isPaused) return true;
		return hero.isDrawingSword;
	}

	/**
	 * Syncs grounded state transitions and emits a land sound when touching down.
	 *
	 * @param {Hero} hero
	 */
	updateGroundState(hero) {
		const wasGrounded = hero.wasOnGround;
		const isGrounded = !hero.isAboveGround();
		if (!wasGrounded && isGrounded) {
			AudioHub.playOne(AudioHub.FALL_HERO);
		}
		hero.wasOnGround = isGrounded;
	}

	/**
	 * Checks animation states in descending priority order (celebration → slide) and runs the first match.
	 *
	 * @param {Keyboard} keyboard
	 * @param {{slidePressed?: boolean}} movementState
	 * @returns {boolean} True when a priority animation consumed the frame.
	 */
	playPriorityAnimation(keyboard, movementState) {
		const hero = this.hero;
		hero.resetHurtBox();
		if (this.handleCelebrationState()) return true;
		if (this.handleDeathState()) return true;
		hero.deathSoundPlayed = false;
		if (this.handleHurtState()) return true;
		if (this.handleAttackState()) return true;
		if (this.handleCastState()) return true;
		if (this.handleAttackInput(keyboard)) return true;
		return this.handleSlideState(movementState);
	}

	/**
	 * Plays the celebration sequence if the win routine is active.
	 *
	 * @returns {boolean}
	 */
	handleCelebrationState() {
		if (!this.hero.isCelebrating) return false;
		AudioHub.stopHeroIdleLoop();
		this.handleCelebration();
		return true;
	}

	/**
	 * Handles hero death animation, including one-shot SFX playback.
	 */
	handleDeathState() {
		const hero = this.hero;
		if (!hero.isDead) return false;
		AudioHub.stopHeroIdleLoop();
		if (!hero.deathSoundPlayed) {
			AudioHub.playHeroDeath();
			hero.deathSoundPlayed = true;
		}
		const frames = hero.hasSword ? hero.frames.DEAD_SWORD : hero.frames.DEAD;
		hero.playAnimationWithSpeed(frames, 14, false);
		return true;
	}

	/**
	 * Plays the hurt animation and SFX once before returning to idle or walk.
	 */
	handleHurtState() {
		const hero = this.hero;
		if (!hero.isHurt) return false;
		AudioHub.stopHeroIdleLoop();
		AudioHub.playHeroHurt();
		hero.playAnimationWithSpeed(hero.frames.HURT, 16, false);
		hero.isHurt = false;
		return true;
	}

	/**
	 * Continues the attack animation if the combat controller already marked the hero as attacking.
	 */
	handleAttackState() {
		const hero = this.hero;
		if (!hero.isAttacking) return false;
		AudioHub.stopHeroIdleLoop();
		hero.setCrouchHurtBox();
		const frames = hero.hasSword ? hero.frames.ATTACK_SWORD : hero.frames.ATTACK;
		hero.playAnimationWithSpeed(frames, 20, false);
		return true;
	}

	/**
	 * Plays the currently queued cast animation (dark vs holy) while casting is active.
	 */
	handleCastState() {
		const hero = this.hero;
		if (!hero.isCasting || !hero.castType) return false;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.castType === "DARK" ? hero.frames.CAST_DARK : hero.frames.CAST_HOLY;
		hero.playAnimationWithSpeed(frames, 20, false);
		return true;
	}

	/**
	 * Reacts to a fresh ATTACK key press by delegating to the combat controller.
	 */
	handleAttackInput(keyboard) {
		const hero = this.hero;
		if (!keyboard.ATTACK) return false;
		AudioHub.stopHeroIdleLoop();
		if (!hero.attackPressed) {
			hero.attackPressed = true;
			hero.playAttackAnimationOnce();
		}
		return true;
	}

	/**
	 * Plays the slide animation whenever the movement controller reports a slide input.
	 *
	 * @param {{slidePressed?: boolean}} movementState
	 */
	handleSlideState(movementState) {
		if (!movementState?.slidePressed) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		hero.setSlideHurtBox();
		hero.playAnimationWithSpeed(hero.frames.SLIDE, 18);
		return true;
	}

	/**
	 * Chooses between crouch, air, walk, or idle animations based on the latest keyboard state.
	 */
	playMovementAnimation(keyboard) {
		if (this.handleCrouch(keyboard)) return;
		if (this.handleAirState()) return;
		if (this.handleWalk(keyboard)) return;
		this.playIdle();
	}

	/**
	 * Plays the crouch animation and adjusts the hurtbox when DOWN is held.
	 *
	 * @returns {boolean}
	 */
	handleCrouch(keyboard) {
		if (!keyboard.DOWN) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		hero.crouch();
		hero.setCrouchHurtBox();
		hero.playAnimationWithSpeed(hero.frames.CROUCH, 12);
		return true;
	}

	/**
	 * Handles jump/fall animations when the hero leaves the ground.
	 *
	 * @returns {boolean}
	 */
	handleAirState() {
		const hero = this.hero;
		if (!hero.isAboveGround()) return false;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.speedY > 0 ? hero.frames.JUMP : hero.frames.FALL;
		hero.playAnimationWithSpeed(frames, 14);
		return true;
	}

	/**
	 * Plays the walking animation (sword or fists) when moving left/right.
	 */
	handleWalk(keyboard) {
		if (!keyboard.RIGHT && !keyboard.LEFT) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.hasSword ? hero.frames.WALK_SWORD : hero.frames.WALK;
		hero.playAnimationWithSpeed(frames, 16);
		return true;
	}

	/**
	 * Plays the idle animation and decides whether the idle looped SFX should run.
	 */
	playIdle() {
		const hero = this.hero;
		if (this.shouldPlayIdleLoop()) {
			AudioHub.playHeroIdleLoop();
		} else {
			AudioHub.stopHeroIdleLoop();
		}
		const frames = hero.hasSword ? hero.frames.IDLE_SWORD : hero.frames.IDLE;
		hero.playAnimationWithSpeed(frames, 12);
	}

	/**
	 * @returns {boolean} True when the hero should emit the idle breathing loop.
	 */
	shouldPlayIdleLoop() {
		const world = this.hero.world;
		if (!world) return !this.hero.isDead;
		if (world.isWinSequenceActive || world.winSequenceStarted) return false;
		if (world.gameOverSequenceStarted) return false;
		if (this.hero.isDead || this.hero.isCelebrating) return false;
		return true;
	}

	/**
	 * Begins the manual sword draw animation if one is not already running.
	 */
	startDrawSwordAnimation() {
		if (!this.canStartSwordDraw()) return;
		const hero = this.hero;
		hero.isDrawingSword = true;
		const frames = hero.frames.DRAW_SWORD;
		const step = this.createSwordDrawStep(frames);
		const intervalId = setInterval(step, 1000 / 12);
		step.intervalId = intervalId;
	}

	/**
	 * @returns {boolean} Whether the hero can start the sword draw sequence.
	 */
	canStartSwordDraw() {
		const hero = this.hero;
		return hero.hasSword && !hero.isDrawingSword;
	}

	/**
	 * Builds the interval callback for the sword draw animation, advancing frames until completion.
	 *
	 * @param {string[]} frames
	 * @returns {() => void}
	 */
	createSwordDrawStep(frames) {
		const hero = this.hero;
		let frameIndex = 0;
		const step = () => {
			if (hero.world?.isPaused) return;
			if (frameIndex < frames.length) {
				this.applySwordDrawFrame(frames, frameIndex++);
				return;
			}
			this.finishSwordDraw(step.intervalId);
		};
		return step;
	}

	/**
	 * Applies a single sword draw frame and forwards the callback to any animation listeners.
	 */
	applySwordDrawFrame(frames, frameIndex) {
		const hero = this.hero;
		const path = frames[frameIndex];
		hero.img = hero.imageCache[path];
		hero.onAnimationFrame?.(frames, frameIndex);
	}

	/**
	 * Cleans up the sword draw interval and unlocks normal animation flow.
	 */
	finishSwordDraw(intervalId) {
		const hero = this.hero;
		hero.isDrawingSword = false;
		clearInterval(intervalId);
	}

	/**
	 * Drives the celebration sheath/idle sequence until its configured duration elapses.
	 */
	handleCelebration() {
		const hero = this.hero;
		if (!hero.isCelebrating) return;
		const elapsed = Date.now() - hero.celebrationStart;
		this.ensureCelebrationSound(hero);
		if (elapsed < hero.celebrationSheathDuration) {
			hero.playAnimationWithSpeed(hero.frames.SHEATHE_SWORD, hero.celebrationSheathFps, false);
			return;
		}
		hero.playAnimationWithSpeed(hero.frames.IDLE, 1);
		if (elapsed >= hero.celebrationTotalDuration) {
			hero.isCelebrating = false;
		}
	}

	/**
	 * Plays the sword sheathe sound once per celebration.
	 *
	 * @param {Hero} hero
	 */
	ensureCelebrationSound(hero) {
		if (hero.celebrationSoundPlayed) return;
		AudioHub.playOne(AudioHub.SWORD_SHEATHE);
		hero.celebrationSoundPlayed = true;
	}

	/**
	 * Global animation callback that syncs sounds and routes attack impact frames to the combat logic.
	 */
	handleAnimationFrame(images, frameIndex) {
		const animationName = this.getAnimationName(images);
		if (animationName) {
			AudioHub.syncSound(animationName, frameIndex);
		}
		if (!this.shouldTriggerImpact(animationName, frameIndex)) return;
		this.hero.triggeredImpactFrames.add(frameIndex);
		this.hero.dealDamageToEnemies(frameIndex);
	}

	/**
	 * Determines whether the given animation/frame index should trigger a combat hit check.
	 *
	 * @returns {boolean}
	 */
	shouldTriggerImpact(animationName, frameIndex) {
		const hero = this.hero;
		if (!hero.isAttacking) return false;
		if (animationName !== hero.attackImpactAnimation) return false;
		if (!Array.isArray(hero.attackImpactFrames)) return false;
		if (!hero.attackImpactFrames.includes(frameIndex)) return false;
		return !hero.triggeredImpactFrames.has(frameIndex);
	}

	/**
	 * Looks up the catalog key that matches a given frame array reference.
	 *
	 * @param {string[]} images
	 * @returns {string|null}
	 */
	getAnimationName(images) {
		const catalog = this.hero.frames || {};
		for (const [key, frames] of Object.entries(catalog)) {
			if (frames === images) return key;
		}
		console.log("Animation name not found");
		return null;
	}
}

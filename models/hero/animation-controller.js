class HeroAnimationController {
	constructor(hero) {
		this.hero = hero;
		this.intervalId = null;
		this.animationFps = 25;
	}

	start() {
		this.stop();
		const frameMs = 1000 / this.animationFps;
		this.intervalId = setInterval(() => this.updateFrame(), frameMs);
	}

	stop() {
		if (!this.intervalId) return;
		clearInterval(this.intervalId);
		this.intervalId = null;
	}

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

	shouldSkipAnimation() {
		const hero = this.hero;
		if (hero.world?.isPaused) return true;
		return hero.isDrawingSword;
	}

	updateGroundState(hero) {
		const wasGrounded = hero.wasOnGround;
		const isGrounded = !hero.isAboveGround();
		if (!wasGrounded && isGrounded) {
			AudioHub.playOne(AudioHub.FALL_HERO);
		}
		hero.wasOnGround = isGrounded;
	}

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

	handleCelebrationState() {
		if (!this.hero.isCelebrating) return false;
		AudioHub.stopHeroIdleLoop();
		this.handleCelebration();
		return true;
	}

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

	handleHurtState() {
		const hero = this.hero;
		if (!hero.isHurt) return false;
		AudioHub.stopHeroIdleLoop();
		AudioHub.playHeroHurt();
		hero.playAnimationWithSpeed(hero.frames.HURT, 16, false);
		hero.isHurt = false;
		return true;
	}

	handleAttackState() {
		const hero = this.hero;
		if (!hero.isAttacking) return false;
		AudioHub.stopHeroIdleLoop();
		hero.setCrouchHurtBox();
		const frames = hero.hasSword ? hero.frames.ATTACK_SWORD : hero.frames.ATTACK;
		hero.playAnimationWithSpeed(frames, 20, false);
		return true;
	}

	handleCastState() {
		const hero = this.hero;
		if (!hero.isCasting || !hero.castType) return false;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.castType === "DARK" ? hero.frames.CAST_DARK : hero.frames.CAST_HOLY;
		hero.playAnimationWithSpeed(frames, 20, false);
		return true;
	}

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

	handleSlideState(movementState) {
		if (!movementState?.slidePressed) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		hero.setSlideHurtBox();
		hero.playAnimationWithSpeed(hero.frames.SLIDE, 18);
		return true;
	}

	playMovementAnimation(keyboard) {
		if (this.handleCrouch(keyboard)) return;
		if (this.handleAirState()) return;
		if (this.handleWalk(keyboard)) return;
		this.playIdle();
	}

	handleCrouch(keyboard) {
		if (!keyboard.DOWN) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		hero.crouch();
		hero.setCrouchHurtBox();
		hero.playAnimationWithSpeed(hero.frames.CROUCH, 12);
		return true;
	}

	handleAirState() {
		const hero = this.hero;
		if (!hero.isAboveGround()) return false;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.speedY > 0 ? hero.frames.JUMP : hero.frames.FALL;
		hero.playAnimationWithSpeed(frames, 14);
		return true;
	}

	handleWalk(keyboard) {
		if (!keyboard.RIGHT && !keyboard.LEFT) return false;
		const hero = this.hero;
		AudioHub.stopHeroIdleLoop();
		const frames = hero.hasSword ? hero.frames.WALK_SWORD : hero.frames.WALK;
		hero.playAnimationWithSpeed(frames, 16);
		return true;
	}

	playIdle() {
		const hero = this.hero;
		AudioHub.playHeroIdleLoop();
		const frames = hero.hasSword ? hero.frames.IDLE_SWORD : hero.frames.IDLE;
		hero.playAnimationWithSpeed(frames, 12);
	}

	startDrawSwordAnimation() {
		if (!this.canStartSwordDraw()) return;
		const hero = this.hero;
		hero.isDrawingSword = true;
		const frames = hero.frames.DRAW_SWORD;
		const step = this.createSwordDrawStep(frames);
		const intervalId = setInterval(step, 1000 / 12);
		step.intervalId = intervalId;
	}

	canStartSwordDraw() {
		const hero = this.hero;
		return hero.hasSword && !hero.isDrawingSword;
	}

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

	applySwordDrawFrame(frames, frameIndex) {
		const hero = this.hero;
		const path = frames[frameIndex];
		hero.img = hero.imageCache[path];
		hero.onAnimationFrame?.(frames, frameIndex);
	}

	finishSwordDraw(intervalId) {
		const hero = this.hero;
		hero.isDrawingSword = false;
		clearInterval(intervalId);
	}

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

	ensureCelebrationSound(hero) {
		if (hero.celebrationSoundPlayed) return;
		AudioHub.playOne(AudioHub.SWORD_SHEATHE);
		hero.celebrationSoundPlayed = true;
	}

	handleAnimationFrame(images, frameIndex) {
		const animationName = this.getAnimationName(images);
		if (animationName) {
			AudioHub.syncSound(animationName, frameIndex);
		}
		if (!this.shouldTriggerImpact(animationName, frameIndex)) return;
		this.hero.triggeredImpactFrames.add(frameIndex);
		this.hero.dealDamageToEnemies(frameIndex);
	}

	shouldTriggerImpact(animationName, frameIndex) {
		const hero = this.hero;
		if (!hero.isAttacking) return false;
		if (animationName !== hero.attackImpactAnimation) return false;
		if (!Array.isArray(hero.attackImpactFrames)) return false;
		if (!hero.attackImpactFrames.includes(frameIndex)) return false;
		return !hero.triggeredImpactFrames.has(frameIndex);
	}

	getAnimationName(images) {
		const catalog = this.hero.frames || {};
		for (const [key, frames] of Object.entries(catalog)) {
			if (frames === images) return key;
		}
		console.log("Animation name not found");
		return null;
	}
}

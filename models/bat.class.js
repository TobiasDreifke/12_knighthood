class Bat extends MoveableObject {
    frames = {};
    width = 120;
    height = 90;
    y = -100;

    offsetLeft = 30;
    offsetRight = 30;
    offsetTop = 20;
    offsetBottom = 20;

    collidingObject = true;
    debugColor = "green";
    health = 16;
    damageOnCollision = 12;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = 100;
    activationX = null;
    isDormant = false;
    activationTriggered = false;

    flightPhase = "descend";
    currentDiveSpeed = 0;
    diveTargetX = null;
    diveTargetY = null;
    diveAcceleration = 0.35;
    diveSpeedCapMultiplier = 6;
    isDeathFalling = false;
    deathFallInterval = null;

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(BatFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = BatFrameCatalog.createCatalog();
        this.loadAllImages();
        this.x = 400 + Math.random() * 1000;

        this.player = player;
        this.speed = 0.45 + Math.random() * 0.2;
        this.baseHorizontalSpeed = this.speed;
        this.verticalClimbSpeed = 2.2 + Math.random();
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2.4;
        this.diveAcceleration = 0.2 + Math.random() * 0.15;
        this.diveSpeedCapMultiplier = 5.5 + Math.random() * 1.2;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.spawnX = this.x;
        this.spawnY = typeof this.spawnY === "number" ? this.spawnY : 100;
        this.y = this.spawnY;

        this.animation();
    }

    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    animation() {
        if (this.animationInterval) {
            return;
        }
        this.animationInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;

            if (this.isDormant) {
                this.holdDormantPose();
                return;
            }

            if (this.isDead) {
                if (this.isDeathFalling) {
                    this.holdDeathFallPose();
                } else {
                    this.playAnimationWithSpeed(this.frames.DEAD, 10, false);
                }
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.frames.HURT, 12, false);
                return;
            }

            this.updateFacingDirection();
            this.performDivePattern();
        }, 1000 / 25);
    }

    updateFacingDirection() {
        if (!this.player) return;
        const batCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        const delta = heroCenter - batCenter;
        const flipThreshold = 10;

        if (delta < -flipThreshold) {
            this.otherDirection = true;
        } else if (delta > flipThreshold) {
            this.otherDirection = false;
        }
    }

    performDivePattern() {
        const heroBox = typeof this.player?.getHurtbox === "function" ? this.player.getHurtbox() : null;
        const heroCenterX = heroBox ? (heroBox.left + heroBox.right) / 2 : this.player ? this.player.x : this.x;
        const heroBottom = heroBox ? heroBox.bottom : (this.player ? this.player.y + (this.player.height ?? 120) : this.y + this.height);
        const topAltitude = this.spawnY ?? 100;

        if (this.flightPhase === "descend") {
            this.ensureDiveTarget(heroCenterX, heroBottom);
            this.diveTowardTarget();
        } else {
            this.resetDiveTarget();
            this.ascendToAltitude(topAltitude);
        }

        this.playAnimationWithSpeed(this.frames.WALK, 14);
    }

    ensureDiveTarget(heroCenterX, heroBottom) {
        if (this.diveTargetX !== null && this.diveTargetY !== null) return;
        const halfWidth = this.width / 2;
        const targetX = heroCenterX;
        const groundFromWorld = this.world?.heroCharacter?.groundY ?? this.groundY ?? (heroBottom + 700);
        const safeGround = groundFromWorld - 6;
        const desiredY = heroBottom - this.height * 0.25;
        const targetY = Math.min(desiredY, safeGround);

        this.diveTargetX = targetX;
        this.diveTargetY = targetY;
        this.currentDiveSpeed = Math.max(this.currentDiveSpeed, this.baseHorizontalSpeed * 2.2);
        this.otherDirection = (this.x + halfWidth) > heroCenterX;
    }

    diveTowardTarget() {
        if (this.diveTargetX === null || this.diveTargetY === null) {
            this.flightPhase = "ascend";
            return;
        }

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const deltaX = this.diveTargetX - centerX;
        const deltaY = this.diveTargetY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;

        const speedCap = this.baseHorizontalSpeed * this.diveSpeedCapMultiplier;
        const stepSpeed = Math.min(this.currentDiveSpeed, speedCap);
        const stepX = (deltaX / distance) * stepSpeed;
        const stepY = (deltaY / distance) * stepSpeed;

        this.x += stepX;
        this.y += stepY;

        this.currentDiveSpeed = Math.min(this.currentDiveSpeed + this.diveAcceleration, speedCap);

        const closeHorizontally = Math.abs(centerX - this.diveTargetX) <= 12;
        const reachedVertical = centerY >= this.diveTargetY - 8;
        const touchedGround = this.y >= this.diveTargetY - 2;

        if (closeHorizontally && (reachedVertical || touchedGround)) {
            this.flightPhase = "ascend";
        }
    }

    resetDiveTarget() {
        this.diveTargetX = null;
        this.diveTargetY = null;
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2;
    }

    ascendToAltitude(topAltitude) {
        const climbSpeed = this.verticalClimbSpeed;
        this.y = Math.max(this.y - climbSpeed, topAltitude);

        if (this.otherDirection) {
            this.x -= this.baseHorizontalSpeed;
        } else {
            this.x += this.baseHorizontalSpeed;
        }

        if (this.y <= topAltitude + 1) {
            this.flightPhase = "descend";
        }
    }

    startDeathFall() {
        if (this.deathFallInterval) return;
        this.isDeathFalling = true;
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }

        let verticalSpeed = 0;
        const horizontalDrift = this.baseHorizontalSpeed * 0.4;

        this.deathFallInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;

            verticalSpeed = Math.min(verticalSpeed + 0.45, 12);
            this.y += verticalSpeed;
            if (this.otherDirection) {
                this.x -= horizontalDrift;
            } else {
                this.x += horizontalDrift;
            }

            const groundLevel = this.getGroundLevel();
            if (this.y >= groundLevel) {
                this.y = groundLevel;
                clearInterval(this.deathFallInterval);
                this.deathFallInterval = null;
                this.isDeathFalling = false;
                this.frameIndex = 0;
                this.lastFrameTime = 0;
            }
        }, 1000 / 25);
    }

    holdDeathFallPose() {
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }
    }

    getGroundLevel() {
        if (typeof this.groundY === "number") return this.groundY;
        const worldGround = this.world?.heroCharacter?.groundY;
        if (typeof worldGround === "number") return worldGround;
        return 340;
    }

	hit(amount = this.damageOnCollision) {
		const hurtFrames = this.frames.HURT?.length ?? 0;
		const handled = this.handleHit(amount, {
			deadSound: AudioHub.BAT_DEAD,
			hurtSound: AudioHub.BAT_HURT,
			hurtFps: 12,
			hurtFrameCount: hurtFrames,
			onDeath: () => {
				this.clearHurtTimeout();
				this.startDeathFall();
			},
			onHurtStart: () => {
				this.clearHurtTimeout();
				this.isHurt = true;
			},
			onHurtEnd: () => {
				this.isHurt = false;
			},
		});
		if (!handled) return;
	}

    holdDormantPose() {
        const idleFrame = this.frames.WALK?.[0];
        if (this.imageCache && this.imageCache[idleFrame]) {
            this.img = this.imageCache[idleFrame];
        }
    }

    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`BAT_${animationName}`, frameIndex);
    }

    getAnimationName(images) {
        const catalog = this.frames || {};
        for (const [key, frames] of Object.entries(catalog)) {
            if (frames === images) {
                return key;
            }
        }
        return null;
    }

    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

    stopAllActivity() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        if (this.deathFallInterval) {
            clearInterval(this.deathFallInterval);
            this.deathFallInterval = null;
        }
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

class Mushroom extends MoveableObject {
    frames = {};
    width = 120;
    height = 120;
    y = 285;

    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 35;
    offsetBottom = 10;

    collidingObject = true;
    debugColor = "purple";
    health = 18;
    damageOnCollision = 12;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;
    activationTriggered = false;

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(MushroomFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = MushroomFrameCatalog.createCatalog();
        this.loadAllImages();
        this.player = player;
        this.x = 450 + Math.random() * 900;
        this.spawnX = this.x;
        this.spawnY = this.y;
        this.speed = 0.2 + Math.random() * 0.2;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.hitboxWidth = 70;
        this.hitboxOffsetTop = 20;
        this.hitboxOffsetBottom = 30;
        this.hitboxOffsetLeft = 0;
        this.hitboxOffsetRight = 0;
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
                this.playAnimationWithSpeed(this.frames.DEAD, 10, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.frames.HURT, 12, false);
                return;
            }

            this.updateFacingDirection();
            this.wanderTowardPlayer();
        }, 1000 / 25);
    }

    updateFacingDirection() {
        if (!this.player) return;

        const mushroomCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        const delta = heroCenter - mushroomCenter;
        const flipThreshold = 5;

        if (delta < -flipThreshold) {
            this.otherDirection = true;
        } else if (delta > flipThreshold) {
            this.otherDirection = false;
        }
    }

    wanderTowardPlayer() {
        if (this.player) {
            if (this.otherDirection) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        } else {
            this.moveLeft();
        }

        this.playAnimationWithSpeed(this.frames.WALK, 11);
    }

	hit(amount = this.damageOnCollision) {
		const frames = this.frames.HURT?.length ?? 0;
		const handled = this.handleHit(amount, {
			deadSound: AudioHub.MUSHROOM_DEAD,
			hurtSound: AudioHub.MUSHROOM_HURT,
			hurtFps: 12,
			hurtFrameCount: frames,
			onDeath: () => this.clearHurtTimeout(),
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
        AudioHub.syncSound(`MUSHROOM_${animationName}`, frameIndex);
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
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

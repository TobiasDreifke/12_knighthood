class Goblin extends MoveableObject {
    frames = {};
    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 40;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";
    health = 20;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(GoblinFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = GoblinFrameCatalog.createCatalog();
        this.loadAllImages();
        this.x = 400 + Math.random() * 1000;

        this.player = player;
        this.speed = 0.35 + Math.random() * 0.25;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

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
                this.playAnimationWithSpeed(this.frames.DEAD, 12, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.frames.HURT, 14, false);
                return;
            }

            this.updateFacingDirection();
            this.walkTowardPlayer();
        }, 1000 / 25);
    }

    updateFacingDirection() {
        if (!this.player) return;
        const goblinCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        const delta = heroCenter - goblinCenter;
        const flipThreshold = 10;

        if (delta < -flipThreshold) {
            this.otherDirection = true;
        } else if (delta > flipThreshold) {
            this.otherDirection = false;
        }
    }

	walkTowardPlayer() {
        if (this.player) {
            if (this.otherDirection) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        } else {
            this.moveLeft();
        }

		this.playAnimationWithSpeed(this.frames.WALK, 12);
	}

	hit(amount = this.damageOnCollision) {
		const frames = this.frames.HURT?.length ?? 0;
		this.handleHit(amount, {
			deadSound: AudioHub.GOBLIN_DEAD,
			hurtSound: AudioHub.GOBLIN_HURT,
			hurtFps: 14,
			hurtFrameCount: frames,
			onDeath: () => this.clearHurtTimeout(),
			onHurtStart: () => { this.clearHurtTimeout(); this.isHurt = true; },
			onHurtEnd: () => { this.isHurt = false; },
		});
	}


    holdDormantPose() {
        const idleFrame = this.frames.WALK[0];
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
        AudioHub.syncSound(`GOBLIN_${animationName}`, frameIndex);
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

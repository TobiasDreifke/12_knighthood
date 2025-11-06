class SkeletonBoss extends MoveableObject {
    frames = {};
    width = 250;
    height = 250;
    y = 155;

    offsetLeft = 90;
    offsetRight = 80;
    offsetTop = 45;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";

    encounterSoundPlayed = false;
    attackTimers = [];
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;

    constructor(player, isHurt = false, isDead = false) {
        super().loadImage(SkeletonBossFrameCatalog.getFrameSet("IDLE")[0]);
        this.frames = SkeletonBossFrameCatalog.createCatalog();
        this.loadAllImages();
        this.player = player;
        this.x = 700;
        this.speed = 0.55;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.isAttacking = false;
        this.attackCooldown = false;

        this.hitboxWidth = 95;
        this.hitboxOffsetTop = 35;
        this.hitboxOffsetBottom = 65;
        this.hitboxOffsetLeft = 0;
        this.hitboxOffsetRight = 0;

        if (this.player) this.animation();
    }

    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    distanceToPlayer() {
        if (!this.player) return Infinity;
        const bossCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        return Math.abs(heroCenter - bossCenter);
    }

    horizontalGapToPlayer() {
        if (!this.player) return Infinity;
        const bossBox = this.getHurtbox();
        const playerBox = this.player.getHurtbox();

        if (playerBox.right < bossBox.left) {
            return bossBox.left - playerBox.right;
        }
        if (playerBox.left > bossBox.right) {
            return playerBox.left - bossBox.right;
        }
        return 0;
    }

    hasVerticalOverlapWithPlayer() {
        if (!this.player) return false;
        const bossBox = this.getHurtbox();
        const playerBox = this.player.getHurtbox();
        return bossBox.bottom > playerBox.top && bossBox.top < playerBox.bottom;
    }

    animation() {
        if (this.animationInterval) return;
        this.animationInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;
            if (!this.player) return;

            if (this.isDormant) {
                this.playIdleAnimation();
                return;
            }

            if (this.isDead) {
                this.playAnimationWithSpeed(this.frames.DEAD, 6, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.frames.HURT, 12, false);
                return;
            }

            const bossCenter = this.x + this.width / 2;
            const heroCenter = this.player.x + this.player.width / 2;
            const centerDelta = heroCenter - bossCenter;
            const flipThreshold = 20;

            if (centerDelta < -flipThreshold) {
                this.otherDirection = true;
            } else if (centerDelta > flipThreshold) {
                this.otherDirection = false;
            }

            if (this.isAttacking) {
                this.playAnimationWithSpeed(this.frames.ATTACK, 10, false);
                return;
            }

            if (this.handleAttackLogic()) return;
            if (this.handleWalkingLogic()) return;

            this.playIdleAnimation();
        }, 1000 / 25);
    }

    handleAttackLogic() {
        const gap = this.horizontalGapToPlayer();
        const attackHorizontalThreshold = 95;

        if (gap > attackHorizontalThreshold || !this.hasVerticalOverlapWithPlayer()) {
            return false;
        }
        if (this.attackCooldown) {
            this.playIdleAnimation();
            return true;
        }
        this.startAttack();
        return true;
    }

    handleWalkingLogic() {
        const walkRange = 540;
        if (this.distanceToPlayer() > walkRange) return false;

        if (!this.encounterSoundPlayed) {
            this.encounterSoundPlayed = true;
            AudioHub.playOne(AudioHub.SKELETON_LAUGHING);
        }

        this.walkTowardPlayer();
        return true;
    }

    walkTowardPlayer() {
        if (!this.player) return;

        if (this.otherDirection) {
            this.moveLeft();
        } else {
            this.moveRight();
        }

        this.playAnimationWithSpeed(this.frames.WALK, 8);
    }

    playIdleAnimation() {
        this.playAnimationWithSpeed(this.frames.IDLE, 6);
    }

    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    startAttack() {
        this.clearAttackTimers();
        this.isAttacking = true;
        this.attackCooldown = true;
        this.frameIndex = 0;
        this.lastFrameTime = 0;

        const fps = 10;
        const frameDuration = 1000 / fps;
        const swingSoundFrame = 4;
        const hitFrame = 7;
        const totalDuration = (this.frames.ATTACK?.length ?? 0) * frameDuration;
        const remainingCooldown = Math.max(3000 - totalDuration, 0);

        this.attackTimers.push(
            setTimeout(() => AudioHub.playOne(AudioHub.SKELETON_ATTACK), swingSoundFrame * frameDuration),
            setTimeout(() => this.attackPlayer(), hitFrame * frameDuration),
            setTimeout(() => {
                this.isAttacking = false;
                this.playIdleAnimation();
                this.attackTimers.push(
                    setTimeout(() => this.attackCooldown = false, remainingCooldown)
                );
            }, totalDuration)
        );
    }

    attackPlayer() {
        const world = this.player?.world || this.world;
        if (world && world.isPaused) return;
        if (!this.player) return;

        const hitbox = this.getHitbox();
        const playerHurtbox = this.player.getHurtbox();

        const isHit =
            hitbox.right > playerHurtbox.left &&
            hitbox.left < playerHurtbox.right &&
            hitbox.bottom > playerHurtbox.top &&
            hitbox.top < playerHurtbox.bottom;

        if (isHit) {
            this.player.hit(25);
        }
    }

    stopAttackImmediately() {
        this.clearAttackTimers();
        this.isAttacking = false;
        this.attackCooldown = true;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.playIdleAnimation();
        this.attackTimers.push(
            setTimeout(() => this.attackCooldown = false, 3000)
        );
    }

    clearAttackTimers() {
        this.attackTimers.forEach(clearTimeout);
        this.attackTimers = [];
    }

	hit(amount = this.damageOnCollision) {
		const frames = this.frames.HURT?.length ?? 0;
		const handled = this.handleHit(amount, {
			deadSound: AudioHub.SKELETON_DEAD,
			hurtSound: AudioHub.SKELETON_HURT,
			hurtFps: 12,
			hurtFrameCount: frames,
			onDeath: () => this.clearAttackTimers(),
			onHurtStart: () => {
				this.stopAttackImmediately();
				this.isHurt = true;
			},
			onHurtEnd: () => {
				this.isHurt = false;
			},
		});
		if (!handled) return;
	}

    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`SKELETON_${animationName}`, frameIndex);
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

    stopAllActivity() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.clearAttackTimers();
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
        this.isAttacking = false;
        this.attackCooldown = true;
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

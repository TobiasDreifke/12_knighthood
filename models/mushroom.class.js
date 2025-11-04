class Mushroom extends MoveableObject {
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

    IMAGES_HURT = [
        "./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_01.png",
        "./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_02.png",
        "./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_03.png",
        "./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_04.png",
    ];

    IMAGES_DEAD = [
        "./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_01.png",
        "./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_02.png",
        "./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_03.png",
        "./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_04.png",
    ];

    IMAGES_WALK = [
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_01.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_02.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_03.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_04.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_05.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_06.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_07.png",
        "./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_08.png",
    ];

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(this.IMAGES_WALK[0]);
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

        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);

        this.animation();
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
                this.playAnimationWithSpeed(this.IMAGES_DEAD, 10, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 12, false);
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

        this.playAnimationWithSpeed(this.IMAGES_WALK, 11);
    }

    hit(amount = this.damageOnCollision) {
        if (this.isDead) return;
        super.hit(amount);

        if (this.isDead) {
            AudioHub.playOne(AudioHub.MUSHROOM_DEAD);
            this.clearHurtTimeout();
            return;
        }

        AudioHub.playOne(AudioHub.MUSHROOM_HURT);
        this.isHurt = true;
        this.clearHurtTimeout();
        const hurtDuration = (this.IMAGES_HURT.length / 12) * 1000;
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, hurtDuration);
    }

    holdDormantPose() {
        const idleFrame = this.IMAGES_WALK[0];
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
        for (const key in this) {
            if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
            if (this[key] === images && key.startsWith('IMAGES_')) {
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

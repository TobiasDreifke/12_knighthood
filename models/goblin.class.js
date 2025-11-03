class Goblin extends MoveableObject {
    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 40;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";
    health = 20;

    encounterSoundPlayed = false;
    hurtTimeout = null;

    IMAGES_HURT = [
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_01.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_02.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_03.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_04.png",
    ];

    IMAGES_DEAD = [
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_01.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_02.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_03.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_04.png"
    ];

    IMAGES_WALK = [
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_02.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_03.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_04.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_05.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_06.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_07.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_08.png"
    ];

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(this.IMAGES_WALK[0]);
        this.x = 400 + Math.random() * 1000;
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);

        this.player = player;
        this.speed = 0.35 + Math.random() * 0.25;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.animation();
    }

    animation() {
        this.animationInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;

            if (this.isDead) {
                this.playAnimationWithSpeed(this.IMAGES_DEAD, 12, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 14, false);
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

        this.playAnimationWithSpeed(this.IMAGES_WALK, 12);
    }

    hit(amount = this.damageOnCollision) {
        if (this.isDead) return;
        super.hit(amount);

        if (this.isDead) {
            this.clearHurtTimeout();
            return;
        }

        this.isHurt = true;
        this.clearHurtTimeout();
        const hurtDuration = (this.IMAGES_HURT.length / 14) * 1000;
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, hurtDuration);
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

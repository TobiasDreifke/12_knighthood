class SkeletonBoss extends MoveableObject {
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

    IMAGES_IDLE = [
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_01.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_02.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_03.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_04.png",
    ];

    IMAGES_WALK = [
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_01.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_02.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_03.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_04.png"
    ];

    IMAGES_ATTACK = [
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_01.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_02.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_03.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_04.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_05.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_06.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_07.png",
        "01_assets/4_enemie_boss/3_attack/skeleton_attack_08.png",
    ];

    IMAGES_HURT = [
        "01_assets/4_enemie_boss/4_hurt/skeleton_hurt_01.png",
        "01_assets/4_enemie_boss/4_hurt/skeleton_hurt_02.png",
        "01_assets/4_enemie_boss/4_hurt/skeleton_hurt_03.png",
        "01_assets/4_enemie_boss/4_hurt/skeleton_hurt_04.png",
    ];

    IMAGES_DEAD = [
        "01_assets/4_enemie_boss/5_dead/skeleton_death_01.png",
        "01_assets/4_enemie_boss/5_dead/skeleton_death_02.png",
        "01_assets/4_enemie_boss/5_dead/skeleton_death_03.png",
        "01_assets/4_enemie_boss/5_dead/skeleton_death_04.png",
    ];

    constructor(player, isHurt = false, isDead = false) {
        super().loadImage(this.IMAGES_IDLE[0]);
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
        this.hitboxOffsetBottom = 35;
        this.hitboxOffsetLeft = 0;
        this.hitboxOffsetRight = 0;

        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);

        if (this.player) this.animation();
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
        this.animationInterval = setInterval(() => {
            if (!this.player) return;

            if (this.isDead) {
                this.playAnimationWithSpeed(this.IMAGES_DEAD, 6, false);
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 12, false);
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
                this.playAnimationWithSpeed(this.IMAGES_ATTACK, 10, false);
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

        this.playAnimationWithSpeed(this.IMAGES_WALK, 8);
    }

    playIdleAnimation() {
        this.playAnimationWithSpeed(this.IMAGES_IDLE, 6);
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
        const totalDuration = this.IMAGES_ATTACK.length * frameDuration;
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
        super.hit(amount);
        if (!this.isDead) {
            this.stopAttackImmediately();
            this.isHurt = true;
            const hurtDuration = (this.IMAGES_HURT.length / 12) * 1000;
            setTimeout(() => {
                this.isHurt = false;
            }, hurtDuration);
        } else {
            this.clearAttackTimers();
        }
    }

    scheduleHurtEnd() {
        if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
        const hurtDuration = (this.IMAGES_HURT.length / 12) * 1000;
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, hurtDuration);
    }
}

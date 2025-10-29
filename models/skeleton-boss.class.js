class SkeletonBoss extends MoveableObject {
    width = 250;
    height = 250;
    y = 155;

    offsetLeft = 100;
    offsetRight = 80;
    offsetTop = 50;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";

    IMAGES_WALK = [
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_01.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_02.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_03.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_04.png"
    ];

    IMAGES_IDLE = [
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_01.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_02.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_03.png",
        "01_assets/4_enemie_boss/2_alert/skeleton_idle_04.png",
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
        super().loadImage(this.IMAGES_WALK[0]);
        this.x = 300;
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);

        this.player = player;
        this.speed = 0.0;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.isAttacking = false;
        this.hitboxWidth = 80;          // how far the sword/swing reaches
        this.hitboxOffsetTop = 50;
        this.hitboxOffsetBottom = 20;

        if (this.player) this.animation();
    }

    isPlayerInRange(range = 50) {
        if (!this.player) return false;
        return Math.abs(this.player.x - this.x) < range;
    }

    animation() {

        this.animationInterval = setInterval(() => {

            if (this.isDead) {
                this.playAnimationWithSpeed(this.IMAGES_DEAD, 6); // 6 FPS
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 8); // 8 FPS
                this.isHurt = false;
                return;
            }

            if (this.isPlayerInRange(45)) {
                if (!this.isAttacking) {
                    this.isAttacking = true;
                    this.playAttackAnimationOnce();
                }
            } else {
                this.isAttacking = false;
                this.walkTowardPlayer();
            }

        }, 1000 / 25);
    }

    walkTowardPlayer() {
        if (!this.player) return;

        if (this.player.x < this.x) {
            this.otherDirection = true;
            this.moveLeft();
        } else {
            this.otherDirection = false;
            this.moveRight();
        }

        this.playAnimationWithSpeed(this.IMAGES_WALK, 8);
    }

    playAttackAnimationOnce() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        const fps = 5;
        const frameDuration = 1000 / fps;
        const totalDuration = this.IMAGES_ATTACK.length * frameDuration;

        this.playAnimationWithSpeed(this.IMAGES_ATTACK, fps);

        // Sword connects around frame 4 → ~800 ms into attack
        const hitTime = 4 * frameDuration;
        setTimeout(() => this.attackPlayer(), hitTime);

        // Reset attack cycle after animation ends
        setTimeout(() => this.isAttacking = false, totalDuration);
    }


    attackPlayer() {
        console.log(`[${this.constructor.name}] attacks [HERO]`);

        // Slight delay to align with sword swing frame
        setTimeout(() => {
            const hitbox = this.getHitbox();
            const playerHurtbox = this.player.getHurtbox();

            const isHit =
                hitbox.right > playerHurtbox.left &&
                hitbox.left < playerHurtbox.right &&
                hitbox.bottom > playerHurtbox.top &&
                hitbox.top < playerHurtbox.bottom;

            if (isHit) {
                console.log("Skeleton hit HERO!");
                this.player.hit();
            }
        }, 400); // Adjust timing to match swing frame
    }





}

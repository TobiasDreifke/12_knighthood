class SkeletonBoss extends MoveableObject {
    width = 250;
    height = 250;
    y = 155;

    offsetLeft = 35;
    offsetRight = 35;
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


    constructor(isHurt = false, isDead = false) {
        super().loadImage(this.IMAGES_WALK[0])
        this.x = 1000;
        this.loadImages(this.IMAGES_WALK);
        
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.animation();
        this.speed = 0.15;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;
    }


    animation() {
        this.animationInterval = setInterval(() => {

            // --------- DEAD
            if (this.isDead) {
                this.playAnimation(this.IMAGES_DEAD);
                setTimeout(() => {
                    clearInterval(this.animationInterval);
                }, this.IMAGES_DEAD.length * (1000 / 25));

                // --------- HURT
            } else if (this.isHurt) {
                this.playAnimation(this.IMAGES_HURT);
                // console.log("is hit");
                this.isHurt = false;

            } else {
                this.moveLeft();
                this.playAnimation(this.IMAGES_WALK);
            }
        }, 1000 / 20);
    }
    // setInterval(() => {
    //     this.moveLeft();
    // }, 1000 / 25);

    // setInterval(() => {
    //     this.playAnimation(this.IMAGES_WALK);
    // }, 150)
    // }

}

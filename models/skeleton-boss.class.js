class SkeletonBoss extends MoveableObject {
    width = 250;
    height = 250;
    y = 155;

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


    constructor() {
        super().loadImage(this.IMAGES_WALK[0])
        this.x = 400;
        this.loadImages(this.IMAGES_WALK);
        this.animation();
        this.moveLeft();
        this.speed = 0.15;
        this.otherDirection = true;
    }


    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALK);
        }, 150)
    }

}

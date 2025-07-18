class SkeletonBoss extends MoveableObject {
    IMAGES_WALK = [
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_01.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_02.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_03.png",
        "./01_assets/4_enemie_boss/1_walk/skeleton_walk_04.png"
    ];



    constructor() {
        super().loadImage(this.IMAGES_WALK[0])
        this.x = 400;
        this.loadImages(this.IMAGES_WALK);
        this.animation();
        this.moveLeft();
        this.speed = 0.25 + Math.random() * 1;
    }

    animation() {
        setInterval(() => {
              this.playAnimation(this.IMAGES_WALK);
        }, 150)
    }


}

class ThrowableDark extends MoveableObject {
    width = 50;
    height = 50;

    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;

    collidingObject = true;
    debugColor = "green";

    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_2.png",
    ];

    constructor() {
        super();
        this.loadImage("./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png");
        console.log("created a dark");
        this.x = 200 + Math.random() * 500;
        this.y = 325;
        this.loadImages(this.IMAGES_IDLE);
        this.animation();
        // this.throwHoly();

    }

    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_IDLE);
        }, 250)
    }
}
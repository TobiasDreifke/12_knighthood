class ThrowDark extends MoveableObject {
    width = 50;
    height = 50;

    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;

    collidingObject = true;
    debugColor = "red";


    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_2.png",
    ];

    IMAGES_THROW = [
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_6.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_7.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_8.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_9.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_10.png",
    ];

    constructor(x, y, isThrown = false) {
        super().loadImage("./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_1.png");
        // console.log("created a dark");
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_THROW);
        this.animation();
        if (isThrown) {
            this.throwDark();
        }
    };

    throwDark(facingLeft) {
        this.speedY = 15; 
        this.applyGravity();

        const throwPower = 15;
        this.speedX = facingLeft ? -throwPower : throwPower;

        this.throwInterval = setInterval(() => {
            this.x += this.speedX;
        }, 25);
    }

    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_THROW);
        }, 250)
    }
}
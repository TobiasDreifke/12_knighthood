class ThrowHoly extends MoveableObject {

    width = 50;
    height = 50;

    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;

    collidingObject = true;
    debugColor = "green";

    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_2.png",
    ];

    IMAGES_THROW = [
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_6.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_7.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_8.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_9.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_10.png",
    ];


    constructor(x, y) {
        super().loadImage("./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_1.png");
        console.log("created a holy");
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_THROW);
        this.animation();
        this.throwHoly();

    };

    throwHoly() {

        // if (this) {

        // }

        this.speedY = 2;
        this.applyGravity();
        setInterval(() => {
            this.x += 15;
        }, 25)
    };

    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_THROW);
        }, 250)
    }

}


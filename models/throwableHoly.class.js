class ThrowHoly extends MoveableObject {
    x = 250;
    y = 325;
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

    constructor() {
        super().loadImage("./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_1.png");
        console.log("created a holy");
        this.loadImages(this.IMAGES_IDLE);
        this.animation();
    };

    // throwHoly() {
    //     // super();

    // };

    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_IDLE);
        }, 250)
    }

}


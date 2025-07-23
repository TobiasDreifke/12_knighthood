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

    constructor(x, y) {
        super().loadImage("./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_1.png");
        console.log("created a holy");
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_IDLE);
        this.animation();
        this.throwHoly();
        
    };

    throwHoly() {

        // if (this) {
            
        // }
        
        this.speedY = 15;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 25)
    };

    animation() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_IDLE);
        }, 250)
    }

}


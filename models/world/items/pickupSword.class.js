class Sword extends MoveableObject {

    width = 50;
    height = 50;
    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;
    collidingObject = true;
    debugColor = "blue";

    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/sword_pick_up.png",
    ];

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_IDLE);
        this.playAnimation(this.IMAGES_IDLE)
    }
}


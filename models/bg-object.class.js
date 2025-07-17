class BackgroundObject extends MoveableObject {
    x = 0;
    width = 720;
    height = 480;

    constructor(imagePath, x, y) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height; // 480 - bildgröße
    }
}
/**
 * Generic parallax background element used across multiple layers.
 */
class BackgroundObject extends MoveableObject {
    x = 0;
    width = 720;
    height = 480;
    parallax = 1;

    constructor(imagePath, x, y = null, parallax = 1) {
        super().loadImage(imagePath);
        this.x = x;
        this.parallax = parallax;
        if (y === null || y === undefined) {
            this.y = 480 - this.height;
        } else {
            this.y = y;
        }
    }
}

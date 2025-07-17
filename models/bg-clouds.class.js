class Cloud extends MoveableObject {
    y = 300;
    width = 800;
    height = 400;
    speed = 0.2;

    constructor() {
        super().loadImage("./01_assets/5_background/layers/4_clouds/clouds_01.png")
        this.x = Math.random() * 100;
        this.moveLeft();
    }


}
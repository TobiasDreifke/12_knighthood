class Goblin extends MoveableObject {
    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 40;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";

    IMAGES_WALK = [
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_02.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_03.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_04.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_05.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_06.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_07.png",
        "./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_08.png"
    ];

    constructor() {
        super().loadImage("./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png")
        this.x = 400 + Math.random() * 800;
        this.loadImages(this.IMAGES_WALK);
        this.animation();
        this.speed = 0.25 + Math.random() * 1;
        this.otherDirection = true;
    }

    animation() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 25);

        setInterval(() => {
            this.playAnimation(this.IMAGES_WALK);
        }, 1000 / 15)
    }
}
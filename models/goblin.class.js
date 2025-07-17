class Goblin extends MoveableObject {

    IMAGES_WALKING = [
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
        this.x = 400 + Math.random() * 200;
        this.loadImages(this.IMAGES_WALKING);
        this.animation();
        this.moveLeft();
        this.speed = 0.25 + Math.random() * 1;
    }

    animation() {
        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALKING.length; // modulu (%) - let i = 0 % 6;=>  0,rest 0 // let i = 5 % 6;=>  0,rest 5 // let i = 6 % 6 ;=> 1,rest 0 // let i = 7 % 6 ;=> 1,rest 1
            // i = 0, 1, 2, 3, 0, 1, 2, 3
            let path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++
        }, 150)
    }


}
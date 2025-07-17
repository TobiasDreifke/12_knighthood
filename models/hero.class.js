class Hero extends MoveableObject {
    world;
    IMAGES_IDLE = [
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00-1.3.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-01-1.3.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-02-1.3.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-03-1.3.png"
    ];

    IMAGES_WALK = [
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-00.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-01.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-02.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-03.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-04.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-05.png",
    ];

    constructor() {
        super().loadImage("./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00-1.3.png")
        this.loadImages(this.IMAGES_WALK);
        this.animation();
        console.log(world, "hallo");
    }

    animation() {
        // this.moveLeft()
        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALK.length; // modulu (%) - let i = 0 % 6;=>  0,rest 0 // let i = 5 % 6;=>  0,rest 5 // let i = 6 % 6 ;=> 1,rest 0 // let i = 7 % 6 ;=> 1,rest 1
            // i = 0, 1, 2, 3, 0, 1, 2, 3
            let path = this.IMAGES_WALK[i];
            this.img = this.imageCache[path];
            this.currentImage++
        }, 200)
    }


    moveLeft() {
        if (this.world) {

        }

        setInterval(() => {
            this.x -= 1;
        }, 1000 / 60);
    };


    jump() { }
}
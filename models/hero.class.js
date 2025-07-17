class Hero extends MoveableObject {
    world;
    speed = 5;
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
        setInterval(() => {
            if (this.world.keyboard.RIGHT) {
                this.x += this.speed;
                this.otherDirection = false;
            }

            if (this.world.keyboard.LEFT) {
                this.x -= this.speed;
                this.otherDirection = true;
            }
        }, 1000 / 60);

        setInterval(() => {
            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT ) {
                let i = this.currentImage % this.IMAGES_WALK.length;

                // WALK ANIMATION
                let path = this.IMAGES_WALK[i];
                this.img = this.imageCache[path];
                this.currentImage++
            }
        }, 75);
    }

}


// moveLeft() {
//     setInterval(() => {
//         this.x -= 1;
//     }, 1000 / 60);
// };



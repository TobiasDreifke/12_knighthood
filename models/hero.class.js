class Hero extends MoveableObject {
    world;
    speed = 15;

    IMAGES_IDLE = [
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-01.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-02.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-03.png",
    ];

    IMAGES_WALK = [
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-00.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-01.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-02.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-03.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-04.png",
        "./01_assets/2_character_hero/2_walk/run3/adventurer-run3-05.png",
    ];

    IMAGES_JUMP = [
        "./01_assets/2_character_hero/3_jump/adventurer-jump-00.png",
        "./01_assets/2_character_hero/3_jump/adventurer-jump-01.png",
        "./01_assets/2_character_hero/3_jump/adventurer-jump-02.png",
        "./01_assets/2_character_hero/3_jump/adventurer-jump-03.png",
    ];
    IMAGES_HURT = [
        "./01_assets/2_character_hero/4_hurt/adventurer-hurt-00-1.3.png",
        "./01_assets/2_character_hero/4_hurt/adventurer-hurt-01-1.3.png",
        "./01_assets/2_character_hero/4_hurt/adventurer-hurt-02-1.3.png",
    ];
    IMAGES_DEAD = [
        "./01_assets/2_character_hero/5_dead/adventurer-die-00-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-01-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-02-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-03-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-04-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-05-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-06-1.3.png",
    ];
    IMAGES_FALL = [
        "./01_assets/2_character_hero/7_fall/adventurer-fall-00.png",
        "./01_assets/2_character_hero/7_fall/adventurer-fall-01.png",
    ];

    constructor() {
        super().loadImage("./01_assets/2_character_hero/7_fall/adventurer-fall-00.png")
        this.loadAllImages();
        this.animation();
        this.applyGravity();
    }

    loadAllImages() {
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_JUMP);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_FALL);
    }

    animation() {
        setInterval(() => {
            // this.walking_sound.pause();
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                // this.walking_sound.play();
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
            }

            if (this.world.keyboard.UP && !this.isAboveGround()) {
                this.jump();
            }

            this.world.camera_x = -this.x + 100;
        }, 1000 / 10);

        setInterval(() => {

            if (this.isDead() == true) {
                this.playAnimation(this.IMAGES_DEAD);
                
            } else if (this.isHurt) {
                this.playAnimation(this.IMAGES_HURT);
                console.log("is hit");
                this.isHurt = false;
            }

            else if (this.isAboveGround()) {
                if (this.speedY > 0) {
                    this.playAnimation(this.IMAGES_JUMP);
                } else if (this.speedY < 0) {
                    this.playAnimation(this.IMAGES_FALL);
                }

            } else {

                if (this.world.keyboard.RIGHT === false) {
                    this.playAnimation(this.IMAGES_IDLE);
                }

                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_WALK);
                }

            }
        }, 1000 / 12);
    }
}



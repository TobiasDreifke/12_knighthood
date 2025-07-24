class Hero extends MoveableObject {
    world;
    speed = 15;

    offsetLeft = 30;
    offsetRight = 30;
    offsetTop = 15;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";


    IMAGES_IDLE = [
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-01.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-02.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-03.png",
    ];

    IMAGES_WALK = [
        "./01_assets/2_character_hero/2_walk/adventurer-run-00-1.3.png",
        "./01_assets/2_character_hero/2_walk/adventurer-run-01-1.3.png",
        "./01_assets/2_character_hero/2_walk/adventurer-run-02-1.3.png",
        "./01_assets/2_character_hero/2_walk/adventurer-run-03-1.3.png",
        "./01_assets/2_character_hero/2_walk/adventurer-run-04-1.3.png",
        "./01_assets/2_character_hero/2_walk/adventurer-run-05-1.3.png",
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
    IMAGES_CAST = [
        "./01_assets/2_character_hero/6_cast/adventurer-cast-00.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-01.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-02.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-03.png",
    ];
    IMAGES_SLIDE = [
        "./01_assets/2_character_hero/9_slide/adventurer-slide-00.png",
        "./01_assets/2_character_hero/9_slide/adventurer-slide-01.png",
    ];
    IMAGES_CROUCH = [
        "./01_assets/2_character_hero/14_crouch/adventurer-crouch-00.png",
        "./01_assets/2_character_hero/14_crouch/adventurer-crouch-01.png",
        "./01_assets/2_character_hero/14_crouch/adventurer-crouch-02.png",
        "./01_assets/2_character_hero/14_crouch/adventurer-crouch-03.png",
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
        this.loadImages(this.IMAGES_CAST);
        this.loadImages(this.IMAGES_SLIDE);
        this.loadImages(this.IMAGES_CROUCH)
    }

    onAnimationFrame(images, frameIndex) { // for SoundSynching
        const animationName = this.getAnimationName(images);
        // console.log("onAnimationFrame called:", animationName, frameIndex);
        AudioHub.syncSound(animationName, frameIndex);
    }

    getAnimationName(images) { // for SoundSynching
        for (let key in this) {
            if (this[key] === images && key.startsWith('IMAGES_')) {
                // console.log("Found animationName:", key);
                return key;
            }
        }
        console.log("Animation name not found");
        return null;
    }

    animation() {
        setInterval(() => {
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();

            }

            if (this.world.keyboard.UP && !this.isAboveGround() || this.world.keyboard.JUMP && !this.isAboveGround()) {
                this.jump();
            }

            if (this.world.keyboard.THROWHOLY) {
                this.playAnimation(this.IMAGES_CAST);
            }

            if (this.world.keyboard.RIGHT && this.world.keyboard.DOWN) {
                this.slideRight();
            }

            if (this.world.keyboard.LEFT && this.world.keyboard.DOWN) {
                this.slideLeft();
            }

            this.world.camera_x = -this.x + 100;
        }, 1000 / 12);

        this.animationInterval = setInterval(() => {

            // --------- DEAD
            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
                setTimeout(() => {
                    clearInterval(this.animationInterval);
                }, this.IMAGES_DEAD.length * (1000 / 12));

                // --------- HURT
            } else if (this.isHurt) {
                this.playAnimation(this.IMAGES_HURT);
                // console.log("is hit");
                this.isHurt = false;

                // --------- SLIDE
            } else if (this.world.keyboard.LEFT && this.world.keyboard.DOWN || this.world.keyboard.RIGHT && this.world.keyboard.DOWN) {
                this.playAnimation(this.IMAGES_SLIDE);

                // --------- CROUCH
            } else if (this.world.keyboard.DOWN) {
                this.crouch();
                this.playAnimation(this.IMAGES_CROUCH);
                // console.log("crouching");

                // --------- JUMP AND FALL
            } else if (this.isAboveGround()) {
                if (this.speedY > 0) {
                    this.playAnimation(this.IMAGES_JUMP);
                } else if (this.speedY < 0) {
                    this.playAnimation(this.IMAGES_FALL);
                }

                // --------- IDLE AND WALK
            } else {
                if (!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_IDLE);
                } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_WALK);
                }
            }

        }, 1000 / 12);
    }
}



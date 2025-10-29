class Goblin extends MoveableObject {
    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 40;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";
    health = 10;

    IMAGES_HURT = [
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_01.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_02.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_03.png",
        "./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_04.png",
    ]

    IMAGES_DEAD = [
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_01.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_02.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_03.png",
        "./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_04.png"
    ]

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

    constructor(isHurt = false, isDead = false) {
        super().loadImage("./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png")
        this.x = 400 + Math.random() * 1000;
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.animation();
        // this.speed = 0.25 + Math.random() * 1;
                this.speed = 0.0 + Math.random() * 0;

        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;
    }

    animation() {
        setInterval(() => {
            if (this.isDead) {
                if (this.isDead) this.playAnimationWithSpeed(this.IMAGES_DEAD, 14);

            } else if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 16);
                this.isHurt = false;

            } else {
                this.moveLeft();
                this.playAnimationWithSpeed(this.IMAGES_WALK, 16);
            }

        }, 1000 / 25);
    }
}
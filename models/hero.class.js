class Hero extends MoveableObject {
    world;
    speed = 15;

    offsetLeft = 30;
    offsetRight = 30;
    offsetTop = 15;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";

    hasSword = false;
    isDrawingSword = false;


    IMAGES_IDLE = [
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-01.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-02.png",
        "./01_assets/2_character_hero/1_idle/idle/adventurer-idle-03.png",
    ];

    IMAGES_IDLE_SWORD = [
        "./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-00.png",
        "./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-01.png",
        "./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-02.png",
        "./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-03.png",
    ]

    IMAGES_WALK = [
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-00.png",
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-01.png",
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-02.png",
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-03.png",
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-04.png",
        "./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-05.png",
    ];

    IMAGES_WALK_SWORD = [
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
    IMAGES_DEAD_SWORD = [
        "./01_assets/2_character_hero/5_dead/adventurer-die-00-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-01-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-02-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-03-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-04-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-05-1.3.png",
        "./01_assets/2_character_hero/5_dead/adventurer-die-06-1.3.png",
    ];

    IMAGES_DEAD = [
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-00.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-01.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-02.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-03.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-04.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-05.png",
        "./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-06.png",
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

    IMAGES_ATTACK = [
        "./01_assets/2_character_hero/15_punch/adventurer-punch-00.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-01.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-02.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-03.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-04.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-05.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-06.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-07.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-08.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-09.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-10.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-11.png",
        "./01_assets/2_character_hero/15_punch/adventurer-punch-12.png",
    ];

    IMAGES_ATTACK_SWORD = [
        "./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-00.png",
        "./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-01.png",
        "./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-02.png",
        "./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-03.png",
        "./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-04.png",
    ];

    IMAGES_SHITE_SWORD = [
        "./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-00.png",
        "./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-01.png",
        "./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-02.png",
        "./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-03.png",

    ];

    IMAGES_DRAW_SWORD = [
        "./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-00.png",
        "./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-01.png",
        "./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-02.png",
        "./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-03.png",
    ];

    constructor(isDead = false) {
        super().loadImage("./01_assets/2_character_hero/7_fall/adventurer-fall-00.png")
        this.loadAllImages();
        this.animation();
        this.applyGravity();
        this.isDead = isDead;
        // this.inventory = new Inventory();

        if (this.isAttacking) {
            this.level.enemies.forEach(enemy => {
                if (this.heroCharacter.isHitting(enemy)) {
                    enemy.hit();
                }
            });
        }

        // this.world.checkInventory();
    }

    startDrawSwordAnimation() {
        if (!this.hasSword || this.isDrawingSword) return;

        this.isDrawingSword = true;
        let frameDuration = 1000 / 12;
        let currentFrame = 0;

        const drawInterval = setInterval(() => {
            if (currentFrame < this.IMAGES_DRAW_SWORD.length) {
                const path = this.IMAGES_DRAW_SWORD[currentFrame];
                this.img = this.imageCache[path];
                currentFrame++;
            } else {
                this.isDrawingSword = false;
                clearInterval(drawInterval);
            }
        }, frameDuration);
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
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_ATTACK_SWORD);
        this.loadImages(this.IMAGES_DEAD_SWORD);
        this.loadImages(this.IMAGES_CROUCH);
        this.loadImages(this.IMAGES_DRAW_SWORD);
        this.loadImages(this.IMAGES_IDLE_SWORD);
        this.loadImages(this.IMAGES_SHITE_SWORD);
        this.loadImages(this.IMAGES_WALK_SWORD);
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

    startAttack() {
        this.isAttacking = true;

        this.hitboxOffsetTop = 40;
        this.hitboxOffsetBottom = 20;
        if (this.hasSword) {
            this.hitboxWidth = 40;
        } else { this.hitboxWidth = 20; };
        setTimeout(() => this.isAttacking = false, 400); // sword active 400ms
    }

    animation() {
        setInterval(() => {

            // -------------------------
            // 1️⃣ Skip everything if drawing sword
            // -------------------------
            if (this.isDrawingSword) return;

            // -------------------------
            // 2️⃣ Movement input
            // -------------------------
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) this.moveRight();
            if (this.world.keyboard.LEFT && this.x > 0) this.moveLeft();
            if ((this.world.keyboard.UP || this.world.keyboard.JUMP) && !this.isAboveGround()) this.jump();
            if (this.world.keyboard.RIGHT && this.world.keyboard.DOWN) this.slideRight();
            if (this.world.keyboard.LEFT && this.world.keyboard.DOWN) this.slideLeft();

            // -------------------------
            // 3️⃣ Animation priorities
            // -------------------------
            if (this.isDead) {
                // Dead animation depends on sword
                if (this.hasSword) this.playAnimationWithSpeed(this.IMAGES_DEAD_SWORD, 14);
                else this.playAnimationWithSpeed(this.IMAGES_DEAD, 14);

            } else if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 16);
                this.isHurt = false;

            } else if (this.world.keyboard.ATTACK) {
                // Attack animation depends on sword
                if (this.hasSword) this.playAnimationWithSpeed(this.IMAGES_ATTACK_SWORD, 20);
                else this.playAnimationWithSpeed(this.IMAGES_ATTACK, 20);

                this.startAttack();

            } else if (this.world.keyboard.THROWHOLY || this.world.keyboard.THROWDARK) {
                this.playAnimationWithSpeed(this.IMAGES_CAST, 14);

            } else if ((this.world.keyboard.RIGHT && this.world.keyboard.DOWN) || (this.world.keyboard.LEFT && this.world.keyboard.DOWN)) {
                this.playAnimationWithSpeed(this.IMAGES_SLIDE, 18);

            } else if (this.world.keyboard.DOWN) {
                this.crouch();
                this.playAnimationWithSpeed(this.IMAGES_CROUCH, 12);

            } else if (this.isAboveGround()) {
                if (this.speedY > 0) this.playAnimationWithSpeed(this.IMAGES_JUMP, 14);
                else if (this.speedY < 0) this.playAnimationWithSpeed(this.IMAGES_FALL, 14);

            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                if (this.hasSword) this.playAnimationWithSpeed(this.IMAGES_WALK_SWORD, 16);
                else this.playAnimationWithSpeed(this.IMAGES_WALK, 16);

            } else {

                if (this.hasSword) this.playAnimationWithSpeed(this.IMAGES_IDLE_SWORD, 12);
                else this.playAnimationWithSpeed(this.IMAGES_IDLE, 12);


            }

            // -------------------------
            // 4️⃣ Camera follows hero
            // -------------------------
            this.world.camera_x = -this.x + 100;

        }, 1000 / 25);
    }




}



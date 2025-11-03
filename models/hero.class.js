class Hero extends MoveableObject {
    world;
    speed = 15;

    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 15;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";

    hasSword = false;
    isDrawingSword = false;
    attackPressed = false;
    castPressed = false;
    isCasting = false;
    castType = null;

    slideSoundFlag = { value: false };
    jumpSoundFlag = { value: false };
    wasOnGround = true;

    swordDamage = 15;
    punchDamage = 5;

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

    IMAGES_CAST_DARK = [
        "./01_assets/2_character_hero/6_cast/adventurer-cast-00.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-01.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-02.png",
        "./01_assets/2_character_hero/6_cast/adventurer-cast-03.png",
    ];

    IMAGES_CAST_HOLY = [
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

    IMAGES_SHEATHE_SWORD = [
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
        this.controlsLocked = false;
        this.isCelebrating = false;
        this.celebrationSheathFps = 2;
        this.celebrationHoldDuration = 3000;
        this.celebrationTotalDuration = 0;
        this.celebrationSoundPlayed = false;
        this.deathSoundPlayed = false;
    }

    startDrawSwordAnimation() {
        if (!this.hasSword || this.isDrawingSword) return;
        this.isDrawingSword = true;
        let frameDuration = 1000 / 12;
        let currentFrame = 0;

        const drawInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (currentFrame < this.IMAGES_DRAW_SWORD.length) {
                const path = this.IMAGES_DRAW_SWORD[currentFrame];
                this.img = this.imageCache[path];
                if (this.onAnimationFrame) {
                    this.onAnimationFrame(this.IMAGES_DRAW_SWORD, currentFrame);
                }
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
        this.loadImages(this.IMAGES_CAST_HOLY);
        this.loadImages(this.IMAGES_CAST_DARK);
        this.loadImages(this.IMAGES_SLIDE);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_ATTACK_SWORD);
        this.loadImages(this.IMAGES_DEAD_SWORD);
        this.loadImages(this.IMAGES_CROUCH);
        this.loadImages(this.IMAGES_DRAW_SWORD);
        this.loadImages(this.IMAGES_IDLE_SWORD);
        this.loadImages(this.IMAGES_SHEATHE_SWORD);
        this.loadImages(this.IMAGES_WALK_SWORD);
    }

    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        AudioHub.syncSound(animationName, frameIndex);

        if (animationName === 'IMAGES_ATTACK' && frameIndex === 5 && this.isAttacking) {
            this.dealDamageToEnemies();
        }
    }

    getAnimationName(images) { // for SoundSynching
        for (let key in this) {
            if (this[key] === images && key.startsWith('IMAGES_')) {
                return key;
            }
        }
        console.log("Animation name not found");
        return null;
    }



    animation() {
        setInterval(() => {
            if (this.shouldSkipAnimation()) return;

            const keyboard = this.world.keyboard;
            const wasGrounded = this.wasOnGround;
            const movementState = this.applyMovementInput(keyboard);
            const isGrounded = !this.isAboveGround();
            if (!wasGrounded && isGrounded) {
                AudioHub.playOne(AudioHub.FALL_HERO);
            }
            this.wasOnGround = isGrounded;

            const animationHandled = this.playPriorityAnimation(keyboard, movementState);
            if (!animationHandled) {
                this.playMovementAnimation(keyboard);
            }

            this.updateCameraPosition();
        }, 1000 / 25);
    }

    shouldSkipAnimation() {
        if (this.world?.isPaused) return true;
        return this.isDrawingSword;
    }

    applyMovementInput(keyboard) {
        if (this.controlsLocked || this.isCelebrating) {
            return { slidePressed: false };
        }

        const jumpPressed = keyboard.UP || keyboard.JUMP;
        const canJump = jumpPressed && !this.isAboveGround();
        AudioHub.playOncePerKey(this.jumpSoundFlag, AudioHub.JUMP_HERO, jumpPressed, canJump);
        if (canJump) this.jump();

        const slideRightPressed = keyboard.RIGHT && keyboard.DOWN;
        const slideLeftPressed = keyboard.LEFT && keyboard.DOWN;
        const slidePressed = slideRightPressed || slideLeftPressed;
        const canSlideSound = slidePressed;
        AudioHub.playOncePerKey(this.slideSoundFlag, AudioHub.SLIDE_HERO, slidePressed, canSlideSound);

        if (keyboard.RIGHT && this.x < this.world.level.level_end_x) this.moveRight();
        if (keyboard.LEFT && this.x > 0) this.moveLeft();
        if (slideRightPressed) this.slideRight();
        if (slideLeftPressed) this.slideLeft();

        return { slidePressed };
    }

    playPriorityAnimation(keyboard, movementState) {
        this.resetHurtBox();
        if (this.isCelebrating) {
            AudioHub.stopHeroIdleLoop();
            this.handleCelebration();
            return true;
        }

        if (this.isDead) {
            AudioHub.stopHeroIdleLoop();
            if (!this.deathSoundPlayed) {
                AudioHub.playHeroDeath();
                this.deathSoundPlayed = true;
            }
            const deadImages = this.hasSword ? this.IMAGES_DEAD_SWORD : this.IMAGES_DEAD;
            this.playAnimationWithSpeed(deadImages, 14, false);
            return true;
        }
        this.deathSoundPlayed = false;

        if (this.isHurt) {
            AudioHub.stopHeroIdleLoop();
            AudioHub.playHeroHurt();
            this.playAnimationWithSpeed(this.IMAGES_HURT, 16, false);
            this.isHurt = false;
            return true;
        }

        if (this.isAttacking) {
            AudioHub.stopHeroIdleLoop();
            this.setCrouchHurtBox();
            const attackImages = this.hasSword ? this.IMAGES_ATTACK_SWORD : this.IMAGES_ATTACK;
            this.playAnimationWithSpeed(attackImages, 20, false);
            return true;
        }

        if (this.isCasting && this.castType) {
            AudioHub.stopHeroIdleLoop();
            const castImages = this.castType === 'DARK' ? this.IMAGES_CAST_DARK : this.IMAGES_CAST_HOLY;
            this.playAnimationWithSpeed(castImages, 20, false);
            return true;
        }

        if (keyboard.ATTACK) {
            AudioHub.stopHeroIdleLoop();
            if (!this.attackPressed) {
                this.attackPressed = true;
                this.playAttackAnimationOnce();
            }
            return true;
        }

        if (movementState.slidePressed) {
            AudioHub.stopHeroIdleLoop();
            this.setSlideHurtBox();
            this.playAnimationWithSpeed(this.IMAGES_SLIDE, 18);
            return true;
        }

        return false;
    }

    playMovementAnimation(keyboard) {
        if (keyboard.DOWN) {
            AudioHub.stopHeroIdleLoop();
            this.crouch();
            this.setCrouchHurtBox();
            this.playAnimationWithSpeed(this.IMAGES_CROUCH, 12);
            return;
        }

        if (this.isAboveGround()) {
            AudioHub.stopHeroIdleLoop();
            if (this.speedY > 0) {
                this.playAnimationWithSpeed(this.IMAGES_JUMP, 14);
            } else if (this.speedY < 0) {
                this.playAnimationWithSpeed(this.IMAGES_FALL, 14);
            }
            return;
        }

        if (keyboard.RIGHT || keyboard.LEFT) {
            AudioHub.stopHeroIdleLoop();
            const walkImages = this.hasSword ? this.IMAGES_WALK_SWORD : this.IMAGES_WALK;
            this.playAnimationWithSpeed(walkImages, 16);
            return;
        }

        AudioHub.playHeroIdleLoop();
        const idleImages = this.hasSword ? this.IMAGES_IDLE_SWORD : this.IMAGES_IDLE;
        this.playAnimationWithSpeed(idleImages, 12);
    }

    updateCameraPosition() {
        if (this.world && this.world.isWinSequenceActive) {
            const target = -this.x + (this.world.canvas.width / 2) - (this.width / 2);
            this.world.camera_x += (target - this.world.camera_x) * 0.05;
        } else {
            this.world.camera_x = -this.x + 100;
        }
    }
    playAttackAnimationOnce() {
        if (this.isAttacking) return; // avoid re-trigger

        this.isAttacking = true;
        this.frameIndex = 0; // reset animation
        this.attackPressed = true;

        // hitbox setup
        this.hitboxOffsetTop = this.hasSword ? -30 : 10;
        this.hitboxOffsetBottom = this.hasSword ? 10 : 20;
        this.hitboxWidth = this.hasSword ? 40 : 30;

        // schedule damage at the correct frame
        const attackImages = this.hasSword ? this.IMAGES_ATTACK_SWORD : this.IMAGES_ATTACK;
        const fps = 20;
        const hitFrame = this.hasSword ? 3 : 5;
        const frameDuration = 1000 / fps;

        setTimeout(() => this.dealDamageToEnemies(), hitFrame * frameDuration);

        // end attack after full animation
        const totalDuration = attackImages.length * frameDuration;
        setTimeout(() => {
            this.isAttacking = false;
            this.attackPressed = false;
        }, totalDuration);
    }

    PlayCastAnimationOnce(type, force = false) { // type = 'HOLY' or 'DARK'
        const noAmmo =
            (type === 'DARK' && this.world.darkAmmo.length === 0) ||
            (type === 'HOLY' && this.world.holyAmmo.length === 0);

        if (this.isCasting || (!force && noAmmo)) {
            if (!force && noAmmo) console.log("No ammo left or already casting!");
            return;
        }

        this.isCasting = true;
        this.castPressed = true;
        this.castType = type; // track which cast is active
        this.frameIndex = 0;

        const castImages = type === 'DARK' ? this.IMAGES_CAST_DARK : this.IMAGES_CAST_HOLY;
        const fps = 20;
        const frameDuration = 1000 / fps;

        this.playAnimationWithSpeed(castImages, fps, false);

        const totalDuration = castImages.length * frameDuration;
        setTimeout(() => {
            this.isCasting = false;
            this.castPressed = false;
            this.castType = null;
        }, totalDuration);
    }

    triggerCastAnimation(type) {
        this.PlayCastAnimationOnce(type, true);
    }

    setControlsLocked(lock = true) {
        this.controlsLocked = lock;
        if (lock) {
            this.attackPressed = false;
        }
    }

    startWinCelebration() {
        if (this.isCelebrating) return;
        this.setControlsLocked(true);
        this.isCelebrating = true;
        this.celebrationSoundPlayed = false;
        this.celebrationStart = Date.now();
        this.celebrationSheathDuration = (this.IMAGES_SHEATHE_SWORD.length / this.celebrationSheathFps) * 1000;
        this.celebrationTotalDuration = this.celebrationSheathDuration + this.celebrationHoldDuration;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.speedY = 0;
        this.castType = null;
        this.isCasting = false;
        this.hasSword = false;
        this.collidingObject = false;
    }

    handleCelebration() {
        if (!this.isCelebrating) return;
        const elapsed = Date.now() - this.celebrationStart;
        if (!this.celebrationSoundPlayed) {
            AudioHub.playOne(AudioHub.SWORD_SHEATHE);
            this.celebrationSoundPlayed = true;
        }

        if (elapsed < this.celebrationSheathDuration) {
            this.playAnimationWithSpeed(this.IMAGES_SHEATHE_SWORD, this.celebrationSheathFps, false);
        } else {
            this.playAnimationWithSpeed(this.IMAGES_IDLE, 1);
            if (elapsed >= this.celebrationTotalDuration) {
                this.isCelebrating = false;
            }
        }
    }

    getCelebrationDuration() {
        return this.celebrationTotalDuration;
    }

    dealDamageToEnemies() {
        if (this.world?.isPaused) return;
        this.world.level.enemies.forEach(enemy => {
            const hitbox = this.getHitbox();
            const enemyHurtbox = enemy.getHurtbox();

            const isHit =
                hitbox.right > enemyHurtbox.left &&
                hitbox.left < enemyHurtbox.right &&
                hitbox.bottom > enemyHurtbox.top &&
                hitbox.top < enemyHurtbox.bottom;

            if (isHit) {
                console.log("HERO hit ENEMY!");
                enemy.hit(this.hasSword ? this.swordDamage : this.punchDamage);
            }
        });
    }

    setCrouchHurtBox() {
         this.offsetLeft = 35;
        this.offsetRight = 35;
        this.offsetTop = 35;
        this.offsetBottom = 5;
    }
    setSlideHurtBox() {
       this.offsetLeft = 20;
        this.offsetRight = 25;
        this.offsetTop = 55;
        this.offsetBottom = 5;
    }

    resetHurtBox() {
        this.offsetLeft = 35;
        this.offsetRight = 35;
        this.offsetTop = 15;
        this.offsetBottom = 5;
    }
}

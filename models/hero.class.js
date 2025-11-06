class Hero extends MoveableObject {
    world;
    speed = 15;
    animationController = null;
    movementController = null;
    combatController = null;
    audioHooks = null;

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
    currentImpactSound = null;
    attackImpactFrames = [];
    attackImpactAnimation = null;
    triggeredImpactFrames = new Set();
    impactFramesPlayed = new Set();
    hitCooldownMs = 600;

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
        this.applyGravity();
        this.initState(isDead);
        this.initControllers();
    }

    initState(isDead) {
        this.isDead = isDead;
        this.controlsLocked = false;
        this.isCelebrating = false;
        this.celebrationSheathFps = 2;
        this.celebrationHoldDuration = 3000;
        this.celebrationTotalDuration = 0;
        this.celebrationSoundPlayed = false;
        this.deathSoundPlayed = false;
        this.audioHooks = new HeroAudioHooks(this);
    }

    initControllers() {
        this.animationController = new HeroAnimationController(this);
        this.movementController = new HeroMovementController(this);
        this.combatController = new HeroCombatController(this);
        this.onAnimationFrame = (images, frameIndex) => {
            this.animationController.handleAnimationFrame(images, frameIndex);
        };
        this.animationController.start();
    }


    loadAllImages() {
        const groups = [
            this.IMAGES_IDLE, this.IMAGES_WALK, this.IMAGES_JUMP,
            this.IMAGES_HURT, this.IMAGES_DEAD, this.IMAGES_FALL,
            this.IMAGES_CAST_HOLY, this.IMAGES_CAST_DARK, this.IMAGES_SLIDE,
            this.IMAGES_ATTACK, this.IMAGES_ATTACK_SWORD, this.IMAGES_DEAD_SWORD,
            this.IMAGES_CROUCH, this.IMAGES_DRAW_SWORD, this.IMAGES_IDLE_SWORD,
            this.IMAGES_SHEATHE_SWORD, this.IMAGES_WALK_SWORD,
        ];
        groups.forEach(images => this.loadImages(images));
    }

    startDrawSwordAnimation() {
        this.animationController.startDrawSwordAnimation();
    }

    applyMovementInput(keyboard) {
        return this.movementController.applyMovementInput(keyboard);
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
        this.combatController.playAttackAnimationOnce();
    }

    PlayCastAnimationOnce(type, force = false) {
        this.combatController.playCastAnimationOnce(type, force);
    }

    triggerCastAnimation(type) {
        this.combatController.triggerCastAnimation(type);
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
        this.configureCelebrationState();
    }

    configureCelebrationState() {
        this.isCelebrating = true;
        this.celebrationSoundPlayed = false;
        this.celebrationStart = Date.now();
        this.updateCelebrationTiming();
        this.resetCelebrationAnimationState();
        this.resetCelebrationCombatState();
    }

    updateCelebrationTiming() {
        const sheatheFrames = this.IMAGES_SHEATHE_SWORD.length;
        this.celebrationSheathDuration = (sheatheFrames / this.celebrationSheathFps) * 1000;
        this.celebrationTotalDuration = this.celebrationSheathDuration + this.celebrationHoldDuration;
    }

    resetCelebrationAnimationState() {
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.speedY = 0;
    }

    resetCelebrationCombatState() {
        this.castType = null;
        this.isCasting = false;
        this.hasSword = false;
        this.collidingObject = false;
    }

    handleCelebration() {
        this.animationController.handleCelebration();
    }

    getCelebrationDuration() {
        return this.celebrationTotalDuration;
    }

    dealDamageToEnemies(impactFrame = null) {
        this.combatController.dealDamageToEnemies(impactFrame);
    }

    hit(amount = this.damageOnCollision) {
        const now = Date.now();
        const cooldown = typeof this.hitCooldownMs === 'number' ? this.hitCooldownMs : 0;
        if (now - this.lastHit < cooldown) return;
        this.lastHit = now;
        super.hit(amount);
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

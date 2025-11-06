class Hero extends MoveableObject {
    world;
    speed = 15;
    frames = {};
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

    constructor(isDead = false) {
        super().loadImage("./01_assets/2_character_hero/7_fall/adventurer-fall-00.png");
        this.initState(isDead);
        this.applyGravity();
        this.initControllers();
    }

    initState(isDead) {
        this.frames = HeroAnimationFramesAssembler.createCatalog();
        this.loadAllImages();
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

    startDrawSwordAnimation() {
        this.animationController.startDrawSwordAnimation();
    }

    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
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
        const sheatheFrames = this.frames.SHEATHE_SWORD.length;
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

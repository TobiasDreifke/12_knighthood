/**
 * Player-controlled character that wires together movement, combat, and animation subsystems.
 */
class Hero extends MoveableObject {
    world;
    speed = 15;
    frames = {};
    animationController = null;
    movementController = null;
    combatController = null;

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
    isIntroDropping = false;
    introDropOffset = 520;
    introDropVelocity = 18;

    swordDamage = 15;
    punchDamage = 5;

    /**
     * @param {boolean} [isDead=false]
     */
    constructor(isDead = false) {
        super().loadImage("./01_assets/2_character_hero/7_fall/adventurer-fall-00.png");
        this.initState(isDead);
        this.applyGravity();
        this.initControllers();
    }

    /**
     * Populates the hero sprite catalog, resets celebration/death flags, and sets up audio helpers.
     */
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
    }

    /**
     * Instantiates animation, movement, and combat controllers plus the shared animation callback.
     */
    initControllers() {
        this.animationController = new HeroAnimationController(this);
        this.movementController = new HeroMovementController(this);
        this.combatController = new HeroCombatController(this);
        this.onAnimationFrame = (images, frameIndex) => {
            this.animationController.handleAnimationFrame(images, frameIndex);
        };
        this.animationController.start();
    }

    /**
     * Convenience wrapper for the animation controller's sword draw routine.
     */
    startDrawSwordAnimation() {
        this.animationController.startDrawSwordAnimation();
    }

    /**
     * Preloads every animation strip referenced by the hero.
     */
    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    /**
     * Delegates keyboard handling to the movement controller.
     *
     * @param {Keyboard} keyboard
     * @returns {{slidePressed?: boolean}}
     */
    applyMovementInput(keyboard) {
        return this.movementController.applyMovementInput(keyboard);
    }

    /**
     * Keeps the world camera centered on the hero; during win/lose sequences it eases toward a target.
     */
    updateCameraPosition() {
        if (this.world && (this.world.isWinSequenceActive || this.world.isLoseSequenceActive)) {
            const target = -this.x + (this.world.canvas.width / 2) - (this.width / 2);
            this.world.camera_x += (target - this.world.camera_x) * 0.05;
            return;
        }
        this.world.camera_x = -this.x + 100;
    }
    
    /**
     * Starts an attack via the combat controller.
     */
    playAttackAnimationOnce() {
        this.combatController.playAttackAnimationOnce();
    }

    /**
     * Starts a cast animation (dark/holy) if ammo allows or when forced.
     *
     * @param {"DARK"|"HOLY"} type
     * @param {boolean} [force=false]
     */
    PlayCastAnimationOnce(type, force = false) {
        this.combatController.playCastAnimationOnce(type, force);
    }

    /**
     * Forces a cast animation regardless of ammo state.
     *
     * @param {"DARK"|"HOLY"} type
     */
    triggerCastAnimation(type) {
        this.combatController.triggerCastAnimation(type);
    }

    /**
     * Repositions the hero above the playfield and locks controls until landing.
     */
    startIntroDrop() {
        if (this.isIntroDropping) return;
        this.isIntroDropping = true;
        this.wasOnGround = false;
        const offset = Math.max(this.introDropOffset, this.height * 2);
        const dropStartY = Math.min(this.groundY - offset, -offset / 2);
        this.y = dropStartY;
        this.speedY = -Math.abs(this.introDropVelocity);
        this.setControlsLocked(true);
    }

    /**
     * Unlocks controls once the intro fall has completed.
     */
    completeIntroDrop() {
        if (!this.isIntroDropping) return;
        this.isIntroDropping = false;
        this.speedY = 0;
        this.setControlsLocked(false);
    }

    /**
     * Called after landing to finish any intro sequences.
     */
    handleLanding() {
        if (this.isIntroDropping) {
            this.completeIntroDrop();
        }
    }

    /**
     * Locks player input (e.g., during cutscenes) and resets attack flags when disabled.
     *
     * @param {boolean} [lock=true]
     */
    setControlsLocked(lock = true) {
        this.controlsLocked = lock;
        if (lock) {
            this.attackPressed = false;
        }
    }

    /**
     * Initiates the multi-stage win celebration if it is not already running.
     */
    startWinCelebration() {
        if (this.isCelebrating) return;
        this.setControlsLocked(true);
        this.configureCelebrationState();
    }

    /**
     * Configures celebration timers, resets animation/combat states, and marks the hero as celebrating.
     */
    configureCelebrationState() {
        this.isCelebrating = true;
        this.celebrationSoundPlayed = false;
        this.celebrationStart = Date.now();
        this.updateCelebrationTiming();
        this.resetCelebrationAnimationState();
        this.resetCelebrationCombatState();
    }

    /**
     * Recomputes sheath/celebration durations based on the configured FPS.
     */
    updateCelebrationTiming() {
        const sheatheFrames = this.frames.SHEATHE_SWORD.length;
        this.celebrationSheathDuration = (sheatheFrames / this.celebrationSheathFps) * 1000;
        this.celebrationTotalDuration = this.celebrationSheathDuration + this.celebrationHoldDuration;
    }

    /**
     * Resets animation indices and velocity before starting celebration loops.
     */
    resetCelebrationAnimationState() {
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.speedY = 0;
    }

    /**
     * Clears casting/weapon flags so the celebration sequence can control visuals safely.
     */
    resetCelebrationCombatState() {
        this.castType = null;
        this.isCasting = false;
        this.hasSword = false;
        this.collidingObject = false;
    }

    /**
     * Delegates to the animation controller's celebration handler (useful for worlds to advance timers).
     */
    handleCelebration() {
        this.animationController.handleCelebration();
    }

    /**
     * @returns {number} Current celebration duration in milliseconds.
     */
    getCelebrationDuration() {
        return this.celebrationTotalDuration;
    }

    /**
     * Calculates the length of the death animation, defaulting to 1.5s if frames are missing.
     *
     * @returns {number}
     */
    getDeathAnimationDuration() {
        const frames = this.hasSword ? this.frames.DEAD_SWORD : this.frames.DEAD;
        const frameCount = Array.isArray(frames) ? frames.length : 0;
        const fps = 14;
        if (!frameCount) return 1500;
        return (frameCount / fps) * 1000;
    }

    /**
     * Thin wrapper around the combat controller's melee damage helper.
     */
    dealDamageToEnemies(impactFrame = null) {
        this.combatController.dealDamageToEnemies(impactFrame);
    }

    /**
     * Applies hero damage but enforces a cooldown between hits.
     *
     * @param {number} [amount=this.damageOnCollision]
     */
	hit(amount = this.damageOnCollision) {
		const now = Date.now();
		const cooldown = typeof this.hitCooldownMs === 'number' ? this.hitCooldownMs : 0;
		if (now - this.lastHit < cooldown) return;
		this.lastHit = now;
		this.world?.gameStats?.addDamageTaken?.(amount);
		super.hit(amount);
	}

    /**
     * Sets the crouch hurtbox offsets, used by both crouch and attack states.
     */
    setCrouchHurtBox() {
        this.offsetLeft = 35;
        this.offsetRight = 35;
        this.offsetTop = 35;
        this.offsetBottom = 5;
    }

    /**
     * Sets the hurtbox for sliding, making the hero shorter but longer on the X axis.
     */
    setSlideHurtBox() {
        this.offsetLeft = 20;
        this.offsetRight = 25;
        this.offsetTop = 55;
        this.offsetBottom = 5;
    }

    /**
     * Restores the standing hurtbox dimensions.
     */
    resetHurtBox() {
        this.offsetLeft = 35;
        this.offsetRight = 35;
        this.offsetTop = 15;
        this.offsetBottom = 5;
    }
}

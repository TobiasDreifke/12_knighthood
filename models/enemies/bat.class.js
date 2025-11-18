/**
 * Builds the animation controller configuration for a Bat enemy so the shared
 * EnemyAnimationController knows which animation keys, frame rates, and state
 * guards to use.
 *
 * @param {Bat} enemy - Bat instance the controller will drive.
 * @returns {import("./enemy-animation-controller").EnemyAnimationConfig}
 */
const createBatAnimationConfig = enemy => ({
    resolveWorld: () => enemy.player?.world || enemy.world,
    animationKeys: { walk: 'WALK', hurt: 'HURT', dead: 'DEAD' },
    fps: { loop: 25, walk: 14, hurt: 12, dead: 10 },
    dormant: { condition: () => enemy.isDormant, action: () => enemy.holdDormantPose(enemy.frames.WALK, 0) },
    states: [
        {
            condition: () => enemy.isDead,
            action: (_, ctrl) => {
                if (enemy.isDeathFalling) enemy.holdDeathFallPose?.();
                else ctrl.playAnimationKey('dead', ctrl.config.fps?.dead ?? 10, false);
                return true;
            },
        },
        {
            condition: () => enemy.isHurt,
            action: (_, ctrl) => (ctrl.playAnimationKey('hurt', ctrl.config.fps?.hurt ?? 12, false), true),
        },
    ],
    onActive: () => {
        enemy.updateFacingForDive();
        enemy.performDivePattern();
    },
});

/**
 * @typedef {Object} DiveMetrics
 * @property {number} heroCenterX
 * @property {number} heroBottom
 * @property {number} heroCenterY
 * @property {number} topAltitude
 */

/**
 * Flying dive-bomber enemy that tracks the hero, dives toward their hurtbox, then ascends
 * back to its spawn altitude. Handles animation state, collision damage, and death fall logic.
 *
 * @extends MoveableObject
 */
class Bat extends MoveableObject {
    frames = {};
    width = 120;
    height = 90;
    y = 0;

    offsetLeft = 30;
    offsetRight = 30;
    offsetTop = 20;
    offsetBottom = 20;

    collidingObject = true;
    debugColor = "green";
    health = 12;
    damageOnCollision = 12;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = -100;
    activationX = null;
    isDormant = false;
    activationTriggered = false;

    flightPhase = "descend";
    currentDiveSpeed = 0;
    diveTargetX = null;
    diveTargetY = null;
    diveAcceleration = 0.35;
    diveSpeedCapMultiplier = 6;
    isDeathFalling = false;
    deathFallInterval = null;
    travelDistance = 0;
    travelDistanceForMaxBoost = 1200;
    maxTravelSpeedMultiplier = 1.8;
    loiterAltitude = null;
    minAscendAltitude = null;
    maxAscendAltitude = null;

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(BatFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = BatFrameCatalog.createCatalog();
        this.loadAllImages();
        this.x = 400 + Math.random() * 1000;

        this.initializeState(player, isHurt, isDead);
        this.initializeAltitudePreferences();
        this.initializeSpawn();
        this.setupAnimationController();
    }

    /**
     * Preloads every animation frame referenced by the bat frame catalog.
     */
    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    /**
     * Creates and starts the enemy animation controller bound to this bat.
     */
    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createBatAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    /**
     * Lazily initializes the animation controller if it was stopped or missing.
     */
    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

    /**
     * Rotates the bat toward the tracked player when within the flip threshold.
     */
	updateFacingDirection() {
        this.updateFacingTowardPlayer({ player: this.player, flipThreshold: 10 });
    }

	/**
	 * Applies incoming damage and delegates to the shared hit handling flow.
	 *
	 * @param {number} [amount=this.damageOnCollision]
	 */
	hit(amount = this.damageOnCollision) {
		const handled = this.handleHit(amount, this.buildHitResponseOptions());
		if (!handled) return;
	}

	/**
	 * @returns {object} Options consumed by MoveableObject.handleHit.
	 */
	buildHitResponseOptions() {
		const hurtFrames = this.frames.HURT?.length ?? 0;
		return {
			deadSound: AudioHub.BAT_DEAD,
			hurtSound: AudioHub.BAT_HURT,
			hurtFps: 12,
			hurtFrameCount: hurtFrames,
			onDeath: () => this.handleHitDeath(),
			onHurtStart: () => this.handleHitStart(),
			onHurtEnd: () => this.handleHitEnd(),
		};
	}

	/**
	 * Called when the bat dies; clears timeouts and triggers the fall animation.
	 */
	handleHitDeath() {
		this.clearHurtTimeout();
		this.startDeathFall();
	}

	/**
	 * Marks the bat as hurt and clears timers before the hurt animation begins.
	 */
	handleHitStart() {
		this.clearHurtTimeout();
		this.isHurt = true;
	}

	/**
	 * Resets the hurt flag once the hurt animation completes.
	 */
	handleHitEnd() {
		this.isHurt = false;
	}

    /**
     * Locks the sprite to the idle pose while dormant.
     */
    holdDormantPose() {
        const idleFrame = this.frames.WALK?.[0];
        if (this.imageCache && this.imageCache[idleFrame]) {
            this.img = this.imageCache[idleFrame];
        }
    }

    /**
     * Marks the bat as active so AI/animation logic can run.
     */
    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    /**
     * Syncs sound effects with the active animation frame.
     *
     * @param {HTMLImageElement[]} images
     * @param {number} frameIndex
     */
    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`BAT_${animationName}`, frameIndex);
    }

    /**
     * Attempts to resolve the animation key for the provided frame array.
     *
     * @param {HTMLImageElement[]} images
     * @returns {string|null}
     */
    getAnimationName(images) {
        const catalog = this.frames || {};
        for (const [key, frames] of Object.entries(catalog)) {
            if (frames === images) {
                return key;
            }
        }
        return null;
    }

    /**
     * Cancels any pending timeout used to leave the hurt animation.
     */
    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

	/**
	 * Stops animation/interval timers and detaches runtime references.
	 */
	stopAllActivity() {
        this.animationController?.stop();
        if (this.deathFallInterval) {
            clearInterval(this.deathFallInterval);
            this.deathFallInterval = null;
        }
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

if (typeof BatDiveBehavior !== "undefined") {
    Object.assign(Bat.prototype, BatDiveBehavior);
}

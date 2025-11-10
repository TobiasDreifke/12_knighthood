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

    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createBatAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

	updateFacingDirection() {
        this.updateFacingTowardPlayer({ player: this.player, flipThreshold: 10 });
    }

    /**
     * Ensures the sprite orientation matches the dive target or falls back to the player so
     * horizontal mirroring always reflects the bat's current travel direction.
     */
    updateFacingForDive() {
        if (this.hasDiveTarget()) {
            const centerX = this.x + this.width / 2;
            this.otherDirection = centerX > this.diveTargetX;
            return;
        }
        this.updateFacingTowardPlayer({ player: this.player, flipThreshold: 10 });
    }

    /**
     * Runs the dive routine: descends toward the hero when attacking and climbs back up when done,
     * ensuring the animation stays synced with the current phase.
     */
    performDivePattern() {
        const metrics = this.resolveDiveMetrics();
        if (this.flightPhase === "descend") {
            this.prepareDive(metrics);
        } else {
            this.resetDiveTarget();
            this.ascendToAltitude(metrics.topAltitude);
        }
        this.playDiveAnimation();
    }

    /**
     * Samples the hero hurtbox (or fallback world values) so the bat knows where to dive and
     * which altitude to return to afterwards.
     *
     * @returns {DiveMetrics}
     */
    resolveDiveMetrics() {
        const box = this.getHeroHurtbox();
        const heroCenterX = box ? (box.left + box.right) / 2 : this.player ? this.player.x : this.x;
        const heroBottom = box ? box.bottom : (this.player ? this.player.y + (this.player.height ?? 120) : this.y + this.height);
        const heroCenterY = box ? (box.top + box.bottom) / 2 : heroBottom - (this.player?.height ?? this.height) / 2;
        const topAltitude = this.getTopAltitude();
        return { heroCenterX, heroBottom, heroCenterY, topAltitude };
    }

    getTopAltitude() {
        let altitude = typeof this.loiterAltitude === "number"
            ? this.loiterAltitude
            : typeof this.spawnY === "number"
                ? this.spawnY
                : 100;
        if (typeof this.minAscendAltitude === "number") {
            altitude = Math.max(altitude, this.minAscendAltitude);
        }
        if (typeof this.maxAscendAltitude === "number") {
            altitude = Math.min(altitude, this.maxAscendAltitude);
        }
        return altitude;
    }

    /**
     * Locks in a dive target using the latest hero metrics and begins accelerating toward it.
     *
     * @param {DiveMetrics} metrics
     */
    prepareDive(metrics) {
        this.ensureDiveTarget(metrics);
        this.diveTowardTarget();
    }

    /**
     * Keeps the wing-flap animation speed aligned with the current dive motion for visual feedback.
     */
    playDiveAnimation() {
        this.playAnimationWithSpeed(this.frames.WALK, 14);
    }

    getTravelSpeedMultiplier() {
        if (!this.maxTravelSpeedMultiplier || this.maxTravelSpeedMultiplier <= 1) return 1;
        const distanceForMax = Math.max(this.travelDistanceForMaxBoost || 0, 1);
        const progress = Math.min(this.travelDistance / distanceForMax, 1);
        return 1 + progress * (this.maxTravelSpeedMultiplier - 1);
    }

    registerTravel(stepX = 0, stepY = 0) {
        const distance = Math.hypot(stepX, stepY);
        if (distance > 0) {
            this.travelDistance += distance;
        }
    }

    /**
     * Computes a safe X/Y dive target centered on the hero while clamping the Y position against
     * the ground, then boosts horizontal speed so the bat fully commits to the dive.
     *
     * @param {DiveMetrics} param0
     * @param {number} param0.heroCenterX
     * @param {number} param0.heroBottom
     * @param {number} param0.heroCenterY
     */
    ensureDiveTarget({ heroCenterX, heroBottom, heroCenterY }) {
        if (this.diveTargetX !== null && this.diveTargetY !== null) return;
        const halfWidth = this.width / 2;
        const targetX = heroCenterX;
        const groundFromWorld = this.world?.heroCharacter?.groundY ?? this.groundY ?? (heroBottom + 700);
        const safeGround = groundFromWorld - 6;
        const desiredY = heroBottom - this.height * 0.1;
        const targetY = Math.min(desiredY, safeGround);

        this.diveTargetX = targetX;
        this.diveTargetY = targetY;
        this.currentDiveSpeed = Math.max(this.currentDiveSpeed, this.baseHorizontalSpeed * 2.2);
        this.otherDirection = (this.x + halfWidth) > this.diveTargetX;
    }

    diveTowardTarget() {
        if (!this.hasDiveTarget()) {
            this.flightPhase = "ascend";
            return;
        }
        const position = this.getCenterPosition();
        const delta = this.calculateDiveDelta(position);
        const step = this.calculateDiveStep(delta);
        this.applyDiveStep(step);
        this.currentDiveSpeed = this.nextDiveSpeed(step.speedCap);
        if (this.reachedDiveTarget()) {
            this.flightPhase = "ascend";
        }
    }

    hasDiveTarget() {
        return this.diveTargetX !== null && this.diveTargetY !== null;
    }

    getHeroHurtbox() {
        return typeof this.player?.getHurtbox === "function" ? this.player.getHurtbox() : null;
    }

    getCenterPosition() {
        return {
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2,
        };
    }

    calculateDiveDelta({ centerX, centerY }) {
        const deltaX = this.diveTargetX - centerX;
        const deltaY = this.diveTargetY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
        return { deltaX, deltaY, distance };
    }

    calculateDiveStep({ deltaX, deltaY, distance }) {
        const speedCap = this.baseHorizontalSpeed * this.diveSpeedCapMultiplier;
        const stepSpeed = Math.min(this.currentDiveSpeed, speedCap) * this.getTravelSpeedMultiplier();
        return {
            stepX: (deltaX / distance) * stepSpeed,
            stepY: (deltaY / distance) * stepSpeed,
            speedCap,
        };
    }

    applyDiveStep({ stepX, stepY }) {
        this.x += stepX;
        this.y += stepY;
        this.registerTravel(stepX, stepY);
    }

    nextDiveSpeed(speedCap) {
        return Math.min(this.currentDiveSpeed + this.diveAcceleration, speedCap);
    }

    reachedDiveTarget() {
        const { centerX, centerY } = this.getCenterPosition();
        const closeHorizontally = Math.abs(centerX - this.diveTargetX) <= 12;
        const reachedVertical = centerY >= this.diveTargetY - 4;
        const touchedGround = centerY >= this.diveTargetY;
        return closeHorizontally && (reachedVertical || touchedGround);
    }

    resetDiveTarget() {
        this.diveTargetX = null;
        this.diveTargetY = null;
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2;
    }

    ascendToAltitude(topAltitude) {
        const speedMultiplier = this.getTravelSpeedMultiplier();
        const climbSpeed = this.verticalClimbSpeed * speedMultiplier;
        const targetY = Math.max(this.y - climbSpeed, topAltitude);
        const verticalDelta = this.y - targetY;
        this.y = targetY;

        const horizontalStep = this.baseHorizontalSpeed * speedMultiplier;
        const horizontalDelta = this.otherDirection ? -horizontalStep : horizontalStep;
        this.x += horizontalDelta;
        this.registerTravel(horizontalDelta, -verticalDelta);

        if (this.y <= topAltitude + 1) {
            this.flightPhase = "descend";
        }
    }

    startDeathFall() {
        if (this.deathFallInterval) return;
        this.isDeathFalling = true;
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        this.applyDeathFallFrame(frames);
        this.deathFallInterval = this.createDeathFallInterval();
    }

    applyDeathFallFrame(frames) {
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }
    }

    createDeathFallInterval() {
        let verticalSpeed = 0;
        const horizontalDrift = this.baseHorizontalSpeed * 0.4;
        const stepMs = 1000 / 25;
        return setInterval(() => {
            if (this.shouldPauseDeathFall()) return;
            verticalSpeed = this.updateDeathFallSpeed(verticalSpeed);
            this.applyDeathFallMovement(verticalSpeed, horizontalDrift);
            this.checkDeathFallLanding();
        }, stepMs);
    }

    shouldPauseDeathFall() {
        const world = this.player?.world || this.world;
        return Boolean(world && world.isPaused);
    }

    updateDeathFallSpeed(current) {
        return Math.min(current + 0.45, 12);
    }

    applyDeathFallMovement(verticalSpeed, horizontalDrift) {
        this.y += verticalSpeed;
        if (this.otherDirection) {
            this.x -= horizontalDrift;
        } else {
            this.x += horizontalDrift;
        }
    }

    checkDeathFallLanding() {
        const groundLevel = this.getGroundLevel();
        if (this.y < groundLevel) return;
        this.y = groundLevel;
        this.completeDeathFall();
    }

    completeDeathFall() {
        if (this.deathFallInterval) {
            clearInterval(this.deathFallInterval);
            this.deathFallInterval = null;
        }
        this.isDeathFalling = false;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }

    holdDeathFallPose() {
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }
    }

    getGroundLevel() {
        if (typeof this.groundY === "number") return this.groundY;
        const worldGround = this.world?.heroCharacter?.groundY;
        if (typeof worldGround === "number") return worldGround;
        return 340;
    }

	hit(amount = this.damageOnCollision) {
		const hurtFrames = this.frames.HURT?.length ?? 0;
		const handled = this.handleHit(amount, {
			deadSound: AudioHub.BAT_DEAD,
			hurtSound: AudioHub.BAT_HURT,
			hurtFps: 12,
			hurtFrameCount: hurtFrames,
			onDeath: () => {
				this.clearHurtTimeout();
				this.startDeathFall();
			},
			onHurtStart: () => {
				this.clearHurtTimeout();
				this.isHurt = true;
			},
			onHurtEnd: () => {
				this.isHurt = false;
			},
		});
		if (!handled) return;
	}

    holdDormantPose() {
        const idleFrame = this.frames.WALK?.[0];
        if (this.imageCache && this.imageCache[idleFrame]) {
            this.img = this.imageCache[idleFrame];
        }
    }

    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`BAT_${animationName}`, frameIndex);
    }

    getAnimationName(images) {
        const catalog = this.frames || {};
        for (const [key, frames] of Object.entries(catalog)) {
            if (frames === images) {
                return key;
            }
        }
        return null;
    }

    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

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

    initializeState(player, isHurt, isDead) {
        this.player = player;
        this.speed = 0.45 + Math.random() * 0.2;
        this.baseHorizontalSpeed = this.speed;
        this.verticalClimbSpeed = 2.2 + Math.random();
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2.4;
        this.diveAcceleration = 10 + Math.random() * 0.15;
        this.diveSpeedCapMultiplier = 10 + Math.random() * 1.2;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;
        this.travelDistance = 0;
    }

    initializeAltitudePreferences() {
        if (typeof this.minAscendAltitude !== "number") {
            this.minAscendAltitude = 0;
        }

        if (typeof this.maxAscendAltitude !== "number") {
            this.maxAscendAltitude = Math.max(this.minAscendAltitude, 100);
        } else if (this.maxAscendAltitude < this.minAscendAltitude) {
            this.maxAscendAltitude = this.minAscendAltitude;
        }

        if (typeof this.loiterAltitude !== "number") {
            const min = this.minAscendAltitude ?? 0;
            const max = this.maxAscendAltitude ?? Math.max(min, 100);
            const span = Math.max(max - min, 0);
            const randomOffset = span > 0 ? Math.random() * span : 0;
            this.loiterAltitude = min + randomOffset;
        } else {
            if (typeof this.minAscendAltitude === "number" && this.loiterAltitude < this.minAscendAltitude) {
                this.loiterAltitude = this.minAscendAltitude;
            }
            if (typeof this.maxAscendAltitude === "number" && this.loiterAltitude > this.maxAscendAltitude) {
                this.loiterAltitude = this.maxAscendAltitude;
            }
        }
    }

    initializeSpawn() {
        this.spawnX = this.x;
        this.spawnY = typeof this.spawnY === "number" ? this.spawnY : 100;
        this.y = this.spawnY;
    }
}

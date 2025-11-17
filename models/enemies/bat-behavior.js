/**
 * Shared bat behavior helpers extracted from the Bat class.
 * Each function expects to be called with `this` bound to a Bat instance.
 */
const BatDiveBehavior = {
    /**
     * Helper for `updateFacingForDive` extracted from the Bat class.
     * @this {Bat}
     */
    updateFacingForDive() {
        if (this.hasDiveTarget()) {
            const centerX = this.x + this.width / 2;
            this.otherDirection = centerX > this.diveTargetX;
            return;
        }
        this.updateFacingTowardPlayer({ player: this.player, flipThreshold: 10 });
    },
    /**
     * Runs the dive routine: descends toward the hero when attacking and climbs back up when done,
     * ensuring the animation stays synced with the current phase.
     * @this {Bat}
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
    },
    /**
     * Samples the hero hurtbox (or fallback world values) so the bat knows where to dive and
     * which altitude to return to afterwards.
     *
     * @returns {DiveMetrics}
     * @this {Bat}
     */
    resolveDiveMetrics() {
        const box = this.getHeroHurtbox();
        const heroCenterX = box ? (box.left + box.right) / 2 : this.player ? this.player.x : this.x;
        const heroBottom = box ? box.bottom : (this.player ? this.player.y + (this.player.height ?? 120) : this.y + this.height);
        const heroCenterY = box ? (box.top + box.bottom) / 2 : heroBottom - (this.player?.height ?? this.height) / 2;
        const topAltitude = this.getTopAltitude();
        return { heroCenterX, heroBottom, heroCenterY, topAltitude };
    },
    /**
     * Helper for `getTopAltitude` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Locks in a dive target using the latest hero metrics and begins accelerating toward it.
     *
     * @param {DiveMetrics} metrics
     * @this {Bat}
     */
    prepareDive(metrics) {
        this.ensureDiveTarget(metrics);
        this.diveTowardTarget();
    },
    /**
     * Keeps the wing-flap animation speed aligned with the current dive motion for visual feedback.
     * @this {Bat}
     */
    playDiveAnimation() {
        this.playAnimationWithSpeed(this.frames.WALK, 14);
    },
    /**
     * Helper for `getTravelSpeedMultiplier` extracted from the Bat class.
     * @this {Bat}
     */
    getTravelSpeedMultiplier() {
        if (!this.maxTravelSpeedMultiplier || this.maxTravelSpeedMultiplier <= 1) return 1;
        const distanceForMax = Math.max(this.travelDistanceForMaxBoost || 0, 1);
        const progress = Math.min(this.travelDistance / distanceForMax, 1);
        return 1 + progress * (this.maxTravelSpeedMultiplier - 1);
    },
    /**
     * Helper for `registerTravel` extracted from the Bat class.
     * @this {Bat}
     */
    registerTravel(stepX = 0, stepY = 0) {
        const distance = Math.hypot(stepX, stepY);
        if (distance > 0) {
            this.travelDistance += distance;
        }
    },
    /**
     * Computes a safe X/Y dive target centered on the hero while clamping the Y position against
     * the ground, then boosts horizontal speed so the bat fully commits to the dive.
     *
     * @param {DiveMetrics} param0
     * @param {number} param0.heroCenterX
     * @param {number} param0.heroBottom
     * @param {number} param0.heroCenterY
     * @this {Bat}
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
    },
    /**
     * Helper for `diveTowardTarget` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Helper for `hasDiveTarget` extracted from the Bat class.
     * @this {Bat}
     */
    hasDiveTarget() {
        return this.diveTargetX !== null && this.diveTargetY !== null;
    },
    /**
     * Helper for `getHeroHurtbox` extracted from the Bat class.
     * @this {Bat}
     */
    getHeroHurtbox() {
        return typeof this.player?.getHurtbox === "function" ? this.player.getHurtbox() : null;
    },
    /**
     * Helper for `getCenterPosition` extracted from the Bat class.
     * @this {Bat}
     */
    getCenterPosition() {
        return {
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2,
        };
    },
    /**
     * Helper for `calculateDiveDelta` extracted from the Bat class.
     * @this {Bat}
     */
    calculateDiveDelta({ centerX, centerY }) {
        const deltaX = this.diveTargetX - centerX;
        const deltaY = this.diveTargetY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
        return { deltaX, deltaY, distance };
    },
    /**
     * Helper for `calculateDiveStep` extracted from the Bat class.
     * @this {Bat}
     */
    calculateDiveStep({ deltaX, deltaY, distance }) {
        const speedCap = this.baseHorizontalSpeed * this.diveSpeedCapMultiplier;
        const stepSpeed = Math.min(this.currentDiveSpeed, speedCap) * this.getTravelSpeedMultiplier();
        return {
            stepX: (deltaX / distance) * stepSpeed,
            stepY: (deltaY / distance) * stepSpeed,
            speedCap,
        };
    },
    /**
     * Helper for `applyDiveStep` extracted from the Bat class.
     * @this {Bat}
     */
    applyDiveStep({ stepX, stepY }) {
        this.x += stepX;
        this.y += stepY;
        this.registerTravel(stepX, stepY);
    },
    /**
     * Helper for `nextDiveSpeed` extracted from the Bat class.
     * @this {Bat}
     */
    nextDiveSpeed(speedCap) {
        return Math.min(this.currentDiveSpeed + this.diveAcceleration, speedCap);
    },
    /**
     * Helper for `reachedDiveTarget` extracted from the Bat class.
     * @this {Bat}
     */
    reachedDiveTarget() {
        const { centerX, centerY } = this.getCenterPosition();
        const closeHorizontally = Math.abs(centerX - this.diveTargetX) <= 12;
        const reachedVertical = centerY >= this.diveTargetY - 4;
        const touchedGround = centerY >= this.diveTargetY;
        return closeHorizontally && (reachedVertical || touchedGround);
    },
    /**
     * Helper for `resetDiveTarget` extracted from the Bat class.
     * @this {Bat}
     */
    resetDiveTarget() {
        this.diveTargetX = null;
        this.diveTargetY = null;
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2;
    },
    /**
     * Helper for `ascendToAltitude` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Helper for `startDeathFall` extracted from the Bat class.
     * @this {Bat}
     */
    startDeathFall() {
        if (this.deathFallInterval) return;
        this.isDeathFalling = true;
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        this.applyDeathFallFrame(frames);
        this.deathFallInterval = this.createDeathFallInterval();
    },
    /**
     * Helper for `applyDeathFallFrame` extracted from the Bat class.
     * @this {Bat}
     */
    applyDeathFallFrame(frames) {
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }
    },
    /**
     * Helper for `createDeathFallInterval` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Helper for `shouldPauseDeathFall` extracted from the Bat class.
     * @this {Bat}
     */
    shouldPauseDeathFall() {
        const world = this.player?.world || this.world;
        return Boolean(world && world.isPaused);
    },
    /**
     * Helper for `updateDeathFallSpeed` extracted from the Bat class.
     * @this {Bat}
     */
    updateDeathFallSpeed(current) {
        return Math.min(current + 0.45, 12);
    },
    /**
     * Helper for `applyDeathFallMovement` extracted from the Bat class.
     * @this {Bat}
     */
    applyDeathFallMovement(verticalSpeed, horizontalDrift) {
        this.y += verticalSpeed;
        if (this.otherDirection) {
            this.x -= horizontalDrift;
        } else {
            this.x += horizontalDrift;
        }
    },
    /**
     * Helper for `checkDeathFallLanding` extracted from the Bat class.
     * @this {Bat}
     */
    checkDeathFallLanding() {
        const groundLevel = this.getGroundLevel();
        if (this.y < groundLevel) return;
        this.y = groundLevel;
        this.completeDeathFall();
    },
    /**
     * Helper for `completeDeathFall` extracted from the Bat class.
     * @this {Bat}
     */
    completeDeathFall() {
        if (this.deathFallInterval) {
            clearInterval(this.deathFallInterval);
            this.deathFallInterval = null;
        }
        this.isDeathFalling = false;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    },
    /**
     * Helper for `holdDeathFallPose` extracted from the Bat class.
     * @this {Bat}
     */
    holdDeathFallPose() {
        const frames = this.frames.DEAD || [];
        if (!frames.length) return;
        const fallFrameIndex = Math.min(1, frames.length - 1);
        const fallFrame = frames[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }
    },
    /**
     * Helper for `getGroundLevel` extracted from the Bat class.
     * @this {Bat}
     */
    getGroundLevel() {
        if (typeof this.groundY === "number") return this.groundY;
        const worldGround = this.world?.heroCharacter?.groundY;
        if (typeof worldGround === "number") return worldGround;
        return 340;
    },
    /**
     * Helper for `initializeState` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Helper for `initializeAltitudePreferences` extracted from the Bat class.
     * @this {Bat}
     */
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
    },
    /**
     * Helper for `initializeSpawn` extracted from the Bat class.
     * @this {Bat}
     */
    initializeSpawn() {
        this.spawnX = this.x;
        this.spawnY = typeof this.spawnY === "number" ? this.spawnY : 100;
        this.y = this.spawnY;
    }
};
if (typeof window !== "undefined") {
    window.BatDiveBehavior = BatDiveBehavior;
}

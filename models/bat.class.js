class Bat extends MoveableObject {
    width = 120;
    height = 90;
    y = -100;

    offsetLeft = 30;
    offsetRight = 30;
    offsetTop = 20;
    offsetBottom = 20;

    collidingObject = true;
    debugColor = "green";
    health = 16;
    damageOnCollision = 12;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = 100;
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

    IMAGES_HURT = [
        "./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_01.png",
        "./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_02.png",
        "./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_03.png",
        "./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_04.png",
    ];

    IMAGES_DEAD = [
        "./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_01.png",
        "./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_02.png",
        "./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_03.png",
        "./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_04.png",
    ];

    IMAGES_WALK = [
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_01.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_02.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_03.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_04.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_05.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_06.png",
        "./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_07.png",
    ];

    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(this.IMAGES_WALK[0]);
        this.x = 400 + Math.random() * 1000;
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);

        this.player = player;
        this.speed = 0.45 + Math.random() * 0.2;
        this.baseHorizontalSpeed = this.speed;
        this.verticalClimbSpeed = 2.2 + Math.random();
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2.4;
        this.diveAcceleration = 0.2 + Math.random() * 0.15;
        this.diveSpeedCapMultiplier = 5.5 + Math.random() * 1.2;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.spawnX = this.x;
        this.spawnY = typeof this.spawnY === "number" ? this.spawnY : 100;
        this.y = this.spawnY;

        this.animation();
    }

    animation() {
        if (this.animationInterval) {
            return;
        }
        this.animationInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;

            if (this.isDormant) {
                this.holdDormantPose();
                return;
            }

            if (this.isDead) {
                if (this.isDeathFalling) {
                    this.holdDeathFallPose();
                } else {
                    this.playAnimationWithSpeed(this.IMAGES_DEAD, 10, false);
                }
                return;
            }

            if (this.isHurt) {
                this.playAnimationWithSpeed(this.IMAGES_HURT, 12, false);
                return;
            }

            this.updateFacingDirection();
            this.performDivePattern();
        }, 1000 / 25);
    }

    updateFacingDirection() {
        if (!this.player) return;
        const batCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        const delta = heroCenter - batCenter;
        const flipThreshold = 10;

        if (delta < -flipThreshold) {
            this.otherDirection = true;
        } else if (delta > flipThreshold) {
            this.otherDirection = false;
        }
    }

    performDivePattern() {
        const heroBox = typeof this.player?.getHurtbox === "function" ? this.player.getHurtbox() : null;
        const heroCenterX = heroBox ? (heroBox.left + heroBox.right) / 2 : this.player ? this.player.x : this.x;
        const heroBottom = heroBox ? heroBox.bottom : (this.player ? this.player.y + (this.player.height ?? 120) : this.y + this.height);
        const topAltitude = this.spawnY ?? 100;

        if (this.flightPhase === "descend") {
            this.ensureDiveTarget(heroCenterX, heroBottom);
            this.diveTowardTarget();
        } else {
            this.resetDiveTarget();
            this.ascendToAltitude(topAltitude);
        }

        this.playAnimationWithSpeed(this.IMAGES_WALK, 14);
    }

    ensureDiveTarget(heroCenterX, heroBottom) {
        if (this.diveTargetX !== null && this.diveTargetY !== null) return;
        const halfWidth = this.width / 2;
        const targetX = heroCenterX;
        const groundFromWorld = this.world?.heroCharacter?.groundY ?? this.groundY ?? (heroBottom + 700);
        const safeGround = groundFromWorld - 6;
        const desiredY = heroBottom - this.height * 0.25;
        const targetY = Math.min(desiredY, safeGround);

        this.diveTargetX = targetX;
        this.diveTargetY = targetY;
        this.currentDiveSpeed = Math.max(this.currentDiveSpeed, this.baseHorizontalSpeed * 2.2);
        this.otherDirection = (this.x + halfWidth) > heroCenterX;
    }

    diveTowardTarget() {
        if (this.diveTargetX === null || this.diveTargetY === null) {
            this.flightPhase = "ascend";
            return;
        }

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const deltaX = this.diveTargetX - centerX;
        const deltaY = this.diveTargetY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;

        const speedCap = this.baseHorizontalSpeed * this.diveSpeedCapMultiplier;
        const stepSpeed = Math.min(this.currentDiveSpeed, speedCap);
        const stepX = (deltaX / distance) * stepSpeed;
        const stepY = (deltaY / distance) * stepSpeed;

        this.x += stepX;
        this.y += stepY;

        this.currentDiveSpeed = Math.min(this.currentDiveSpeed + this.diveAcceleration, speedCap);

        const closeHorizontally = Math.abs(centerX - this.diveTargetX) <= 12;
        const reachedVertical = centerY >= this.diveTargetY - 8;
        const touchedGround = this.y >= this.diveTargetY - 2;

        if (closeHorizontally && (reachedVertical || touchedGround)) {
            this.flightPhase = "ascend";
        }
    }

    resetDiveTarget() {
        this.diveTargetX = null;
        this.diveTargetY = null;
        this.currentDiveSpeed = this.baseHorizontalSpeed * 2;
    }

    ascendToAltitude(topAltitude) {
        const climbSpeed = this.verticalClimbSpeed;
        this.y = Math.max(this.y - climbSpeed, topAltitude);

        if (this.otherDirection) {
            this.x -= this.baseHorizontalSpeed;
        } else {
            this.x += this.baseHorizontalSpeed;
        }

        if (this.y <= topAltitude + 1) {
            this.flightPhase = "descend";
        }
    }

    startDeathFall() {
        if (this.deathFallInterval) return;
        this.isDeathFalling = true;
        const fallFrameIndex = Math.min(1, this.IMAGES_DEAD.length - 1);
        const fallFrame = this.IMAGES_DEAD[fallFrameIndex];
        if (fallFrame && this.imageCache?.[fallFrame]) {
            this.img = this.imageCache[fallFrame];
        }

        let verticalSpeed = 0;
        const horizontalDrift = this.baseHorizontalSpeed * 0.4;

        this.deathFallInterval = setInterval(() => {
            const world = this.player?.world || this.world;
            if (world && world.isPaused) return;

            verticalSpeed = Math.min(verticalSpeed + 0.45, 12);
            this.y += verticalSpeed;
            if (this.otherDirection) {
                this.x -= horizontalDrift;
            } else {
                this.x += horizontalDrift;
            }

            const groundLevel = this.getGroundLevel();
            if (this.y >= groundLevel) {
                this.y = groundLevel;
                clearInterval(this.deathFallInterval);
                this.deathFallInterval = null;
                this.isDeathFalling = false;
                this.frameIndex = 0;
                this.lastFrameTime = 0;
            }
        }, 1000 / 25);
    }

    holdDeathFallPose() {
        const fallFrameIndex = Math.min(1, this.IMAGES_DEAD.length - 1);
        const fallFrame = this.IMAGES_DEAD[fallFrameIndex];
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
        if (this.isDead) return;
        super.hit(amount);

        if (this.isDead) {
            AudioHub.playOne(AudioHub.BAT_DEAD);
            this.clearHurtTimeout();
            this.startDeathFall();
            return;
        }

        AudioHub.playOne(AudioHub.BAT_HURT);
        this.isHurt = true;
        this.clearHurtTimeout();
        const hurtDuration = (this.IMAGES_HURT.length / 12) * 1000;
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, hurtDuration);
    }

    holdDormantPose() {
        const idleFrame = this.IMAGES_WALK[0];
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
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key) && this[key] === images && key.startsWith('IMAGES_')) {
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
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
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

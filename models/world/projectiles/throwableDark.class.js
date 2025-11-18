/**
 * Dark ammo projectile with parabolic flight, impact animation, and damage value.
 */
class ThrowDark extends MoveableObject {
    width = 50;
    height = 50;
    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;
    collidingObject = true;
    debugColor = "red";

    throwInterval = null;
    animationInterval = null;

    isThrown = false;
    isAnimating = false;
    isImpacting = false;
    hasHit = false;
    shouldRemove = false;

    travelDistance = 0;
    startY = 0;
    straightRatio = 0.35;

    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_2.png",
    ];

    IMAGES_THROW = [
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_6.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_7.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_8.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_9.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_10.png",
    ];

    IMAGES_IMPACT = [
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_01/dark_vfx_splash_6.png",
    ];

    constructor(x, y, isThrown = false, damage = 20) {
        super();
        this.x = x;
        this.y = y;
        this.isThrown = isThrown;
        this.damage = Number.isFinite(damage) ? damage : 20;
        this.maxDistance = 720;
        this.originX = x;

        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_THROW);
        this.loadImages(this.IMAGES_IMPACT);

        this.loadImage(this.IMAGES_IDLE[0]);

        if (isThrown) {
            this.throwDark(false);
        } else {
            this.startIdleAnimation();
        }
    }

    /**
     * Loops the idle animation while the bottle sits on the ground.
     */
    startIdleAnimation() {
        if (this.isThrown || this.isAnimating) return;
        this.startLoopAnimation(this.IMAGES_IDLE, 6);
    }

    /**
     * Starts a repeating animation for the provided frames.
     *
     * @param {string[]} images
     * @param {number} fps
     */
    startLoopAnimation(images, fps) {
        this.stopAnimation();
        this.isAnimating = true;
        let frame = 0;
        this.animationInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.isImpacting) return;
            this.img = this.imageCache[images[frame]];
            frame = (frame + 1) % images.length;
        }, 1000 / fps);
    }

    /**
     * Cancels any animation interval and resets animation flags.
     */
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAnimating = false;
    }

    /**
     * Launches the projectile, scheduling its movement and throw animation.
     */
    throwDark(facingLeft = false, launch = {}) {
        this.stopAnimation();
        this.isThrown = true;
        this.isImpacting = false;
        this.hasHit = false;
        this.shouldRemove = false;
        this.currentImage = 0;

        this.otherDirection = !!facingLeft;
        this.originX = this.x;
        this.startY = this.y;
        this.travelDistance = 0;
        this.straightRatio = this.normalizeStraightRatio(launch.straightRatio);
        this.maxDistance = this.normalizeMaxDistance(launch.maxDistance);
        this.img = this.imageCache[this.IMAGES_THROW[0]];

        this.startLoopAnimation(this.IMAGES_THROW, 18);

        const horizontalPower = Number.isFinite(launch.horizontalPower) ? launch.horizontalPower : 2.8;
        this.speedX = facingLeft ? -horizontalPower : horizontalPower;

        if (this.throwInterval) clearInterval(this.throwInterval);
        this.throwInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.isImpacting) return;
            this.advanceProjectile();
        }, 25);
    }

    /**
     * Moves the projectile along its arc and triggers impacts when appropriate.
     */
    advanceProjectile() {
        this.x += this.speedX;
        this.travelDistance += Math.abs(this.speedX);

        const progress = Math.min(this.travelDistance / this.maxDistance, 1);
        const groundTarget = this.computeGroundTarget();

        if (progress >= 1) {
            this.triggerImpact();
            return;
        }

        if (progress <= this.straightRatio) {
            this.y = this.startY;
        } else {
            const curveProgress = (progress - this.straightRatio) / (1 - this.straightRatio);
            const eased = curveProgress * curveProgress;
            const dropDistance = groundTarget - this.startY;
            const nextY = this.startY + dropDistance * eased;
            if (nextY >= groundTarget - 1) {
                this.y = groundTarget;
                this.triggerImpact();
                return;
            }
            this.y = nextY;
        }

        if (Math.abs(this.x - this.originX) >= this.maxDistance) {
            this.triggerImpact();
        }
    }

    /**
     * @returns {number} Target Y position the bottle should reach.
     */
    computeGroundTarget() {
        const explicitGround = typeof this.groundY === "number" ? this.groundY : null;
        const fallback = this.startY + 160;
        if (explicitGround !== null && explicitGround > this.startY + 5) {
            return explicitGround;
        }
        return fallback;
    }

    /**
     * Clamps the duration of the straight flight phase.
     *
     * @param {number} value
     * @returns {number}
     */
    normalizeStraightRatio(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 0.35;
        return Math.min(Math.max(numeric, 0), 0.9);
    }

    /**
     * Normalizes how far the projectile can travel horizontally.
     *
     * @param {number} value
     * @returns {number}
     */
    normalizeMaxDistance(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return 720;
        return numeric;
    }

    /**
     * Stops the movement timer and horizontal velocity.
     */
    stopMotion() {
        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }
        this.speedX = 0;
    }

    /**
     * Plays the dark impact explosion and schedules removal.
     */
    triggerImpact() {
        if (this.isImpacting) return;
        this.isImpacting = true;
        this.hasHit = true;
        this.stopMotion();
        this.stopAnimation();
        AudioHub.playOne(AudioHub.CAST_DARK_IMPACT);

        const frames = this.IMAGES_IMPACT;
        let frame = 0;
        const fps = 20;

        const playNextFrame = () => {
            if (this.world?.isPaused) return;
            if (frame >= frames.length) {
                clearInterval(this.animationInterval);
                this.animationInterval = null;
                this.isAnimating = false;
                this.shouldRemove = true;
                return;
            }
            this.img = this.imageCache[frames[frame]];
            frame++;
        };

        playNextFrame();
        this.animationInterval = setInterval(playNextFrame, 1000 / fps);
    }
}

/**
 * Holy ammo projectile supporting multiple penetrations and splash animation.
 */
class ThrowHoly extends MoveableObject {
    width = 50;
    height = 50;
    offsetLeft = 15;
    offsetRight = 15;
    offsetTop = 15;
    offsetBottom = 15;
    collidingObject = true;
    debugColor = "blue";

    throwInterval = null;
    animationInterval = null;

    isThrown = false;
    isAnimating = false;
    isImpacting = false;
    shouldRemove = false;

    hitTargets = new Set();
    penetrationHits = 1;

    travelDistance = 0;
    startY = 0;
    straightRatio = 0.35;

    IMAGES_IDLE = [
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_2.png",
    ];

    IMAGES_THROW = [
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_6.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_7.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_8.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_9.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_10.png",
    ];

    IMAGES_IMPACT = [
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_1.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_2.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_3.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_4.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_5.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_6.png",
        "./01_assets/6_salsa_bottle/bottle_rotation/impact_02/holy_impact_7.png",
    ];

    constructor(x, y, isThrown = false, damage = 10) {
        super();
        this.x = x;
        this.y = y;
        this.isThrown = isThrown;
        this.damage = Number.isFinite(damage) ? damage : 10;
        this.maxDistance = 720;
        this.originX = x;

        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_THROW);
        this.loadImages(this.IMAGES_IMPACT);

        this.loadImage(this.IMAGES_IDLE[0]);

        if (isThrown) {
            this.throwHoly(false);
        } else {
            this.startIdleAnimation();
        }
    }

    startIdleAnimation() {
        if (this.isThrown || this.isAnimating) return;
        this.startLoopAnimation(this.IMAGES_IDLE, 6);
    }

    startLoopAnimation(images, fps) {
        this.stopAnimation();
        this.isAnimating = true;
        let frameIndex = 0;
        this.animationInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.isImpacting) return;
            this.img = this.imageCache[images[frameIndex]];
            frameIndex = (frameIndex + 1) % images.length;
        }, 1000 / fps);
    }

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAnimating = false;
    }

    /**
     * Launches the projectile with the provided arc configuration.
     */
    throwHoly(facingLeft = false, launch = {}) {
        this.stopAnimation();
        this.isThrown = true;
        this.isImpacting = false;
        this.shouldRemove = false;
        this.hitTargets.clear();
        this.currentImage = 0;

        this.otherDirection = !!facingLeft;
        this.originX = this.x;
        this.startY = this.y;
        this.travelDistance = 0;
        this.straightRatio = this.normalizeStraightRatio(launch.straightRatio);
        this.maxDistance = this.normalizeMaxDistance(launch.maxDistance);
        this.img = this.imageCache[this.IMAGES_THROW[0]];

        this.startLoopAnimation(this.IMAGES_THROW, 18);

        const horizontalPower = Number.isFinite(launch.horizontalPower) ? launch.horizontalPower : 5;
        this.speedX = facingLeft ? -horizontalPower : horizontalPower;

        if (this.throwInterval) clearInterval(this.throwInterval);
        this.throwInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.isImpacting) return;
            this.advanceProjectile();
        }, 25);
    }

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

    computeGroundTarget() {
        const explicitGround = typeof this.groundY === "number" ? this.groundY : null;
        const fallback = this.startY + 160;
        if (explicitGround !== null && explicitGround > this.startY + 5) {
            return explicitGround;
        }
        return fallback;
    }

    normalizeStraightRatio(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 0.35;
        return Math.min(Math.max(numeric, 0), 0.9);
    }

    normalizeMaxDistance(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return 720;
        return numeric;
    }

    stopMotion() {
        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }
        this.speedX = 0;
    }

    /**
     * Registers a hit and determines whether the projectile should explode.
     */
    registerHit(enemy) {
        if (this.isImpacting || this.hitTargets.has(enemy)) return false;
        this.hitTargets.add(enemy);

        const shouldExplode = this.hitTargets.size > this.penetrationHits;
        if (shouldExplode) {
            this.triggerImpact();
        }
        return true;
    }

    triggerImpact() {
        if (this.isImpacting) return;
        this.isImpacting = true;
        this.stopMotion();
        this.stopAnimation();
        AudioHub.playOne(AudioHub.CAST_HOLY_IMPACT);

        const frames = this.IMAGES_IMPACT;
        let frameIndex = 0;
        const fps = 20;

        const playFrame = () => {
            if (this.world?.isPaused) return;
            if (frameIndex >= frames.length) {
                clearInterval(this.animationInterval);
                this.animationInterval = null;
                this.isAnimating = false;
                this.shouldRemove = true;
                return;
            }
            this.img = this.imageCache[frames[frameIndex]];
            frameIndex++;
        };

        playFrame();
        this.animationInterval = setInterval(playFrame, 1000 / fps);
    }
}

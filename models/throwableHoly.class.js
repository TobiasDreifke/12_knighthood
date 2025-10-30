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
    gravityInterval = null;
    animationInterval = null;

    isThrown = false;
    isAnimating = false;
    isImpacting = false;
    shouldRemove = false;

    hitTargets = new Set(); 
    penetrationHits = 1;    

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

    constructor(x, y, isThrown = false) {
        super();
        this.x = x;
        this.y = y;
        this.isThrown = isThrown;

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

    throwHoly(facingLeft = false) {
        this.stopAnimation();
        this.isThrown = true;
        this.isImpacting = false;
        this.shouldRemove = false;
        this.hitTargets.clear();
        this.currentImage = 0;

        this.otherDirection = !!facingLeft;
        this.img = this.imageCache[this.IMAGES_THROW[0]];

        this.startLoopAnimation(this.IMAGES_THROW, 18);

        this.speedY = 0;
        this.applyGravity();

        const throwPower = 5;
        this.speedX = facingLeft ? -throwPower : throwPower;

        if (this.throwInterval) clearInterval(this.throwInterval);
        this.throwInterval = setInterval(() => {
            if (this.isImpacting) return;
            this.x += this.speedX;
        }, 25);
    }

    applyGravity() {
        if (this.gravityInterval) clearInterval(this.gravityInterval);
        this.gravityInterval = setInterval(() => {
            if (this.isImpacting) return;
            if (this.y < this.groundY || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
                if (this.y > this.groundY) this.y = this.groundY;
            }
        }, 1000 / 25);
    }

    stopMotion() {
        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }
        if (this.gravityInterval) {
            clearInterval(this.gravityInterval);
            this.gravityInterval = null;
        }
        this.speedX = 0;
        this.speedY = 0;
    }

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

        const frames = this.IMAGES_IMPACT;
        let frameIndex = 0;
        const fps = 20;

        const playFrame = () => {
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

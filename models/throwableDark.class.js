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
    gravityInterval = null;
    animationInterval = null;

    isThrown = false;
    isAnimating = false;
    isImpacting = false;
    hasHit = false;
    shouldRemove = false;

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

    startIdleAnimation() {
        if (this.isThrown || this.isAnimating) return;
        this.startLoopAnimation(this.IMAGES_IDLE, 6);
    }

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

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAnimating = false;
    }

    throwDark(facingLeft = false) {
        this.stopAnimation();
        this.isThrown = true;
        this.isImpacting = false;
        this.hasHit = false;
        this.shouldRemove = false;
        this.currentImage = 0;

        this.otherDirection = !!facingLeft;
        this.img = this.imageCache[this.IMAGES_THROW[0]];

        this.startLoopAnimation(this.IMAGES_THROW, 18);

        // launch motion
        this.speedY = 0;
        this.applyGravity();

        const throwPower = 2;
        this.speedX = facingLeft ? -throwPower : throwPower;

        if (this.throwInterval) clearInterval(this.throwInterval);
        this.throwInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            if (this.isImpacting) return;
            this.x += this.speedX;
        }, 25);
    }

    applyGravity() {
        if (this.gravityInterval) clearInterval(this.gravityInterval);
        this.gravityInterval = setInterval(() => {
            if (this.world?.isPaused) return;
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

    triggerImpact() {
        if (this.isImpacting) return;
        this.isImpacting = true;
        this.hasHit = true;
        this.stopMotion();
        this.stopAnimation();

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

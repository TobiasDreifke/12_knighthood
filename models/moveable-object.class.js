class MoveableObject extends DrawableObject {

    health = 100;

    speed = 0.15;

    speedY = 0;
    acceleration = 2.5;

    otherDirection = false;
    lastHit = 0;

    damageOnCollision = 5;

    isColliding(mo) {
        const thisLeft = this.x + this.offsetLeft;
        const thisTop = this.y + this.offsetTop;
        const thisRight = this.x + this.width - this.offsetRight;
        const thisBottom = this.y + this.height - this.offsetBottom;

        const otherLeft = mo.x + mo.offsetLeft;
        const otherTop = mo.y + mo.offsetTop;
        const otherRight = mo.x + mo.width - mo.offsetRight;
        const otherBottom = mo.y + mo.height - mo.offsetBottom;

        return thisRight > otherLeft &&
            thisBottom > otherTop &&
            thisLeft < otherRight &&
            thisTop < otherBottom;
    }

    moveRight() {
        this.x += this.speed;
        this.otherDirection = false;
    }

    moveLeft() {
        this.x -= this.speed;
        this.otherDirection = true;
    };

    playAnimation(img) {
        let i = this.currentImage % img.length;
        let path = img[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowHoly) {
            return true;
        } else {
            return this.y < 300;
        }
    }

    jump() {
        this.speedY = 30;
    }

    hit() {

        // console.log("is hit");
        this.health -= this.damageOnCollision;
        if (this.health < 0) {
            this.health = 0;
            // console.log("is dead");
        }

        this.isHurt = true;
    }

    isDead() {
        return this.health === 0;
    }
}


class DrawableObject {
    x = 120;
    y = 300;

    // ----- HURTBOX -------    
    offsetLeft = 0;
    offsetRight = 0;
    offsetTop = 0;
    offsetBottom = 0;

    // ----- HITBOX -------
    hitboxOffsetLeft = 0;
    hitboxOffsetRight = 0;
    hitboxOffsetTop = 0;
    hitboxOffsetBottom = 0;


    img;
    imageCache = {};
    currentImage = 0;

    width = 100;
    height = 100;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path
    }


    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };

    drawRectangle(ctx) {
        if (!this.debugColor) return;  // skip if no color set

        ctx.beginPath();
        ctx.lineWidth = "5";
        ctx.strokeStyle = this.debugColor;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }


    drawCollisionBox(ctx) {
        if (!this.collidingObject) return; // skip if no collision box

        const x = this.x + (this.offsetLeft || 0);
        const y = this.y + (this.offsetTop || 0);
        const width = this.width - (this.offsetLeft || 0) - (this.offsetRight || 0);
        const height = this.height - (this.offsetTop || 0) - (this.offsetBottom || 0);

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.collisionColor || "yellow"; // fallback color

        ctx.rect(x, y, width, height);
        ctx.stroke();
    }

    drawHitbox(ctx) {
        if (!this.isAttacking) return;

        const hb = this.getHitbox();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.rect(hb.left, hb.top, hb.right - hb.left, hb.bottom - hb.top);
        ctx.stroke();
    }

    getHurtbox() {
        return {
            left: this.x + this.offsetLeft,
            top: this.y + this.offsetTop,
            right: this.x + this.width - this.offsetRight,
            bottom: this.y + this.height - this.offsetBottom,
        };
    }

    getHitbox() {
        const hurtbox = this.getHurtbox();

        const left = this.otherDirection
            ? hurtbox.left - this.hitboxWidth - (this.hitboxOffsetLeft || 0)
            : hurtbox.right + (this.hitboxOffsetRight || 0);

        const right = this.otherDirection
            ? hurtbox.left - (this.hitboxOffsetLeft || 0)
            : hurtbox.right + this.hitboxWidth + (this.hitboxOffsetRight || 0);

        const top = hurtbox.top + (this.hitboxOffsetTop || 0);
        const bottom = hurtbox.bottom - (this.hitboxOffsetBottom || 0);

        return { left, top, right, bottom };
    }





}

/**
 * Base sprite that knows how to preload images and expose collision/hitbox helpers
 * used by both the hero and enemies.
 */
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

    /**
     * Loads a single sprite frame and stores it as the active image on this object.
     *
     * @param {string} path
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path
    }


    /**
     * Loads a batch of frames and caches them by file path.
     *
     * @param {string[]} arr
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };

    /**
     * Draws the debug bounding rectangle when `debugColor` is set.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawRectangle(ctx) {
        if (!this.debugColor) return;  // skip if no color set

        ctx.beginPath();
        ctx.lineWidth = "5";
        ctx.strokeStyle = this.debugColor;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }


    /**
     * Renders the hurtbox outline for debugging if the object is collidable.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawCollisionBox(ctx) {
        const box = this.getCollisionBox();
        if (!box) return;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = box.color;
        ctx.rect(box.left, box.top, box.width, box.height);
        ctx.stroke();
    }

    /**
     * Resolves the current hurtbox rectangle in world coordinates.
     *
     * @returns {{left:number,top:number,width:number,height:number,color:string}|null}
     */
    getCollisionBox() {
        if (!this.collidingObject) return null;
        const left = this.x + (this.offsetLeft || 0);
        const top = this.y + (this.offsetTop || 0);
        const width = this.width - (this.offsetLeft || 0) - (this.offsetRight || 0);
        const height = this.height - (this.offsetTop || 0) - (this.offsetBottom || 0);
        return { left, top, width, height, color: this.collisionColor || "yellow" };
    }

    /**
     * Renders the object's hitbox (used for attacks) if one is active.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawHitbox(ctx) {
        if (!this.isAttacking) return;

        const hb = this.getHitbox();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.rect(hb.left, hb.top, hb.right - hb.left, hb.bottom - hb.top);
        ctx.stroke();
    }

    /**
     * @returns {{left:number,top:number,right:number,bottom:number}} Hurtbox bounds.
     */
    getHurtbox() {
        return {
            left: this.x + this.offsetLeft,
            top: this.y + this.offsetTop,
            right: this.x + this.width - this.offsetRight,
            bottom: this.y + this.height - this.offsetBottom,
        };
    }

    /**
     * Computes the attack hitbox, mirroring offsets when `otherDirection` is true.
     *
     * @returns {{left:number,top:number,right:number,bottom:number}}
     */
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

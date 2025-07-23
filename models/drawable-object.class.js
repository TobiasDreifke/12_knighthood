class DrawableObject {
    x = 120;
    y = 300;

    offsetLeft = 0;
    offsetRight = 0;
    offsetTop = 0;
    offsetBottom = 0;


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



}

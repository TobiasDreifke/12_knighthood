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
        if (this instanceof Hero) {
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "green";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        if (this instanceof Goblin) {
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "red";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        if (this instanceof SkeletonBoss) {
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "darkred";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    };


    drawCollisionBox(ctx) {
        if (this instanceof Hero || this instanceof Goblin || this instanceof SkeletonBoss) {
            const x = this.x + this.offsetLeft;
            const y = this.y + this.offsetTop;
            const width = this.width - this.offsetLeft - this.offsetRight;
            const height = this.height - this.offsetTop - this.offsetBottom;

            ctx.beginPath();
            ctx.lineWidth = "2";

            if (this instanceof Hero) {
                ctx.strokeStyle = "red";
            } else if (this instanceof Goblin) {
                ctx.strokeStyle = "green";
            } else if (this instanceof SkeletonBoss) {
                ctx.strokeStyle = "darkgreen";
            }

            ctx.rect(x, y, width, height);
            ctx.stroke();
        }
    };



}

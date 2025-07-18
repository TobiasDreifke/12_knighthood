class MoveableObject {
    x = 120;
    y = 300;

    width = 100;
    height = 100;

    img;
    imageCache = {};
    currentImage = 0;

    speed = 0.15;

    speedY = 0;
    acceleration = 2.5;

    otherDirection = false;

    // loadgImage("img/test.png")
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById("image") <img id="image">
        this.img.src = path
    }

    // @param {array} arr - ["img/image1.png", "img/image2.png"]    

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };

    drawRectangle(ctx) {
        // if (this instanceof Hero && this.isColliding) {
        //     ctx.beginPath();
        //     ctx.lineWidth = "5";
        //     ctx.strokeStyle = "blue";
        //     ctx.rect(this.x, this.y, this.width, this.height);
        //     ctx.stroke();
        // }
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

    isColliding(mo) {
        return this.x + this.width > mo.x &&
            this.y + this.height > mo.y &&
            this.x < mo.x &&
            this.y < mo.y + mo.height;
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

        // OLD AND BUGGED VERSION BECAUSE IT LOOKS FOR WALK.LENGTH
        // let i = this.currentImage % this.IMAGES_WALK.length;
        // // WALK ANIMATION
        // let path = img[i];
        // this.img = this.imageCache[path];
        // this.currentImage++
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
        return this.y < 300;
    }

    jump() {
        this.speedY = 30;
    }

    // fall() {
    //     applyGravity();
    //  }
}


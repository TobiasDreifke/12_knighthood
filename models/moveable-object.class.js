class MoveableObject {
    x = 120;
    y = 300;
    img;
    width = 100;
    height = 100;
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

    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 25);
    };

    playAnimation(img) {
        let i = this.currentImage % this.IMAGES_WALK.length;

        // WALK ANIMATION
        let path = img[i];
        this.img = this.imageCache[path];
        this.currentImage++
    }

    applyGravity() {
        setInterval(() => {
            if (isAboveGround()) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isAboveGround(){
        return this.y < 180;
    }
}


class MoveableObject {
    x = 120;
    y = 300;
    img;
    height = 100;
    width = 100;

    // loadgImage("img/test.png")
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById("image") <img id="image">
        this.img.src = path
    }

    moveRight() {
        console.log("moving right");
    }

    moveLeft() { }
}


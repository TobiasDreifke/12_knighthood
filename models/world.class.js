class World {
    heroCharacter = new Hero();
    enemies = [
        new Goblin(),
        new Goblin(),
        new Goblin(),
    ];
    backgroundObjects = [
        new BackgroundObject("./01_assets/5_background/layers/parallax-demon-woods-bg.png", 0, 0),
        new BackgroundObject("./01_assets/5_background/layers/3_third_layer/parallax-demon-woods-far-trees.png", 0, 0),
        new BackgroundObject("./01_assets/5_background/layers/2_second_layer/parallax-demon-woods-mid-trees.png", 0, 0),
        new BackgroundObject("./01_assets/5_background/layers/1_first_layer/parallax-demon-woods-close-trees.png", 0, 0)
    ]

    canvas;
    ctx;
    keyboard;
    camera_x = -100;
    // bg_thirdLayer = new BgThirdLayer();
    // bg_secondLayer = new BgSecondLayer();
    // bg_firstLayer = new BgFirstLayer();
    clouds = [new Cloud()];

    constructor(canvasPara, keyboardPara) {
        this.ctx = canvasPara.getContext("2d");
        this.canvas = canvasPara;
        this.keyboard = keyboardPara;
        this.draw();
        this.setWorld();
    }

    setWorld() {
        this.heroCharacter.world = this;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)


        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addToMap(this.heroCharacter)
        this.addObjectsToMap(this.enemies);

        this.ctx.translate(-this.camera_x, 0);


        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o)
        });
    }

    addToMap(MoveableObjects) {
        if (MoveableObjects.otherDirection) {
            this.flipImage(MoveableObjects);
        }

        // MoveableObjects.draw(this.ctx);

        if (MoveableObjects.otherDirection === false) {
            this.flipImageBack(MoveableObjects);
        }
    }

    flipImage(MoveableObjects) {
        this.ctx.save();
        this.ctx.translate(MoveableObjects.x + MoveableObjects.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(MoveableObjects.img, 0, MoveableObjects.y, MoveableObjects.width, MoveableObjects.height);
        this.ctx.restore();
    }

    flipImageBack(MoveableObjects) {
        this.ctx.save();
        this.ctx.drawImage(MoveableObjects.img, MoveableObjects.x, MoveableObjects.y, MoveableObjects.width, MoveableObjects.height);
        this.ctx.restore();
    }
}


// LayerThree
// this.ctx.drawImage(
//     this.bg_thirdLayer.img,
//     this.bg_thirdLayer.x,
//     this.bg_thirdLayer.y,
//     this.bg_thirdLayer.height,
//     this.bg_thirdLayer.width
// );
// // LayerTwo
// this.ctx.drawImage(
//     this.bg_secondLayer.img,
//     this.bg_secondLayer.x,
//     this.bg_secondLayer.y,
//     this.bg_secondLayer.height,
//     this.bg_secondLayer.width
// );
// // LayerOne
// this.ctx.drawImage(
//     this.bg_firstLayer.img,
//     this.bg_firstLayer.x,
//     this.bg_firstLayer.y,
//     this.bg_firstLayer.height,
//     this.bg_firstLayer.width
// );
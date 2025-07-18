class World {
    heroCharacter = new Hero();

    level = level_01

    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    // bg_thirdLayer = new BgThirdLayer();
    // bg_secondLayer = new BgSecondLayer();
    // bg_firstLayer = new BgFirstLayer();

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

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.heroCharacter)


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
        if (MoveableObjects.otherDirection === false) {
            this.flipImageBack(MoveableObjects);
        }
        MoveableObjects.drawRectangle(this.ctx);
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
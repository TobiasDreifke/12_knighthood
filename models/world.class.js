class World {
    IntervalIDs = [];
    IntervalID = 1;

    heroCharacter = new Hero();
    statusBarHealth = new StatusbarHealth();
    statusBarEnergy = new StatusbarEnergy();
    statusBarAmmo = new StatusbarAmmo();

    level = level_01


    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    // bg_thirdLayer = new BgThirdLayer();
    // bg_secondLayer = new BgSecondLayer();
    // bg_firstLayer = new BgFirstLayer();

    // setStopableInterval(fn, time) {
    //     let id = setInterval(fn, time);
    //     this.IntervalIDs.push(id);
    // }

    // stopGame() {
    //     this.IntervalIDs.forEach(clearInterval);
    // }

    // // sayHello() {
    // //     console.log("hello", this.IntervalID);
    // //     this.IntervalID++
    // // }
    // // sayGoodbye() {
    // //     console.log("tschau", this.IntervalID);
    // //     this.IntervalID++
    // // }


    constructor(canvasPara, keyboardPara) {
        this.ctx = canvasPara.getContext("2d");
        this.canvas = canvasPara;
        this.keyboard = keyboardPara;
        this.draw();
        this.setWorld();
        this.checkCollisions();


        // this.setStopableInterval(() => this.sayHello(), 500);
        // this.setStopableInterval(() => this.sayGoodbye(), 500);
    }

    setWorld() {
        this.heroCharacter.world = this;
    }

    checkCollisions() {
        setInterval(() => {
            this.level.enemies.forEach((enemies) => {
                if (this.heroCharacter.isColliding(enemies) && this.heroCharacter.health >= 0) {
                    this.heroCharacter.hit();
                    this.statusBarHealth.setPercentage(this.heroCharacter.health);
                    this.statusBarEnergy.setPercentage(this.heroCharacter.health);
                    this.statusBarAmmo.setPercentage(this.heroCharacter.health);
                }
            });
        }, 200);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.camera_x, 0); // back
        // ------------- Space for fixed objects ----------------
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarEnergy);
        this.addToMap(this.statusBarAmmo);
        this.ctx.translate(this.camera_x, 0); //forward

        this.addToMap(this.heroCharacter);


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


    addToMap(DrawableObject) {
        DrawableObject.drawRectangle(this.ctx); // Object Image Box
        DrawableObject.drawCollisionBox(this.ctx); // Object Collision Box

        if (DrawableObject.otherDirection === true) {
            this.flipImage(DrawableObject);
        } else if (DrawableObject.otherDirection === false) {
            this.flipImageBack(DrawableObject);
        } else {
            this.ctx.drawImage(DrawableObject.img, DrawableObject.x, DrawableObject.y, DrawableObject.width, DrawableObject.height);
        }
    }

    flipImage(DrawableObject) {
        this.ctx.save();
        this.ctx.translate(DrawableObject.x + DrawableObject.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(DrawableObject.img, 0, DrawableObject.y, DrawableObject.width, DrawableObject.height);
        this.ctx.restore();
    }

    flipImageBack(DrawableObject) {
        this.ctx.save();
        this.ctx.drawImage(DrawableObject.img, DrawableObject.x, DrawableObject.y, DrawableObject.width, DrawableObject.height);
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
class World {
	IntervalIDs = [];
	IntervalID = 1;

	heroCharacter = new Hero();
	statusBarHealth = new StatusbarHealth();
	statusBarEnergy = new StatusbarEnergy();
	statusBarAmmo = new StatusbarAmmo(this.level);

	throwableHoly = [];
	// throwableDark = new ThrowableDark();
	throwableDark = [];
	darkAmmo = [];
	holyAmmo = [];

	level = level_01


	canvas;
	ctx;
	keyboard;
	camera_x = 0;
	// bg_thirdLayer = new BgThirdLayer();
	// bg_secondLayer = new BgSecondLayer();
	// bg_firstLayer = new BgFirstLayer();

	// setStopableInterval(fn, time) {
	// let id = setInterval(fn, time);
	// this.IntervalIDs.push(id);
	// }

	// stopGame() {
	// this.IntervalIDs.forEach(clearInterval);
	// }

	// // sayHello() {
	// // console.log("hello", this.IntervalID);
	// // this.IntervalID++
	// // }
	// // sayGoodbye() {
	// // console.log("tschau", this.IntervalID);
	// // this.IntervalID++
	// // }


	constructor(canvasPara, keyboardPara) {

		this.ctx = canvasPara.getContext("2d");
		this.canvas = canvasPara;
		this.keyboard = keyboardPara;
		this.draw();
		this.setWorld();
		this.run();
		console.log(this.level.throwables);



	}

	setWorld() {
		this.heroCharacter.world = this;
		this.statusBarAmmo.world = this;
	}

	run() {

		// --------- CHECK COLLISION ------------
		setInterval(() => {
			this.checkCollisions();
			this.throwHoly();
			this.throwDark();
			// this.throwDark();
		}, 200);
	}

	throwHoly() {
		if (this.keyboard.THROWHOLY && this.holyAmmo.length > 0) {
			console.log("Throwing holy bottle, ammo left:", this.holyAmmo.length);

			let holy = this.holyAmmo.pop();

			const facingLeft = this.heroCharacter.otherDirection;

			holy.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
			holy.y = this.heroCharacter.y + 20;
			holy.isThrown = true;

			holy.throwHoly(facingLeft);

			this.throwableHoly.push(holy);

			this.statusBarAmmo.percentage -= 10;
			if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
			this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);
		} else if (this.keyboard.THROWHOLY) {
			console.log("No holy ammo left!");
		}
	}

	throwDark() {
		if (this.keyboard.THROWDARK && this.darkAmmo.length > 0) {
			console.log("Throwing dark bottle, ammo left:", this.darkAmmo.length);

			let dark = this.darkAmmo.pop();

			const facingLeft = this.heroCharacter.otherDirection;

			dark.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
			dark.y = this.heroCharacter.y + 20;
			dark.isThrown = true;

			dark.throwDark(facingLeft);

			this.throwableDark.push(dark);

			this.statusBarAmmo.percentage -= 10;
			if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
			this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);
		} else if (this.keyboard.THROWDARK) {
			console.log("No dark ammo left!");
		}
	}

	checkInventory() {

	}

	checkCollisions() {
		this.level.enemies.forEach((enemy) => {
			if (this.heroCharacter.isColliding(enemy) && this.heroCharacter.health >= 0) {
				this.heroCharacter.hit();
					enemy.hit();
				this.statusBarHealth.setPercentage(this.heroCharacter.health);
				this.statusBarEnergy.setPercentage(this.heroCharacter.health);
			}


	});



	this.level.throwables.forEach((throwable) => {
		if (this.heroCharacter.isColliding(throwable)) {
			if (throwable instanceof ThrowDark) {
				this.darkAmmo.push(throwable);
				console.log("Dark ammo collected:", this.darkAmmo.length);
			}

			if (throwable instanceof ThrowHoly) {
				this.holyAmmo.push(throwable);
				console.log("Holy ammo collected:", this.holyAmmo.length);
			}

			this.statusBarAmmo.collect();
		}
	});

	this.level.throwables = this.level.throwables.filter(
		(t) => !this.heroCharacter.isColliding(t)
	);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.translate(this.camera_x, 0);

		this.addObjectsToMap(this.level.backgroundObjects);
		this.addObjectsToMap(this.level.enemies);
		this.addObjectsToMap(this.level.clouds);
		this.addObjectsToMap(this.level.throwables);
		// this.addObjectsToMap(this.level.throwables);
		this.addObjectsToMap(this.throwableHoly);
		this.addObjectsToMap(this.throwableDark);


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
// this.bg_thirdLayer.img,
// this.bg_thirdLayer.x,
// this.bg_thirdLayer.y,
// this.bg_thirdLayer.height,
// this.bg_thirdLayer.width
// );
// // LayerTwo
// this.ctx.drawImage(
// this.bg_secondLayer.img,
// this.bg_secondLayer.x,
// this.bg_secondLayer.y,
// this.bg_secondLayer.height,
// this.bg_secondLayer.width
// );
// // LayerOne
// this.ctx.drawImage(
// this.bg_firstLayer.img,
// this.bg_firstLayer.x,
// this.bg_firstLayer.y,
// this.bg_firstLayer.height,
// this.bg_firstLayer.width
// );

class World {
	IntervalIDs = [];
	IntervalID = 1;

	heroCharacter = new Hero();
	statusBarHealth = new StatusbarHealth();
	statusBarEnergy = new StatusbarEnergy();
	statusBarAmmo = new StatusbarAmmo(this.level);

	throwableHoly = [];
	throwableDark = [];
	darkAmmo = [];
	holyAmmo = [];
	heroinventory = [];
	lastDarkThrow = 0;
	lastHolyThrow = 0;
	darkCooldownMs = 1000;
	holyCooldownMs = 500;

	level = level_01


	canvas;
	ctx;
	keyboard;
	camera_x = 0;





	constructor(canvasPara, keyboardPara) {
		this.ctx = canvasPara.getContext("2d");
		this.canvas = canvasPara;
		this.keyboard = keyboardPara;
		// this.draw();
		this.setWorld();
		// this.run();
		// console.log(this.level.throwables);
		console.log(this.level.pickables);
	}

	start() {
		this.draw();  // start rendering loop
		this.run();   // start intervals (collision checking, throwing, etc.)
	}
	setWorld() {
		this.heroCharacter.world = this;
		this.statusBarAmmo.world = this;

		this.level.enemies.forEach(enemy => {
			if (enemy instanceof SkeletonBoss) {
				enemy.player = this.heroCharacter;
				enemy.animation();
			}
		});
	}

	run() {
		const collisionId = setInterval(() => {
			this.checkCollisions();
		}, 200);
		this.IntervalIDs.push(collisionId);

		const throwId = setInterval(() => {
			this.throwHoly();
			this.throwDark();
		}, 10);
		this.IntervalIDs.push(throwId);
	}

	stopAllIntervals() {
		this.IntervalIDs.forEach(clearInterval);
		this.IntervalIDs = [];
	}

	throwHoly() {
		if (!this.keyboard.THROWHOLY) return;

		const now = Date.now();
		if (now - this.lastHolyThrow < this.holyCooldownMs) return;
		if (this.holyAmmo.length === 0) return;

		this.lastHolyThrow = now;
		console.log("Throwing holy bottle, ammo left:", this.holyAmmo.length);

		const holy = this.holyAmmo.pop();
		const facingLeft = this.heroCharacter.otherDirection;

		holy.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
		holy.y = this.heroCharacter.y + 20;
		holy.isThrown = true;

		holy.throwHoly(facingLeft);

		this.throwableHoly.push(holy);

		this.statusBarAmmo.percentage -= 10;
		if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
		this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);

		if (this.heroCharacter.triggerCastAnimation) {
			this.heroCharacter.triggerCastAnimation('HOLY');
		}
	}

	throwDark() {
		if (!this.keyboard.THROWDARK) return;

		const now = Date.now();
		if (now - this.lastDarkThrow < this.darkCooldownMs) return;
		if (this.darkAmmo.length === 0) return;

		this.lastDarkThrow = now;
		console.log("Throwing dark bottle, ammo left:", this.darkAmmo.length);

		const dark = this.darkAmmo.pop();
		const facingLeft = this.heroCharacter.otherDirection;

		dark.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
		dark.y = this.heroCharacter.y + 20;
		dark.isThrown = true;

		dark.throwDark(facingLeft);

		this.throwableDark.push(dark);

		this.statusBarAmmo.percentage -= 10;
		if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
		this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);

		if (this.heroCharacter.triggerCastAnimation) {
			this.heroCharacter.triggerCastAnimation('DARK');
		}
	}

	canThrowDark() {
		return (Date.now() - this.lastDarkThrow) >= this.darkCooldownMs && this.darkAmmo.length > 0;
	}

	canThrowHoly() {
		return (Date.now() - this.lastHolyThrow) >= this.holyCooldownMs && this.holyAmmo.length > 0;
	}



	checkInventory() {
		CurrentInventory = this.heroinventory;
		console.log("current inventory list" + CurrentInventory);
	}

	checkCollisions() {
		this.level.enemies.forEach((enemy) => {

			// player attack -> enemy gets hit
			// if (this.heroCharacter.isAttacking && this.heroCharacter.isHitting(enemy)) {
			// 	enemy.hit();
			// 	console.log(`[${enemy.constructor.name}] hit by hero attack!`);
			// }



			// enemy -> player collision -> player gets hit
			if (this.heroCharacter.isColliding(enemy)) {
				this.heroCharacter.hit();
				this.statusBarHealth.setPercentage(this.heroCharacter.health);
				this.statusBarEnergy.setPercentage(this.heroCharacter.health);
			}

			// if (enemy.isHitting(this.heroCharacter)) {
			// 	this.heroCharacter.hit();
			// 	this.statusBarHealth.setPercentage(this.heroCharacter.health);
			// 	this.statusBarEnergy.setPercentage(this.heroCharacter.health);
			// }

			if (enemy instanceof SkeletonBoss && enemy.isDead) {
				this.showEndScreen();
			}
		});

		this.throwableHoly.forEach((projectile) => {
			if (projectile.isImpacting) return;
			this.level.enemies.forEach(enemy => {
				if (enemy.isDead) return;
				if (projectile.isColliding(enemy) && projectile.registerHit(enemy)) {
					enemy.hit();
					console.log(`[${enemy.constructor.name}] hit by HolyThrow!`);
				}
			});
		});

		this.throwableHoly = this.throwableHoly.filter(projectile => !projectile.shouldRemove);


		this.throwableDark.forEach((projectile) => {
			if (projectile.hasHit) return;
			this.level.enemies.some(enemy => {
				if (!enemy.isDead && projectile.isColliding(enemy)) {
					enemy.hit();
					projectile.triggerImpact();
					console.log(`[${enemy.constructor.name}] hit by DarkThrow!`);
					return true;
				}
				return false;
			});
		});

		this.throwableDark = this.throwableDark.filter(projectile => !projectile.shouldRemove);



		// --- PICKUP COLLISION (for ammo, etc.) ---
		this.level.throwables.forEach((throwable) => {
			if (this.heroCharacter.isColliding(throwable)) {
				if (throwable instanceof ThrowDark) {
					this.darkAmmo.push(throwable);
					// console.log("Dark ammo collected:", this.darkAmmo.length);
				}

				if (throwable instanceof ThrowHoly) {
					this.holyAmmo.push(throwable);
					// console.log("Holy ammo collected:", this.holyAmmo.length);
				}

				this.statusBarAmmo.collect();
			}
		});

		this.level.pickables.forEach((pickable) => {
			if (this.heroCharacter.isColliding(pickable)) {
				if (pickable instanceof Sword) {
					this.heroinventory.push(pickable);
					console.log("Sword collected:", this.heroinventory.length);
					this.heroCharacter.hasSword = true;
					this.heroCharacter.startDrawSwordAnimation();
					this.level.pickables = this.level.pickables.filter(p => p !== pickable);
				}
			}
		});

		// remove collected items
		this.level.throwables = this.level.throwables.filter(
			(t) => !this.heroCharacter.isColliding(t)
		);
	}


	draw() {

		if (this.isRunning === false) return; // stops rendering when game ended

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.translate(this.camera_x, 0);


		this.addObjectsToMap(this.level.backgroundObjects);

		// then draw other stuff
		this.addObjectsToMap(this.level.enemies);
		this.addObjectsToMap(this.level.clouds);
		this.addObjectsToMap(this.level.throwables);
		this.addObjectsToMap(this.level.pickables);
		this.addObjectsToMap(this.throwableHoly);
		this.addObjectsToMap(this.throwableDark);

		this.ctx.translate(-this.camera_x, 0);

		// UI elements
		this.addToMap(this.statusBarHealth);
		this.addToMap(this.statusBarEnergy);
		this.addToMap(this.statusBarAmmo);

		this.ctx.translate(this.camera_x, 0);
		this.addToMap(this.heroCharacter);
		this.ctx.translate(-this.camera_x, 0);

		requestAnimationFrame(() => this.draw());
	}


	addObjectsToMap(objects) {
		objects.forEach(o => {
			this.addToMap(o)
		});
	}


	addToMap(DrawableObject) {
		DrawableObject.drawRectangle(this.ctx); // Object Image Box
		DrawableObject.drawCollisionBox(this.ctx); // Object HurtBox
		DrawableObject.drawHitbox(this.ctx); // Object HitBox 
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

	showEndScreen() {
		this.isRunning = false;          // stop draw loop
		this.stopAllIntervals();         // stop background intervals

		const endScreen = document.getElementById("end-screen");
		endScreen.style.display = "flex";
		setTimeout(() => {
			endScreen.style.opacity = 1;
		}, 50);
	}

}









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

class MoveableObject extends DrawableObject {

	health = 100;

	speed = 0.15;
	slideSpeed = this.speed + 10;

	groundY = 300;
	speedY = 0;
	acceleration = 2.5;

	otherDirection = false;
	lastHit = 0;

	damageOnCollision = 10;

	isColliding(mo) {

		if (this.isDead || mo.isDead) {
			return false;
		}

		else {
			const thisLeft = this.x + this.offsetLeft;
			const thisTop = this.y + this.offsetTop;
			const thisRight = this.x + this.width - this.offsetRight;
			const thisBottom = this.y + this.height - this.offsetBottom;

			const otherLeft = mo.x + mo.offsetLeft;
			const otherTop = mo.y + mo.offsetTop;
			const otherRight = mo.x + mo.width - mo.offsetRight;
			const otherBottom = mo.y + mo.height - mo.offsetBottom;

			return thisRight > otherLeft &&
				thisBottom > otherTop &&
				thisLeft < otherRight &&
				thisTop < otherBottom;
		}

	}

	moveRight() {
		this.x += this.speed;
		this.otherDirection = false;
	}

	slideRight() {
		this.x += this.slideSpeed;
		this.otherDirection = false;
		// console.log("SLIDIIIIIIIING");
	}

	moveLeft() {
		this.x -= this.speed;
		this.otherDirection = true;
	};

	slideLeft() {
		this.x -= this.slideSpeed;
		this.otherDirection = true;
		// console.log("SLIDIIIIIIIING");
	}

	crouch() {
		this.x += 0;
	}

	playAnimation(img) {

		let i = this.currentImage % img.length;
		let path = img[i];
		this.img = this.imageCache[path];
		this.currentImage++;

		if (this.onAnimationFrame) { // for SoundSynching
			this.onAnimationFrame(img, i);
		}

		// ------------ for Bugfixing throw animation ---------

		// if (img === this.IMAGES_IDLE) { 
		// console.log(`[${this.constructor.name}] playing IDLE frame`, path);
		// } else if (img === this.IMAGES_THROW) {
		// console.log(`[${this.constructor.name}] playing THROW frame`, path);
		// } if (this.constructor.name === "ThrowDark" && img === this.IMAGES_IDLE) {
		// console.warn("[ThrowDark] !!! IDLE detected !!!");
		// }

	}

	applyGravity() {
		setInterval(() => {
			if (this.y < this.groundY || this.speedY > 0) {
				this.y -= this.speedY;
				this.speedY -= this.acceleration;
				if (this.y > this.groundY) this.y = this.groundY;
			}
		}, 1000 / 25);
	}

	isAboveGround() {
		if (this instanceof ThrowHoly || this instanceof ThrowDark) return true;
		return this.y < this.groundY;
	}

	jump() {
		this.speedY = 30;
	} ddd

	hit() {
		if (this.isDead) return; 
		console.log(`[${this.constructor.name}] is hit`);
		this.health -= this.damageOnCollision;

		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
			console.log(`[${this.constructor.name}] is dead`);
		} else {
			this.isHurt = true;
		}
	}

	// isDead() {
	// 	return this.health === 0;
	// }
}


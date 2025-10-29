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
		if (this.isDead || mo.isDead) return false;

		const a = this.getHurtbox(); // this object's hurtbox
		const b = mo.getHurtbox();   // other object's hurtbox

		return a.right > b.left &&
			a.bottom > b.top &&
			a.left < b.right &&
			a.top < b.bottom;
	}

	isHitting(mo) {
		if (this.isDead || mo.isDead) return false;

		const a = this.getHitbox();  // this object's hitbox
		const b = mo.getHurtbox();   // enemy’s hurtbox

		return a.right > b.left &&
			a.bottom > b.top &&
			a.left < b.right &&
			a.top < b.bottom;
	}

	
	playAnimationWithSpeed(images, fps, loop = true) {
		const now = Date.now();
		if (!this.lastFrameTime) this.lastFrameTime = 0;
		if (this.frameIndex === undefined) this.frameIndex = 0;

		const frameDuration = 1000 / fps;

		if (now - this.lastFrameTime > frameDuration) {
			this.lastFrameTime = now;

			// Set frame
			if (this.frameIndex >= images.length) {
				if (loop) {
					this.frameIndex = 0;
				} else {
					this.frameIndex = images.length - 1; // stop at last frame
				}
			}

			const path = images[this.frameIndex];
			this.img = this.imageCache[path];

			this.frameIndex++;
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


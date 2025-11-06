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
		if (this.onAnimationFrame) {
			this.onAnimationFrame(images, this.frameIndex);
		}
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

	getWorld() {
		if (this.world) return this.world;
		if (this.player && this.player.world) return this.player.world;
		if (this.owner && this.owner.world) return this.owner.world;
		return null;
	}

	applyGravity() {
		setInterval(() => {
			const world = this.getWorld();
			if (world && world.isPaused) return;
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

	handleHit(amount = this.damageOnCollision, options = {}) {
		const {
			deadSound = null,
			hurtSound = null,
			hurtFps = 14,
			hurtFrameCount = null,
			onDeath = null,
			onHurtStart = null,
			onHurtEnd = null,
		} = options;

		if (this.isDead) return false;

		this.health -= amount;
		console.log(`[${this.constructor.name}] is hit with [${amount}]`);

		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
			console.log(`[${this.constructor.name}] is dead`);
		} else {
			this.isHurt = true;
		}

		if (this.isDead) {
			if (deadSound) AudioHub.playOne(deadSound);
			if (typeof onDeath === "function") onDeath();
			return true;
		}

		if (hurtSound) AudioHub.playOne(hurtSound);
		if (typeof onHurtStart === "function") onHurtStart();

		const defaultFrames = Array.isArray(this.frames?.HURT) ? this.frames.HURT.length : this.IMAGES_HURT?.length ?? 0;
		const frames = typeof hurtFrameCount === "number" ? hurtFrameCount : defaultFrames;
		const duration = frames > 0 ? (frames / hurtFps) * 1000 : 1000;
		if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
		this.hurtTimeout = setTimeout(() => {
			if (typeof onHurtEnd === "function") {
				onHurtEnd();
			}
		}, duration);
		return true;
	}

	hit(amount = this.damageOnCollision) {
		this.handleHit(amount);
	}

	// isDead() {
	// 	return this.health === 0;
	// }
}


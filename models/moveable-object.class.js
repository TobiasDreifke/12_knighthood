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
		if (!Array.isArray(images) || !images.length) return;
		this.initializeFrameState();
		const frameDuration = this.calculateFrameDuration(fps);
		this.handleAnimationCallback(images);
		if (!this.readyForNextFrame(frameDuration)) return;
		this.renderNextFrame(images, loop);
	}

	initializeFrameState() {
		if (typeof this.frameIndex !== "number") this.frameIndex = 0;
		if (typeof this.lastFrameTime !== "number") this.lastFrameTime = 0;
	}

	calculateFrameDuration(fps) {
		return 1000 / fps;
	}

	handleAnimationCallback(images) {
		if (typeof this.onAnimationFrame === "function") {
			this.onAnimationFrame(images, this.frameIndex);
		}
	}

	readyForNextFrame(frameDuration) {
		const now = Date.now();
		if (now - this.lastFrameTime <= frameDuration) return false;
		this.lastFrameTime = now;
		return true;
	}

	renderNextFrame(images, loop) {
		if (this.frameIndex >= images.length) {
			this.frameIndex = loop ? 0 : images.length - 1;
		}
		const path = images[this.frameIndex];
		this.img = this.imageCache[path];
		this.frameIndex++;
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
	}

	handleHit(amount = this.damageOnCollision, options = {}) {
		if (this.isDead) return false;
		const config = this.normalizeHitOptions(options);
		const result = this.applyDamage(amount);
		if (result.wasFatal) return this.processFatalHit(config);
		this.processHurtState(config);
		return true;
	}

	normalizeHitOptions(options) {
		const defaultFrames = Array.isArray(this.frames?.HURT) ? this.frames.HURT.length : this.IMAGES_HURT?.length ?? 0;
		const {
			deadSound = null,
			hurtSound = null,
			hurtFps = 14,
			hurtFrameCount = null,
			onDeath = null,
			onHurtStart = null,
			onHurtEnd = null,
		} = options;
		const frames = typeof hurtFrameCount === "number" ? hurtFrameCount : defaultFrames;
		return { deadSound, hurtSound, hurtFps, frames, onDeath, onHurtStart, onHurtEnd };
	}

	applyDamage(amount) {
		this.health -= amount;
		console.log(`[${this.constructor.name}] is hit with [${amount}]`);
		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
			console.log(`[${this.constructor.name}] is dead`);
			return { wasFatal: true };
		}
		this.isHurt = true;
		return { wasFatal: false };
	}

	processFatalHit(config) {
		if (config.deadSound) AudioHub.playOne(config.deadSound);
		if (typeof config.onDeath === "function") config.onDeath();
		return true;
	}

	processHurtState(config) {
		if (config.hurtSound) AudioHub.playOne(config.hurtSound);
		if (typeof config.onHurtStart === "function") config.onHurtStart();
		this.scheduleHurtRecovery(config.frames, config.hurtFps, config.onHurtEnd);
	}

	scheduleHurtRecovery(frames, fps, onHurtEnd) {
		const duration = frames > 0 ? (frames / fps) * 1000 : 1000;
		if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
		this.hurtTimeout = setTimeout(() => onHurtEnd?.(), duration);
	}

	hit(amount = this.damageOnCollision) {
		this.handleHit(amount);
	}

	moveTowardPlayer(options = {}) {
		const {
			player = this.player,
			flipThreshold = 10,
			speed = this.speed,
			onMoveLeft,
			onMoveRight,
		} = options;
		const delta = this.resolveTargetDelta(player);
		if (delta === null) return false;
		if (delta < -flipThreshold) {
			this.otherDirection = true;
			onMoveLeft?.(this);
			this.x -= speed;
			return true;
		}
		if (delta > flipThreshold) {
			this.otherDirection = false;
			onMoveRight?.(this);
			this.x += speed;
			return true;
		}
		return false;
	}

	updateFacingTowardPlayer(options = {}) {
		const { player = this.player, flipThreshold = 10 } = options;
		const delta = this.resolveTargetDelta(player);
		if (delta === null) return false;
		if (delta < -flipThreshold) {
			this.otherDirection = true;
			return true;
		}
		if (delta > flipThreshold) {
			this.otherDirection = false;
			return true;
		}
		return false;
	}

	resolveTargetDelta(player = this.player) {
		if (!player) return null;
		const targetBox = typeof player.getHurtbox === "function" ? player.getHurtbox() : null;
		const targetCenter = targetBox ? (targetBox.left + targetBox.right) / 2 : player.x ?? this.x;
		const actorCenter = this.x + (this.width ?? 0) / 2;
		return targetCenter - actorCenter;
	}

	holdPose(frames, index = 0) {
		const frameList = Array.isArray(frames) ? frames : null;
		if (!frameList || !frameList.length) return;
		const safeIndex = Math.min(Math.max(index, 0), frameList.length - 1);
		const frame = frameList[safeIndex];
		if (frame && this.imageCache?.[frame]) {
			this.img = this.imageCache[frame];
		}
	}

	holdDormantPose(frames = null, index = 0) {
		const fallback = this.frames?.IDLE || this.frames?.WALK || this.frames?.idle || this.frames?.walk;
		const frameList = frames ?? fallback;
		this.holdPose(frameList, index);
	}

	// isDead() {
	// 	return this.health === 0;
	// }
}


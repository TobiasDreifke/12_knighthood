/**
 * Extends `DrawableObject` with physics helpers, animation playback, AI movement,
 * and reusable hit/damage handling used across the hero and enemy classes.
 */
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

	/**
	 * Axis-aligned hurtbox collision check between this object and another.
	 *
	 * @param {MoveableObject} mo
	 * @returns {boolean}
	 */
	isColliding(mo) {
		if (this.isDead || mo.isDead) return false;

		const a = this.getHurtbox(); 
		const b = mo.getHurtbox();   

		return a.right > b.left &&
			a.bottom > b.top &&
			a.left < b.right &&
			a.top < b.bottom;
	}

	/**
	 * Collision check that uses this object's hitbox against another object's hurtbox.
	 *
	 * @param {MoveableObject} mo
	 * @returns {boolean}
	 */
	isHitting(mo) {
		if (this.isDead || mo.isDead) return false;

		const a = this.getHitbox();  
		const b = mo.getHurtbox();   

		return a.right > b.left &&
			a.bottom > b.top &&
			a.left < b.right &&
			a.top < b.bottom;
	}

	/**
	 * Plays an animation array at the requested FPS, optionally looping.
	 *
	 * @param {string[]} images
	 * @param {number} fps
	 * @param {boolean} [loop=true]
	 */
	playAnimationWithSpeed(images, fps, loop = true) {
		if (!Array.isArray(images) || !images.length) return;
		this.initializeFrameState();
		const frameDuration = this.calculateFrameDuration(fps);
		this.handleAnimationCallback(images);
		if (!this.readyForNextFrame(frameDuration)) return;
		this.renderNextFrame(images, loop);
	}

	/**
	 * Ensures `frameIndex`/`lastFrameTime` exist before iterating an animation.
	 */
	initializeFrameState() {
		if (typeof this.frameIndex !== "number") this.frameIndex = 0;
		if (typeof this.lastFrameTime !== "number") this.lastFrameTime = 0;
	}

	/**
	 * @param {number} fps
	 * @returns {number} Frame duration in milliseconds.
	 */
	calculateFrameDuration(fps) {
		return 1000 / fps;
	}

	/**
	 * Invokes a consumer-provided `onAnimationFrame` hook if present.
	 *
	 * @param {string[]} images
	 */
	handleAnimationCallback(images) {
		if (typeof this.onAnimationFrame === "function") {
			this.onAnimationFrame(images, this.frameIndex);
		}
	}

	/**
	 * @param {number} frameDuration
	 * @returns {boolean} True when enough time has passed to advance frames.
	 */
	readyForNextFrame(frameDuration) {
		const now = Date.now();
		if (now - this.lastFrameTime <= frameDuration) return false;
		this.lastFrameTime = now;
		return true;
	}

	/**
	 * Switches to the next frame and updates `img`, wrapping if needed.
	 *
	 * @param {string[]} images
	 * @param {boolean} loop
	 */
	renderNextFrame(images, loop) {
		if (this.frameIndex >= images.length) {
			this.frameIndex = loop ? 0 : images.length - 1;
		}
		const path = images[this.frameIndex];
		this.img = this.imageCache[path];
		this.frameIndex++;
	}
	/**
	 * Moves the actor to the right and flips sprite orientation accordingly.
	 */
	moveRight() {
		this.x += this.speed;
		this.otherDirection = false;
	}

	/**
	 * Slides to the right using the slide speed (used for ducking).
	 */
	slideRight() {
		this.x += this.slideSpeed;
		this.otherDirection = false;
	}

	/**
	 * Moves the actor to the left and flips sprite orientation.
	 */
	moveLeft() {
		this.x -= this.speed;
		this.otherDirection = true;
	};

	/**
	 * Slides to the left using the slide speed.
	 */
	slideLeft() {
		this.x -= this.slideSpeed;
		this.otherDirection = true;
	}

	/**
	 * Placeholder that keeps crouch compatibility with other subclasses.
	 */
	crouch() {
		this.x += 0;
	}

	/**
	 * Steps through an animation frame set and notifies hook listeners.
	 *
	 * @param {string[]} img
	 */
	playAnimation(img) {
		let i = this.currentImage % img.length;
		let path = img[i];
		this.img = this.imageCache[path];
		this.currentImage++;

		if (this.onAnimationFrame) { 
			this.onAnimationFrame(img, i);
		}
	}

	/**
	 * @returns {World|null} Best-effort lookup for the owning world reference.
	 */
	getWorld() {
		if (this.world) return this.world;
		if (this.player && this.player.world) return this.player.world;
		if (this.owner && this.owner.world) return this.owner.world;
		return null;
	}

	/**
	 * Starts a loop that applies gravity unless the world is paused.
	 */
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

	/**
	 * @returns {boolean} True if the object is currently airborne.
	 */
	isAboveGround() {
		if (this instanceof ThrowHoly || this instanceof ThrowDark) return true;
		return this.y < this.groundY;
	}

	/**
	 * Initiates an upward velocity for jump-capable actors.
	 */
	jump() {
		this.speedY = 30;
	}

	/**
	 * Shared damage handler that plays hurt/death SFX and invokes callbacks.
	 *
	 * @param {number} [amount=this.damageOnCollision]
	 * @param {Object} [options]
	 * @returns {boolean}
	 */
	handleHit(amount = this.damageOnCollision, options = {}) {
		if (this.isDead) return false;
		const config = this.normalizeHitOptions(options);
		const result = this.applyDamage(amount);
		if (result.wasFatal) return this.processFatalHit(config);
		this.processHurtState(config);
		return true;
	}

	/**
	 * Applies defaults to the hit handler options.
	 *
	 * @param {Object} options
	 * @returns {{deadSound:string|null,hurtSound:string|null,hurtFps:number,frames:number,onDeath:Function?,onHurtStart:Function?,onHurtEnd:Function?}}
	 */
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

	/**
	 * Mutates health and returns whether the hit was fatal.
	 *
	 * @param {number} amount
	 * @returns {{wasFatal:boolean}}
	 */
	applyDamage(amount) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
			this.notifyStatsOfDeath();
			return { wasFatal: true };
		}
		this.isHurt = true;
		return { wasFatal: false };
	}

	/**
	 * Handles death-specific audio/callbacks.
	 *
	 * @param {ReturnType<MoveableObject["normalizeHitOptions"]>} config
	 */
	processFatalHit(config) {
		if (config.deadSound) AudioHub.playOne(config.deadSound);
		if (typeof config.onDeath === "function") config.onDeath();
		return true;
	}

	/**
	 * Plays hurt audio, triggers callbacks, and schedules recovery.
	 *
	 * @param {ReturnType<MoveableObject["normalizeHitOptions"]>} config
	 */
	processHurtState(config) {
		if (config.hurtSound) AudioHub.playOne(config.hurtSound);
		if (typeof config.onHurtStart === "function") config.onHurtStart();
		this.scheduleHurtRecovery(config.frames, config.hurtFps, config.onHurtEnd);
	}

	/**
	 * Delays the `onHurtEnd` callback by the animation length so states reset cleanly.
	 *
	 * @param {number} frames
	 * @param {number} fps
	 * @param {Function} onHurtEnd
	 */
	scheduleHurtRecovery(frames, fps, onHurtEnd) {
		const duration = frames > 0 ? (frames / fps) * 1000 : 1000;
		if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
		this.hurtTimeout = setTimeout(() => onHurtEnd?.(), duration);
	}

	/**
	 * Shortcut that applies the default hit configuration for the object.
	 *
	 * @param {number} [amount=this.damageOnCollision]
	 */
	hit(amount = this.damageOnCollision) {
		this.handleHit(amount);
	}

	/**
	 * Moves the object horizontally toward a target player using simple steering logic.
	 *
	 * @param {Object} [options]
	 * @returns {boolean} True if movement occurred.
	 */
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

	/**
	 * Flips the sprite toward the player without applying movement.
	 *
	 * @param {Object} [options]
	 * @returns {boolean}
	 */
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

	/**
	 * @param {MoveableObject} [player=this.player]
	 * @returns {number|null} Horizontal distance between centers (positive → target on right).
	 */
	resolveTargetDelta(player = this.player) {
		if (!player) return null;
		const targetBox = typeof player.getHurtbox === "function" ? player.getHurtbox() : null;
		const targetCenter = targetBox ? (targetBox.left + targetBox.right) / 2 : player.x ?? this.x;
		const actorCenter = this.x + (this.width ?? 0) / 2;
		return targetCenter - actorCenter;
	}

	/**
	 * Forces the sprite to display a single frame from a provided list.
	 *
	 * @param {string[]} frames
	 * @param {number} [index=0]
	 */
	holdPose(frames, index = 0) {
		const frameList = Array.isArray(frames) ? frames : null;
		if (!frameList || !frameList.length) return;
		const safeIndex = Math.min(Math.max(index, 0), frameList.length - 1);
		const frame = frameList[safeIndex];
		if (frame && this.imageCache?.[frame]) {
			this.img = this.imageCache[frame];
		}
	}

	/**
	 * Helper for dormant states that picks a safe idle frame if none is provided.
	 */
	holdDormantPose(frames = null, index = 0) {
		const fallback = this.frames?.IDLE || this.frames?.WALK || this.frames?.idle || this.frames?.walk;
		const frameList = frames ?? fallback;
		this.holdPose(frameList, index);
	}

	/**
	 * Notifies the owning world's stats tracker of this object's death.
	 */
	notifyStatsOfDeath() {
		const world = this.getWorld();
		const stats = world?.gameStats;
		if (!stats || typeof stats.recordKill !== "function") return;
		stats.recordKill(this);
	}
}

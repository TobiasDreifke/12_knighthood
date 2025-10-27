class ThrowDark extends MoveableObject {
	width = 50;
	height = 50;
	offsetLeft = 15;
	offsetRight = 15;
	offsetTop = 15;
	offsetBottom = 15;
	collidingObject = true;
	debugColor = "red";


	IMAGES_IDLE = [
		"./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_1.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/idle_01/dark_vfx_splash_idle_2.png",
	];

	IMAGES_THROW = [
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_1.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_2.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_3.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_4.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_5.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_6.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_7.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_8.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_9.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_01/dark_vfx_hit_10.png",
	];

	constructor(x, y, isThrown = false) {

		super();
		this.x = x;
		this.y = y;
		this.isThrown = isThrown;
		this.isAnimating = false;

		// Only load throw images immediately
		this.loadImages(this.IMAGES_THROW);

		if (isThrown) {
			this.loadImage(this.IMAGES_THROW[0]); // display correct first frame
			this.throwDark();
		} else {
			this.loadImages(this.IMAGES_IDLE);
			this.loadImage(this.IMAGES_IDLE[0]);
			this.startIdleAnimation();
		}
	}

	startIdleAnimation() {
		if (this.isThrown) return;
		if (this.isAnimating) return;
		this.isAnimating = true;
		this.stopAnimation();
		this.animationInterval = setInterval(() => {
			if (!this.isThrown) {
				this.playAnimation(this.IMAGES_IDLE);
			}
		}, 1000 / 3);
	}

	startThrowAnimation() {
		this.stopAnimation();
		this.isAnimating = true;
		this.animationInterval = setInterval(() => {
			this.playAnimation(this.IMAGES_THROW);
		}, 1000 / 12);
	}

	stopAnimation() {
		if (this.animationInterval) {
			clearInterval(this.animationInterval);
			this.animationInterval = null;
		}
		this.isAnimating = false;
	}

	throwDark(facingLeft) {
		this.stopAnimation();
		this.isThrown = true;
		this.currentImage = 0;

		// Force the correct throw frame
		this.img = this.imageCache[this.IMAGES_THROW[0]];
		console.log("Initial image path (after force):", this.img?.src);

		this.startThrowAnimation();

		this.speedY = 15;
		this.applyGravity();

		const throwPower = 10;
		this.speedX = facingLeft ? -throwPower : throwPower;

		this.throwInterval = setInterval(() => {
			this.x += this.speedX;
		}, 25);
}

}

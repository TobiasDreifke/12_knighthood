class ThrowHoly extends MoveableObject {
	width = 50;
	height = 50;
	offsetLeft = 15;
	offsetRight = 15;
	offsetTop = 15;
	offsetBottom = 15;
	collidingObject = true;
	debugColor = "blue";

	IMAGES_IDLE = [
		"./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_1.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/idle_02/holy_idle_2.png",
	];

	IMAGES_THROW = [
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_1.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_2.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_3.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_4.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_5.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_6.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_7.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_8.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_9.png",
		"./01_assets/6_salsa_bottle/bottle_rotation/attack_02/holy_attack_10.png",
	];


	constructor(x, y, isThrown = false) {
		super();
		this.x = x;
		this.y = y;
		this.isThrown = isThrown;
		this.isAnimating = false;


		this.loadImages(this.IMAGES_THROW);

		if (isThrown) {
			this.loadImage(this.IMAGES_THROW[0]);
			this.throwHoly();
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

	throwHoly(facingLeft) {
		this.stopAnimation();
		this.isThrown = true;
		this.currentImage = 0;
		this.otherDirection = !!facingLeft;

		this.img = this.imageCache[this.IMAGES_THROW[0]];

		this.startThrowAnimation();

		// this.speedY = 15;
		this.applyGravity();

		const throwPower = 5;
		this.speedX = facingLeft ? -throwPower : throwPower;

		this.throwInterval = setInterval(() => {
			this.x += this.speedX;
		}, 25);
	}

}


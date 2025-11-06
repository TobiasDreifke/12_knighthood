class HeroMovementController {
	constructor(hero) {
		this.hero = hero;
	}

	applyMovementInput(keyboard) {
		if (this.isMovementLocked()) {
			return { slidePressed: false };
		}

		this.handleJumpInput(keyboard);
		const slideState = this.handleSlideInput(keyboard);
		this.handleHorizontalMovement(keyboard);
		return slideState;
	}

	isMovementLocked() {
		const hero = this.hero;
		return hero.controlsLocked || hero.isCelebrating;
	}

	handleJumpInput(keyboard) {
		const hero = this.hero;
		const jumpPressed = keyboard.UP || keyboard.JUMP;
		const canJump = jumpPressed && !hero.isAboveGround();
		AudioHub.playOncePerKey(hero.jumpSoundFlag, AudioHub.JUMP_HERO, jumpPressed, canJump);
		if (canJump) hero.jump();
	}

	handleSlideInput(keyboard) {
		const hero = this.hero;
		const slideRight = keyboard.RIGHT && keyboard.DOWN;
		const slideLeft = keyboard.LEFT && keyboard.DOWN;
		const slidePressed = slideRight || slideLeft;
		AudioHub.playOncePerKey(hero.slideSoundFlag, AudioHub.SLIDE_HERO, slidePressed, slidePressed);
		if (slideRight) hero.slideRight();
		if (slideLeft) hero.slideLeft();
		return { slidePressed };
	}

	handleHorizontalMovement(keyboard) {
		const hero = this.hero;
		const maxX = hero.world?.level?.level_end_x ?? Infinity;
		if (keyboard.RIGHT && hero.x < maxX) {
			hero.moveRight();
		}
		if (keyboard.LEFT && hero.x > 0) {
			hero.moveLeft();
		}
	}
}

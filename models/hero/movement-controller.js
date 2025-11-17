/**
 * Translates keyboard input into hero movement commands, slide/jump SFX, and camera-friendly state.
 */
class HeroMovementController {
	/**
	 * @param {Hero} hero
	 */
	constructor(hero) {
		this.hero = hero;
		this.slideActive = false;
	}

	/**
	 * Main entry point for hero movement â€“ handles jumps, slides, and horizontal motion.
	 *
	 * @param {Keyboard} keyboard
	 * @returns {{slidePressed: boolean, movedHorizontally: boolean}}
	 */
	applyMovementInput(keyboard) {
		if (this.isMovementLocked()) {
			return { slidePressed: false, movedHorizontally: false };
		}

		this.handleJumpInput(keyboard);
		const slideState = this.handleSlideInput(keyboard);
		const movedHorizontally = this.handleHorizontalMovement(keyboard);
		return { ...slideState, movedHorizontally };
	}


	/**
	 * @returns {boolean} True when controls are temporarily disabled.
	 */
	isMovementLocked() {
		const hero = this.hero;
		return hero.controlsLocked || hero.isCelebrating;
	}

	/**
	 * Triggers a jump and plays the one-shot jump SFX when the player presses UP/JUMP from the ground.
	 */
	handleJumpInput(keyboard) {
		const hero = this.hero;
		const jumpPressed = keyboard.UP || keyboard.JUMP;
		const canJump = jumpPressed && !hero.isAboveGround();
		AudioHub.playOncePerKey(hero.jumpSoundFlag, AudioHub.JUMP_HERO, jumpPressed, canJump);
		if (canJump) {
			hero.jump();
			hero.world?.gameStats?.recordJump?.();
		}
	}

	/**
	 * Detects slide combos (DOWN + direction), moves the hero, and emits the slide SFX.
	 *
	 * @returns {{slidePressed: boolean}}
	 */
	handleSlideInput(keyboard) {
		const hero = this.hero;
		const slideRight = keyboard.RIGHT && keyboard.DOWN;
		const slideLeft = keyboard.LEFT && keyboard.DOWN;
		const slidePressed = slideRight || slideLeft;
		if (slidePressed && !this.slideActive) {
			hero.world?.gameStats?.recordSlide?.();
		}
		this.slideActive = slidePressed;
		AudioHub.playOncePerKey(hero.slideSoundFlag, AudioHub.SLIDE_HERO, slidePressed, slidePressed);
		if (slideRight) hero.slideRight();
		if (slideLeft) hero.slideLeft();
		return { slidePressed };
	}

	/**
	 * Applies left/right input while clamping movement to the level bounds.
	 */
	handleHorizontalMovement(keyboard) {
		const hero = this.hero;
		let moved = false;
		if (keyboard.RIGHT) {
			moved = hero.moveRight() || moved;
		}
		if (keyboard.LEFT) {
			moved = hero.moveLeft() || moved;
		}
		return moved;
	}

}

/**
 * Handles showing/hiding the win and game-over screens with optional delays.
 */
class GameStateUI {
	/**
	 * @param {Document} [doc=document]
	 */
	constructor(doc = document) {
		this.doc = doc;
		this.pendingWinTimeout = null;
	}

	/**
	 * Schedules the win screen to appear after an optional delay, canceling any previous timer.
	 *
	 * @param {World} world
	 * @param {number} [delayMs=0]
	 */
	scheduleWinScreen(world, delayMs = 0) {
		this.clearWinTimeout();
		if (delayMs <= 0) {
			this.showWinScreen(world);
			return;
		}
		this.pendingWinTimeout = setTimeout(() => this.showWinScreen(world), delayMs);
	}

	/**
	 * Immediately shows the win screen and stops the win sequence state.
	 *
	 * @param {World} world
	 */
	showWinScreen(world) {
		this.clearWinTimeout();
		if (!world) return;
		world.isWinSequenceActive = false;
		world.isRunning = false;
		this.reveal("end-screen");
		if (typeof AudioHub !== "undefined" && typeof AudioHub.playStartScreenMusic === "function") {
			AudioHub.playStartScreenMusic();
		}
	}

	/**
	 * Shows the game-over screen and halts world rendering.
	 *
	 * @param {World} world
	 */
	showGameOverScreen(world) {
		this.clearWinTimeout();
		if (!world) return;
		world.isRunning = false;
		this.reveal("gameover-screen");
		if (typeof AudioHub !== "undefined" && typeof AudioHub.playStartScreenMusic === "function") {
			AudioHub.playStartScreenMusic();
		}
	}

	hideScreens() {
		this.clearWinTimeout();
		this.hide("end-screen");
		this.hide("gameover-screen");
	}

	clearWinTimeout() {
		if (!this.pendingWinTimeout) return;
		clearTimeout(this.pendingWinTimeout);
		this.pendingWinTimeout = null;
	}

	reveal(elementId) {
		const el = this.getElement(elementId);
		if (!el) return;
		el.style.display = "flex";
		el.style.opacity = 0;
		setTimeout(() => {
			el.style.opacity = 1;
		}, 50);
	}

	hide(elementId) {
		const el = this.getElement(elementId);
		if (!el) return;
		el.style.display = "none";
		el.style.opacity = 0;
	}

	getElement(elementId) {
		if (!this.doc || typeof this.doc.getElementById !== "function") {
			return null;
		}
		return this.doc.getElementById(elementId);
	}
}

class GameStateUI {
	constructor(doc = document) {
		this.doc = doc;
		this.pendingWinTimeout = null;
	}

	scheduleWinScreen(world, delayMs = 0) {
		this.clearWinTimeout();
		if (delayMs <= 0) {
			this.showWinScreen(world);
			return;
		}
		this.pendingWinTimeout = setTimeout(() => this.showWinScreen(world), delayMs);
	}

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

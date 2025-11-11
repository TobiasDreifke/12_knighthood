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
		world.gameStats?.markWin?.();
		world.isWinSequenceActive = false;
		world.isRunning = false;
		this.renderStats(world, "end-screen");
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
		this.renderStats(world, "gameover-screen");
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

	renderStats(world, rootId) {
		if (!rootId) return;
		const container = this.getElement(rootId);
		const stats = world?.gameStats?.getSnapshot?.();
		if (!container || !stats) return;

		const assignments = {
			"kills-bats": stats.killed?.bats ?? 0,
			"kills-goblins": stats.killed?.goblins ?? 0,
			"kills-mushrooms": stats.killed?.mushrooms ?? 0,
			"kills-bosses": stats.killed?.bosses ?? 0,
			"collect-holy": stats.collected?.holy ?? 0,
			"collect-dark": stats.collected?.dark ?? 0,
			"attacks-used": stats.attacksUsed ?? 0,
			"casts-holy": stats.spellsCast?.holy ?? 0,
			"casts-dark": stats.spellsCast?.dark ?? 0,
			"damage-dealt": stats.totalDamage ?? 0,
			"damage-taken": stats.damageTaken ?? 0,
			"slides-used": stats.slideUses ?? 0,
			"jumps": stats.jumps ?? 0,
			"time-ms": this.formatDuration(stats.timeMs),
		};

		Object.entries(assignments).forEach(([key, value]) => this.assignStat(container, key, value));
	}

	assignStat(container, key, value) {
		const target = container.querySelector(`[data-stat="${key}"]`);
		if (!target) return;
		target.textContent = value;
	}

	formatDuration(durationMs) {
		if (!Number.isFinite(durationMs) || durationMs <= 0) {
			return "00:00:00,00";
		}
		const totalMs = Math.max(0, Math.floor(durationMs));
		const totalSeconds = Math.floor(totalMs / 1000);
		const centiseconds = Math.floor((totalMs % 1000) / 10);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60) % 60;
		const hours = Math.floor(totalSeconds / 3600);
		return [
			String(hours).padStart(2, "0"),
			String(minutes).padStart(2, "0"),
			String(seconds).padStart(2, "0"),
		].join(":") + `,${String(centiseconds).padStart(2, "0")}`;
	}
}

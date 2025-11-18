(function () {
	"use strict";

	const LEADERBOARD_COLLECTION = "scores";
	const MAX_LEADERBOARD_ENTRIES = 10;

	const SCORE_WEIGHTS = {
		kills: {
			bats: 50,
			goblins: 75,
			mushrooms: 90,
			bosses: 800,
		},
		collectibles: {
			holy: 25,
			dark: 25,
		},
		casts: {
			holy: 15,
			dark: 20,
		},
		movement: {
			slides: 10,
			jumps: 5,
		},
		penalties: {
			damageTaken: 2,
			attacksUsed: 3,
		},
		timeBonus: {
			targetMs: 8 * 60 * 1000,
			maxBonus: 5000,
		},
	};

	class ScoreSystem {
		/**
		 * Transforms the tracked stats object into a single integer score.
		 * @param {ReturnType<GameStats["getSnapshot"]>} stats
		 * @returns {number}
		 */
		static calculate(stats) {
			if (!stats) return 0;
			let total = 0;
			total += (stats.killed?.bats || 0) * SCORE_WEIGHTS.kills.bats;
			total += (stats.killed?.goblins || 0) * SCORE_WEIGHTS.kills.goblins;
			total += (stats.killed?.mushrooms || 0) * SCORE_WEIGHTS.kills.mushrooms;
			total += (stats.killed?.bosses || 0) * SCORE_WEIGHTS.kills.bosses;
			total += (stats.collected?.holy || 0) * SCORE_WEIGHTS.collectibles.holy;
			total += (stats.collected?.dark || 0) * SCORE_WEIGHTS.collectibles.dark;
			total += (stats.spellsCast?.holy || 0) * SCORE_WEIGHTS.casts.holy;
			total += (stats.spellsCast?.dark || 0) * SCORE_WEIGHTS.casts.dark;
			total += (stats.slideUses || 0) * SCORE_WEIGHTS.movement.slides;
			total += (stats.jumps || 0) * SCORE_WEIGHTS.movement.jumps;
			total -= (stats.damageTaken || 0) * SCORE_WEIGHTS.penalties.damageTaken;
			total -= (stats.attacksUsed || 0) * SCORE_WEIGHTS.penalties.attacksUsed;

			const runTime = Math.max(0, stats.timeMs || 0);
			const paceRatio = 1 - runTime / SCORE_WEIGHTS.timeBonus.targetMs;
			const timeScore = Math.max(0, paceRatio * SCORE_WEIGHTS.timeBonus.maxBonus);

			return Math.max(0, Math.round(total + timeScore));
		}
	}

	class FirebaseLeaderboard {
		constructor(firebase, config, collectionName = LEADERBOARD_COLLECTION) {
			this.firebase = firebase;
			this.config = config;
			this.collectionName = collectionName;
			this.db = null;
		}

		ensureInitialized() {
			if (this.db) return;
			const apps = Array.isArray(this.firebase.apps) ? this.firebase.apps : [];
			if (!apps.length) {
				this.firebase.initializeApp(this.config);
			}
			this.db = this.firebase.firestore();
		}

		async save(entry) {
			this.ensureInitialized();
			const payload = {
				displayName: entry.displayName,
				score: Number(entry.score) || 0,
				levelIndex: Number.isFinite(entry.levelIndex) ? entry.levelIndex : 0,
				durationMs: Number.isFinite(entry.durationMs) ? entry.durationMs : 0,
				createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
			};
			return this.db.collection(this.collectionName).add(payload);
		}

		async fetchTop(limit = MAX_LEADERBOARD_ENTRIES) {
			this.ensureInitialized();
			const snapshot = await this.db
				.collection(this.collectionName)
				.orderBy("score", "desc")
				.limit(limit)
				.get();
			return snapshot.docs.map(doc => doc.data());
		}
	}

	class ScoreboardController {
		constructor(doc = document) {
			this.doc = doc;
			this.scoreValueEl = null;
			this.form = null;
			this.nameInput = null;
			this.statusEl = null;
			this.listEl = null;
			this.modal = null;
			this.modalDialog = null;
			this.closeButton = null;
			this.openButtons = [];
			this.boundSubmitHandler = event => this.handleSubmit(event);
			this.formBound = false;
			this.boundOpenButtons = new WeakSet();
			this.closeBound = false;
			this.modalBackdropBound = false;
			this.escapeBound = false;
			this.modalVisible = false;
			this.state = {
				latestScore: null,
				submitting: false,
				lastOutcome: null,
			};
			this.service = this.createService();
		}

		createService() {
			const firebaseLib = window.firebase;
			const config = window.FIREBASE_CONFIG;
			if (!firebaseLib || !this.hasValidConfig(config)) {
				return null;
			}
			try {
				return new FirebaseLeaderboard(firebaseLib, config);
			} catch (error) {
				console.warn("[Scoreboard] Unable to initialize Firebase", error);
				return null;
			}
		}

		hasValidConfig(config) {
			if (!config) return false;
			const requiredKeys = [
				"apiKey",
				"authDomain",
				"projectId",
				"storageBucket",
				"messagingSenderId",
				"appId",
			];
			return requiredKeys.every(key => typeof config[key] === "string" && config[key].trim().length);
		}

		init() {
			this.captureElements();
			this.syncFormAvailability();

			if (!this.service) {
				this.status("Configure Firebase to enable the online leaderboard.");
				return;
			}

			this.refreshLeaderboard().catch(error => {
				console.warn("[Scoreboard] Initial fetch failed", error);
			});
		}

		captureElements() {
			this.scoreValueEl = this.doc.getElementById("final-score-value");
			this.form = this.doc.getElementById("score-submit-form");
			this.nameInput = this.doc.getElementById("player-name");
			this.statusEl = this.doc.getElementById("score-submit-status");
			this.listEl = this.doc.getElementById("leaderboard-list");
			this.modal = this.doc.getElementById("scoreboard-modal");
			this.modalDialog = this.modal?.querySelector(".scoreboard_modal__dialog") || null;
			this.closeButton = this.doc.querySelector("[data-close-scoreboard]");
			this.openButtons = Array.from(this.doc.querySelectorAll("[data-open-scoreboard]"));
			if (this.form && !this.formBound) {
				this.form.addEventListener("submit", this.boundSubmitHandler);
				this.formBound = true;
			}
			this.bindOpenButtons();
			this.bindCloseButton();
			this.bindModalBackdrop();
			this.bindEscapeHandler();
		}

		bindOpenButtons() {
			if (!this.openButtons || !this.openButtons.length) return;
			this.openButtons.forEach(button => {
				if (!button || this.boundOpenButtons.has(button)) return;
				button.addEventListener("click", () => this.openModal());
				this.boundOpenButtons.add(button);
			});
		}

		bindCloseButton() {
			if (!this.closeButton || this.closeBound) return;
			this.closeButton.addEventListener("click", () => this.closeModal());
			this.closeBound = true;
		}

		bindModalBackdrop() {
			if (!this.modal || this.modalBackdropBound) return;
			this.modal.addEventListener("click", event => {
				if (event.target === this.modal) {
					this.closeModal();
				}
			});
			this.modalBackdropBound = true;
		}

		bindEscapeHandler() {
			if (this.escapeBound) return;
			this.doc.addEventListener("keydown", event => {
				if (event.key === "Escape") {
					this.closeModal();
				}
			});
			this.escapeBound = true;
		}

		openModal() {
			this.captureElements();
			if (!this.modal) return;
			this.modal.classList.add("visible");
			this.modal.setAttribute("aria-hidden", "false");
			this.modalVisible = true;
			this.refreshLeaderboard();
			this.closeButton?.focus?.();
		}

		closeModal() {
			this.captureElements();
			if (!this.modal) return;
			if (!this.modalVisible) return;
			this.modal.classList.remove("visible");
			this.modal.setAttribute("aria-hidden", "true");
			this.modalVisible = false;
		}

		handleScreensHidden() {
			this.captureElements();
			this.closeModal();
			if (this.state.submitting) return;
			this.state.latestScore = null;
			this.state.lastOutcome = null;
			this.syncFormAvailability();
			if (!this.state.submitting) {
				this.status("");
			}
		}

		async handleRunFinished(world, meta = {}) {
			this.captureElements();
			const stats = world?.gameStats?.getSnapshot?.();
			if (!stats) return;
			const score = ScoreSystem.calculate(stats);
			this.state.lastOutcome = meta.outcome || "win";

			if (this.scoreValueEl) {
				this.scoreValueEl.textContent = score.toLocaleString();
			}

			if (this.state.lastOutcome === "win") {
				this.state.latestScore = {
					score,
					levelIndex: world?.levelIndex ?? 0,
					durationMs: stats.timeMs ?? 0,
				};
				this.status(this.service ? "Submit your run!" : "Leaderboard offline.");
			} else {
				this.state.latestScore = null;
				this.status("Defeated knights cannot submit scores.");
			}

			this.syncFormAvailability();
			await this.refreshLeaderboard();
		}

		async handleSubmit(event) {
			this.captureElements();
			event.preventDefault();
			if (!this.service || !this.state.latestScore || this.state.submitting) {
				return;
			}
			const name = this.nameInput?.value?.trim();
			if (!name) {
				this.status("Choose a knight name first.");
				this.nameInput?.focus();
				return;
			}

			this.state.submitting = true;
			this.syncFormAvailability();
			this.status("Submitting...");

			try {
				await this.service.save({
					displayName: name,
					...this.state.latestScore,
				});
				this.status("Score recorded! Play again to climb higher.");
				this.form?.reset();
				this.state.latestScore = null;
				await this.refreshLeaderboard();
			} catch (error) {
				console.error("[Scoreboard] Unable to store score", error);
				this.status("Could not store your score. Try again.");
			} finally {
				this.state.submitting = false;
				this.syncFormAvailability();
			}
		}

		async refreshLeaderboard() {
			this.captureElements();
			if (!this.listEl) return;
			if (!this.service) {
				this.renderLeaderboard([], { emptyMessage: "Leaderboard offline", emptyScore: "…" });
				return;
			}
			try {
				const entries = await this.service.fetchTop(MAX_LEADERBOARD_ENTRIES);
				this.renderLeaderboard(entries);
			} catch (error) {
				console.error("[Scoreboard] Failed to fetch leaderboard", error);
				this.renderLeaderboard([], { emptyMessage: "Unable to load scores" });
			}
		}

		renderLeaderboard(entries, options = {}) {
			const { emptyMessage = "No scores yet", emptyScore = "--" } = options;
			this.captureElements();
			if (!this.listEl) return;
			this.listEl.innerHTML = "";
			if (!entries || !entries.length) {
				const placeholder = this.doc.createElement("li");
				const nameSpan = this.doc.createElement("span");
				nameSpan.textContent = emptyMessage;
				const scoreSpan = this.doc.createElement("span");
				scoreSpan.textContent = emptyScore;
				placeholder.append(nameSpan, scoreSpan);
				this.listEl.appendChild(placeholder);
				return;
			}

			const fragment = this.doc.createDocumentFragment();
			entries.forEach(entry => {
				const li = this.doc.createElement("li");
				const nameSpan = this.doc.createElement("span");
				const scoreSpan = this.doc.createElement("span");
				nameSpan.textContent = entry.displayName?.slice(0, 16) || "Unknown";
				scoreSpan.textContent = Number(entry.score || 0).toLocaleString();
				li.append(nameSpan, scoreSpan);
				fragment.appendChild(li);
			});
			this.listEl.appendChild(fragment);
		}

		syncFormAvailability() {
			this.captureElements();
			if (!this.form) return;
			const controls = this.form.querySelectorAll("input, button");
			const canSubmit = Boolean(
				this.service &&
				this.state.latestScore &&
				!this.state.submitting &&
				this.state.lastOutcome === "win"
			);
			controls.forEach(control => {
				control.disabled = !canSubmit;
			});
			if (!this.service) {
				this.status("Leaderboard offline. Configure Firebase to enable submissions.");
			}
		}

		status(message) {
			this.captureElements();
			if (this.statusEl) {
				this.statusEl.textContent = message || "";
			}
		}
	}

	window.Scoreboard = new ScoreboardController();

	window.addEventListener("DOMContentLoaded", () => {
		window.Scoreboard?.init();
	});
})();

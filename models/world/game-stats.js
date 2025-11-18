/**
 * Tracks lightweight run statistics for the end-screen win board.
 */
class GameStats {
	constructor() {
		this.reset();
	}

	/**
	 * Clears all tracked counters and timers back to their initial values.
	 */
	reset() {
		this.startedAt = null;
		this.finishedAt = null;
		this.kills = {
			bat: 0,
			goblin: 0,
			mushroom: 0,
			boss: 0,
		};
		this.pickups = {
			holy: 0,
			dark: 0,
		};
		this.attacksUsed = 0;
		this.totalDamageDealt = 0;
		this.spellsCast = {
			holy: 0,
			dark: 0,
		};
		this.slideUses = 0;
		this.jumps = 0;
		this.damageTaken = 0;
	}

	/**
	 * Records the timestamp when the run began.
	 */
	markGameStart() {
		this.startedAt = Date.now();
		this.finishedAt = null;
	}

	/**
	 * Marks the run as finished if it hasn't been recorded already.
	 */
	markWin() {
		if (this.finishedAt) return;
		this.finishedAt = Date.now();
	}

	/**
	 * Increments the kill counter for the provided enemy type.
	 *
	 * @param {object} enemy
	 */
	recordKill(enemy) {
		const key = this.normalizeEnemyKey(enemy);
		if (!key) return;
		this.kills[key] = (this.kills[key] || 0) + 1;
	}

	/**
	 * Maps a concrete enemy constructor to the stats dictionary key.
	 *
	 * @param {object} enemy
	 * @returns {string|null}
	 */
	normalizeEnemyKey(enemy) {
		const map = {
			Bat: "bat",
			Goblin: "goblin",
			Mushroom: "mushroom",
			SkeletonBoss: "boss",
		};
		const ctorName = enemy?.constructor?.name;
		return map[ctorName] || null;
	}

	/**
	 * Adds a collected pickup to the relevant tally.
	 *
	 * @param {"holy"|"dark"} type
	 */
	recordPickup(type) {
		const key = typeof type === "string" ? type.toLowerCase() : null;
		if (!key || !(key in this.pickups)) return;
		this.pickups[key] += 1;
	}

	/**
	 * Tracks a melee attack usage.
	 */
	recordAttack() {
		this.attacksUsed += 1;
	}

	/**
	 * Tracks how often the hero slides.
	 */
	recordSlide() {
		this.slideUses += 1;
	}

	/**
	 * Tracks hero jumps.
	 */
	recordJump() {
		this.jumps += 1;
	}

	/**
	 * Adds to the accumulated damage taken counter if the value is valid.
	 *
	 * @param {number} amount
	 */
	addDamageTaken(amount) {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) return;
		this.damageTaken += value;
	}

	/**
	 * Adds to the total damage dealt counter if the number is valid.
	 *
	 * @param {number} amount
	 */
	addDamage(amount) {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) return;
		this.totalDamageDealt += value;
	}

	/**
	 * Increments the spell cast counter for holy/dark projectiles.
	 *
	 * @param {"holy"|"dark"} type
	 */
	recordCast(type) {
		const key = typeof type === "string" ? type.toLowerCase() : null;
		if (!key || !(key in this.spellsCast)) return;
		this.spellsCast[key] += 1;
	}

	/**
	 * @returns {number} Milliseconds elapsed between game start and now/finish.
	 */
	getElapsedMs() {
		if (!this.startedAt) return 0;
		const end = this.finishedAt || Date.now();
		return Math.max(end - this.startedAt, 0);
	}

	/**
	 * @returns {object} Plain object summarizing tracked stats for UI consumption.
	 */
	getSnapshot() {
		return {
			killed: {
				bats: this.kills.bat || 0,
				goblins: this.kills.goblin || 0,
				mushrooms: this.kills.mushroom || 0,
				bosses: this.kills.boss || 0,
			},
			collected: {
				holy: this.pickups.holy || 0,
				dark: this.pickups.dark || 0,
			},
			attacksUsed: this.attacksUsed,
			spellsCast: {
				holy: this.spellsCast.holy || 0,
				dark: this.spellsCast.dark || 0,
			},
			totalDamage: Math.round(this.totalDamageDealt),
			damageTaken: Math.round(this.damageTaken),
			slideUses: this.slideUses,
			jumps: this.jumps,
			timeMs: this.getElapsedMs(),
		};
	}
}

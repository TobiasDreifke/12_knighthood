/**
 * Tracks lightweight run statistics for the end-screen win board.
 */
class GameStats {
	constructor() {
		this.reset();
	}

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

	markGameStart() {
		this.startedAt = Date.now();
		this.finishedAt = null;
	}

	markWin() {
		if (this.finishedAt) return;
		this.finishedAt = Date.now();
	}

	recordKill(enemy) {
		const key = this.normalizeEnemyKey(enemy);
		if (!key) return;
		this.kills[key] = (this.kills[key] || 0) + 1;
	}

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

	recordPickup(type) {
		const key = typeof type === "string" ? type.toLowerCase() : null;
		if (!key || !(key in this.pickups)) return;
		this.pickups[key] += 1;
	}

	recordAttack() {
		this.attacksUsed += 1;
	}

	recordSlide() {
		this.slideUses += 1;
	}

	recordJump() {
		this.jumps += 1;
	}

	addDamageTaken(amount) {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) return;
		this.damageTaken += value;
	}

	addDamage(amount) {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) return;
		this.totalDamageDealt += value;
	}

	recordCast(type) {
		const key = typeof type === "string" ? type.toLowerCase() : null;
		if (!key || !(key in this.spellsCast)) return;
		this.spellsCast[key] += 1;
	}

	getElapsedMs() {
		if (!this.startedAt) return 0;
		const end = this.finishedAt || Date.now();
		return Math.max(end - this.startedAt, 0);
	}

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

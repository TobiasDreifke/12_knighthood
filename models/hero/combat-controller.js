/**
 * Handles the hero's melee/casting combat flow, including impact timing, hitboxes, and cooldowns.
 */
class HeroCombatController {
	/**
	 * @param {Hero} hero
	 */
	constructor(hero) {
		this.hero = hero;
		this.activeAttackTimeout = null;
	}

	/**
	 * Starts a new attack animation cycle if the hero is not already mid-swing.
	 */
	playAttackAnimationOnce() {
		const hero = this.hero;
		if (hero.isAttacking) return;

		hero.world?.gameStats?.recordAttack?.();
		hero.isAttacking = true;
		hero.frameIndex = 0;
		hero.attackPressed = true;

		this.configureAttackState();
		this.scheduleAttackEnd();
	}

	/**
	 * Prepares sounds, impact frames, and hitbox offsets for the active attack style.
	 */
	configureAttackState() {
		const hero = this.hero;
		const hasSword = hero.hasSword;
		hero.currentImpactSound = hasSword ? AudioHub.SWORD_IMPACT : AudioHub.PUNCH_IMPACT;
		hero.attackImpactFrames = hasSword ? [0] : [1, 5];
		hero.attackImpactAnimation = hasSword ? "ATTACK_SWORD" : "ATTACK";
		hero.triggeredImpactFrames.clear();
		hero.impactFramesPlayed.clear();
		this.configureAttackHitbox(hasSword);
	}

	/**
	 * Adjusts the temporary attack hitbox based on whether the hero is using a sword.
	 *
	 * @param {boolean} hasSword
	 */
	configureAttackHitbox(hasSword) {
		const hero = this.hero;
		hero.hitboxOffsetTop = hasSword ? -30 : 10;
		hero.hitboxOffsetBottom = hasSword ? 10 : 20;
		hero.hitboxWidth = hasSword ? 40 : 30;
	}

	/**
	 * Sets a timeout that will reset the attack state once the animation finishes.
	 */
	scheduleAttackEnd() {
		const hero = this.hero;
		const frames = hero.hasSword ? hero.frames.ATTACK_SWORD : hero.frames.ATTACK;
		const fps = 20;
		const duration = frames.length * (1000 / fps);

		this.clearAttackTimeout();
		this.activeAttackTimeout = setTimeout(() => this.resetAttackState(), duration);
	}

	/**
	 * Clears attack flags/collections so subsequent attacks start from a clean slate.
	 */
	resetAttackState() {
		const hero = this.hero;
		hero.isAttacking = false;
		hero.attackPressed = false;
		hero.attackImpactAnimation = null;
		hero.attackImpactFrames = [];
		hero.currentImpactSound = null;
		hero.triggeredImpactFrames.clear();
		hero.impactFramesPlayed.clear();
		this.clearAttackTimeout();
	}

	/**
	 * Cancels any pending attack timeout created by `scheduleAttackEnd`.
	 */
	clearAttackTimeout() {
		if (!this.activeAttackTimeout) return;
		clearTimeout(this.activeAttackTimeout);
		this.activeAttackTimeout = null;
	}

	/**
	 * Forces a cast animation to start, ignoring ammo or cooldown constraints.
	 *
	 * @param {"DARK"|"HOLY"} type
	 */
	triggerCastAnimation(type) {
		this.playCastAnimationOnce(type, true);
	}

	/**
	 * Starts a cast animation when ammo is available (or forced) and schedules its cleanup.
	 *
	 * @param {"DARK"|"HOLY"} type
	 * @param {boolean} [force=false]
	 */
	playCastAnimationOnce(type, force = false) {
		if (!this.canStartCast(type, force)) return;
		const frames = this.startCastSequence(type);
		this.scheduleCastEnd(frames);
	}

	/**
	 * @param {"DARK"|"HOLY"} type
	 * @param {boolean} force
	 * @returns {boolean}
	 */
	canStartCast(type, force) {
		const hero = this.hero;
		if (hero.isCasting) return false;
		if (force) return true;
		if (this.isOutOfAmmo(type)) {
			return false;
		}
		return true;
	}

	/**
	 * Marks the hero as casting and determines which frame set to use.
	 *
	 * @param {"DARK"|"HOLY"} type
	 * @returns {string[]}
	 */
	startCastSequence(type) {
		const hero = this.hero;
		hero.isCasting = true;
		hero.castPressed = true;
		hero.castType = type;
		hero.frameIndex = 0;
		const frames = type === "DARK" ? hero.frames.CAST_DARK : hero.frames.CAST_HOLY;
		hero.playAnimationWithSpeed(frames, 20, false);
		return frames;
	}

	/**
	 * Ends casting once every frame in the current animation has played.
	 *
	 * @param {string[]} frames
	 */
	scheduleCastEnd(frames) {
		const duration = frames.length * (1000 / 20);
		setTimeout(() => this.resetCastingState(), duration);
	}

	/**
	 * @param {"DARK"|"HOLY"} type
	 * @returns {boolean} True when the requested ammo pool is empty.
	 */
	isOutOfAmmo(type) {
		const world = this.hero.world;
		if (!world) return true;
		if (type === "DARK") return world.darkAmmo.length === 0;
		if (type === "HOLY") return world.holyAmmo.length === 0;
		return true;
	}

	/**
	 * Resets all casting flags so input can be processed again.
	 */
	resetCastingState() {
		const hero = this.hero;
		hero.isCasting = false;
		hero.castPressed = false;
		hero.castType = null;
	}

	/**
	 * Applies melee damage to overlapping enemies and plays the configured impact sound once.
	 *
	 * @param {number|null} [impactFrame]
	 */
	dealDamageToEnemies(impactFrame = null) {
		if (!this.canDealDamage()) return;
		const hit = this.applyDamageToEnemies();
		if (!hit || !this.hero.currentImpactSound) return;
		this.playImpactSound(impactFrame);
	}

	/**
	 * @returns {boolean} Whether the world context exists and isn't paused.
	 */
	canDealDamage() {
		const world = this.hero.world;
		return !!world && !world.isPaused;
	}

	/**
	 * Iterates active enemies, applying damage to each overlapping hurtbox.
	 *
	 * @returns {boolean} True if any enemy took damage.
	 */
	applyDamageToEnemies() {
		const world = this.hero.world;
		let hit = false;
		this.activeEnemies().forEach(enemy => {
			if (!this.collidesWithEnemy(this.hero, enemy)) return;
			const dmg = this.hero.hasSword ? this.hero.swordDamage : this.hero.punchDamage;
			enemy.hit(dmg);
			world?.gameStats?.addDamage?.(dmg);
			hit = true;
		});
		return hit;
	}

	/**
	 * @returns {MoveableObject[]} List of living enemies currently in the level.
	 */
	activeEnemies() {
		const world = this.hero.world;
		return (world?.level?.enemies || []).filter(enemy => enemy && !enemy.isDead);
	}

	/**
	 * Simple AABB collision check between the hero hitbox and an enemy hurtbox.
	 *
	 * @param {Hero} hero
	 * @param {MoveableObject} enemy
	 * @returns {boolean}
	 */
	collidesWithEnemy(hero, enemy) {
		const hitbox = hero.getHitbox();
		const hurtbox = enemy.getHurtbox();
		return hitbox.right > hurtbox.left &&
			hitbox.left < hurtbox.right &&
			hitbox.bottom > hurtbox.top &&
			hitbox.top < hurtbox.bottom;
	}

	/**
	 * Plays the attack's impact sound once per unique frame key.
	 *
	 * @param {number|string} impactFrame
	 */
	playImpactSound(impactFrame) {
		const hero = this.hero;
		const frameKey = impactFrame ?? "default";
		if (hero.impactFramesPlayed.has(frameKey)) return;
		AudioHub.playOne(hero.currentImpactSound);
		hero.impactFramesPlayed.add(frameKey);
	}
}

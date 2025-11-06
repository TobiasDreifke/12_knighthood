class HeroCombatController {
	constructor(hero) {
		this.hero = hero;
		this.activeAttackTimeout = null;
	}

	playAttackAnimationOnce() {
		const hero = this.hero;
		if (hero.isAttacking) return;

		hero.isAttacking = true;
		hero.frameIndex = 0;
		hero.attackPressed = true;

		this.configureAttackState();
		this.scheduleAttackEnd();
	}

	configureAttackState() {
		const hero = this.hero;
		const hasSword = hero.hasSword;
		hero.currentImpactSound = hasSword ? AudioHub.SWORD_IMPACT : AudioHub.PUNCH_IMPACT;
		hero.attackImpactFrames = hasSword ? [0] : [1, 5];
		hero.attackImpactAnimation = hasSword ? "IMAGES_ATTACK_SWORD" : "IMAGES_ATTACK";
		hero.triggeredImpactFrames.clear();
		hero.impactFramesPlayed.clear();
		this.configureAttackHitbox(hasSword);
	}

	configureAttackHitbox(hasSword) {
		const hero = this.hero;
		hero.hitboxOffsetTop = hasSword ? -30 : 10;
		hero.hitboxOffsetBottom = hasSword ? 10 : 20;
		hero.hitboxWidth = hasSword ? 40 : 30;
	}

	scheduleAttackEnd() {
		const hero = this.hero;
		const frames = hero.hasSword ? hero.IMAGES_ATTACK_SWORD : hero.IMAGES_ATTACK;
		const fps = 20;
		const duration = frames.length * (1000 / fps);

		this.clearAttackTimeout();
		this.activeAttackTimeout = setTimeout(() => this.resetAttackState(), duration);
	}

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

	clearAttackTimeout() {
		if (!this.activeAttackTimeout) return;
		clearTimeout(this.activeAttackTimeout);
		this.activeAttackTimeout = null;
	}

	triggerCastAnimation(type) {
		this.playCastAnimationOnce(type, true);
	}

	playCastAnimationOnce(type, force = false) {
		if (!this.canStartCast(type, force)) return;
		const frames = this.startCastSequence(type);
		this.scheduleCastEnd(frames);
	}

	canStartCast(type, force) {
		const hero = this.hero;
		if (hero.isCasting) return false;
		if (force) return true;
		if (this.isOutOfAmmo(type)) {
			console.log("No ammo left or already casting!");
			return false;
		}
		return true;
	}

	startCastSequence(type) {
		const hero = this.hero;
		hero.isCasting = true;
		hero.castPressed = true;
		hero.castType = type;
		hero.frameIndex = 0;
		const frames = type === "DARK" ? hero.IMAGES_CAST_DARK : hero.IMAGES_CAST_HOLY;
		hero.playAnimationWithSpeed(frames, 20, false);
		return frames;
	}

	scheduleCastEnd(frames) {
		const duration = frames.length * (1000 / 20);
		setTimeout(() => this.resetCastingState(), duration);
	}

	isOutOfAmmo(type) {
		const world = this.hero.world;
		if (!world) return true;
		if (type === "DARK") return world.darkAmmo.length === 0;
		if (type === "HOLY") return world.holyAmmo.length === 0;
		return true;
	}

	resetCastingState() {
		const hero = this.hero;
		hero.isCasting = false;
		hero.castPressed = false;
		hero.castType = null;
	}

	dealDamageToEnemies(impactFrame = null) {
		if (!this.canDealDamage()) return;
		const hit = this.applyDamageToEnemies();
		if (!hit || !this.hero.currentImpactSound) return;
		this.playImpactSound(impactFrame);
	}

	canDealDamage() {
		const world = this.hero.world;
		return !!world && !world.isPaused;
	}

	applyDamageToEnemies() {
		let hit = false;
		this.activeEnemies().forEach(enemy => {
			if (!this.collidesWithEnemy(this.hero, enemy)) return;
			console.log("HERO hit ENEMY!");
			const dmg = this.hero.hasSword ? this.hero.swordDamage : this.hero.punchDamage;
			enemy.hit(dmg);
			hit = true;
		});
		return hit;
	}

	activeEnemies() {
		const world = this.hero.world;
		return (world?.level?.enemies || []).filter(enemy => enemy && !enemy.isDead);
	}

	collidesWithEnemy(hero, enemy) {
		const hitbox = hero.getHitbox();
		const hurtbox = enemy.getHurtbox();
		return hitbox.right > hurtbox.left &&
			hitbox.left < hurtbox.right &&
			hitbox.bottom > hurtbox.top &&
			hitbox.top < hurtbox.bottom;
	}

	playImpactSound(impactFrame) {
		const hero = this.hero;
		const frameKey = impactFrame ?? "default";
		if (hero.impactFramesPlayed.has(frameKey)) return;
		AudioHub.playOne(hero.currentImpactSound);
		hero.impactFramesPlayed.add(frameKey);
	}
}

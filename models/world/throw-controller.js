/**
 * Handles player projectile throwing logic, including cooldowns and ammo consumption.
 */
class ThrowController {
	update(world) {
		if (!world || world.isPaused) return;
		this.tryHoly(world);
		this.tryDark(world);
	}

	/**
	 * Attempts to launch a holy projectile if the input/cooldown conditions are met.
	 *
	 * @returns {boolean}
	 */
	tryHoly(world) {
		if (!this.shouldThrow(world, "THROWHOLY", world?.holyAmmo, world?.lastHolyThrow, world?.holyCooldownMs)) return false;
		world.lastHolyThrow = Date.now();
		console.log("Throwing holy bottle, ammo left:", world.holyAmmo.length);
		const projectile = this.consumeProjectile(world.holyAmmo);
		if (!projectile) return false;
		const config = {
			targetArray: "throwableHoly",
			throwMethod: "throwHoly",
			horizontalPower: 7,
			straightRatio: 0.4,
			maxDistance: 720,
			animationKey: "HOLY",
		};
		this.launchProjectile(projectile, world, config);
		return true;
	}

	/**
	 * Attempts to launch a dark projectile if the input/cooldown conditions are met.
	 */
	tryDark(world) {
		if (!this.shouldThrow(world, "THROWDARK", world?.darkAmmo, world?.lastDarkThrow, world?.darkCooldownMs)) return false;
		world.lastDarkThrow = Date.now();
		console.log("Throwing dark bottle, ammo left:", world.darkAmmo.length);
		const projectile = this.consumeProjectile(world.darkAmmo);
		if (!projectile) return false;
		const config = {
			targetArray: "throwableDark",
			throwMethod: "throwDark",
			horizontalPower: 4.5,
			straightRatio: 0.4,
			maxDistance: 720,
			animationKey: "DARK",
		};
		this.launchProjectile(projectile, world, config);
		return true;
	}

	canThrowHoly(world) {
		return this.hasAmmo(world?.holyAmmo) && this.isOffCooldown(world?.lastHolyThrow, world?.holyCooldownMs);
	}

	canThrowDark(world) {
		return this.hasAmmo(world?.darkAmmo) && this.isOffCooldown(world?.lastDarkThrow, world?.darkCooldownMs);
	}

	shouldThrow(world, key, ammo, lastThrow, cooldown) {
		if (!world || world.isPaused) return false;
		if (!this.isKeyPressed(world.keyboard, key)) return false;
		if (!this.hasAmmo(ammo)) return false;
		return this.isOffCooldown(lastThrow, cooldown);
	}

	isKeyPressed(keyboard, key) {
		if (!keyboard) return false;
		return !!keyboard[key];
	}

	hasAmmo(ammo) {
		return Array.isArray(ammo) && ammo.length > 0;
	}

	isOffCooldown(lastThrow, cooldown) {
		const elapsed = Date.now() - (lastThrow || 0);
		return elapsed >= (cooldown || 0);
	}

	consumeProjectile(ammo) {
		if (!this.hasAmmo(ammo)) return null;
		return ammo.pop();
	}

	launchProjectile(projectile, world, config) {
		const hero = world?.heroCharacter;
		if (!hero || !projectile) return;
		const facingLeft = !!hero.otherDirection;
		this.configureProjectile(projectile, hero, facingLeft);
		this.executeThrow(projectile, facingLeft, config);
		this.finalizeThrow(world, projectile, config, hero);
	}

	configureProjectile(projectile, hero, facingLeft) {
		projectile.world = hero.world;
		projectile.x = hero.x + (facingLeft ? -50 : 75);
		projectile.y = hero.y + 20;
		projectile.isThrown = true;
		projectile.groundY = this.resolveGroundTarget(hero);
	}

	resolveGroundTarget(hero) {
		if (typeof hero?.groundY === "number") {
			return Math.max(hero.groundY, hero.y + 120);
		}
		return hero.y + 150;
	}

	executeThrow(projectile, facingLeft, config) {
		const method = projectile?.[config.throwMethod];
		if (typeof method !== "function") return;
		const params = {
			horizontalPower: config.horizontalPower,
			straightRatio: config.straightRatio,
			maxDistance: config.maxDistance,
		};
		method.call(projectile, facingLeft, params);
	}

	finalizeThrow(world, projectile, config, hero) {
		const collection = world?.[config.targetArray];
		if (Array.isArray(collection)) collection.push(projectile);
		if (typeof world?.updateAmmoBars === "function") world.updateAmmoBars();
		const spellType = typeof config.animationKey === "string" ? config.animationKey.toLowerCase() : null;
		if (spellType) {
			world?.gameStats?.recordCast?.(spellType);
		}
		this.triggerCast(hero, config.animationKey);
	}

	triggerCast(hero, animationKey) {
		if (!hero || typeof hero.triggerCastAnimation !== "function") return;
		hero.triggerCastAnimation(animationKey);
	}
}

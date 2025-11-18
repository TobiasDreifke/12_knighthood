/**
 * Handles player projectile throwing logic, including cooldowns and ammo consumption.
 */
class ThrowController {
	/**
	 * Tries both holy and dark throws when inputs/cooldowns allow.
	 *
	 * @param {World} world
	 */
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

	/**
	 * @returns {boolean} True when holy ammo exists and cooldown expired.
	 */
	canThrowHoly(world) {
		return this.hasAmmo(world?.holyAmmo) && this.isOffCooldown(world?.lastHolyThrow, world?.holyCooldownMs);
	}

	/**
	 * @returns {boolean} True when dark ammo exists and cooldown expired.
	 */
	canThrowDark(world) {
		return this.hasAmmo(world?.darkAmmo) && this.isOffCooldown(world?.lastDarkThrow, world?.darkCooldownMs);
	}

	/**
	 * Validates that the world/input/cooldown allow a throw attempt.
	 *
	 * @param {World} world
	 * @param {string} key
	 * @param {any[]} ammo
	 * @param {number} lastThrow
	 * @param {number} cooldown
	 * @returns {boolean}
	 */
	shouldThrow(world, key, ammo, lastThrow, cooldown) {
		if (!world || world.isPaused) return false;
		if (!this.isKeyPressed(world.keyboard, key)) return false;
		if (!this.hasAmmo(ammo)) return false;
		return this.isOffCooldown(lastThrow, cooldown);
	}

	/**
	 * @returns {boolean} Whether the given keyboard action is currently held.
	 */
	isKeyPressed(keyboard, key) {
		if (!keyboard) return false;
		return !!keyboard[key];
	}

	/**
	 * @returns {boolean} True when the ammo array contains at least one projectile.
	 */
	hasAmmo(ammo) {
		return Array.isArray(ammo) && ammo.length > 0;
	}

	/**
	 * @returns {boolean} Whether enough time passed since the last throw.
	 */
	isOffCooldown(lastThrow, cooldown) {
		const elapsed = Date.now() - (lastThrow || 0);
		return elapsed >= (cooldown || 0);
	}

	/**
	 * Pops a projectile instance from the ammo array, if one exists.
	 *
	 * @param {any[]} ammo
	 * @returns {object|null}
	 */
	consumeProjectile(ammo) {
		if (!this.hasAmmo(ammo)) return null;
		return ammo.pop();
	}

	/**
	 * Configures, launches, and tracks a projectile within the world.
	 *
	 * @param {object} projectile
	 * @param {World} world
	 * @param {object} config
	 */
	launchProjectile(projectile, world, config) {
		const hero = world?.heroCharacter;
		if (!hero || !projectile) return;
		const facingLeft = !!hero.otherDirection;
		this.configureProjectile(projectile, hero, facingLeft);
		this.executeThrow(projectile, facingLeft, config);
		this.finalizeThrow(world, projectile, config, hero);
	}

	/**
	 * Positions and tags the projectile based on the hero's current state.
	 *
	 * @param {object} projectile
	 * @param {Hero} hero
	 * @param {boolean} facingLeft
	 */
	configureProjectile(projectile, hero, facingLeft) {
		projectile.world = hero.world;
		projectile.x = hero.x + (facingLeft ? -50 : 75);
		projectile.y = hero.y + 20;
		projectile.isThrown = true;
		projectile.groundY = this.resolveGroundTarget(hero);
	}

	/**
	 * Computes the Y target for projectile arcs based on hero ground state.
	 *
	 * @param {Hero} hero
	 * @returns {number}
	 */
	resolveGroundTarget(hero) {
		if (typeof hero?.groundY === "number") {
			return Math.max(hero.groundY, hero.y + 120);
		}
		return hero.y + 150;
	}

	/**
	 * Invokes the projectile's throw method with calculated parameters.
	 *
	 * @param {object} projectile
	 * @param {boolean} facingLeft
	 * @param {{throwMethod:string,horizontalPower:number,straightRatio:number,maxDistance:number}} config
	 */
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

	/**
	 * Adds the projectile to the world, updates stats, and triggers hero animations.
	 *
	 * @param {World} world
	 * @param {object} projectile
	 * @param {object} config
	 * @param {Hero} hero
	 */
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

	/**
	 * Plays the hero's casting animation for the specified spell.
	 *
	 * @param {Hero} hero
	 * @param {string} animationKey
	 */
	triggerCast(hero, animationKey) {
		if (!hero || typeof hero.triggerCastAnimation !== "function") return;
		hero.triggerCastAnimation(animationKey);
	}
}

/**
 * Handles all world collision checks: hero vs enemies, projectiles vs enemies,
 * pickup interactions, and cleanup of spent entities.
 */
class CollisionSystem {
	/**
	 * Processes collision interactions for the current tick.
	 *
	 * @param {World} world
	 */
	update(world) {
		if (!world || world.isPaused) return;
		this.handleEnemyInteractions(world);
		this.handleHolyProjectiles(world);
		this.handleDarkProjectiles(world);
		this.handleThrowablePickups(world);
		this.handlePickableCollisions(world);
		this.cleanupProjectiles(world);
		this.handleHeroState(world);
	}

	/**
	 * Resolves hero/enemy collisions and win triggers for defeated bosses.
	 *
	 * @param {World} world
	 */
	handleEnemyInteractions(world) {
		const { heroCharacter, level } = world;
		if (!heroCharacter || !Array.isArray(level?.enemies)) return;
		for (const enemy of level.enemies) {
			if (!enemy) continue;
			if (heroCharacter.isColliding(enemy)) {
				heroCharacter.hit();
				world.statusBarHealth.setPercentage(heroCharacter.health);
				if (heroCharacter.isDead) world.startGameOverSequence();
			}
			if (enemy instanceof SkeletonBoss && enemy.isDead) world.startWinSequence(enemy);
		}
	}

	/**
	 * Updates holy projectile collisions against barriers and enemies.
	 *
	 * @param {World} world
	 */
	handleHolyProjectiles(world) {
		const level = world.level;
		if (!Array.isArray(world.throwableHoly)) return;
		world.throwableHoly.forEach(projectile => {
			if (!projectile) return;
			if (this.hitLevelBarrier(projectile, level)) return;
			if (projectile.isImpacting) return;
			this.applyHolyEnemyHits(projectile, level?.enemies);
		});
	}

	/**
	 * Updates dark projectile collisions against barriers and enemies.
	 *
	 * @param {World} world
	 */
	handleDarkProjectiles(world) {
		const level = world.level;
		if (!Array.isArray(world.throwableDark)) return;
		world.throwableDark.forEach(projectile => {
			if (!projectile) return;
			if (this.hitLevelBarrier(projectile, level)) return;
			if (projectile.hasHit) return;
			this.applyDarkEnemyHit(projectile, level?.enemies);
		});
	}

	/**
	 * Detects hero collisions with throwable pickups and updates ammo.
	 *
	 * @param {World} world
	 */
	handleThrowablePickups(world) {
		const { level, heroCharacter } = world;
		if (!heroCharacter || !Array.isArray(level?.throwables)) return;
		level.throwables.forEach(throwable => {
			if (!throwable || !heroCharacter.isColliding(throwable)) return;
			const pickupSound = this.collectThrowable(world, throwable);
			if (pickupSound) AudioHub.playOne(pickupSound);
			if (typeof world.updateAmmoBars === "function") world.updateAmmoBars();
		});
	}

	/**
	 * Handles hero collisions with pickable items (currently swords).
	 *
	 * @param {World} world
	 */
	handlePickableCollisions(world) {
		const { level, heroCharacter } = world;
		if (!heroCharacter || !Array.isArray(level?.pickables)) return;
		level.pickables.forEach(pickable => {
			if (!pickable || !heroCharacter.isColliding(pickable)) return;
			if (!(pickable instanceof Sword)) return;
			world.heroinventory.push(pickable);
			console.log("Sword collected:", world.heroinventory.length);
			heroCharacter.hasSword = true;
			heroCharacter.startDrawSwordAnimation();
			level.pickables = level.pickables.filter(p => p !== pickable);
		});
	}

	/**
	 * Removes projectiles or throwables flagged for removal/collision.
	 *
	 * @param {World} world
	 */
	cleanupProjectiles(world) {
		world.throwableHoly = (world.throwableHoly || []).filter(p => !p?.shouldRemove);
		world.throwableDark = (world.throwableDark || []).filter(p => !p?.shouldRemove);
		const { level, heroCharacter } = world;
		if (!heroCharacter || !Array.isArray(level?.throwables)) return;
		level.throwables = level.throwables.filter(t => !heroCharacter.isColliding(t));
	}

	/**
	 * Triggers the game-over sequence if the hero is dead.
	 *
	 * @param {World} world
	 */
	handleHeroState(world) {
		if (world.heroCharacter?.isDead) {
			world.startGameOverSequence();
		}
	}

	/**
	 * Stops a projectile that traveled beyond the configured barrier.
	 *
	 * @param {MoveableObject} projectile
	 * @param {Level} level
	 * @returns {boolean}
	 */
	hitLevelBarrier(projectile, level) {
		if (typeof level?.projectileBarrierX !== "number") return false;
		if (projectile.x < level.projectileBarrierX) return false;
		projectile.triggerImpact();
		return true;
	}

	/**
	 * Applies holy projectile damage to every enemy it collides with.
	 *
	 * @param {MoveableObject} projectile
	 * @param {MoveableObject[]} enemies
	 */
	applyHolyEnemyHits(projectile, enemies) {
		if (!Array.isArray(enemies)) return;
		for (const enemy of enemies) {
			if (!enemy || enemy.isDead) continue;
			if (!projectile.isColliding(enemy)) continue;
			if (!projectile.registerHit(enemy)) continue;
			const dmg = this.resolveDamage(projectile, enemy);
			enemy.hit(dmg);
			console.log(`[${enemy.constructor.name}] hit by HolyThrow!`);
		}
	}

	/**
	 * Applies dark projectile damage to the first enemy hit.
	 *
	 * @param {MoveableObject} projectile
	 * @param {MoveableObject[]} enemies
	 * @returns {boolean} True if a hit occurred.
	 */
	applyDarkEnemyHit(projectile, enemies) {
		if (!Array.isArray(enemies)) return false;
		for (const enemy of enemies) {
			if (!enemy || enemy.isDead) continue;
			if (!projectile.isColliding(enemy)) continue;
			const dmg = this.resolveDamage(projectile, enemy);
			enemy.hit(dmg);
			projectile.triggerImpact();
			console.log(`[${enemy.constructor.name}] hit by DarkThrow!`);
			return true;
		}
		return false;
	}

	/**
	 * Adds a collectible throwable to the appropriate ammo pool.
	 *
	 * @param {World} world
	 * @param {Object} throwable
	 * @returns {HTMLAudioElement|null}
	 */
	collectThrowable(world, throwable) {
		if (throwable instanceof ThrowDark) {
			world.darkAmmo.push(throwable);
			return AudioHub.CAST_DARK_PICKUP;
		}
		if (throwable instanceof ThrowHoly) {
			world.holyAmmo.push(throwable);
			return AudioHub.CAST_HOLY_PICKUP;
		}
		return null;
	}

	/**
	 * Determines the damage value for a projectile hit, falling back to the enemy default.
	 */
	resolveDamage(projectile, enemy) {
		return Number.isFinite(projectile?.damage) ? projectile.damage : enemy?.damageOnCollision;
	}
}

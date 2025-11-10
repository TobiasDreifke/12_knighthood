/**
 * Utility helpers for wiring enemies and spawnables into the world context.
 */
class EntityUtils {
	/**
	 * Recursively assigns the `world` reference to single entities or collections.
	 */
	static attachWorldReference(target, world) {
		if (!target) return;
		if (Array.isArray(target)) {
			target.forEach(entity => EntityUtils.attachWorldReference(entity, world));
			return;
		}
		if (typeof target === "object") {
			target.world = world;
		}
	}

	/**
	 * Restores entities to their defined spawn coordinates when present.
	 */
	static resetSpawnCoordinates(entity) {
		if (!entity) return;
		if (typeof entity.spawnX === "number") {
			entity.x = entity.spawnX;
		}
		if (typeof entity.spawnY === "number") {
			entity.y = entity.spawnY;
		}
	}

	/**
	 * Attaches world references, activation markers, targets, and animation for a given enemy.
	 */
	static prepareEnemy(enemy, world) {
		if (!enemy) return;
		EntityUtils.attachWorldReference(enemy, world);
		EntityUtils.resetSpawnCoordinates(enemy);
		EntityUtils.applyEnemyActivation(enemy);
		EntityUtils.assignEnemyTarget(enemy, world.heroCharacter);
		EntityUtils.startEnemyAnimation(enemy);
	}

	static applyEnemyActivation(enemy) {
		if (typeof enemy.activationX === "number") {
			enemy.isDormant = true;
			enemy.activationTriggered = false;
			return;
		}
		if (enemy.isDormant === undefined) {
			enemy.isDormant = false;
		}
	}

	/**
	 * Assigns the hero as a tracking target for enemies that require it.
	 */
	static assignEnemyTarget(enemy, hero) {
		if (!hero) return;
		if (EntityUtils.requiresPlayerAssignment(enemy)) {
			enemy.player = hero;
			enemy.ensureAnimationController?.();
		}
	}

	/**
	 * @returns {boolean} Whether the enemy relies on a direct hero reference.
	 */
	static requiresPlayerAssignment(enemy) {
		return enemy instanceof SkeletonBoss
			|| enemy instanceof Goblin
			|| enemy instanceof Mushroom
			|| enemy instanceof Bat;
	}

	/**
	 * Ensures an enemy's animation loop is running.
	 */
	static startEnemyAnimation(enemy) {
		if (typeof enemy?.ensureAnimationController === "function") {
			enemy.ensureAnimationController();
			return;
		}
		if (typeof enemy?.animation === "function") {
			enemy.animation();
		}
	}
}

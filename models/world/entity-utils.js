class EntityUtils {
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

	static resetSpawnCoordinates(entity) {
		if (!entity) return;
		if (typeof entity.spawnX === "number") {
			entity.x = entity.spawnX;
		}
		if (typeof entity.spawnY === "number") {
			entity.y = entity.spawnY;
		}
	}

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

	static assignEnemyTarget(enemy, hero) {
		if (!hero) return;
		if (EntityUtils.requiresPlayerAssignment(enemy)) {
			enemy.player = hero;
		}
	}

	static requiresPlayerAssignment(enemy) {
		return enemy instanceof SkeletonBoss
			|| enemy instanceof Goblin
			|| enemy instanceof Mushroom
			|| enemy instanceof Bat;
	}

	static startEnemyAnimation(enemy) {
		if (typeof enemy?.animation === "function") {
			enemy.animation();
		}
	}
}

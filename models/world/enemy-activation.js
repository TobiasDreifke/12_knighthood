/**
 * Lazily activates enemies once the hero crosses their activation line.
 */
class EnemyActivationSystem {
	/**
	 * Checks all enemies in the world and activates those within range.
	 *
	 * @param {World} world
	 */
	update(world) {
		const enemies = world?.level?.enemies;
		if (!Array.isArray(enemies)) return;
		const heroX = world?.heroCharacter?.x ?? 0;
		enemies.forEach(enemy => this.tryActivateEnemy(enemy, heroX));
	}

	/**
	 * Determines whether an enemy should be activated based on the hero position.
	 *
	 * @param {MoveableObject} enemy
	 * @param {number} heroX
	 */
	tryActivateEnemy(enemy, heroX) {
		if (!enemy || typeof enemy.activationX !== "number") return;
		if (enemy.activationTriggered) return;
		if (heroX < enemy.activationX) return;
		this.activateEnemy(enemy);
	}

	/**
	 * Marks the enemy as active, invoking its custom hook if provided.
	 *
	 * @param {MoveableObject} enemy
	 */
	activateEnemy(enemy) {
		if (typeof enemy.activate === "function") {
			enemy.activate();
		} else {
			enemy.isDormant = false;
		}
		enemy.activationTriggered = true;
	}
}

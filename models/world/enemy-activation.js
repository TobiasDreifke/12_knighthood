class EnemyActivationSystem {
	update(world) {
		const enemies = world?.level?.enemies;
		if (!Array.isArray(enemies)) return;
		const heroX = world?.heroCharacter?.x ?? 0;
		enemies.forEach(enemy => this.tryActivateEnemy(enemy, heroX));
	}

	tryActivateEnemy(enemy, heroX) {
		if (!enemy || typeof enemy.activationX !== "number") return;
		if (enemy.activationTriggered) return;
		if (heroX < enemy.activationX) return;
		this.activateEnemy(enemy);
	}

	activateEnemy(enemy) {
		if (typeof enemy.activate === "function") {
			enemy.activate();
		} else {
			enemy.isDormant = false;
		}
		enemy.activationTriggered = true;
	}
}

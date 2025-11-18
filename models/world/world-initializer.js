/**
 * Sets up world entities by linking references, preparing enemies, and ensuring level metadata.
 */
class WorldInitializer {
	constructor(entityUtils = EntityUtils) {
		this.entityUtils = entityUtils;
	}

	/**
	 * Main entry that wires up references and spawnables for a world instance.
	 *
	 * @param {World} world
	 */
	initialize(world) {
		if (!world) return;
		this.linkCoreEntities(world);
		this.attachCollections(world);
		this.prepareEnemies(world);
		this.prepareSpawnables(world.level?.throwables);
		this.prepareSpawnables(world.level?.pickables);
		this.ensureProjectileBarrier(world);
	}

	/**
	 * Ensures hero and status bars have a world reference and updated ammo counts.
	 *
	 * @param {World} world
	 */
	linkCoreEntities(world) {
		const { heroCharacter, StatusbarDark, StatusbarHoly, statusBarHealth } = world;
		if (heroCharacter) heroCharacter.world = world;
		if (StatusbarDark) StatusbarDark.world = world;
		if (StatusbarHoly) StatusbarHoly.world = world;
		this.entityUtils.attachWorldReference(statusBarHealth, world);
		this.entityUtils.attachWorldReference(StatusbarHoly, world);
		this.entityUtils.attachWorldReference(StatusbarDark, world);
		if (typeof world.updateAmmoBars === "function") {
			world.updateAmmoBars();
		}
	}

	/**
	 * Attaches the world reference to level collections that need it later.
	 *
	 * @param {World} world
	 */
	attachCollections(world) {
		const level = world.level;
		if (!level) return;
		this.entityUtils.attachWorldReference(level.backgroundObjects, world);
		this.entityUtils.attachWorldReference(level.clouds, world);
		this.entityUtils.attachWorldReference(level.throwables, world);
		this.entityUtils.attachWorldReference(level.pickables, world);
		this.entityUtils.attachWorldReference(world.overlayObjects, world);
	}

	/**
	 * Calls `prepareEnemy` for each level enemy so they inherit world hooks.
	 *
	 * @param {World} world
	 */
	prepareEnemies(world) {
		const enemies = world.level?.enemies;
		if (!Array.isArray(enemies)) return;
		enemies.forEach(enemy => this.entityUtils.prepareEnemy(enemy, world));
	}

	/**
	 * Resets spawn coordinates for throwables/pickables.
	 *
	 * @param {Object[]} items
	 */
	prepareSpawnables(items) {
		if (!Array.isArray(items)) return;
		items.forEach(item => this.entityUtils.resetSpawnCoordinates(item));
	}

	/**
	 * Ensures the level has a projectile barrier coordinate to despawn shots.
	 *
	 * @param {World} world
	 */
	ensureProjectileBarrier(world) {
		const level = world.level;
		if (!level) return;
		if (typeof level.projectileBarrierX === "number") return;
		const levelEnd = typeof level.level_end_x === "number" ? level.level_end_x : this.defaultBarrier(world);
		level.projectileBarrierX = levelEnd;
	}

	/**
	 * @param {World} world
	 * @returns {number} Default barrier derived from the assembler's tile width.
	 */
	defaultBarrier(world) {
		const tileWidth = world?.levelAssembler?.tileWidth ?? 720;
		return tileWidth * 4;
	}
}

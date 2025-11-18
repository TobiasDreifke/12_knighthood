/**
 * Builds playable levels by stitching together builder segments or falling back to predefined levels.
 */
class LevelAssembler {
	constructor(tileWidth = 720) {
		this.tileWidth = tileWidth;
	}

	/**
	 * Returns a Level instance from builders, fallback arrays, or the default `level_01`.
	 */
	buildLevel(levelIndex, builders, fallbackLevels) {
		const hasBuilders = Array.isArray(builders) && builders.some(fn => typeof fn === "function");
		if (hasBuilders) {
			return this.combineSegments(builders);
		}
		if (Array.isArray(fallbackLevels) && fallbackLevels[levelIndex]) {
			return fallbackLevels[levelIndex];
		}
		return typeof level_01 !== "undefined" ? level_01 : null;
	}

	/**
	 * Executes builder functions in order, merging their entities into a single level context.
	 */
	combineSegments(builders) {
		const ctx = this.createContext();
		builders.forEach(builder => this.applyBuilder(builder, ctx));
		if (!ctx.checkpoints.length) ctx.checkpoints.push(0);
		ctx.checkpoints.push(ctx.offset);
		return this.createLevel(ctx);
	}

	/**
	 * @returns {{enemies:any[],throwables:any[],pickables:any[],clouds:any[],backgrounds:any[],overlays:any[],checkpoints:number[],offset:number}}
	 * Creates an empty aggregation context for builder segments.
	 */
	createContext() {
		return {
			enemies: [],
			throwables: [],
			pickables: [],
			clouds: [],
			backgrounds: [],
			overlays: [],
			checkpoints: [],
			offset: 0,
		};
	}

	/**
	 * Applies a level segment builder and merges its data into the shared context.
	 */
	applyBuilder(builder, ctx) {
		if (typeof builder !== "function") return;
		const segment = builder();
		if (!segment) return;
		const offset = ctx.offset;
		ctx.checkpoints.push(offset);
		this.mergeEnemies(segment.enemies, offset, ctx);
		this.mergeThrowables(segment.throwables, offset, ctx);
		this.mergePickables(segment.pickables, offset, ctx);
		this.mergeClouds(segment.clouds, offset, ctx);
		this.mergeBackgrounds(segment.backgroundObjects, offset, ctx);
		this.mergeOverlays(segment.overlays, offset, ctx);
		ctx.offset += this.resolveSegmentLength(segment);
	}

	/**
	 * Adds enemies to the context while applying horizontal offsets.
	 */
	mergeEnemies(enemies, offset, ctx) {
		if (!Array.isArray(enemies)) return;
		enemies.forEach(enemy => {
			if (!enemy) return;
			this.applyEnemyOffsets(enemy, offset);
			ctx.enemies.push(enemy);
		});
	}

	/**
	 * Shifts spawn positions/activation thresholds by the current segment offset.
	 */
	applyEnemyOffsets(enemy, offset) {
		if (typeof enemy.spawnX === "number") {
			enemy.spawnX += offset;
			enemy.x = enemy.spawnX;
		} else if (typeof enemy.x === "number") {
			enemy.x += offset;
			enemy.spawnX = enemy.x;
		}
		if (typeof enemy.spawnY === "number") {
			enemy.y = enemy.spawnY;
		}
		if (typeof enemy.activationX === "number") {
			enemy.activationX += offset;
			enemy.isDormant = true;
			enemy.activationTriggered = false;
		}
	}

	/**
	 * Adds throwable items to the context while applying the current offset.
	 *
	 * @param {Object[]} throwables
	 * @param {number} offset
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 */
	mergeThrowables(throwables, offset, ctx) {
		if (!Array.isArray(throwables)) return;
		throwables.forEach(item => {
			if (!item) return;
			this.applySpawnableOffsets(item, offset);
			ctx.throwables.push(item);
		});
	}

	/**
	 * Adds pickable items to the context with offset adjustments.
	 *
	 * @param {Object[]} pickables
	 * @param {number} offset
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 */
	mergePickables(pickables, offset, ctx) {
		if (!Array.isArray(pickables)) return;
		pickables.forEach(item => {
			if (!item) return;
			this.applySpawnableOffsets(item, offset);
			ctx.pickables.push(item);
		});
	}

	/**
	 * Shifts spawnable positions by the provided offset and ensures spawn values exist.
	 *
	 * @param {Object} item
	 * @param {number} offset
	 */
	applySpawnableOffsets(item, offset) {
		if (typeof item.x === "number") {
			item.x += offset;
		}
		if (typeof item.spawnX === "number") {
			item.spawnX += offset;
		} else if (typeof item.x === "number") {
			item.spawnX = item.x;
		}
		if (typeof item.spawnY === "number") {
			item.y = item.spawnY;
		}
	}

	/**
	 * Adds background clouds with updated anchor positions.
	 *
	 * @param {Object[]} clouds
	 * @param {number} offset
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 */
	mergeClouds(clouds, offset, ctx) {
		if (!Array.isArray(clouds)) return;
		clouds.forEach(cloud => {
			if (!cloud) return;
			if (typeof cloud.x === "number") {
				cloud.x += offset;
			}
			if (typeof cloud.anchorX === "number") {
				cloud.anchorX += offset;
			}
			ctx.clouds.push(cloud);
		});
	}

	/**
	 * Adds parallax background objects to the context.
	 *
	 * @param {Object[]} objects
	 * @param {number} offset
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 */
	mergeBackgrounds(objects, offset, ctx) {
		if (!Array.isArray(objects)) return;
		objects.forEach(obj => {
			if (!obj) return;
			if (typeof obj.x === "number") {
				obj.x += offset;
			}
			ctx.backgrounds.push(obj);
		});
	}

	/**
	 * Adds overlay UI objects to the context.
	 *
	 * @param {Object[]} overlays
	 * @param {number} offset
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 */
	mergeOverlays(overlays, offset, ctx) {
		if (!Array.isArray(overlays)) return;
		overlays.forEach(overlay => {
			if (!overlay) return;
			if (typeof overlay.x === "number") {
				overlay.x += offset;
			}
			ctx.overlays.push(overlay);
		});
	}

	/**
	 * Converts the aggregated context into a Level instance with fallbacks.
	 *
	 * @param {ReturnType<LevelAssembler["createContext"]>} ctx
	 * @returns {Level}
	 */
	createLevel(ctx) {
		const clouds = ctx.clouds.length ? ctx.clouds : generateClouds(120);
		const backgrounds = ctx.backgrounds.length ? ctx.backgrounds : createBackgroundObjects();
		const level = new Level(ctx.enemies, clouds, backgrounds, ctx.throwables, ctx.pickables, ctx.overlays);
		level.level_end_x = ctx.offset;
		level.checkpoints = ctx.checkpoints;
		level.overlays = ctx.overlays;
		return level;
	}

	/**
	 * @param {Object} segment
	 * @returns {number} Length contribution of a builder segment.
	 */
	resolveSegmentLength(segment) {
		if (typeof segment?.level_end_x === "number") {
			return segment.level_end_x;
		}
		return this.tileWidth * 4;
	}
}

/**
 * Populates `globalThis.BatFrameCatalog` once so other modules can request bat sprite sets.
 */
(() => {
	if (typeof globalThis.BatFrameCatalog !== "undefined") return;

	/**
	 * Immutable mapping of bat animation names to their sprite frame file paths.
	 * @type {Readonly<Record<string, string[]>>}
	 */
	const BAT_FRAME_SETS = Object.freeze({
		WALK: [
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_01.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_02.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_03.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_04.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_05.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_06.png",
			"./01_assets/3_enemies_mobs/bat/1_walk/bat_walk_07.png",
		],
		HURT: [
			"./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_01.png",
			"./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_02.png",
			"./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_03.png",
			"./01_assets/3_enemies_mobs/bat/3_hurt/bat_hurt_04.png",
		],
		DEAD: [
			"./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_01.png",
			"./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_02.png",
			"./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_03.png",
			"./01_assets/3_enemies_mobs/bat/2_dead/bat_dead_04.png",
		],
	});

	/**
	 * Utility helpers for working with bat sprite frame sets without exposing the frozen source arrays.
	 */
	class BatFrameCatalog {
		/**
		 * Creates a shallow copy of the catalog keyed by animation name.
		 *
		 * @returns {Record<string, string[]>}
		 */
		static createCatalog() {
			return Object.fromEntries(
				Object.entries(BAT_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
			);
		}

		/**
		 * Returns a cloned array for a specific animation or an empty array if missing.
		 *
		 * @param {string} key
		 * @returns {string[]}
		 */
		static getFrameSet(key) {
			const frames = BAT_FRAME_SETS[key];
			return frames ? [...frames] : [];
		}

		/**
		 * Returns copies of every frame array, useful for eager preloading.
		 *
		 * @returns {string[][]}
		 */
		static getAllFrameSets() {
			return Object.values(BAT_FRAME_SETS).map(frames => [...frames]);
		}
	}

	globalThis.BatFrameCatalog = BatFrameCatalog;
})();

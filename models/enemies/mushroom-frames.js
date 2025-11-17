/**
 * Provides the mushroom sprite sheet mappings via a single global catalog instance.
 */
(() => {
	if (typeof globalThis.MushroomFrameCatalog !== "undefined") return;

	/**
	 * Immutable table of mushroom animation names mapped to sprite frame paths.
	 * @type {Readonly<Record<string, string[]>>}
	 */
	const MUSHROOM_FRAME_SETS = Object.freeze({
		WALK: [
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_01.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_02.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_03.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_04.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_05.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_06.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_07.png",
			"./01_assets/3_enemies_mobs/mushroom/1_walk/mushroom_walk_08.png",
		],
		HURT: [
			"./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_01.png",
			"./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_02.png",
			"./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_03.png",
			"./01_assets/3_enemies_mobs/mushroom/2_hurt/mushroom_hurt_04.png",
		],
		DEAD: [
			"./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_01.png",
			"./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_02.png",
			"./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_03.png",
			"./01_assets/3_enemies_mobs/mushroom/2_dead/mushroom_death_04.png",
		],
	});

	/**
	 * Helper utilities for cloning mushroom sprite frame sets without mutating the source data.
	 */
	class MushroomFrameCatalog {
		/**
		 * Clones every animation array and returns them keyed by animation type.
		 *
		 * @returns {Record<string, string[]>}
		 */
		static createCatalog() {
			return Object.fromEntries(
				Object.entries(MUSHROOM_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
			);
		}

		/**
		 * Fetches a copy of the requested animation's frames.
		 *
		 * @param {string} key
		 * @returns {string[]}
		 */
		static getFrameSet(key) {
			const frames = MUSHROOM_FRAME_SETS[key];
			return frames ? [...frames] : [];
		}

		/**
		 * Returns copies for every animation array, useful for eager loading.
		 *
		 * @returns {string[][]}
		 */
		static getAllFrameSets() {
			return Object.values(MUSHROOM_FRAME_SETS).map(frames => [...frames]);
		}
	}

	globalThis.MushroomFrameCatalog = MushroomFrameCatalog;
})();

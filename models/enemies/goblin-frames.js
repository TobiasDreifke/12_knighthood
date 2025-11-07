(() => {
	if (typeof globalThis.GoblinFrameCatalog !== "undefined") return;

	/**
	 * Immutable mapping of goblin animation keys to ordered sprite frame paths.
	 * @type {Readonly<Record<string, string[]>>}
	 */
	const GOBLIN_FRAME_SETS = Object.freeze({
		WALK: [
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_02.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_03.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_04.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_05.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_06.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_07.png",
			"./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_08.png",
		],
		HURT: [
			"./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_01.png",
			"./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_02.png",
			"./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_03.png",
			"./01_assets/3_enemies_mobs/goblin/3_hurt/goblin_hurt_04.png",
		],
		DEAD: [
			"./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_01.png",
			"./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_02.png",
			"./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_03.png",
			"./01_assets/3_enemies_mobs/goblin/2_dead/goblin_death_04.png",
		],
	});

	/**
	 * Provides safe getters that return cloned arrays for goblin sprite frame sequences.
	 */
	class GoblinFrameCatalog {
		/**
		 * Creates a mutable copy of every registered animation keyed by name.
		 *
		 * @returns {Record<string, string[]>}
		 */
		static createCatalog() {
			return Object.fromEntries(
				Object.entries(GOBLIN_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
			);
		}

		/**
		 * Returns a duplicate array for the requested animation or an empty array if missing.
		 *
		 * @param {string} key
		 * @returns {string[]}
		 */
		static getFrameSet(key) {
			const frames = GOBLIN_FRAME_SETS[key];
			return frames ? [...frames] : [];
		}

		/**
		 * Returns duplicates for all animations, useful when preloading assets.
		 *
		 * @returns {string[][]}
		 */
		static getAllFrameSets() {
			return Object.values(GOBLIN_FRAME_SETS).map(frames => [...frames]);
		}
	}

	globalThis.GoblinFrameCatalog = GoblinFrameCatalog;
})();

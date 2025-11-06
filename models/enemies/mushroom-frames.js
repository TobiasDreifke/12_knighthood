(() => {
	if (typeof globalThis.MushroomFrameCatalog !== "undefined") return;

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

	class MushroomFrameCatalog {
		static createCatalog() {
			return Object.fromEntries(
				Object.entries(MUSHROOM_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
			);
		}

		static getFrameSet(key) {
			const frames = MUSHROOM_FRAME_SETS[key];
			return frames ? [...frames] : [];
		}

		static getAllFrameSets() {
			return Object.values(MUSHROOM_FRAME_SETS).map(frames => [...frames]);
		}
	}

	globalThis.MushroomFrameCatalog = MushroomFrameCatalog;
})();

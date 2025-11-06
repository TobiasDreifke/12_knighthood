(() => {
	if (typeof globalThis.SkeletonBossFrameCatalog !== "undefined") return;

	const SKELETON_BOSS_FRAME_SETS = Object.freeze({
		IDLE: [
			"./01_assets/4_enemie_boss/2_alert/skeleton_idle_01.png",
			"./01_assets/4_enemie_boss/2_alert/skeleton_idle_02.png",
			"./01_assets/4_enemie_boss/2_alert/skeleton_idle_03.png",
			"./01_assets/4_enemie_boss/2_alert/skeleton_idle_04.png",
		],
		WALK: [
			"./01_assets/4_enemie_boss/1_walk/skeleton_walk_01.png",
			"./01_assets/4_enemie_boss/1_walk/skeleton_walk_02.png",
			"./01_assets/4_enemie_boss/1_walk/skeleton_walk_03.png",
			"./01_assets/4_enemie_boss/1_walk/skeleton_walk_04.png",
		],
		ATTACK: [
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_01.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_02.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_03.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_04.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_05.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_06.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_07.png",
			"./01_assets/4_enemie_boss/3_attack/skeleton_attack_08.png",
		],
		HURT: [
			"./01_assets/4_enemie_boss/4_hurt/skeleton_hurt_01.png",
			"./01_assets/4_enemie_boss/4_hurt/skeleton_hurt_02.png",
			"./01_assets/4_enemie_boss/4_hurt/skeleton_hurt_03.png",
			"./01_assets/4_enemie_boss/4_hurt/skeleton_hurt_04.png",
		],
		DEAD: [
			"./01_assets/4_enemie_boss/5_dead/skeleton_death_01.png",
			"./01_assets/4_enemie_boss/5_dead/skeleton_death_02.png",
			"./01_assets/4_enemie_boss/5_dead/skeleton_death_03.png",
			"./01_assets/4_enemie_boss/5_dead/skeleton_death_04.png",
		],
	});

	class SkeletonBossFrameCatalog {
		static createCatalog() {
			return Object.fromEntries(
				Object.entries(SKELETON_BOSS_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
			);
		}

		static getFrameSet(key) {
			const frames = SKELETON_BOSS_FRAME_SETS[key];
			return frames ? [...frames] : [];
		}

		static getAllFrameSets() {
			return Object.values(SKELETON_BOSS_FRAME_SETS).map(frames => [...frames]);
		}
	}

	globalThis.SkeletonBossFrameCatalog = SkeletonBossFrameCatalog;
})();

/**
 * Immutable catalog of hero animation names mapped to the sprite assets they use.
 * @type {Readonly<Record<string, string[]>>}
 */
const HERO_FRAME_SETS = Object.freeze({
	IDLE: [
		"./01_assets/2_character_hero/1_idle/idle/adventurer-idle-00.png",
		"./01_assets/2_character_hero/1_idle/idle/adventurer-idle-01.png",
		"./01_assets/2_character_hero/1_idle/idle/adventurer-idle-02.png",
		"./01_assets/2_character_hero/1_idle/idle/adventurer-idle-03.png",
	],
	IDLE_SWORD: [
		"./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-00.png",
		"./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-01.png",
		"./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-02.png",
		"./01_assets/2_character_hero/18_idle_sword/adventurer-idle-2-03.png",
	],
	WALK: [
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-00.png",
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-01.png",
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-02.png",
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-03.png",
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-04.png",
		"./01_assets/2_character_hero/19_walk_no_sword/adventurer-run2-05.png",
	],
	WALK_SWORD: [
		"./01_assets/2_character_hero/2_walk/adventurer-run3-00.png",
		"./01_assets/2_character_hero/2_walk/adventurer-run3-01.png",
		"./01_assets/2_character_hero/2_walk/adventurer-run3-02.png",
		"./01_assets/2_character_hero/2_walk/adventurer-run3-03.png",
		"./01_assets/2_character_hero/2_walk/adventurer-run3-04.png",
		"./01_assets/2_character_hero/2_walk/adventurer-run3-05.png",
	],
	JUMP: [
		"./01_assets/2_character_hero/3_jump/adventurer-jump-00.png",
		"./01_assets/2_character_hero/3_jump/adventurer-jump-01.png",
		"./01_assets/2_character_hero/3_jump/adventurer-jump-02.png",
		"./01_assets/2_character_hero/3_jump/adventurer-jump-03.png",
	],
	FALL: [
		"./01_assets/2_character_hero/7_fall/adventurer-fall-00.png",
		"./01_assets/2_character_hero/7_fall/adventurer-fall-01.png",
	],
	HURT: [
		"./01_assets/2_character_hero/4_hurt/adventurer-hurt-00-1.3.png",
		"./01_assets/2_character_hero/4_hurt/adventurer-hurt-01-1.3.png",
		"./01_assets/2_character_hero/4_hurt/adventurer-hurt-02-1.3.png",
	],
	DEAD: [
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-00.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-01.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-02.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-03.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-04.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-05.png",
		"./01_assets/2_character_hero/17_dead_no_Sword/adventurer-knock-dwn-06.png",
	],
	DEAD_SWORD: [
		"./01_assets/2_character_hero/5_dead/adventurer-die-00-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-01-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-02-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-03-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-04-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-05-1.3.png",
		"./01_assets/2_character_hero/5_dead/adventurer-die-06-1.3.png",
	],
	CAST_DARK: [
		"./01_assets/2_character_hero/6_cast/adventurer-cast-00.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-01.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-02.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-03.png",
	],
	CAST_HOLY: [
		"./01_assets/2_character_hero/6_cast/adventurer-cast-00.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-01.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-02.png",
		"./01_assets/2_character_hero/6_cast/adventurer-cast-03.png",
	],
	SLIDE: [
		"./01_assets/2_character_hero/9_slide/adventurer-slide-00.png",
		"./01_assets/2_character_hero/9_slide/adventurer-slide-01.png",
	],
	CROUCH: [
		"./01_assets/2_character_hero/14_crouch/adventurer-crouch-00.png",
		"./01_assets/2_character_hero/14_crouch/adventurer-crouch-01.png",
		"./01_assets/2_character_hero/14_crouch/adventurer-crouch-02.png",
		"./01_assets/2_character_hero/14_crouch/adventurer-crouch-03.png",
	],
	ATTACK: [
		"./01_assets/2_character_hero/15_punch/adventurer-punch-00.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-01.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-02.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-03.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-04.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-05.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-06.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-07.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-08.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-09.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-10.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-11.png",
		"./01_assets/2_character_hero/15_punch/adventurer-punch-12.png",
	],
	ATTACK_SWORD: [
		"./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-00.png",
		"./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-01.png",
		"./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-02.png",
		"./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-03.png",
		"./01_assets/2_character_hero/16_attack_sword/adventurer-attack1-04.png",
	],
	SHEATHE_SWORD: [
		"./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-00.png",
		"./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-01.png",
		"./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-02.png",
		"./01_assets/2_character_hero/13_sword_shite/adventurer-swrd-shte-03.png",
	],
	DRAW_SWORD: [
		"./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-00.png",
		"./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-01.png",
		"./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-02.png",
		"./01_assets/2_character_hero/12_sword_draw/adventurer-swrd-drw-03.png",
	],
});

/**
 * Provides safe helper methods for cloning hero animation frame lists.
 */
class HeroAnimationFramesAssembler {
	/**
	 * @returns {Record<string, string[]>} Mutable copy of the hero frame catalog.
	 */
	static createCatalog() {
		return Object.fromEntries(
			Object.entries(HERO_FRAME_SETS).map(([key, frames]) => [key, [...frames]])
		);
	}

	/**
	 * Returns a duplicate of the requested animation's frames, or an empty array if unknown.
	 *
	 * @param {string} key
	 * @returns {string[]}
	 */
	static getFrameSet(key) {
		const frames = HERO_FRAME_SETS[key];
		return frames ? [...frames] : [];
	}

	/**
	 * Returns copies of every animation strip, ideal for eager preloading.
	 *
	 * @returns {string[][]}
	 */
	static getAllFrameSets() {
		return Object.values(HERO_FRAME_SETS).map(frames => [...frames]);
	}
}

/**
 * Creates the animation controller config for walking mushrooms so they can share driver logic.
 *
 * @param {Mushroom} enemy
 * @returns {import("./enemy-animation-controller").EnemyAnimationConfig}
 */
const createMushroomAnimationConfig = enemy => ({
    animationKeys: { walk: 'WALK', hurt: 'HURT', dead: 'DEAD' },
    fps: { loop: 25, walk: 11, hurt: 12, dead: 10 },
    dormant: {
        condition: () => enemy.isDormant,
        action: () => enemy.holdDormantPose(enemy.frames.WALK, 0),
    },
    onActive: () => {
        enemy.moveTowardPlayer({ speed: enemy.speed, flipThreshold: 5 });
        enemy.playAnimationWithSpeed(enemy.frames.WALK, 11);
    },
});

/**
 * Heavier ground mob that shuffles toward the hero with a chunky hitbox and damage on contact.
 */
class Mushroom extends MoveableObject {
    frames = {};
    width = 120;
    height = 120;
    y = 285;

    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 35;
    offsetBottom = 10;

    collidingObject = true;
    debugColor = "purple";
    health = 35;
    damageOnCollision = 12;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;
    activationTriggered = false;

    /**
     * @param {MoveableObject|null} [player]
     * @param {boolean} [isHurt=false]
     * @param {boolean} [isDead=false]
     */
    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(MushroomFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = MushroomFrameCatalog.createCatalog();
        this.loadAllImages();
        this.player = player;
        this.x = 450 + Math.random() * 900;
        this.spawnX = this.x;
        this.spawnY = this.y;
        this.speed = 0.2 + Math.random() * 0.2;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;
        this.configureHitbox();
        this.setupAnimationController();
    }

    /**
     * Preloads every sprite strip referenced by this enemy to avoid runtime hitches.
     */
    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    /**
     * Tightens the collision box so the wide sprite still yields fair contact detection.
     */
    configureHitbox() {
        this.hitboxWidth = 70;
        this.hitboxOffsetTop = 20;
        this.hitboxOffsetBottom = 30;
        this.hitboxOffsetLeft = 0;
        this.hitboxOffsetRight = 0;
    }

    /**
     * Builds and starts the EnemyAnimationController for this mushroom mob.
     */
    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createMushroomAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    /**
     * Restores the animation controller if it was stopped or removed externally.
     */
    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

	/**
	 * Handles incoming hero damage, coordinating sounds, timers, and death cleanup.
	 *
	 * @param {number} [amount=this.damageOnCollision]
	 */
	hit(amount = this.damageOnCollision) {
		const frames = this.frames.HURT?.length ?? 0;
		const handled = this.handleHit(amount, {
			deadSound: AudioHub.MUSHROOM_DEAD,
			hurtSound: AudioHub.MUSHROOM_HURT,
			hurtFps: 12,
			hurtFrameCount: frames,
			onDeath: () => this.clearHurtTimeout(),
			onHurtStart: () => {
				this.clearHurtTimeout();
				this.isHurt = true;
			},
			onHurtEnd: () => {
				this.isHurt = false;
			},
		});
		if (!handled) return;
	}
    /**
     * Wakes the mushroom once the hero crosses its activation line.
     */
    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    /**
     * Keeps AudioHub effects in sync with the animation currently being played.
     *
     * @param {string[]} images
     * @param {number} frameIndex
     */
    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`MUSHROOM_${animationName}`, frameIndex);
    }

    /**
     * Resolves the catalog key for the provided frame array so the correct sound prefix can be used.
     *
     * @param {string[]} images
     * @returns {string|null}
     */
    getAnimationName(images) {
        const catalog = this.frames || {};
        for (const [key, frames] of Object.entries(catalog)) {
            if (frames === images) {
                return key;
            }
        }
        return null;
    }

    /**
     * Cancels any pending hurt animation timeout.
     */
    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

    /**
     * Completely halts the mushroom's animation/timer activity and drops references to the world/player.
     */
    stopAllActivity() {
        this.animationController?.stop();
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

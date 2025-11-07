/**
 * Builds the animation controller config for goblins so their walk/hurt/death loops share a single driver.
 *
 * @param {Goblin} enemy
 * @returns {import("./enemy-animation-controller").EnemyAnimationConfig}
 */
const createGoblinAnimationConfig = enemy => ({
    animationKeys: { walk: 'WALK', hurt: 'HURT', dead: 'DEAD' },
    fps: { loop: 25, walk: 12, hurt: 14, dead: 12 },
    dormant: {
        condition: () => enemy.isDormant,
        action: () => enemy.holdDormantPose(enemy.frames.WALK, 0),
    },
    onActive: () => {
        enemy.moveTowardPlayer({ speed: enemy.speed, flipThreshold: 10 });
        enemy.playAnimationWithSpeed(enemy.frames.WALK, 12);
    },
});

/**
 * Ground-based grunts that march toward the hero, deal contact damage, and share the common
 * MoveableObject/EnemyAnimationController plumbing used by other mobs.
 */
class Goblin extends MoveableObject {
    frames = {};
    offsetLeft = 35;
    offsetRight = 35;
    offsetTop = 40;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";
    health = 20;

    encounterSoundPlayed = false;
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;

    /**
     * @param {MoveableObject|null} [player]
     * @param {boolean} [isHurt=false]
     * @param {boolean} [isDead=false]
     */
    constructor(player = null, isHurt = false, isDead = false) {
        super().loadImage(GoblinFrameCatalog.getFrameSet("WALK")[0]);
        this.frames = GoblinFrameCatalog.createCatalog();
        this.loadAllImages();
        this.x = 400 + Math.random() * 1000;

        this.player = player;
        this.speed = 0.35 + Math.random() * 0.25;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.setupAnimationController();
    }

    /**
     * Preloads all sprite frames so animation changes never stall mid-combat.
     */
    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    /**
     * Creates the shared EnemyAnimationController and starts the animation loop immediately.
     */
    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createGoblinAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    /**
     * Lazily reinstates the animation controller if something removed it (e.g., after serialization).
     */
    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

	/**
	 * Applies incoming damage, coordinating hurt/death animations and clearing lingering timers.
	 *
	 * @param {number} [amount=this.damageOnCollision]
	 */
	hit(amount = this.damageOnCollision) {
		const frames = this.frames.HURT?.length ?? 0;
		this.handleHit(amount, {
			deadSound: AudioHub.GOBLIN_DEAD,
			hurtSound: AudioHub.GOBLIN_HURT,
			hurtFps: 14,
			hurtFrameCount: frames,
			onDeath: () => this.clearHurtTimeout(),
			onHurtStart: () => { this.clearHurtTimeout(); this.isHurt = true; },
			onHurtEnd: () => { this.isHurt = false; },
		});
	}

    /**
     * Wakes the goblin from its dormant state when the player enters the activation zone.
     */
    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    /**
     * Synchronizes AudioHub effects with the currently playing animation frames.
     *
     * @param {string[]} images
     * @param {number} frameIndex
     */
    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`GOBLIN_${animationName}`, frameIndex);
    }

    /**
     * Finds the catalog key that matches the provided frame array.
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
     * Cancels any pending hurt timers so states do not linger longer than intended.
     */
    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

    /**
     * Stops animation/timer activity and releases references when a goblin leaves the world.
     */
    stopAllActivity() {
        this.animationController?.stop();
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

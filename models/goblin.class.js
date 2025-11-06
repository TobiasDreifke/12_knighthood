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

    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createGoblinAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

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

    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`GOBLIN_${animationName}`, frameIndex);
    }

    getAnimationName(images) {
        const catalog = this.frames || {};
        for (const [key, frames] of Object.entries(catalog)) {
            if (frames === images) {
                return key;
            }
        }
        return null;
    }

    clearHurtTimeout() {
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
    }

    stopAllActivity() {
        this.animationController?.stop();
        this.clearHurtTimeout();
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

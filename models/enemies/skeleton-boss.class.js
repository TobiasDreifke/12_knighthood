/**
 * Builds the animation controller config for the skeleton boss, wiring each combat phase to a key.
 *
 * @param {SkeletonBoss} enemy
 * @returns {import("./enemy-animation-controller").EnemyAnimationConfig}
 */
const createSkeletonAnimationConfig = enemy => ({
    resolveWorld: () => enemy.player?.world || enemy.world,
    animationKeys: { walk: 'WALK', hurt: 'HURT', dead: 'DEAD', idle: 'IDLE', attack: 'ATTACK' },
    fps: { loop: 25, walk: 8, hurt: 12, dead: 1, attack: 10 },
    dormant: { condition: () => enemy.isDormant, action: () => enemy.playIdleAnimation() },
    states: [
        {
            condition: () => enemy.isDead,
            action: (_, ctrl) => (ctrl.playAnimationKey('dead', ctrl.config.fps?.dead ?? 6, false), true),
        },
        {
            condition: () => enemy.isHurt,
            action: (_, ctrl) => (ctrl.playAnimationKey('hurt', ctrl.config.fps?.hurt ?? 12, false), true),
        },
        {
            condition: () => enemy.isAttacking,
            action: (_, ctrl) => (ctrl.playAnimationKey('attack', ctrl.config.fps?.attack ?? 10, false), true),
        },
    ],
    onActive: () => enemy.runBossBehaviour(),
});

/**
 * Mid/late-game boss with bespoke attack/walk logic, complex hit reactions, and animation orchestration.
 */
class SkeletonBoss extends MoveableObject {
    frames = {};
    width = 250;
    height = 250;
    y = 155;

    offsetLeft = 90;
    offsetRight = 80;
    offsetTop = 45;
    offsetBottom = 5;

    collidingObject = true;
    debugColor = "green";
    health = 240;
    encounterSoundPlayed = false;
    attackTimers = [];
    hurtTimeout = null;
    spawnX = null;
    spawnY = null;
    activationX = null;
    isDormant = false;

    /**
     * @param {MoveableObject} player
     * @param {boolean} [isHurt=false]
     * @param {boolean} [isDead=false]
     */
    constructor(player, isHurt = false, isDead = false) {
        super().loadImage(SkeletonBossFrameCatalog.getFrameSet("IDLE")[0]);
        this.frames = SkeletonBossFrameCatalog.createCatalog();
        this.loadAllImages();
        this.player = player;
        this.x = 700;
        this.speed = 0.55;
        this.otherDirection = true;
        this.isHurt = isHurt;
        this.isDead = isDead;

        this.isAttacking = false;
        this.attackCooldown = false;

        this.hitboxWidth = 95;
        this.hitboxOffsetTop = 35;
        this.hitboxOffsetBottom = 65;
        this.hitboxOffsetLeft = 0;
        this.hitboxOffsetRight = 0;

        if (this.player) this.setupAnimationController();
    }

    /**
     * Preloads every sprite strip referenced by the boss to guarantee smooth transitions.
     */
    loadAllImages() {
        Object.values(this.frames).forEach(group => this.loadImages(group));
    }

    /**
     * Instantiates the EnemyAnimationController used to sequence idle/walk/attack/hurt states.
     */
    setupAnimationController() {
        const controller = new EnemyAnimationController(this, createSkeletonAnimationConfig(this));
        controller.start();
        this.animationController = controller;
    }

    /**
     * Recreates the controller if it is missing (e.g., after serialization/injection).
     */
    ensureAnimationController() {
        if (this.animationController) return;
        this.setupAnimationController();
    }

    /**
     * Computes the center-to-center distance to the hero, or Infinity if no player is tracked.
     *
     * @returns {number}
     */
    distanceToPlayer() {
        if (!this.player) return Infinity;
        const bossCenter = this.x + this.width / 2;
        const heroCenter = this.player.x + this.player.width / 2;
        return Math.abs(heroCenter - bossCenter);
    }

    /**
     * Measures the horizontal gap between hurtboxes so melee range checks stay accurate.
     *
     * @returns {number}
     */
    horizontalGapToPlayer() {
        if (!this.player) return Infinity;
        const bossBox = this.getHurtbox();
        const playerBox = this.player.getHurtbox();

        if (playerBox.right < bossBox.left) {
            return bossBox.left - playerBox.right;
        }
        if (playerBox.left > bossBox.right) {
            return playerBox.left - bossBox.right;
        }
        return 0;
    }

    /**
     * Determines whether the boss and player overlap on the Y axis, a prerequisite for melee swings.
     *
     * @returns {boolean}
     */
    hasVerticalOverlapWithPlayer() {
        if (!this.player) return false;
        const bossBox = this.getHurtbox();
        const playerBox = this.player.getHurtbox();
        return bossBox.bottom > playerBox.top && bossBox.top < playerBox.bottom;
    }

    /**
     * Checks whether the boss should attack, accounting for cooldowns and gap thresholds.
     *
     * @returns {boolean} Whether an attack (or idle fallback) consumed this frame.
     */
    handleAttackLogic() {
        const gap = this.horizontalGapToPlayer();
        const attackHorizontalThreshold = 95;

        if (gap > attackHorizontalThreshold || !this.hasVerticalOverlapWithPlayer()) {
            return false;
        }
        if (this.attackCooldown) {
            this.playIdleAnimation();
            return true;
        }
        this.startAttack();
        return true;
    }

    /**
     * Moves the boss toward the player when they are within engagement range.
     *
     * @returns {boolean} Whether movement logic ran this frame.
     */
    handleWalkingLogic() {
        const walkRange = 540;
        if (this.distanceToPlayer() > walkRange) return false;

        if (!this.encounterSoundPlayed) {
            this.encounterSoundPlayed = true;
            AudioHub.playOne(AudioHub.SKELETON_LAUGHING);
        }

        this.walkTowardPlayer();
        return true;
    }

    /**
     * Slides toward the hero and picks the correct animation (walk vs idle) based on movement result.
     */
    walkTowardPlayer() {
        const moved = this.moveTowardPlayer({ player: this.player, speed: this.speed, flipThreshold: 20 });
        if (moved) {
            this.playAnimationWithSpeed(this.frames.WALK, 8);
        } else {
            this.playIdleAnimation();
        }
    }

    /**
     * Plays the boss idle animation at its slower eased FPS.
     */
    playIdleAnimation() {
        this.playAnimationWithSpeed(this.frames.IDLE, 6);
    }

    /**
     * Primary per-frame update invoked by the animation controller when the boss is active.
     */
    runBossBehaviour() {
        if (!this.player) return;
        this.updateFacingTowardPlayer({ player: this.player, flipThreshold: 20 });
        if (this.handleAttackLogic()) return;
        if (this.handleWalkingLogic()) return;
        this.playIdleAnimation();
    }

    /**
     * Removes the dormant flag so the boss logic can begin running once the encounter starts.
     */
    activate() {
        this.isDormant = false;
        this.activationTriggered = true;
    }

    /**
     * Kicks off the attack timing sequence (swing sound, hit frame, recovery).
     */
    startAttack() {
        this.resetAttackState();
        const timing = this.createAttackTiming();
        this.attackTimers.push(
            setTimeout(() => AudioHub.playOne(AudioHub.SKELETON_ATTACK), timing.swing),
            setTimeout(() => this.attackPlayer(), timing.hit),
            this.scheduleAttackEnd(timing.totalDuration, timing.cooldown)
        );
    }

    /**
     * Clears any previous attack timers and flips state so the animation controller enters ATTACK mode.
     */
    resetAttackState() {
        this.clearAttackTimers();
        this.isAttacking = true;
        this.attackCooldown = true;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }

    /**
     * Calculates swing/hit/total timings based on the ATTACK sprite sheet length.
     *
     * @returns {{swing: number, hit: number, totalDuration: number, cooldown: number}}
     */
    createAttackTiming() {
        const frameDuration = 1000 / 10;
        const frameCount = this.frames.ATTACK?.length ?? 0;
        const totalDuration = frameCount * frameDuration;
        return {
            swing: frameDuration * 4,
            hit: frameDuration * 7,
            totalDuration,
            cooldown: Math.max(3000 - totalDuration, 0),
        };
    }

    /**
     * Schedules the end of an attack animation and subsequent cooldown timer.
     *
     * @param {number} totalDuration
     * @param {number} cooldown
     * @returns {number} Timeout id
     */
    scheduleAttackEnd(totalDuration, cooldown) {
        return setTimeout(() => {
            this.isAttacking = false;
            this.playIdleAnimation();
            this.attackTimers.push(setTimeout(() => this.attackCooldown = false, cooldown));
        }, totalDuration);
    }

    /**
     * Checks collision with the hero during the attack hit window and applies damage if overlapping.
     */
    attackPlayer() {
        const world = this.player?.world || this.world;
        if (world && world.isPaused) return;
        if (!this.player) return;

        const hitbox = this.getHitbox();
        const playerHurtbox = this.player.getHurtbox();

        const isHit =
            hitbox.right > playerHurtbox.left &&
            hitbox.left < playerHurtbox.right &&
            hitbox.bottom > playerHurtbox.top &&
            hitbox.top < playerHurtbox.bottom;

        if (isHit) {
            this.player.hit(25);
        }
    }

    /**
     * Cancels the current attack, ensuring state and timers reset correctly (used on hurt/death transitions).
     */
    stopAttackImmediately() {
        this.clearAttackTimers();
        this.isAttacking = false;
        this.attackCooldown = true;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.playIdleAnimation();
        this.attackTimers.push(
            setTimeout(() => this.attackCooldown = false, 3000)
        );
    }

    /**
     * Clears every timeout related to attack sequencing/cooldowns.
     */
    clearAttackTimers() {
        this.attackTimers.forEach(clearTimeout);
        this.attackTimers = [];
    }

    /**
     * Applies incoming damage and defers to the shared MoveableObject hit helper.
     *
     * @param {number} [amount=this.damageOnCollision]
     */
    hit(amount = this.damageOnCollision) {
        this.handleHit(amount, this.createHitConfig());
    }

    /**
     * Builds the configuration passed into `handleHit`, wiring sounds and callbacks.
     *
     * @returns {Object}
     */
    createHitConfig() {
        const frameCount = this.frames.HURT?.length ?? 0;
        return {
            deadSound: AudioHub.SKELETON_DEAD,
            hurtSound: AudioHub.SKELETON_HURT,
            hurtFps: 12,
            hurtFrameCount: frameCount,
            onDeath: () => {
                this.clearAttackTimers();
                this.beginDeathAnimation();
            },
            onHurtStart: () => this.startHurtState(),
            onHurtEnd: () => this.endHurtState(),
        };
    }

    /**
     * Begins the hurt animation/state and ensures the current attack cannot finish mid-stagger.
     */
    startHurtState() {
        this.stopAttackImmediately();
        this.isHurt = true;
    }

    /**
     * Ends the temporary hurt state so normal AI can resume.
     */
    endHurtState() {
        this.isHurt = false;
    }

    /**
     * Resets frame bookkeeping so the death animation starts from the first frame.
     */
    beginDeathAnimation() {
        this.isHurt = false;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }

    /**
     * Synchronizes boss-specific sound effects with whichever animation strip is currently active.
     *
     * @param {string[]} images
     * @param {number} frameIndex
     */
    onAnimationFrame(images, frameIndex) {
        const animationName = this.getAnimationName(images);
        if (!animationName) return;
        AudioHub.syncSound(`SKELETON_${animationName}`, frameIndex);
    }

    /**
     * Resolves the catalog key for a given frame array reference.
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
     * Fully halts the boss encounter (used when the player wins or leaves the level).
     */
    stopAllActivity() {
        if (this.world?.isWinSequenceActive && this.isDead) {
            return;
        }
        this.animationController?.stop();
        this.clearAttackTimers();
        if (this.hurtTimeout) {
            clearTimeout(this.hurtTimeout);
            this.hurtTimeout = null;
        }
        this.isAttacking = false;
        this.attackCooldown = true;
        this.player = null;
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }
}

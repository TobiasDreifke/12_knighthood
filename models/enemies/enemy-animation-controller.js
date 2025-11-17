/**
 * Defines the EnemyAnimationController globally exactly once to keep animation logic centralized.
 */
(() => {
	if (typeof globalThis.EnemyAnimationController !== "undefined") return;

	const PROXY_FLAG = "__enemyAnimationProxy";

	/**
	 * @typedef {Object} EnemyAnimationState
	 * @property {(enemy: MoveableObject, controller: EnemyAnimationController) => boolean|void} [action]
	 * @property {(enemy: MoveableObject, controller: EnemyAnimationController) => boolean|boolean} [condition]
	 */

	/**
	 * @typedef {Object} EnemyAnimationConfig
	 * @property {() => any} [resolveWorld] - Optional resolver for the MoveableWorld so pause states can be read.
	 * @property {Object<string,string>} [animationKeys] - Mapping from logical state names to catalog keys.
	 * @property {Object<string,number>} [fps] - Per-animation FPS overrides plus a loop default.
	 * @property {{condition?: (enemy: MoveableObject, controller: EnemyAnimationController) => boolean, action?: (enemy: MoveableObject, controller: EnemyAnimationController) => void}} [dormant]
	 * @property {EnemyAnimationState[]} [states] - Ordered state machine that can short-circuit further processing.
	 * @property {(enemy: MoveableObject, controller: EnemyAnimationController) => void|boolean} [onBeforeFrame]
	 * @property {(enemy: MoveableObject, controller: EnemyAnimationController) => void|boolean} [onActive]
	 * @property {(enemy: MoveableObject, controller: EnemyAnimationController) => void} [onAfterFrame]
	 * @property {Object<string, string[]>} [frameMap] - Optional explicit frame arrays keyed by logical name.
	 */

	/**
	 * Drives a MoveableObject's sprite animation by polling a simple state machine and
	 * delegating to `playAnimationWithSpeed` when a state becomes active.
	 */
	class EnemyAnimationController {
		/**
		 * @param {MoveableObject} enemy - Instance whose animation API should be controlled.
		 * @param {EnemyAnimationConfig} [config] - Declarative state machine configuration.
		 */
		constructor(enemy, config = {}) {
			this.enemy = enemy;
			this.config = config;
			this._intervalId = null;
			this.fps = config.fps?.loop ?? 25;
			this.states = Array.isArray(config.states) && config.states.length
				? config.states
				: this.createDefaultStates();
			this.ensureAnimationIntervalProxy();
		}

		/**
		 * Lazily installs a getter/setter on the enemy so existing code that manages
		 * `animationInterval` continues to work while still letting the controller clean up timers.
		 */
		ensureAnimationIntervalProxy() {
			const enemy = this.enemy;
			if (enemy[PROXY_FLAG]) return;
			Object.defineProperty(enemy, 'animationInterval', {
				configurable: true,
				enumerable: false,
				get: () => this._intervalId,
				set: value => {
					if (value == null) {
						this.stop();
					} else {
						this._intervalId = value;
					}
				},
			});
			Object.defineProperty(enemy, PROXY_FLAG, {
				value: true,
				configurable: true,
				enumerable: false,
				writable: false,
			});
		}

		/**
		 * Starts polling animation state using `setInterval` if not already active.
		 */
		start() {
			if (this._intervalId) return;
			const handle = setInterval(() => this.updateFrame(), 1000 / this.fps);
			this.enemy.animationInterval = handle;
		}

		/**
		 * Stops the active polling interval and clears controller bookkeeping.
		 */
		stop() {
			if (!this._intervalId) return;
			clearInterval(this._intervalId);
			this._intervalId = null;
		}

		/**
		 * Evaluates the animation state machine once, honoring pause/dormant hooks and
		 * executing `onActive`/`onAfterFrame` callbacks when appropriate.
		 */
		updateFrame() {
			const enemy = this.enemy;
			const resolver = this.config.resolveWorld;
			const world = typeof resolver === "function" ? resolver(enemy) : (enemy.player?.world || enemy.world);
			if (world?.isPaused) return;

			if (typeof this.config.onBeforeFrame === "function") {
				this.config.onBeforeFrame(enemy, this);
			}

			const dormant = this.config.dormant;
			if (dormant?.condition && dormant.condition(enemy, this)) {
				dormant.action?.(enemy, this);
				return;
			}

			for (const state of this.states) {
				if (!state) continue;
				const condition = state.condition;
				const shouldRun = typeof condition === "function" ? condition(enemy, this) : !!condition;
				if (!shouldRun) continue;
				const action = state.action;
				const result = typeof action === "function" ? action(enemy, this) : undefined;
				if (result !== false) return;
			}

			if (typeof this.config.onActive === "function") {
				if (this.config.onActive(enemy, this) === false) return;
			}

			if (typeof this.config.onAfterFrame === "function") {
				this.config.onAfterFrame(enemy, this);
			}
		}

		/**
		 * Provides a minimal default set of states (hurt/dead) when no custom ones are supplied.
		 *
		 * @returns {EnemyAnimationState[]}
		 */
		createDefaultStates() {
			const deadFps = this.config.fps?.dead ?? 10;
			const hurtFps = this.config.fps?.hurt ?? 12;
			return [
				{
					condition: enemy => enemy.isDead,
					action: (enemy, controller) => {
						controller.playAnimationKey('dead', deadFps, false);
						return true;
					},
				},
				{
					condition: enemy => enemy.isHurt,
					action: (enemy, controller) => {
						controller.playAnimationKey('hurt', hurtFps, false);
						return true;
					},
				},
			];
		}

		/**
		 * Resolves the actual frame catalog for a logical animation key, honoring config overrides.
		 *
		 * @param {string} key
		 * @returns {string[]|null}
		 */
		getFrames(key) {
			const keyMap = this.config.animationKeys || {};
			const resolvedKey = keyMap[key] || key;
			const frameMap = this.config.frameMap || {};
			const explicitFrames = frameMap[key];
			if (Array.isArray(explicitFrames)) return explicitFrames;
			const catalogFrames = this.enemy.frames?.[resolvedKey];
			return Array.isArray(catalogFrames) ? catalogFrames : null;
		}

		/**
		 * Plays the resolved animation on the enemy with the requested FPS and loop behavior.
		 *
		 * @param {string} key
		 * @param {number} [fps]
		 * @param {boolean} [loop=true]
		 */
		playAnimationKey(key, fps, loop = true) {
			const frames = this.getFrames(key);
			if (!frames || !frames.length) return;
			const speed = fps ?? this.config.fps?.[key] ?? 12;
			this.enemy.playAnimationWithSpeed(frames, speed, loop);
		}
	}

	globalThis.EnemyAnimationController = EnemyAnimationController;
})();

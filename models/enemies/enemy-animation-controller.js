(() => {
	if (typeof globalThis.EnemyAnimationController !== "undefined") return;

	const PROXY_FLAG = "__enemyAnimationProxy";

	class EnemyAnimationController {
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

		start() {
			if (this._intervalId) return;
			const handle = setInterval(() => this.updateFrame(), 1000 / this.fps);
			this.enemy.animationInterval = handle;
		}

		stop() {
			if (!this._intervalId) return;
			clearInterval(this._intervalId);
			this._intervalId = null;
		}

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

		getFrames(key) {
			const keyMap = this.config.animationKeys || {};
			const resolvedKey = keyMap[key] || key;
			const frameMap = this.config.frameMap || {};
			const explicitFrames = frameMap[key];
			if (Array.isArray(explicitFrames)) return explicitFrames;
			const catalogFrames = this.enemy.frames?.[resolvedKey];
			return Array.isArray(catalogFrames) ? catalogFrames : null;
		}

		playAnimationKey(key, fps, loop = true) {
			const frames = this.getFrames(key);
			if (!frames || !frames.length) return;
			const speed = fps ?? this.config.fps?.[key] ?? 12;
			this.enemy.playAnimationWithSpeed(frames, speed, loop);
		}
	}

	globalThis.EnemyAnimationController = EnemyAnimationController;
})();

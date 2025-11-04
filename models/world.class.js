class World {
	IntervalIDs = [];
	IntervalID = 1;

	heroCharacter = new Hero();
	statusBarHealth = new StatusbarHealth();
	statusBarEnergy = new StatusbarEnergy();
	statusBarAmmo = null;

	throwableHoly = [];
	throwableDark = [];
	darkAmmo = [];
	holyAmmo = [];
	heroinventory = [];
	lastDarkThrow = 0;
	lastHolyThrow = 0;
	darkCooldownMs = 1000;
	holyCooldownMs = 500;

	winSequenceStarted = false;
	gameOverSequenceStarted = false;
	inputLocked = false;
	isWinSequenceActive = false;
	isPaused = false;
	hasStarted = false;

	levelIndex = 0;
	level = null;

	canvas;
	ctx;
	keyboard;
	camera_x = 0;

	constructor(canvasPara, keyboardPara, levelIndex = 0) {
		this.ctx = canvasPara.getContext("2d");
		this.canvas = canvasPara;
		this.keyboard = keyboardPara;
		this.levelIndex = levelIndex;
		this.level = this.resolveLevel(levelIndex);
		this.statusBarAmmo = new StatusbarAmmo();
		this.setWorld();
	}

	resolveLevel(index) {
		if (Array.isArray(GAME_LEVEL_BUILDERS) && GAME_LEVEL_BUILDERS.length) {
			return this.combineLevels(GAME_LEVEL_BUILDERS);
		}
		if (Array.isArray(GAME_LEVELS) && GAME_LEVELS[index]) {
			return GAME_LEVELS[index];
		}
		return typeof level_01 !== 'undefined' ? level_01 : null;
	}

	combineLevels(builders) {
		const tileWidth = 720;
		const combinedEnemies = [];
		const combinedThrowables = [];
		const combinedPickables = [];
		const combinedClouds = [];
		const combinedBackgrounds = [];
		const checkpoints = [];
		let offset = 0;

		builders.forEach(builder => {
			if (typeof builder !== 'function') return;
			const segment = builder();
			if (!segment) return;

			const segmentOffset = offset;
			checkpoints.push(segmentOffset);

			(segment.enemies || []).forEach(enemy => {
				if (!enemy) return;
				if (typeof enemy.spawnX === 'number') {
					enemy.spawnX += segmentOffset;
					enemy.x = enemy.spawnX;
				} else if (typeof enemy.x === 'number') {
					enemy.x += segmentOffset;
					enemy.spawnX = enemy.x;
				}
				if (typeof enemy.spawnY === 'number') {
					enemy.y = enemy.spawnY;
				}
				if (typeof enemy.activationX === 'number') {
					enemy.activationX += segmentOffset;
					enemy.isDormant = true;
					enemy.activationTriggered = false;
				}
				combinedEnemies.push(enemy);
			});

			(segment.throwables || []).forEach(item => {
				if (!item) return;
				if (typeof item.x === 'number') item.x += segmentOffset;
				if (typeof item.spawnX === 'number') {
					item.spawnX += segmentOffset;
				} else {
					item.spawnX = item.x;
				}
				combinedThrowables.push(item);
			});

			(segment.pickables || []).forEach(item => {
				if (!item) return;
				if (typeof item.x === 'number') item.x += segmentOffset;
				if (typeof item.spawnX === 'number') {
					item.spawnX += segmentOffset;
				} else {
					item.spawnX = item.x;
				}
				combinedPickables.push(item);
			});

			(segment.clouds || []).forEach(cloud => {
				if (!cloud) return;
				if (typeof cloud.x === 'number') cloud.x += segmentOffset;
				if (typeof cloud.anchorX === 'number') cloud.anchorX += segmentOffset;
				combinedClouds.push(cloud);
			});

			(segment.backgroundObjects || []).forEach(obj => {
				if (!obj) return;
				if (typeof obj.x === 'number') obj.x += segmentOffset;
				combinedBackgrounds.push(obj);
			});

			const segmentLength = segment.level_end_x ?? (tileWidth * 4);
			offset += segmentLength;
		});
		checkpoints.push(offset);

		const level = new Level(
			combinedEnemies,
			combinedClouds.length ? combinedClouds : generateClouds(120),
			combinedBackgrounds.length ? combinedBackgrounds : createBackgroundObjects(),
			combinedThrowables,
			combinedPickables,
		);

		level.level_end_x = offset;
		// level.projectileBarrierX = offset - tileWidth * 0.1;
		level.checkpoints = checkpoints;
		return level;
	}

	start() {
		this.hasStarted = true;
		this.isPaused = false;
		this.isRunning = true;
		AudioHub.playGameplayMusic();
		this.draw();  // start rendering loop
		this.run();   // start intervals (collision checking, throwing, etc.)
	}
	setWorld() {
		this.heroCharacter.world = this;
		this.statusBarAmmo.world = this;
		if (typeof this.statusBarAmmo.setPercentage === 'function') {
			this.statusBarAmmo.setPercentage(0);
		}
		this.attachWorldReference(this.statusBarHealth);
		this.attachWorldReference(this.statusBarEnergy);
		this.attachWorldReference(this.level.backgroundObjects);
		this.attachWorldReference(this.level.clouds);
		this.attachWorldReference(this.level.throwables);
		this.attachWorldReference(this.level.pickables);

		this.level.enemies.forEach(enemy => {
			if (!enemy) return;
			this.attachWorldReference(enemy);
			if (typeof enemy.spawnX === 'number') {
				enemy.x = enemy.spawnX;
			}
			if (typeof enemy.spawnY === 'number') {
				enemy.y = enemy.spawnY;
			}
			if (typeof enemy.activationX === 'number') {
				enemy.isDormant = true;
				enemy.activationTriggered = false;
			} else if (enemy.isDormant === undefined) {
				enemy.isDormant = false;
			}
			if (enemy instanceof SkeletonBoss || enemy instanceof Goblin) {
				enemy.player = this.heroCharacter;
			}
			if (typeof enemy.animation === 'function') {
				enemy.animation();
			}
		});

		(this.level.throwables || []).forEach(item => {
			if (typeof item.spawnX === 'number') {
				item.x = item.spawnX;
			}
			if (typeof item.spawnY === 'number') {
				item.y = item.spawnY;
			}
		});

		(this.level.pickables || []).forEach(item => {
			if (typeof item.spawnX === 'number') {
				item.x = item.spawnX;
			}
			if (typeof item.spawnY === 'number') {
				item.y = item.spawnY;
			}
		});

		if (typeof this.level.projectileBarrierX !== 'number') {
			this.level.projectileBarrierX = this.level.level_end_x ?? (720 * 4);
		}
	}

	run() {
		const collisionId = setInterval(() => {
			if (this.isPaused) return;
			this.checkCollisions();
		}, 200);
		this.IntervalIDs.push(collisionId);

		const throwId = setInterval(() => {
			if (this.isPaused) return;
			this.throwHoly();
			this.throwDark();
		}, 10);
		this.IntervalIDs.push(throwId);
	}

	stopAllIntervals() {
		this.IntervalIDs.forEach(clearInterval);
		this.IntervalIDs = [];
	}

	stopAllEnemyActivity() {
		if (!this.level || !Array.isArray(this.level.enemies)) return;
		this.level.enemies.forEach(enemy => {
			if (!enemy) return;
			if (typeof enemy.stopAllActivity === 'function') {
				enemy.stopAllActivity();
			} else if (enemy.animationInterval) {
				clearInterval(enemy.animationInterval);
				enemy.animationInterval = null;
			}
		});
	}

	lockInput() {
		this.inputLocked = true;
		if (this.keyboard) {
			for (const key in this.keyboard) {
				if (Object.prototype.hasOwnProperty.call(this.keyboard, key)) {
					this.keyboard[key] = false;
				}
			}
		}
	}

	unlockInput() {
		this.inputLocked = false;
	}

	pauseGame() {
		if (this.isPaused || !this.hasStarted || this.gameOverSequenceStarted || this.winSequenceStarted || this.isWinSequenceActive) return false;
		this.isPaused = true;
		this.lockInput();
		if (this.heroCharacter) {
			this.heroCharacter.setControlsLocked(true);
		}
		AudioHub.stopHeroIdleLoop();
		return true;
	}

	resumeGame() {
		if (!this.isPaused) return false;
		this.isPaused = false;
		this.unlockInput();
		if (this.heroCharacter) {
			this.heroCharacter.setControlsLocked(false);
		}
		return true;
	}

	togglePause() {
		if (this.isPaused) {
			return this.resumeGame();
		}
		return this.pauseGame();
	}

	attachWorldReference(target) {
		if (!target) return;
		if (Array.isArray(target)) {
			target.forEach(entity => this.attachWorldReference(entity));
			return;
		}
		if (typeof target === 'object') {
			target.world = this;
		}
	}

	throwHoly() {
		if (this.isPaused) return;
		if (!this.keyboard.THROWHOLY) return;

		const now = Date.now();
		if (now - this.lastHolyThrow < this.holyCooldownMs) return;
		if (this.holyAmmo.length === 0) return;

		this.lastHolyThrow = now;
		console.log("Throwing holy bottle, ammo left:", this.holyAmmo.length);

		const holy = this.holyAmmo.pop();
		holy.world = this;
		const facingLeft = this.heroCharacter.otherDirection;

		holy.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
		holy.y = this.heroCharacter.y + 20;
		holy.isThrown = true;

		holy.throwHoly(facingLeft);

		this.throwableHoly.push(holy);

		this.statusBarAmmo.percentage -= 10;
		if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
		this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);

		if (this.heroCharacter.triggerCastAnimation) {
			this.heroCharacter.triggerCastAnimation('HOLY');
		}
	}

	throwDark() {
		if (this.isPaused) return;
		if (!this.keyboard.THROWDARK) return;

		const now = Date.now();
		if (now - this.lastDarkThrow < this.darkCooldownMs) return;
		if (this.darkAmmo.length === 0) return;

		this.lastDarkThrow = now;
		console.log("Throwing dark bottle, ammo left:", this.darkAmmo.length);

		const dark = this.darkAmmo.pop();
		dark.world = this;
		const facingLeft = this.heroCharacter.otherDirection;

		dark.x = this.heroCharacter.x + (facingLeft ? -50 : 75);
		dark.y = this.heroCharacter.y + 20;
		dark.isThrown = true;

		dark.throwDark(facingLeft);

		this.throwableDark.push(dark);

		this.statusBarAmmo.percentage -= 10;
		if (this.statusBarAmmo.percentage < 0) this.statusBarAmmo.percentage = 0;
		this.statusBarAmmo.setPercentage(this.statusBarAmmo.percentage);

		if (this.heroCharacter.triggerCastAnimation) {
			this.heroCharacter.triggerCastAnimation('DARK');
		}
	}

	canThrowDark() {
		return (Date.now() - this.lastDarkThrow) >= this.darkCooldownMs && this.darkAmmo.length > 0;
	}

	canThrowHoly() {
		return (Date.now() - this.lastHolyThrow) >= this.holyCooldownMs && this.holyAmmo.length > 0;
	}



	checkInventory() {
		CurrentInventory = this.heroinventory;
		console.log("current inventory list" + CurrentInventory);
	}

	checkCollisions() {
		if (this.isPaused) return;
		this.level.enemies.forEach((enemy) => {

			// player attack -> enemy gets hit
			// if (this.heroCharacter.isAttacking && this.heroCharacter.isHitting(enemy)) {
			// 	enemy.hit();
			// 	console.log(`[${enemy.constructor.name}] hit by hero attack!`);
			// }



			// enemy -> player collision -> player gets hit
			if (this.heroCharacter.isColliding(enemy)) {
				this.heroCharacter.hit();
				this.statusBarHealth.setPercentage(this.heroCharacter.health);
				this.statusBarEnergy.setPercentage(this.heroCharacter.health);
				if (this.heroCharacter.isDead) {
					this.startGameOverSequence();
				}
			}

			// if (enemy.isHitting(this.heroCharacter)) {
			// 	this.heroCharacter.hit();
			// 	this.statusBarHealth.setPercentage(this.heroCharacter.health);
			// 	this.statusBarEnergy.setPercentage(this.heroCharacter.health);
			// }

			if (enemy instanceof SkeletonBoss && enemy.isDead) {
				this.startWinSequence();
			}
		});

		this.throwableHoly.forEach((projectile) => {
			if (this.level.projectileBarrierX !== undefined && projectile.x >= this.level.projectileBarrierX) {
				projectile.triggerImpact();
				return;
			}
			if (projectile.isImpacting) return;
			this.level.enemies.forEach(enemy => {
				if (enemy.isDead) return;
				if (projectile.isColliding(enemy) && projectile.registerHit(enemy)) {
					const dmg = Number.isFinite(projectile.damage) ? projectile.damage : enemy.damageOnCollision;
					enemy.hit(dmg);
					console.log(`[${enemy.constructor.name}] hit by HolyThrow!`);
				}
			});
		});

		this.throwableHoly = this.throwableHoly.filter(projectile => !projectile.shouldRemove);


		this.throwableDark.forEach((projectile) => {
			if (this.level.projectileBarrierX !== undefined && projectile.x >= this.level.projectileBarrierX) {
				projectile.triggerImpact();
				return;
			}
			if (projectile.hasHit) return;
			this.level.enemies.some(enemy => {
				if (!enemy.isDead && projectile.isColliding(enemy)) {
					const dmg = Number.isFinite(projectile.damage) ? projectile.damage : enemy.damageOnCollision;
					enemy.hit(dmg);
					projectile.triggerImpact();
					console.log(`[${enemy.constructor.name}] hit by DarkThrow!`);
					return true;
				}
				return false;
			});
		});

		this.throwableDark = this.throwableDark.filter(projectile => !projectile.shouldRemove);



		// --- PICKUP COLLISION (for ammo, etc.) ---
		this.level.throwables.forEach((throwable) => {
			if (this.heroCharacter.isColliding(throwable)) {
				if (throwable instanceof ThrowDark) {
					this.darkAmmo.push(throwable);
					// console.log("Dark ammo collected:", this.darkAmmo.length);
				}

				if (throwable instanceof ThrowHoly) {
					this.holyAmmo.push(throwable);
					// console.log("Holy ammo collected:", this.holyAmmo.length);
				}

				this.statusBarAmmo.collect();
			}
		});

		this.level.pickables.forEach((pickable) => {
			if (this.heroCharacter.isColliding(pickable)) {
				if (pickable instanceof Sword) {
					this.heroinventory.push(pickable);
					console.log("Sword collected:", this.heroinventory.length);
					this.heroCharacter.hasSword = true;
					this.heroCharacter.startDrawSwordAnimation();
					this.level.pickables = this.level.pickables.filter(p => p !== pickable);
				}
			}
		});

		// remove collected items
		this.level.throwables = this.level.throwables.filter(
			(t) => !this.heroCharacter.isColliding(t)
		);

		if (this.heroCharacter.isDead) {
			this.startGameOverSequence();
		}
	}


	draw() {

		if (this.isRunning === false) return; // stops rendering when game ended
		this.updateEnemyActivation();

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.translate(this.camera_x, 0);


		this.drawBackgroundLayer(this.level.backgroundObjects);

		const cloudsBehind = [];
		const cloudsFront = [];

		this.level.clouds.forEach(cloud => {
			if (cloud.y >= 370 && cloud.y <= 400) {
				cloudsFront.push(cloud);
			} else {
				cloudsBehind.push(cloud);
			}
		});

		this.addObjectsToMap(cloudsBehind);

		// draw gameplay objects
		this.addObjectsToMap(this.level.enemies);
		this.addToMap(this.heroCharacter);
		this.addObjectsToMap(this.level.throwables);
		this.addObjectsToMap(this.level.pickables);
		this.addObjectsToMap(this.throwableHoly);
		this.addObjectsToMap(this.throwableDark);

		this.addObjectsToMap(cloudsFront);

		this.ctx.translate(-this.camera_x, 0);

		// UI elements
		this.addToMap(this.statusBarHealth);
		this.addToMap(this.statusBarEnergy);
		this.addToMap(this.statusBarAmmo);

		requestAnimationFrame(() => this.draw());
	}


	updateEnemyActivation() {
		if (!this.level || !Array.isArray(this.level.enemies)) return;
		const heroX = this.heroCharacter?.x ?? 0;
		this.level.enemies.forEach(enemy => {
			if (!enemy || typeof enemy.activationX !== 'number') return;
			if (enemy.activationTriggered) return;
			if (heroX >= enemy.activationX) {
				if (typeof enemy.activate === 'function') {
					enemy.activate();
				} else {
					enemy.isDormant = false;
				}
				enemy.activationTriggered = true;
			}
		});
	}

	drawBackgroundLayer(objects) {
		objects.forEach(o => this.drawBackgroundObject(o));
	}

	drawBackgroundObject(background) {
		const parallax = background.parallax ?? 1;
		const drawX = background.x + (parallax - 1) * this.camera_x;
		this.ctx.drawImage(background.img, drawX, background.y, background.width, background.height);
	}

	addObjectsToMap(objects) {
		objects.forEach(o => {
			this.addToMap(o)
		});
	}


	addToMap(DrawableObject) {
		DrawableObject.drawRectangle(this.ctx); // Object Image Box
		DrawableObject.drawCollisionBox(this.ctx); // Object HurtBox
		DrawableObject.drawHitbox(this.ctx); // Object HitBox 
		if (DrawableObject.otherDirection === true) {
			this.flipImage(DrawableObject);
		} else if (DrawableObject.otherDirection === false) {
			this.flipImageBack(DrawableObject);
		} else {
			this.ctx.drawImage(DrawableObject.img, DrawableObject.x, DrawableObject.y, DrawableObject.width, DrawableObject.height);
		}
	}

	flipImage(DrawableObject) {
		this.ctx.save();
		this.ctx.translate(DrawableObject.x + DrawableObject.width, 0);
		this.ctx.scale(-1, 1);
		this.ctx.drawImage(DrawableObject.img, 0, DrawableObject.y, DrawableObject.width, DrawableObject.height);
		this.ctx.restore();
	}

	flipImageBack(DrawableObject) {
		this.ctx.save();
		this.ctx.drawImage(DrawableObject.img, DrawableObject.x, DrawableObject.y, DrawableObject.width, DrawableObject.height);
		this.ctx.restore();
	}

	showEndScreen() {
		this.isWinSequenceActive = false;
		this.isRunning = false;

		const endScreen = document.getElementById("end-screen");
		endScreen.style.display = "flex";
		AudioHub.playStartScreenMusic();
		setTimeout(() => {
			endScreen.style.opacity = 1;
		}, 50);
	}

	startWinSequence() {
		if (this.winSequenceStarted) return;
		this.winSequenceStarted = true;
		this.lockInput();
		this.stopAllIntervals();
		this.stopAllEnemyActivity();
		this.isWinSequenceActive = true;
		this.heroCharacter.setControlsLocked(true);
		this.heroCharacter.startWinCelebration();
		AudioHub.stopAll();
		const celebrationDuration = (this.heroCharacter.getCelebrationDuration() || 0) + 500;
		setTimeout(() => this.showEndScreen(), celebrationDuration);
	}

	startGameOverSequence() {
		if (this.gameOverSequenceStarted) return;
		this.gameOverSequenceStarted = true;
		this.lockInput();
		this.stopAllIntervals();
		this.stopAllEnemyActivity();
		this.heroCharacter.setControlsLocked(true);
		AudioHub.stopAll();
		this.showGameOverScreen();
		AudioHub.playStartScreenMusic();
	}

	showGameOverScreen() {
		this.isRunning = false;
		const gameOverScreen = document.getElementById("gameover-screen");
		gameOverScreen.style.display = "flex";
		setTimeout(() => {
			gameOverScreen.style.opacity = 1;
		}, 50);
	}
}


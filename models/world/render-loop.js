class RenderLoop {
	render(world) {
		if (!this.canRender(world)) return;
		const ctx = world.ctx;
		this.prepareFrame(ctx, world);
		this.drawWorld(ctx, world);
		this.finishFrame(ctx, world);
		requestAnimationFrame(() => this.render(world));
	}

	canRender(world) {
		return world && world.isRunning !== false && world.ctx && world.canvas;
	}

	prepareFrame(ctx, world) {
		if (typeof world.updateEnemyActivation === "function") {
			world.updateEnemyActivation();
		}
		ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
		ctx.save();
		ctx.translate(world.camera_x, 0);
	}

	drawWorld(ctx, world) {
		const level = world.level || {};
		const clouds = this.splitCloudLayers(level.clouds || []);
		this.drawBackgroundLayer(ctx, level.backgroundObjects, world);
		this.addObjectsToMap(ctx, clouds.behind, world);
		this.addObjectsToMap(ctx, level.enemies, world);
		this.addObject(ctx, world.heroCharacter, world);
		this.addObjectsToMap(ctx, level.throwables, world);
		this.addObjectsToMap(ctx, level.pickables, world);
		this.addObjectsToMap(ctx, world.throwableHoly, world);
		this.addObjectsToMap(ctx, world.throwableDark, world);
		this.addObjectsToMap(ctx, clouds.front, world);
		this.drawOverlayLayer(ctx, world.overlayObjects, world);
	}

	finishFrame(ctx, world) {
		ctx.restore();
		this.drawUi(ctx, world);
	}

	drawBackgroundLayer(ctx, objects, world) {
		if (!Array.isArray(objects)) return;
		objects.forEach(obj => {
			this.attachWorldIfMissing(obj, world);
			this.drawBackgroundObject(ctx, obj, world);
		});
	}

	drawBackgroundObject(ctx, background, world) {
		if (!background || !background.img) return;
		const parallax = background.parallax ?? 1;
		const offset = (parallax - 1) * (world?.camera_x ?? 0);
		const drawX = background.x + offset;
		ctx.drawImage(background.img, drawX, background.y, background.width, background.height);
	}

	drawOverlayLayer(ctx, overlays, world) {
		if (!Array.isArray(overlays)) return;
		overlays.forEach(overlay => {
			if (!overlay) return;
			if (typeof overlay.update === "function") overlay.update(world);
			if (typeof overlay.draw === "function") overlay.draw(ctx);
		});
	}

	drawUi(ctx, world) {
		this.addObject(ctx, world.statusBarHealth, world);
		this.addObject(ctx, world.StatusbarHoly, world);
		this.addObject(ctx, world.StatusbarDark, world);
	}

	addObjectsToMap(ctx, objects, world) {
		if (!Array.isArray(objects)) return;
		objects.forEach(obj => this.addObject(ctx, obj, world));
	}

	addObject(ctx, obj, world) {
		if (!obj) return;
		this.attachWorldIfMissing(obj, world);
		this.drawDebugShapes(ctx, obj);
		this.drawSprite(ctx, obj);
	}

	attachWorldIfMissing(obj, world) {
		if (!obj.world) {
			obj.world = world;
		}
	}

	drawDebugShapes(ctx, obj) {
		this.callIfFunction(obj, obj.drawRectangle, ctx);
		this.callIfFunction(obj, obj.drawCollisionBox, ctx);
		this.callIfFunction(obj, obj.drawHitbox, ctx);
	}

	callIfFunction(target, fn, ctx) {
		if (typeof fn === "function") {
			fn.call(target, ctx);
		}
	}

	drawSprite(ctx, obj) {
		if (!obj.img) return;
		if (obj.otherDirection === true) {
			this.drawMirrored(ctx, obj);
			return;
		}
		if (obj.otherDirection === false) {
			this.drawFacing(ctx, obj);
			return;
		}
		ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
	}

	drawMirrored(ctx, obj) {
		ctx.save();
		ctx.translate(obj.x + obj.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
		ctx.restore();
	}

	drawFacing(ctx, obj) {
		ctx.save();
		ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
		ctx.restore();
	}

	splitCloudLayers(clouds) {
		const layers = { behind: [], front: [] };
		if (!Array.isArray(clouds)) return layers;
		clouds.forEach(cloud => {
			if (!cloud) return;
			if (cloud.y >= 370 && cloud.y <= 400) {
				layers.front.push(cloud);
			} else {
				layers.behind.push(cloud);
			}
		});
		return layers;
	}
}

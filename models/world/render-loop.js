/**
 * Handles drawing the scrolling world, clouds, overlays, and HUD each frame.
 */
class RenderLoop {
	frameHandle = null;
	/**
	 * Main render tick. Prepares the frame, draws world layers, then schedules the next frame.
	 *
	 * @param {World} world
	 */
	render(world) {
		if (!this.canRender(world)) return;
		const ctx = world.ctx;
		this.prepareFrame(ctx, world);
		this.drawWorld(ctx, world);
		this.finishFrame(ctx, world);
		this.frameHandle = requestAnimationFrame(() => this.render(world));
	}

	/**
	 * @returns {boolean} Whether the render loop has the required state to draw.
	 */
	canRender(world) {
		return world && world.isRunning !== false && world.ctx && world.canvas;
	}

	/**
	 * Clears the canvas and applies the world's camera translation before drawing.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {World} world
	 */
	prepareFrame(ctx, world) {
		if (typeof world.updateEnemyActivation === "function") {
			world.updateEnemyActivation();
		}
		ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
		ctx.save();
		ctx.translate(world.camera_x, 0);
	}

	/**
	 * Renders clouds, backgrounds, hero, enemies, projectiles, and overlays.
	 */
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

	/**
	 * Restores the canvas state after drawing the map and overlays the HUD.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {World} world
	 */
	finishFrame(ctx, world) {
		ctx.restore();
		this.drawUi(ctx, world);
	}

	/**
	 * Iterates over parallax/background sprites and renders them with world context.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject[]} objects
	 * @param {World} world
	 */
	drawBackgroundLayer(ctx, objects, world) {
		if (!Array.isArray(objects)) return;
		objects.forEach(obj => {
			this.attachWorldIfMissing(obj, world);
			this.drawBackgroundObject(ctx, obj, world);
		});
	}

	/**
	 * Draws a single background sprite applying its parallax offset.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} background
	 * @param {World} world
	 */
	drawBackgroundObject(ctx, background, world) {
		if (!background || !background.img) return;
		const parallax = background.parallax ?? 1;
		const offset = (parallax - 1) * (world?.camera_x ?? 0);
		const drawX = background.x + offset;
		ctx.drawImage(background.img, drawX, background.y, background.width, background.height);
	}

	/**
	 * Draws overlay UI objects that sit on top of gameplay.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject[]} overlays
	 * @param {World} world
	 */
	drawOverlayLayer(ctx, overlays, world) {
		if (!Array.isArray(overlays)) return;
		overlays.forEach(overlay => {
			if (!overlay) return;
			if (typeof overlay.update === "function") overlay.update(world);
			if (typeof overlay.draw === "function") overlay.draw(ctx);
		});
	}

	/**
	 * Renders the world HUD elements (health/holy/dark bars).
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {World} world
	 */
	drawUi(ctx, world) {
		this.addObject(ctx, world.statusBarHealth, world);
		this.addObject(ctx, world.StatusbarHoly, world);
		this.addObject(ctx, world.StatusbarDark, world);
	}

	/**
	 * Draws each object in an array, skipping invalid entries.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject[]} objects
	 * @param {World} world
	 */
	addObjectsToMap(ctx, objects, world) {
		if (!Array.isArray(objects)) return;
		objects.forEach(obj => this.addObject(ctx, obj, world));
	}

	/**
	 * Ensures an object has a world reference and renders it plus overlays.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 * @param {World} world
	 */
	addObject(ctx, obj, world) {
		if (!obj) return;
		this.attachWorldIfMissing(obj, world);
		this.drawDebugShapes(ctx, obj);
		this.drawSprite(ctx, obj);
		this.drawObjectHud(ctx, obj);
	}

	/**
	 * Assigns the world reference so objects can access global state while drawing.
	 *
	 * @param {DrawableObject} obj
	 * @param {World} world
	 */
	attachWorldIfMissing(obj, world) {
		if (!obj.world) {
			obj.world = world;
		}
	}

	/**
	 * Renders optional debugging rectangles if the object exposes them.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 */
	drawDebugShapes(ctx, obj) {
		this.callIfFunction(obj, obj.drawRectangle, ctx);
		this.callIfFunction(obj, obj.drawCollisionBox, ctx);
		this.callIfFunction(obj, obj.drawHitbox, ctx);
	}

	/**
	 * Safely invokes a method on a target if it exists.
	 *
	 * @param {object} target
	 * @param {Function|undefined} fn
	 * @param {CanvasRenderingContext2D} ctx
	 */
	callIfFunction(target, fn, ctx) {
		if (typeof fn === "function") {
			fn.call(target, ctx);
		}
	}

	/**
	 * Draws an object's sprite, handling facing/mirroring automatically.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 */
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

	/**
	 * Renders a sprite mirrored on the X axis.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 */
	drawMirrored(ctx, obj) {
		ctx.save();
		ctx.translate(obj.x + obj.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
		ctx.restore();
	}

	/**
	 * Draws any HUD the object exposes (e.g., enemy health bars).
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 */
	drawObjectHud(ctx, obj) {
		if (typeof obj.drawHud === "function") {
			obj.drawHud(ctx);
		}
	}

	/**
	 * Draws a right-facing sprite using the object's coordinates.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {DrawableObject} obj
	 */
	drawFacing(ctx, obj) {
		ctx.save();
		ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
		ctx.restore();
	}

	/**
	 * Divides rendered clouds into front/behind layers for parallax depth.
	 *
	 * @param {DrawableObject[]} clouds
	 * @returns {{behind:DrawableObject[],front:DrawableObject[]}}
	 */
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

	/**
	 * Cancels the pending animation frame so rendering pauses cleanly.
	 */
	stop() {
		if (this.frameHandle) {
			cancelAnimationFrame(this.frameHandle);
			this.frameHandle = null;
		}
	}
}

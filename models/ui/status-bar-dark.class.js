/**
 * Bottle-style HUD element that visualizes the hero's remaining dark ammo.
 */
class StatusbarDark extends DrawableObject {
    world;
    ammoCount = 0;
    percentage = 0;
    maxAmmoSlots = 10;

    IMAGES = [
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_00.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_01.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_02.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_03.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_04.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_05.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_06.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_07.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_08.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_09.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/dark_dark_10.png",
    ]
    /**
     * Positions the bottle sprite and preloads its fill-level frames.
     */
    constructor() {
        super();
        this.x = 15;
        this.y = 70;
        this.width = 71;
        this.height = 53;
        this.loadImages(this.IMAGES);
        this.setAmmoCount(0);
    }

    /**
     * Clamps the provided percentage, selects the matching sprite, and updates `img`.
     *
     * @param {number} percentage
     */
    setPercentage(percentage) {
        const clamped = Math.max(0, Math.min(100, percentage));
        this.percentage = clamped;
        const path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Converts the current percentage to an array index (10% steps).
     *
     * @returns {number}
     */
    resolveImageIndex() {
        const index = Math.floor(this.percentage / 10);
        return Math.max(0, Math.min(index, this.IMAGES.length - 1));
    }

    /**
     * Converts a raw ammo count into the appropriate percentage and updates the sprite.
     *
     * @param {number} count
     */
    setAmmoCount(count) {
        const safeCount = Math.max(0, Number.isFinite(count) ? count : 0);
        this.ammoCount = safeCount;
        const capacity = Math.max(1, this.maxAmmoSlots);
        const capped = Math.min(safeCount, capacity);
        const percentage = (capped / capacity) * 100;
        this.setPercentage(percentage);
    }
}

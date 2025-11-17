/**
 * Bottle-style HUD element that visualizes the hero's remaining holy ammo.
 */
class StatusbarHoly extends DrawableObject {

    world;
    ammoCount = 0;
    percentage = 0;
    maxAmmoSlots = 10;

    IMAGES = [
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_00.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_01.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_02.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_03.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_04.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_05.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_06.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_07.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_08.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_09.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/holy__holy_10.png",
    ]
    /**
     * Positions the bottle sprite and loads the frame catalog.
     */
    constructor() {
        super();


        this.x = 120;
        this.y = 70;
        this.width = 71;
        this.height = 53;


        this.loadImages(this.IMAGES);
        this.setAmmoCount(0);
        // this.isHurt();
        // this.collect();

    }


    /**
     * Clamps the target fill percentage and updates the active sprite.
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
     * @returns {number} Sprite index derived from the current percentage.
     */
    resolveImageIndex() {
        const index = Math.floor(this.percentage / 10);
        return Math.max(0, Math.min(index, this.IMAGES.length - 1));
    }

    /**
     * Converts an absolute ammo count into a percentage based on slot capacity.
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

/**
 * Horizontal health bar HUD element rendered at the top-left of the screen.
 */
class StatusbarHealth extends DrawableObject {


    percentage = 100;

    IMAGES = [
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_0.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_10.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_20.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_30.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_40.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_50.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_60.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_70.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_80.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_90.png",
        "./01_assets/7_statusbars/1_statusbar/2_statusbar_health/health_bar_statusbar_100.png",
    ]
    /**
     * Positions the bar sprite, preloads frames, and initializes to 100%.
     */
    constructor() {
        super();
        this.x = 10;
        this.y = 10;
        this.width = 292;
        this.height = 53;

        
        this.loadImages(this.IMAGES);
        this.setPercentage(100);

    }


    /**
     * Clamps health to [0,100] and updates the rendered sprite.
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
     * Derives the sprite index from the current percentage (10% steps).
     *
     * @returns {number}
     */
    resolveImageIndex() {
        const index = Math.floor(this.percentage / 10);
        return Math.max(0, Math.min(index, this.IMAGES.length - 1));
    }
}

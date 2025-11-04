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
    constructor() {
        super();
        this.x = 10;
        this.y = 10;
        this.width = 292;
        this.height = 53;

        
        this.loadImages(this.IMAGES);
        this.setPercentage(100);
        // this.isHurt();

        // console.log("loaded statusbar img:", this.IMAGES);
    }


    setPercentage(percentage) {
        const clamped = Math.max(0, Math.min(100, percentage));
        this.percentage = clamped;
        const path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        const index = Math.floor(this.percentage / 10);
        return Math.max(0, Math.min(index, this.IMAGES.length - 1));
    }
}

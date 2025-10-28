class StatusbarEnergy extends DrawableObject {


    percentage = 100;

    IMAGES = [
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
        "./01_assets/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png",
    ]
    constructor() {
        super();
        this.x = 50;
        this.y = 50;
        this.width = 200;
        this.height = 60;

        
        this.loadImages(this.IMAGES);
        this.setPercentage(100);
        // this.isHurt();

        // console.log("loaded statusbar img:", this.IMAGES);
    }


    setPercentage(percentage) {
        this.percentage = percentage; // => 0 ... 5
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;
        } else if (this.percentage > 80) {
            return 4;
        } else if (this.percentage > 60) {
            return 3;
        } else if (this.percentage > 40) {
            return 2;
        } else if (this.percentage > 20) {
            return 1;
        } else {
            return 0;
        }
    }
}
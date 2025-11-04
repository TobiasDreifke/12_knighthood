class StatusbarDark extends DrawableObject {
    world;
    testAmount = 10;
    Ammo = 0;
    percentage = 0;

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
    constructor() {
        super();


        this.x = 15;
        this.y = 70;
        this.width = 71;
        this.height = 53;


        this.loadImages(this.IMAGES);
        this.setPercentage(0);
        // this.isHurt();
        // console.log("loaded statusbar img:", this.IMAGES);
        // this.collect();
        // console.log("statusbar this level" + this.world.level.throwables);

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


    collect() {
        if (!this.world || !this.world.level) {
            console.warn("StatusbarDark: world or level not set yet");
            return;
        }

        if (this.percentage < 100) {
            this.percentage += this.testAmount;

            if (this.percentage > 100) this.percentage = 100;

            console.log("Current Ammo: " + this.percentage);


            this.setPercentage(this.percentage);
        }

        if (this.percentage <= 0) {
            this.percentage = 0;
            this.setPercentage(this.percentage);
            console.log("Out of ammo");
        }
    }

}


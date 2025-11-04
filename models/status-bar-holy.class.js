class StatusbarHoly extends DrawableObject {

    world;
    testAmount = 10;
    Ammo = 0;
    percentage = 0;

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
    constructor() {
        super();


        this.x = 120;
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
}
class StatusbarAmmo extends DrawableObject {
    world;
    testAmount = 10;
    Ammo = 0;
    percentage = 0;

    IMAGES = [
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
        "./01_assets/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png",
    ]
    constructor() {
        super();


        this.x = 50;
        this.y = 100;
        this.width = 200;
        this.height = 60;


        this.loadImages(this.IMAGES);
        this.setPercentage(30);
        // this.isHurt();
        // console.log("loaded statusbar img:", this.IMAGES);
        // this.collect();
        // console.log("statusbar this level" + this.world.level.throwables);

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
    collect() {
        if (!this.world) {
            console.warn("StatusbarAmmo: world not set yet");
            return;
        }

        if (!this.world.level) {
            console.warn("StatusbarAmmo: level not set yet");
            return;
        }

        console.log("Collecting ammo from level with", this.world.level.throwables.length, "throwables");

        if (this.percentage < 100) {
            this.percentage += this.testAmount;
            console.log("Current Ammo: " + this.percentage);
            if (this.percentage > 100) {
                this.percentage = 100;
            }
            if (this.percentage === 100) {
                console.log("full ammo");
            }
        }
        if (this.percentage < 0) {
            this.percentage = 0;
            console.log("out of ammo");
        }
    }

}


class Cloud extends MoveableObject {
    speed = 0.2;

    constructor(imagePath, x, y, scale = 1) {
        super();
        this.x = x + Math.random() * 100;
        this.y = y;
        this.scale = scale;

        this.loadCloudImage(imagePath);
        this.startFloating();
    }

    loadCloudImage(path) {
        super.loadImage(path);

        const applyNativeSize = () => {
            const naturalWidth = this.img.naturalWidth || this.img.width;
            const naturalHeight = this.img.naturalHeight || this.img.height;

            if (naturalWidth && naturalHeight) {
                this.width = naturalWidth * this.scale;
                this.height = naturalHeight * this.scale;
            }
        };

        if (this.img.complete) {
            applyNativeSize();
        } else {
            this.img.onload = () => {
                applyNativeSize();
                this.img.onload = null;
            };
        }
    }

    startFloating() {
        const verticalAmplitude = 1 + Math.random() * 10; // 6-16 px drift
        const verticalSpeed = 5000 + Math.random() * 3000;
        const horizontalAmplitude = 1 + Math.random() * 20; // 10-30 px drift
        const horizontalSpeed = 7000 + Math.random() * 4000;

        this.anchorX = this.x;
        this.anchorY = this.y;
        this.floatParams = {
            verticalAmplitude,
            verticalSpeed,
            horizontalAmplitude,
            horizontalSpeed,
        };

        this.floatInterval = setInterval(() => {
            if (this.world?.isPaused) return;
            const now = Date.now();
            this.x = this.anchorX + Math.sin(now / horizontalSpeed) * horizontalAmplitude;
            this.y = this.anchorY + Math.sin(now / verticalSpeed) * verticalAmplitude;
        }, 1000 / 30);
    }
}

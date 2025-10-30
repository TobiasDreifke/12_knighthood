class Cloud extends MoveableObject {
    speed = 0.2;

    constructor(imagePath, x, y, scale = 1) {
        super();
        this.x = x + Math.random() * 100;
        this.y = y;
        this.scale = scale;

        this.loadCloudImage(imagePath);
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
}

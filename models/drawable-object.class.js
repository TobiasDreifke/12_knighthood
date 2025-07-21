class DrawableObject {
    x = 120;
    y = 300;

    img;
    imageCache = {};
    currentImage = 0;

    width = 100;
    height = 100;

    
    loadImage(path) {
        this.img = new Image();
        this.img.src = path
    }

    
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };

    
}
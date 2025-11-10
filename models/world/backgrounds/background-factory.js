const BACKGROUND_SEGMENTS = [-720, 0, 720, 720 * 2, 720 * 3, 720 * 4];

/**
 * Creates tiled parallax background layers for the demon woods scene.
 *
 * @returns {BackgroundObject[]}
 */
function createBackgroundObjects() {
    return [
        ...BACKGROUND_SEGMENTS.map(x => new BackgroundObject("./01_assets/5_background/layers/parallax-demon-woods-bg.png", x, null, 0)),
        ...BACKGROUND_SEGMENTS.map(x => new BackgroundObject("./01_assets/5_background/layers/3_third_layer/parallax-demon-woods-far-trees.png", x, null, 0.01)),
        ...BACKGROUND_SEGMENTS.map(x => new BackgroundObject("./01_assets/5_background/layers/2_second_layer/parallax-demon-woods-mid-trees.png", x, null, 0.05)),
        ...BACKGROUND_SEGMENTS.map(x => new BackgroundObject("./01_assets/5_background/layers/1_first_layer/parallax-demon-woods-close-trees.png", x, null, 0.1)),
    ];
}

window.createBackgroundObjects = createBackgroundObjects;

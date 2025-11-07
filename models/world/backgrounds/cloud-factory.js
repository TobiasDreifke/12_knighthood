const CLOUD_VARIANTS = [
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_big_01_left.png", scale: 0.2 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_big_01_rightpng.png", scale: 0.1 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_big_02_right.png", scale: 0.15 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_big_03_left.png", scale: 0.25 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_medium_01_mid.png", scale: 0.2 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_small_01_left.png", scale: 0.3 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_small_02_left.png", scale: 0.4 },
    { path: "./01_assets/5_background/layers/4_clouds/single_clouds/cloud_verysmall_01_left.png", scale: 0.7 },
];

function generateClouds(count = 100) {
    const minX = -100;
    const maxX = 720 * 4;
    const minY = 350;
    const maxY = 400;
    const segment = (maxX - minX) / count;
    const clouds = [];

    for (let i = 0; i < count; i++) {
        const variant = CLOUD_VARIANTS[Math.floor(Math.random() * CLOUD_VARIANTS.length)];
        const baseX = minX + i * segment;
        const jitter = (Math.random() - 0.5) * segment * 0.7;
        const x = baseX + jitter;
        const y = minY + Math.random() * (maxY - minY);
        clouds.push(new Cloud(variant.path, x, y, variant.scale || 1));
    }

    return clouds;
}

window.generateClouds = generateClouds;
window.CLOUD_VARIANTS = CLOUD_VARIANTS;

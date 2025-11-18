/**
 * Builds the final Level 10 encounter, wiring in the boss fight and supporting props.
 *
 * @returns {Level}
 */
function createLevel10() {
    const tile = 720;
    const enemies = [];

    const batPositions = [
        { spawn: 2.4, activation: 2, facingLeft: false },
        { spawn: 3.4, activation: 3, facingLeft: true },
        { spawn: 4.4, activation: 4, facingLeft: true },
        { spawn: 5.4, activation: 4, facingLeft: true },
        { spawn: 0, activation: 0, facingLeft: true },
    ];

    batPositions.forEach(config => {
        const bat = new Bat();
        bat.spawnX = tile * config.spawn;
        bat.x = bat.spawnX;
        bat.spawnY = -100;
        bat.y = bat.spawnY;
        bat.activationX = tile * config.activation;
        bat.isDormant = true;
        bat.otherDirection = config.facingLeft;
        enemies.push(bat);
    });

    const boss = new SkeletonBoss();
    boss.spawnX = tile * 3.2;
    boss.x = boss.spawnX;
    boss.activationX = tile * 2.6;
    boss.isDormant = true;
    boss.otherDirection = false;
    enemies.push(boss);

    const throwables = [];
    const holyPositions = [0.7, 1.0, 1.35];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 24 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const darkPositions = [1.55, 1.85];
    darkPositions.forEach((mult, index) => {
        const darkPickup = new ThrowDark(tile * mult, 360, false, 26 + index * 2);
        darkPickup.spawnX = darkPickup.x;
        darkPickup.spawnY = darkPickup.y;
        throwables.push(darkPickup);
    });

    const pickables = [];
    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(130),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    level.projectileBarrierX = tile * 3.85; // locks the arena once the boss activates
    return level;
}

const level_10 = createLevel10();

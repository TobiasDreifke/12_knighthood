/**
 * Builds Level 05, wiring together its scripted encounters and collectible placement.
 *
 * @returns {Level}
 */
function createLevel05() {
    const tile = 720;
    const enemies = [];

    const goblinPositions = [
        { spawn: 1.8, activation: 1, facingLeft: true },
        { spawn: 2.4, activation: 1.1, facingLeft: false },
    ];

    goblinPositions.forEach(config => {
        const goblin = new Goblin();
        goblin.spawnX = tile * config.spawn;
        goblin.x = goblin.spawnX;
        goblin.activationX = tile * config.activation;
        goblin.isDormant = true;
        goblin.otherDirection = config.facingLeft;
        enemies.push(goblin);
    });

    const mushroom = new Mushroom();
    mushroom.spawnX = tile * 2.9;
    mushroom.x = mushroom.spawnX;
    mushroom.activationX = tile * 1.4;
    mushroom.isDormant = true;
    mushroom.otherDirection = true;
    enemies.push(mushroom);

    const batPositions = [
        { spawn: 2.4, activation: 2, facingLeft: false },
        { spawn: 3.1, activation: 2.4, facingLeft: true },
        { spawn: 3.6, activation: 2.8, facingLeft: false },
    ];

    batPositions.forEach(config => {
        const bat = new Bat();
        bat.spawnX = tile * config.spawn;
        bat.x = bat.spawnX;
        bat.spawnY = -120;
        bat.y = bat.spawnY;
        bat.activationX = tile * config.activation;
        bat.isDormant = true;
        bat.otherDirection = config.facingLeft;
        enemies.push(bat);
    });

    const boss = new SkeletonBoss();
    boss.spawnX = tile * 3.2;
    boss.x = boss.spawnX;
    boss.activationX = tile * 2.7;
    boss.isDormant = true;
    boss.otherDirection = false;
    enemies.push(boss);

    const throwables = [];
    const holyPositions = [0.65, 1.0, 1.35];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 22 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const darkPositions = [1.55, 1.9];
    darkPositions.forEach((mult, index) => {
        const darkPickup = new ThrowDark(tile * mult, 360, false, 24 + index * 2);
        darkPickup.spawnX = darkPickup.x;
        darkPickup.spawnY = darkPickup.y;
        throwables.push(darkPickup);
    });

    const pickables = [];
    const overlays = [];
    const level = new Level(
        enemies,
        generateClouds(120),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    level.projectileBarrierX = tile * 3.85;
    return level;
}

const level_05 = createLevel05();

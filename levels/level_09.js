/**
 * Creates the penultimate Level 09 configuration, including boss prep overlays.
 *
 * @returns {Level}
 */
function createLevel09() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.5, activation: 1, facingLeft: true },
        { spawn: 2.1, activation: 1, facingLeft: false },
        { spawn: 2.7, activation: 1, facingLeft: true },
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

    const mushroomPositions = [
        { spawn: 2.4, activation: 1, facingLeft: false },
        { spawn: 3.2, activation: 2, facingLeft: true },
    ];

    mushroomPositions.forEach(config => {
        const mushroom = new Mushroom();
        mushroom.spawnX = tile * config.spawn;
        mushroom.x = mushroom.spawnX;
        mushroom.activationX = tile * config.activation;
        mushroom.isDormant = true;
        mushroom.otherDirection = config.facingLeft;
        enemies.push(mushroom);
    });

    const bat = new Bat();
    bat.spawnX = tile * 3.3;
    bat.x = bat.spawnX;
    bat.spawnY = -100;
    bat.y = bat.spawnY;
    bat.activationX = tile * 1.5;
    bat.isDormant = true;
    bat.otherDirection = false;
    enemies.push(bat);

    const throwables = [];
    const holyPositions = [0.8, 1.2];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 22 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const darkPositions = [1.5, 1.8];
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
        generateClouds(110),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_09 = createLevel09();

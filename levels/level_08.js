/**
 * Prepares Level 08, defining the stage layout, hazards, and helper overlays.
 *
 * @returns {Level}
 */
function createLevel08() {
    const tile = 720;
    const enemies = [];

    const goblinPositions = [
        { spawn: 1.6, activation: 1, facingLeft: true },
        { spawn: 2.3, activation: 1, facingLeft: false },
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
    mushroom.activationX = tile * 1;
    mushroom.isDormant = true;
    mushroom.otherDirection = false;
    enemies.push(mushroom);

    const batPositions = [
        { spawn: 3.1, activation: 2.8, facingLeft: true },
        { spawn: 3.4, activation: 3, facingLeft: false },
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

    const throwables = [];
    const holyPositions = [0.75, 1.1];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 22 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const darkPositions = [1.45];
    darkPositions.forEach(mult => {
        const darkPickup = new ThrowDark(tile * mult, 360, false, 24);
        darkPickup.spawnX = darkPickup.x;
        darkPickup.spawnY = darkPickup.y;
        throwables.push(darkPickup);
    });

    const pickables = [];
    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(95),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_08 = createLevel08();

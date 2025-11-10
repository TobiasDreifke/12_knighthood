function createLevel07() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.7, activation: 1, facingLeft: true },
        { spawn: 2.6, activation: 1, facingLeft: false },
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

    const batPositions = [
        { spawn: 2.9, activation: 2, facingLeft: true },
        { spawn: 3.3, activation: 2.8, facingLeft: false },
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
    const holyPositions = [0.8, 1.15];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 22 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const pickables = [];
    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(90),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_07 = createLevel07();

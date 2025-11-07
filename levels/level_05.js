function createLevel05() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.8, activation: 1.2, facingLeft: true },
        { spawn: 2.6, activation: 2.0, facingLeft: false },
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
    mushroom.spawnX = tile * 3.1;
    mushroom.x = mushroom.spawnX;
    mushroom.activationX = tile * 2.5;
    mushroom.isDormant = true;
    mushroom.otherDirection = true;
    enemies.push(mushroom);

    const throwables = [];
    const holyPositions = [0.7, 1.05];
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
        generateClouds(70),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_05 = createLevel05();

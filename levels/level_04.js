function createLevel04() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.6, activation: 1.2, facingLeft: true },
        { spawn: 2.2, activation: 1.8, facingLeft: false },
        { spawn: 2.8, activation: 2.3, facingLeft: true },
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

    const throwables = [];

    const pickables = [];
    const sword = new Sword(tile * 0.45, 340);
    sword.spawnX = sword.x;
    sword.spawnY = sword.y;
    pickables.push(sword);

    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(60),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_04 = createLevel04();

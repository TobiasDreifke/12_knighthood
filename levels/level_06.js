function createLevel06() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.5, activation: 1.1, facingLeft: true },
        { spawn: 2.0, activation: 1.6, facingLeft: false },
        { spawn: 2.5, activation: 2.1, facingLeft: true },
        { spawn: 3.0, activation: 2.6, facingLeft: false },
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
        { spawn: 2.2, activation: 1.7, facingLeft: false },
        { spawn: 3.2, activation: 2.8, facingLeft: true },
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

    const throwables = [];
    const pickables = [];
    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(80),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_06 = createLevel06();

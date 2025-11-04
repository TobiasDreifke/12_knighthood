function createLevel03() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [1.5, 1.9, 2.3, 2.7, 3.1];
    goblinPositions.forEach((mult, index) => {
        const goblin = new Goblin();
        goblin.spawnX = tile * mult;
        goblin.x = goblin.spawnX;
        goblin.activationX = tile * (1.1 + index * 0.3);
        goblin.isDormant = true;
        goblin.otherDirection = true;
        enemies.push(goblin);
    });

    const throwables = [];

    const pickables = [];
    const sword = new Sword(tile * 0.5, 340);
    sword.spawnX = sword.x;
    sword.spawnY = sword.y;
    pickables.push(sword);

    const level = new Level(
        enemies,
        generateClouds(90),
        createBackgroundObjects(),
        throwables,
        pickables,
    );

    level.level_end_x = tile * 4;
    level.projectileBarrierX = level.level_end_x - tile * 0.1;
    return level;
}

const level_03 = createLevel03();


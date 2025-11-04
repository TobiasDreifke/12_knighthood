function createLevel03() {
    const tile = 720;

    const enemies = [];

    const goblin1 = new Goblin();
    goblin1.spawnX = tile * 2.2;
    goblin1.x = goblin1.spawnX;
    goblin1.activationX = tile * 1.6;
    goblin1.isDormant = true;
    goblin1.otherDirection = true;
    enemies.push(goblin1);

    const goblin2 = new Goblin();
    goblin2.spawnX = tile * 2.5;
    goblin2.x = goblin2.spawnX;
    goblin2.activationX = tile * 1.9;
    goblin2.isDormant = true;
    goblin2.otherDirection = true;
    enemies.push(goblin2);

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


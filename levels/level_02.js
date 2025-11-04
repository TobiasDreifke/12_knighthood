function createLevel02() {
    const tile = 720;

    const enemies = [];

    const goblin1 = new Goblin();
    goblin1.spawnX = tile * 2.0;
    goblin1.x = goblin1.spawnX;
    goblin1.activationX = tile * 1.4;
    goblin1.isDormant = true;
    goblin1.otherDirection = true;
    enemies.push(goblin1);

    const goblin2 = new Goblin();
    goblin2.spawnX = tile * 2.3;
    goblin2.x = goblin2.spawnX;
    goblin2.activationX = tile * 1.7;
    goblin2.isDormant = true;
    goblin2.otherDirection = true;
    enemies.push(goblin2);

    const throwables = [];
    const dark1 = new ThrowDark(tile * 0.65, 350, false, 18);
    dark1.spawnX = dark1.x;
    dark1.spawnY = dark1.y;
    throwables.push(dark1);
    const dark2 = new ThrowDark(tile * 0.9, 350, false, 18);
    dark2.spawnX = dark2.x;
    dark2.spawnY = dark2.y;
    throwables.push(dark2);

    const level = new Level(
        enemies,
        generateClouds(90),
        createBackgroundObjects(),
        throwables,
    );

    level.level_end_x = tile * 4;
    level.projectileBarrierX = level.level_end_x - tile * 0.1;
    return level;
}

const level_02 = createLevel02();

function createLevel04() {
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

    const boss = new SkeletonBoss();
        boss.spawnX = tile * 4.2;
        boss.x = boss.spawnX;
        boss.activationX = tile * 3.6;
        boss.isDormant = true;
        enemies.push(boss);

    const throwables = [];
    const dark1 = new ThrowDark(tile * 0.8, 350, false, 20);
    dark1.spawnX = dark1.x;
    dark1.spawnY = dark1.y;
    throwables.push(dark1);
    const dark2 = new ThrowDark(tile * 1.0, 350, false, 20);
    dark2.spawnX = dark2.x;
    dark2.spawnY = dark2.y;
    throwables.push(dark2);
    const holy1 = new ThrowHoly(tile * 1.2, 350, false, 24);
    holy1.spawnX = holy1.x;
    holy1.spawnY = holy1.y;
    throwables.push(holy1);

    const pickables = [];
    const sword = new Sword(tile * 0.4, 340);
    sword.spawnX = sword.x;
    sword.spawnY = sword.y;
    pickables.push(sword);

    const level = new Level(
        enemies,
        generateClouds(100),
        createBackgroundObjects(),
        throwables,
        pickables,
    );

    level.level_end_x = tile * 5;
    level.projectileBarrierX = level.level_end_x - tile * 0.1;
    return level;
}

const level_04 = createLevel04();

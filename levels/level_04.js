const level_04 = (() => {
    const tile = 720;

    const enemies = [
        new Goblin(),
        new Goblin(),
        new Goblin(),
        new Goblin(),
        new Goblin(),
        new SkeletonBoss(),
    ];

    enemies[0].x = tile * 1.5;
    enemies[1].x = tile * 1.9;
    enemies[2].x = tile * 2.3;
    enemies[3].x = tile * 2.7;
    enemies[4].x = tile * 3.1;
    enemies[5].x = tile * 4.2;

    const throwables = [
        new ThrowDark(tile * 0.8, 350),
        new ThrowDark(tile * 1.0, 350),
        new ThrowHoly(tile * 1.2, 350),
    ];

    const pickables = [
        new Sword(tile * 0.4, 340),
    ];

    const level = new Level(
        enemies,
        generateClouds(100),
        createBackgroundObjects(),
        throwables,
        pickables,
    );

    level.level_end_x = tile * 5;
    return level;
})();

const level_02 = (() => {
    const tile = 720;

    const enemies = [new Goblin(), new Goblin()];
    enemies[0].x = tile * 2.0;
    enemies[1].x = tile * 2.3;

    const throwables = [
        new ThrowDark(tile * 0.65, 350),
        new ThrowDark(tile * 0.9, 350),
    ];

    const pickables = [
        new Sword(tile * 0.35, 340),
    ];

    const level = new Level(
        enemies,
        generateClouds(90),
        createBackgroundObjects(),
        throwables,
        pickables,
    );

    level.level_end_x = tile * 4;
    return level;
})();

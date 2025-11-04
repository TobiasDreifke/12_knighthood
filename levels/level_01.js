const level_01 = (() => {
    const tile = 720;

    const enemies = [new Goblin(), new Goblin()];
    enemies[0].x = tile * 1.8;
    enemies[1].x = tile * 2.1;

    const throwables = [
        new ThrowHoly(tile * 0.6, 350),
        new ThrowHoly(tile * 0.85, 350),
    ];

    const pickables = [];

    const level = new Level(
        enemies,
        generateClouds(80),
        createBackgroundObjects(),
        throwables,
        pickables,
    );

    level.level_end_x = tile * 4;
    return level;
})();

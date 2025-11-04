const level_03 = (() => {
    const tile = 720;

    const enemies = [new Goblin(), new Goblin()];
    enemies[0].x = tile * 2.2;
    enemies[1].x = tile * 2.5;

    const throwables = [];

    const pickables = [
        new Sword(tile * 0.5, 340),
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

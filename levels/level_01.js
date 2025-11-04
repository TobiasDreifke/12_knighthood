function createLevel01() {
    const tile = 720;

    const enemies = [];

    const goblin1 = new Goblin();
    goblin1.spawnX = tile * 1.8;
    goblin1.x = goblin1.spawnX;
    goblin1.activationX = tile * 1.2;
    goblin1.isDormant = true;
    goblin1.otherDirection = true;
    enemies.push(goblin1);

    const goblin2 = new Goblin();
    goblin2.spawnX = tile * 2.1;
    goblin2.x = goblin2.spawnX;
    goblin2.activationX = tile * 1.5;
    goblin2.isDormant = true;
    goblin2.otherDirection = true;
    enemies.push(goblin2);

    const throwables = [];
    const holy1 = new ThrowHoly(tile * 0.6, 350, false, 22);
    holy1.spawnX = holy1.x;
    holy1.spawnY = holy1.y;
    throwables.push(holy1);
    const holy2 = new ThrowHoly(tile * 0.85, 350, false, 22);
    holy2.spawnX = holy2.x;
    holy2.spawnY = holy2.y;
    throwables.push(holy2);

    const pickables = [];

    const overlays = [];
    const attackTooltip = new TooltipText({
        x: tile * 0.75,
        y: 140,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `To attack press ${KeyboardMapping.getDisplayKey("ATTACK", "Attack")}`,
    });
    overlays.push(attackTooltip);

    const level = new Level(
        enemies,
        generateClouds(20),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    // level.projectileBarrierX = level.level_end_x - tile * 0.1;
    return level;
}

const level_01 = createLevel01();

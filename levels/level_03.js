function createLevel03() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.7, activation: 1, facingLeft: true },
        { spawn: 2.4, activation: 1, facingLeft: false },
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

    const mushroom = new Mushroom();
    mushroom.spawnX = tile * 3.0;
    mushroom.x = mushroom.spawnX;
    mushroom.activationX = tile * 1.5;
    mushroom.isDormant = true;
    mushroom.otherDirection = false;
    enemies.push(mushroom);

    const throwables = [];
    const darkPositions = [0.6, 1.0];
    darkPositions.forEach((mult, index) => {
        const darkPickup = new ThrowDark(tile * mult, 360, false, 18 + index * 2);
        darkPickup.spawnX = darkPickup.x;
        darkPickup.spawnY = darkPickup.y;
        throwables.push(darkPickup);
    });

    const pickables = [];
    const overlays = [];

    const DarkTooltip = new TooltipText({
        x: tile * 0.25,
        y: 250,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `A Dark cast has high damage <br> but will explode upon contact`,
    });
    overlays.push(DarkTooltip);
    const ThrowDarkTooltip = new TooltipText({
        x: tile * 1,
        y: 275,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `To Cast a Dark press ${KeyboardMapping.getDisplayKey("THROWDARK", "throwdark")}`,
    });
    overlays.push(ThrowDarkTooltip);
    const level = new Level(
        enemies,
        generateClouds(50),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_03 = createLevel03();

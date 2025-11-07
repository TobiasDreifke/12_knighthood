function createLevel02() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 2.0, activation: 1.3, facingLeft: true },
        { spawn: 2.5, activation: 1.9, facingLeft: false },
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

    const throwables = [];
    const holyPositions = [0.65, 0.95];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 10 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const pickables = [];

    const overlays = [];

    const movementTips = [
        {
            x: 0.25,
            text: () => `Hold ${KeyboardMapping.getDisplayKey("LEFT", "left")} / ${KeyboardMapping.getDisplayKey("RIGHT", "right")} to move`,
        },
        {
            x: 0.75,
            text: () => `Jump with ${KeyboardMapping.getDisplayKey("JUMP", "jump")} and punch with ${KeyboardMapping.getDisplayKey("ATTACK", "attack")}`,
        },
        {
            x: 1.25,
            text: () => `Pick up blessed flasks with ${KeyboardMapping.getDisplayKey("INTERACT", "interact")}`,
        },
    ];

    movementTips.forEach(tip => {
        const tooltip = new TooltipText({
            x: tile * tip.x,
            y: 350,
            textAlign: "center",
            textBaseline: "top",
            font: "22px \"Merriweather\", serif",
            padding: 12,
            maxWidth: 360,
            text: tip.text,
        });
        overlays.push(tooltip);
    });

    const level = new Level(
        enemies,
        generateClouds(40),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_02 = createLevel02();

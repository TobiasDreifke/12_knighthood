/**
 * Builds the introductory tutorial level and wires helpful tooltip overlays.
 *
 * @returns {Level}
 */
function createLevel01() {
    const tile = 720;
    const enemies = [];

    const goblin1 = new Goblin();
    goblin1.spawnX = tile * 2.75;
    goblin1.x = goblin1.spawnX;
    goblin1.activationX = tile * 2;
    goblin1.isDormant = true;
    goblin1.otherDirection = true;
    enemies.push(goblin1);

    const goblin2 = new Goblin();
    goblin2.spawnX = tile * 2.85;
    goblin2.x = goblin2.spawnX;
    goblin2.activationX = tile * 2;
    goblin2.isDormant = true;
    goblin2.otherDirection = true;
    enemies.push(goblin2);

    const throwables = [];
    const pickables = [];
    const overlays = [];

    const pauseTooltip = new TooltipText({
        x: tile * 0.25,
        y: 275,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `For Menu press ${KeyboardMapping.getDisplayKey("PAUSE", "pause")}`,
    });
    overlays.push(pauseTooltip);

    const jumpTooltip = new TooltipText({
        x: tile * 0.75,
        y: 275,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `To Jump press ${KeyboardMapping.getDisplayKey("JUMP", "jump")}`,
    });
    overlays.push(jumpTooltip);

    const slideTooltip = new TooltipText({
        x: tile * 1.25,
        y: 275,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `To Slide press ${KeyboardMapping.getDisplayKey("down", "DOWN")} and ${KeyboardMapping.getDisplayKey("LEFT", "left")} / ${KeyboardMapping.getDisplayKey("RIGHT", "right")}`,
    });
    overlays.push(slideTooltip);

    const attackTooltip = new TooltipText({
        x: tile * 2.25,
        y: 275,
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
    return level;
}

const level_01 = createLevel01();

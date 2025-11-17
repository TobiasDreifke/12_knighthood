/**
 * Builds the second combat-focused level configuration with its enemies and overlays.
 *
 * @returns {Level}
 */
function createLevel02() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 2.0, activation: 1, facingLeft: true },
        { spawn: 2.25, activation: 1, facingLeft: false },
        { spawn: 2.5, activation: 1, facingLeft: false },
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
    const holyPositions = [0.25, 0.95];
    holyPositions.forEach((mult, index) => {
        const holyPickup = new ThrowHoly(tile * mult, 360, false, 10 + index * 2);
        holyPickup.spawnX = holyPickup.x;
        holyPickup.spawnY = holyPickup.y;
        throwables.push(holyPickup);
    });

    const pickables = [];

    const overlays = [];

    const HolyTooltip = new TooltipText({
        x: tile * 0.25,
        y: 250,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `A Holy cast has low damage <br> but will pierce through enemies`,
    });
    overlays.push(HolyTooltip);

    const ThrowHolyTooltip = new TooltipText({
        x: tile * 1,
        y: 275,
        textAlign: "center",
        textBaseline: "top",
        font: "22px \"Merriweather\", serif",
        padding: 12,
        maxWidth: 360,
        text: () => `To Cast a Holy press ${KeyboardMapping.getDisplayKey("THROWHOLY", "throwholy")}`,
    });
    overlays.push(ThrowHolyTooltip);

    


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

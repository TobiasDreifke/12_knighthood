/**
 * Configures the fourth level with its tailored enemy mix and environmental props.
 *
 * @returns {Level}
 */
function createLevel04() {
    const tile = 720;

    const enemies = [];

    const goblinPositions = [
        { spawn: 1.6, activation: 1, facingLeft: true },
        { spawn: 2.2, activation: 1, facingLeft: false },
        { spawn: 2.8, activation: 1, facingLeft: true },
    ];
    const batPositions = [
        { spawn: 3.3, activation: 3.3, facingLeft: false },
    ];

    batPositions.forEach(config => {
        const bat = new Bat();
        bat.spawnX = tile * config.spawn;
        bat.x = bat.spawnX;
        bat.spawnY = -100;
        bat.y = bat.spawnY;
        bat.activationX = tile * config.activation;
        bat.isDormant = true;
        bat.otherDirection = config.facingLeft;
        enemies.push(bat);
    });
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

    const pickables = [];
    const sword = new Sword(tile * 0.45, 340);
    sword.spawnX = sword.x;
    sword.spawnY = sword.y;
    pickables.push(sword);

    const overlays = [];

    const level = new Level(
        enemies,
        generateClouds(60),
        createBackgroundObjects(),
        throwables,
        pickables,
        overlays,
    );

    level.level_end_x = tile * 4;
    return level;
}

const level_04 = createLevel04();

const GAME_LEVEL_BUILDERS = [
    createLevel01,
    createLevel02,
    createLevel03,
    createLevel04,
];

const GAME_LEVELS = GAME_LEVEL_BUILDERS.map(builder => builder());

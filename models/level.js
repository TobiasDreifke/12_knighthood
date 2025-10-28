class Level {
    clouds;
    enemies;
    backgroundObjects;
    throwables;
    pickables;
    level_end_x = 720 * 3;

    constructor(enemies, clouds, backgroundObjects, throwables, pickables) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwables = throwables;
        this.pickables = pickables;
    }
}
class Level {
    clouds;
    enemies;
    backgroundObjects;
    throwables;
    level_end_x = 720 * 3;

    constructor(enemies, clouds, backgroundObjects, throwables) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwables = throwables;
    }
}
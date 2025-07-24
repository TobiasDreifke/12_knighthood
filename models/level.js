class Level {
    clouds;
    enemies;
    backgroundObjects;
    throwable;
    level_end_x = 720 * 3;

    constructor(enemies, clouds, backgroundObjects, throwable) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwable = throwable;
    }
}
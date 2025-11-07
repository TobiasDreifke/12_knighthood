class Level {
    clouds;
    enemies;
    backgroundObjects;
    throwables;
    pickables;
    overlays;
    level_end_x = 720 * 3;

    constructor(enemies, clouds, backgroundObjects, throwables, pickables, overlays = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwables = throwables;
        this.pickables = pickables;
        this.overlays = overlays;
    }
}

class Goblin extends MoveableObject {

    constructor() {
        super().loadImage("./01_assets/3_enemies_mobs/goblin/1_walk/goblin_walk_01.png")
        this.x = 400 + Math.random() *200;;
    }
}
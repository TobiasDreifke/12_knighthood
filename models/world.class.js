class World {
    heroCharacter = new Hero();
    enemies = [
        new Goblin(),
        new Goblin(),
        new Goblin(),
    ];
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.draw();
    }

    draw() {
        // Draw hero
        this.ctx.drawImage(
            this.heroCharacter.img,
            this.heroCharacter.x,
            this.heroCharacter.y,
            this.heroCharacter.height,
            this.heroCharacter.width
        );

        // Draw all enemies
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            this.ctx.drawImage(
                enemy.img,
                enemy.x,
                enemy.y,
                enemy.height,
                enemy.width
            );
        }
    }
}
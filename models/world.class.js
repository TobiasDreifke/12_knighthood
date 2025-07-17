class World {
    heroCharacter = new Hero();
    enemies = [
        new Goblin(),
        new Goblin(),
        new Goblin(),
    ];
    canvas;
    ctx;

    constructor(canvasPara) {
        this.ctx = canvasPara.getContext("2d");
        this.canvas = canvasPara;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // draw heroCharacter
        this.ctx.drawImage(
            this.heroCharacter.img,
            this.heroCharacter.x,
            this.heroCharacter.y,
            this.heroCharacter.height,
            this.heroCharacter.width
        );

        // draw all enemies
        this.enemies.forEach(enemy => {
            this.ctx.drawImage(enemy.img,
                enemy.x,
                enemy.y,
                enemy.height,
                enemy.width)
        })

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }
}
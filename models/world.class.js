class World {
    heroCharacter = new Hero();
    enemies = [
        new Goblin(),
        new Goblin(),
        new Goblin(),
    ];
    clouds = [new Cloud()];
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
                enemy.width,
                enemy.height)
        });

         // draw all clouds
        this.clouds.forEach(cloud => {
            this.ctx.drawImage(cloud.img,
                cloud.x,
                cloud.y,
                cloud.width,
                cloud.height)
        });

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }
}
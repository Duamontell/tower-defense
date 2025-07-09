export class World {
    constructor() {
        this.towers = [];
        this.bases = [];
        this.enemies = [];
        this.gameOver = false;
    }

    addTower(tower) {
        this.towers.push(tower);
    }

    addEnemy(enemy) {
        this.enemies.push(enemy);
    }

    addBase(base) {
        this.bases.push(base);
    }

    update(delta) {
        this.towers.forEach(tower => tower.update(delta, this.enemies));
        this.enemies.forEach(enemy => enemy.update(delta));

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.reachedEnd) {
                this.bases.forEach(base => base.recieveDamage(enemy.damage));
                return false;
            }
            return enemy.isAlive();
        });
        console.log(this.bases[0].health);
        if (this.bases.some(base => base.isDestroyed)) {
            this.gameOver = true;
            alert('Игра окончена! Ваша база уничтожена.');
            return;
        }
    }

    draw(ctx) {
        this.towers.forEach(tower => tower.draw(ctx));
        this.bases.forEach(base => base.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}
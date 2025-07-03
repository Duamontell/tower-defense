export class World {
    constructor() {
        this.towers = [];
        this.bases = [];
        this.enemies = [];
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
        this.towers.forEach(tower => tower.update(delta, this.enemies))
        this.enemies.forEach(enemy => enemy.update(delta))
    }

    draw(ctx) {
        this.towers.forEach(tower => tower.draw(ctx));
        this.bases.forEach(base => base.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}
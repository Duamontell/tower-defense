import { GoblinEnemy, OrkEnemy, ZombieEnemy } from './enemy.js';

export class World {
    constructor(changeBalance) {
        this.towers = [];
        this.bases = [];
        this.enemies = [];
        this.gameOver = false;
        this.waypoints = [];
        this.changeBalance = changeBalance
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

    summonWave(wave) {
        let delay = 0;

        for (let i = 0; i < wave.enemies.orks; i++) {
            let ork = new OrkEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints);
            setTimeout(() => this.addEnemy(ork), delay * 1000);
            delay++;
        }

        for (let i = 0; i < wave.enemies.zombies; i++) {
            let zombie = new ZombieEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints);
            setTimeout(() => this.addEnemy(zombie), delay * 1000);
            delay++;
        }

        for (let i = 0; i < wave.enemies.goblins; i++) {
            let goblin = new GoblinEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints);
            setTimeout(() => this.addEnemy(goblin), delay * 1000);
            delay;
        }
    }

    update(delta) {
        this.towers.forEach(tower => tower.update(delta, this.enemies));
        this.enemies.forEach(enemy => enemy.update(delta));

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.reachedEnd) {
                this.bases.forEach(base => base.recieveDamage(enemy.damage));
                return false;
            }
            if (!enemy.isAlive()) {
                if (this.changeBalance) {
                    this.changeBalance(enemy.reward);
                    console.log(enemy.reward)
                }
                return false;
            }
            return true
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
import { GoblinEnemy, OrcEnemy, ZombieEnemy } from './enemy.js';

export class World {
    constructor(changeBalance, lvlCfg, enemiesCfg, towersCfg) {
        this.towers = [];
        this.bases = [];
        this.enemies = [];
        this.projectiles = [];
        this.waypoints = [];
        this.changeBalance = changeBalance
        this.gameOver = false;
        this.towerZones = lvlCfg.towerZones.map(zone => ({
            topLeft: zone.topLeft,
            bottomRight: zone.bottomRight,
            occupied: false,
            tower: null,
        }));
        this.enemiesCfg = enemiesCfg;
        this.towersCfg = towersCfg
        this.spawnrate = lvlCfg.spawnrate;
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

        for (let i = 0; i < wave.enemies.orcs; i++) {
            let orc = new OrcEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints, this.enemiesCfg.orc);
            setTimeout(() => this.addEnemy(orc), delay * 1000);
            delay = delay + this.spawnrate;

        }

        for (let i = 0; i < wave.enemies.zombies; i++) {
            let zombie = new ZombieEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints, this.enemiesCfg.zombie);
            setTimeout(() => this.addEnemy(zombie), delay * 1000);
            delay = delay + this.spawnrate;
        }

        for (let i = 0; i < wave.enemies.goblins; i++) {
            let goblin = new GoblinEnemy({ x: this.waypoints[0].x, y: this.waypoints[0].y }, this.waypoints, this.enemiesCfg.goblin);
            setTimeout(() => this.addEnemy(goblin), delay * 1000);
            delay = delay + this.spawnrate;
        }
    }

    update(delta) {

        this.towerZones.forEach(zone => {
            if (zone.occupied && zone.tower) {
                zone.tower.update(delta, this.enemies, this.projectiles);
            }
        });

        this.enemies.forEach(enemy => enemy.update(delta));
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.reachedEnd) {
                this.bases.forEach(base => base.recieveDamage(enemy.damage));
                return false;
            }
            if (!enemy.isAlive()) {
                if (this.changeBalance) {
                    this.changeBalance(enemy.reward);
                }
                return false;
            }
            return true
        });

        this.projectiles.forEach(projectile => projectile.update(delta));
        this.projectiles = this.projectiles.filter(projectile => {
            if (projectile.reachedEnd) {
                projectile.enemy.receiveDamage(projectile.damage);
                return false;
            }
            return true
        });

        if (this.bases.some(base => base.isDestroyed)) {
            this.gameOver = true;
            alert('Игра окончена! Ваша база уничтожена.');
            return;
        }
    }

    draw(ctx) {
        this.towerZones.forEach(zone => {
            if (zone.occupied && zone.tower) {
                zone.tower.draw(ctx);
            }
        });
        this.bases.forEach(base => base.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }

    getZoneByCoordinates(x, y) {
        return this.towerZones.find(zone =>
            x >= zone.topLeft.x && x <= zone.bottomRight.x &&
            y >= zone.topLeft.y && y <= zone.bottomRight.y
        );
    }

    tryPlaceTower(x, y, TowerClass) {
        const zone = this.getZoneByCoordinates(x, y);
        if (!zone || zone.occupied) return false;
    
        const centerX = (zone.topLeft.x + zone.bottomRight.x) / 2;
        const centerY = (zone.topLeft.y + zone.bottomRight.y) / 2;
        const tower = new TowerClass({ x: centerX, y: centerY }, this.towersCfg);
        this.towers.push(tower);
    
        zone.occupied = true;
        zone.tower = tower;
    
        return true;
    }
    
}
import { GoblinEnemy, OrcEnemy, ZombieEnemy } from './enemy.js';
import { User } from "./user.js";
import { uuidv4 } from '../systems/generateId.js'

export class World {
    constructor(lvlCfg, enemiesCfg, towersCfg) {
        this.players = new Map;
        this.towers = [];
        this.bases = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.towerZones = [];
        this.waves = {
            currentWave: 0,
            maxWave: lvlCfg.waves,
            userWaves: new Map
        }
        this.enemiesCfg = enemiesCfg;
        this.towersCfg = towersCfg
        this.spawnrate = lvlCfg.spawnrate;
        this.gameOver = false;
        this.winnerId = null;
        this.isWinEvent = false;
    }

    addUser(userId, userCfg) {
        this.players.set(userId, new User(userId, userCfg));
    }

    addTower(tower, userId) {
        this.towers.push(tower);
        this.players.get(currentUserId).addTowerId(tower.id);
        tower.ownerId = userId;
    }

    addEnemy(enemy, userId) {
        this.enemies.push(enemy);
        this.players.get(userId).addEnemyId(enemy.id);
        enemy.ownerId = userId;
    }

    addBase(base, userId) {
        this.bases.push(base);
        this.players.get(userId).setBaseId(base.id);
        base.ownerId = userId;
    }

    addTowerZones(zones, userId) {
        zones.forEach(zone => {
            const id = uuidv4()
            this.towerZones.push({
                id: zone.id,
                topLeft: zone.topLeft,
                bottomRight: zone.bottomRight,
                occupied: false,
                tower: null,
            });
            this.players.get(userId).addTowerZoneId(zone.id);
        })
    }

    summonWaves(wave) {
        const users = this.players.values();
        users.forEach((user, index) => {
            if (user.isLose) return;
            const userWaveConfigs = this.waves.userWaves.get(user.id);
            if (!userWaveConfigs) return;

            const currentWave = userWaveConfigs[wave];
            if (!currentWave) return;

            let delay = 0;
            const { orcs, zombies, goblins } = currentWave.enemies;
            const waypoints = user.waypoints;

            // Орки
            for (let i = 0; i < orcs; i++) {
                setTimeout(() => {
                    const enemy = new OrcEnemy({ x: waypoints[0].x, y: waypoints[0].y }, waypoints, this.enemiesCfg.orc);
                    this.addEnemy(enemy, user.id);
                }, delay * 1000);
                delay += this.spawnrate;
            }

            // Зомби
            for (let i = 0; i < zombies; i++) {
                setTimeout(() => {
                    const enemy = new ZombieEnemy(
                        { x: waypoints[0].x, y: waypoints[0].y },
                        waypoints,
                        this.enemiesCfg.zombie
                    );
                    this.addEnemy(enemy, user.id);
                }, delay * 1000);
                delay += this.spawnrate;
            }

            // Гоблины
            for (let i = 0; i < goblins; i++) {
                setTimeout(() => {
                    const enemy = new GoblinEnemy({ x: waypoints[0].x, y: waypoints[0].y }, waypoints,
                        this.enemiesCfg.goblin
                    );
                    this.addEnemy(enemy, user.id);
                }, delay * 1000);
                delay += this.spawnrate;
            }
        });
    }

    update(delta) {
        this.towerZones.forEach(zone => {
            if (zone.occupied && zone.tower) {
                zone.tower.update(delta, this.enemies, this.projectiles, this.effects);
            }
            return true
        });

        this.projectiles.forEach(projectile => projectile.update(delta));
        this.projectiles = this.projectiles.filter(projectile => {
            if (projectile.reachedEnd) {
                projectile.doDamage(this.effects);
                return false;
            }
            return true
        });

        this.effects.forEach(effect => effect.update(delta, this.enemies));
        this.effects = this.effects.filter(effect => {
            return effect.duration > 0;
        })

        this.enemies.forEach(enemy => enemy.update(delta));
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.reachedEnd) {
                const base = this.bases.find(base => base.ownerId === enemy.ownerId);
                if (base) {
                    base.recieveDamage(enemy.damage);
                    if (base.isDestroyed) {
                        const user = this.players.get(base.ownerId);
                        if (user) {
                            user.isLose = true;
                        }
                    }
                }
                return false;
            }
            if (!enemy.isAlive()) {
                if (this.players.get(currentUserId).changeBalance) {
                    this.players.get(currentUserId).changeBalance(enemy.reward);
                }
                return false;
            }
            return true;
        });
    }

    draw(ctx) {
        this.effects.forEach(effect => { if (!effect.isOnTop) effect.draw(ctx) });
        this.towerZones.forEach(zone => {
            if (zone.occupied && zone.tower) {
                zone.tower.draw(ctx);
            }
        });
        this.bases.forEach(base => base.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
        this.projectiles.forEach(projectile => projectile.draw(ctx));
        this.effects.forEach(effect => { if (effect.isOnTop) effect.draw(ctx) });

    }

    getZoneByCoordinates(x, y) {
        return this.towerZones.find(zone =>
            x >= zone.topLeft.x && x <= zone.bottomRight.x &&
            y >= zone.topLeft.y && y <= zone.bottomRight.y
        );
    }

    tryPlaceTower(x, y, TowerClass) {
        const zone = this.getZoneByCoordinates(x, y);
        if (!this.players.get(currentUserId).towerZonesId.some(id => zone.id === id)) { }
        if (!zone || zone.occupied) return false;

        const centerX = (zone.topLeft.x + zone.bottomRight.x) / 2;
        const centerY = (zone.topLeft.y + zone.bottomRight.y) / 2;
        const tower = new TowerClass({ x: centerX, y: centerY }, this.towersCfg);
        this.addTower(tower, currentUserId);


        zone.occupied = true;
        zone.tower = tower;

        //return true;
        return { tower, zone };
    }
}
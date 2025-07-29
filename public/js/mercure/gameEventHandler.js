import { ArchersTower, MagicianTower, PoisonousTower, FreezingTower, MortarTower } from '../entity/tower.js';
import { ArrowProjectile, FireballProjectile, PoisonProjectile, FreezeProjectile, ExplosiveProjectile } from '../entity/projectile.js';
import { ExplosionEffect, FreezeEffect, PoisonEffect, FreezeTowerEffect } from '../entity/effect.js';
import { publishToMercure } from './mercureHandler.js';

export class GameEventHandler {
    constructor(world) {
        this.world = world;
    }

    handleEvent(data) {
        switch (data.type) {
            case 'userId':
                this.#handleUserId(data);
                break;
            case 'addTower':
                this.#handleAddTower(data);
                break;
            case 'towerAttack':
                this.#handleTowerAttack(data);
                break;
            case 'damageToBase':
                this.#handleDamageToBase(data);
                break;
            case 'baseDestroyed':
                this.#handleBaseDestroyed(data);
                break;
            case 'playerIsWin':
                this.#handlePlayerIsWin(data);
                break;
            case 'addEffect':
                this.#handleAddEffect(data);
                break;
            case 'summonWave':
                this.#handleSummonWave(data);
                break;
            case 'upgradeTower':
                this.#handleUpgradeTower(data);
                break;
            case 'sellTower':
                this.#handleSellTower(data);
                break;
            default:
                console.warn('Неизвестный тип события:', data.type);
        }
    }

    #handleUserId(data) {
        // this.world.players.set(data.userId, new User(data.userId, ));
    }

    #handleAddTower(data) {
        const { userId, towerId, zoneId, name } = data;

        if (userId === window.currentUserId) {
            return;
        }

        const TOWER_CLASSES = {
            ArchersTower,
            MagicianTower,
            MortarTower,
            PoisonousTower,
            FreezingTower
        };

        const TowerClass = TOWER_CLASSES[name];
        if (!TowerClass) {
            //console.error(`Ошибка: неизвестный тип башни '${name}'`);
            return;
        }

        const zone = this.world.towerZones.find(z => z.id === zoneId);
        if (!zone) {
            //console.warn(`Зона с id ${zoneId} не найдена. Невозможно установить координаты башни.`);
            return;
        }

        const towerPos = {
            x: (zone.topLeft.x + zone.bottomRight.x) / 2,
            y: (zone.topLeft.y + zone.bottomRight.y) / 2,
        };

        const tower = new TowerClass(towerPos, this.world.towersCfg);
        tower.id = towerId;
        this.world.addTower(tower, userId);

        zone.occupied = true;
        zone.tower = tower;

        const player = this.world.players.get(userId);
        if (player) {
            player.addTowerId(tower.id);
        } else {
            //console.warn(`Пользователь ${userId} не найден при добавлении башни.`);
        }

        //console.log(`Башня "${name}" добавлена для пользователя ${userId} в зоне ${zoneId} с позицией (${towerPos.x}, ${towerPos.y}).`);
    }

    #handleTowerAttack(data) {
        const { towerId, enemyId, playerId, slowness } = data;

        if (playerId === window.currentUserId) {
            return;
        }

        const tower = this.world.towers.find(t => t.id === towerId);
        if (!tower) {
            //console.warn(`Башня с id ${towerId} не найдена.`);
            return;
        }

        const enemy = this.world.enemies.find(e => e.id === enemyId);
        if (!enemy) {
            //console.warn(`Враг с id ${enemyId} не найден.`);
            return;
        }

        let projectile;
        const startPos = { x: tower.position.x, y: tower.position.y };
        const targetPos = { x: enemy.position.x, y: enemy.position.y };

        switch (tower.name) {
            case 'Archers':
                projectile = new ArrowProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                break;
            case 'Magicians':
                projectile = new FireballProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                break;
            case 'Mortar':
                projectile = new ExplosiveProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                break;
            case 'Poisonous':
                projectile = new PoisonProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                break;
            case 'Freezing':
                const freezeSlowness = slowness ?? tower.slowness;
                projectile = new FreezeProjectile(startPos, [targetPos], enemy, tower.damage, freezeSlowness, tower.attackCfg);
                break;
            default:
                //console.warn(`Неизвестный тип башни для атаки: ${tower.name}`);
                return;
        }

        if (projectile) {
            this.world.projectiles.push(projectile);
            //console.log(`Башня ${tower.id} (${tower.name}) создала снаряд для врага ${enemy.id}.`);
        }
    }

    #handleDamageToBase(data) {
        const { baseId, damage, userId } = data;

        if (userId === window.currentUserId) {
            return;
        }

        const base = this.world.bases.find(b => b.id === baseId);
        if (!base) {
            //console.warn(`База с id ${baseId} не найдена.`);
            return;
        }
        if (base.isDestroyed) {
            //console.warn(`База ${baseId} уже уничтожена. Игнорируем урон.`);
            return;
        }

        base.recieveDamage(damage, true);
        //console.log(`База ${baseId} получила ${damage} урона.`);
    }

    #handleBaseDestroyed(data) {
        const { baseId, isDestroyed, health, userId } = data;

        const base = this.world.bases.find(b => b.id === baseId);
        if (!base) {
            //console.warn(`База с id ${baseId} не найдена.`);
            return;
        }
        base.health = health;
        base.isDestroyed = isDestroyed;

        const player = this.world.players.get(userId);
        if (player) {
            player.isLose = true;
        }
        this.#checkWinCondition();
    }

    #checkWinCondition() {
        const alivePlayers = Array.from(this.world.players.values()).filter(user => !user.isLose);
        if (alivePlayers.length === 1 && !this.world.gameOver && !this.world.isWinEvent) {
            if (alivePlayers[0].id === window.currentUserId) {
                const winEventData = {
                    type: 'playerIsWin',
                    winnerId: alivePlayers[0].id,
                }
                publishToMercure(topic, winEventData);
            }
        }
    }
    #handlePlayerIsWin(data) {
        const { winnerId } = data;
        this.world.winnerId = winnerId;
        this.world.isWinEvent = true;
    }

    #handleAddEffect(data) {
        const { userId, effectType, x, y, damage, slowness, cfg, towerId, duration } = data;

        if (userId === window.currentUserId) return;

        let effect;
        switch (effectType) {
            case 'Poison':
                effect = new PoisonEffect({ x, y }, damage, cfg);
                break;
            case 'Freezing':
                effect = new FreezeEffect({ x, y }, slowness, cfg);
                break;
            case 'Bomb':
                effect = new ExplosionEffect({ x, y }, damage, cfg);
                break;
            case 'FreezeTower':
                const towerObj = this.world.towers.find(t => t.id === towerId);
                if (!towerObj) {
                    return;
                }
                towerObj.isFrozen = true;
                effect = new FreezeTowerEffect(towerObj, duration);
                break;
            default:
                //console.warn('Неизвестный тип эффекта:', effectType);
                return;
        }
        if (effect) {
            this.world.effects.push(effect);
        }
    }

    #handleSummonWave(data) {
        const { userId, targetUserId, enemies } = data;

        if (userId === window.currentUserId) return;

        this.world.summonWave(enemies, targetUserId);
    }

    #handleUpgradeTower(data) {
        const { userId, towerId, upgradeIndex, newLevel } = data;

        if (userId === window.currentUserId) return;

        const tower = this.world.towers.find(t => t.id === towerId);
        if (!tower) {
            //console.warn(`Башня с id ${towerId} не найдена для апгрейда`);
            return;
        }

        if (typeof tower.applyUpgrade === 'function') {
            tower.applyUpgrade(upgradeIndex);
            if (Array.isArray(tower.upgradeLevels)) {
                tower.upgradeLevels[upgradeIndex] = newLevel;
            }
        }
    }

    #handleSellTower(data) {
        const { userId, towerId } = data;
        if (userId === window.currentUserId) return;

        const tower = this.world.towers.find(t => t.id === towerId);
        if (!tower) return;

        tower.isBeingSold = true;
        tower.sellAnimationProgress = 0;
    }
}

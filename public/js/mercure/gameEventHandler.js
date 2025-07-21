import { ArchersTower, MagicianTower, PoisonousTower, FreezingTower, MortarTower } from '../entity/tower.js';
import { ArrowProjectile, FireballProjectile } from '../entity/projectile.js';

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
            console.error(`Ошибка: неизвестный тип башни '${name}'`);
            return;
        }

        const zone = this.world.towerZones.find(z => z.id === zoneId);
        if (!zone) {
            console.warn(`Зона с id ${zoneId} не найдена. Невозможно установить координаты башни.`);
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
            console.warn(`Пользователь ${userId} не найден при добавлении башни.`);
        }

        console.log(`Башня "${name}" добавлена для пользователя ${userId} в зоне ${zoneId} с позицией (${towerPos.x}, ${towerPos.y}).`);
    }

    #handleTowerAttack(data) {
        const { towerId, enemyId } = data;

        const tower = this.world.towers.find(t => t.id === towerId);
        if (!tower) {
            console.warn(`Башня с id ${towerId} не найдена.`);
            return;
        }

        const enemy = this.world.enemies.find(e => e.id === enemyId);
        if (!enemy) {
            console.warn(`Враг с id ${enemyId} не найден.`);
            return;
        }

        if (tower.attackType === 'single') {
            let projectile;
            const startPos = tower.position;
            const targetPos = {
                x: enemy.position.x,
                y: enemy.position.y
            };

            switch (tower.name) {
                case 'Archers':
                    projectile = new ArrowProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                    break;
                case 'Magicians':
                    projectile = new FireballProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                    break;
                case 'Mortar':
                    projectile = new ArrowProjectile(startPos, [targetPos], enemy, tower.damage, tower.attackCfg);
                    break;
                default:
                    console.warn(`Неизвестный тип башни для атаки: ${tower.name}`);
                    return;
            }
            if (projectile) {
                this.world.projectiles.push(projectile);
                console.log(`Башня ${tower.id} создала снаряд для врага ${enemy.id}.`);
            }
        }
        else if (tower.attackType === 'area') {
            enemy.receiveDamage(tower.damage);
            console.log(`Башня ${tower.id} нанесла ${tower.damage} урона врагу ${enemy.id} (area attack).`);
        }
    }

    #handleDamageToBase(data) {
        const { baseId, damage, userId } = data;

        if (userId === window.currentUserId) {
            return;
        }

        const base = this.world.bases.find(b => b.id === baseId);
        if (!base) {
            console.warn(`База с id ${baseId} не найдена.`);
            return;
        }

        if (base.isDestroyed) {
            console.warn(`База ${baseId} уже уничтожена. Игнорируем урон.`);
            return;
        }

        base.recieveDamage(damage, true);
        console.log(`База ${baseId} получила ${damage} урона.`);
    }

    #handleBaseDestroyed(data) {
        const { baseId, isDestroyed, health, userId } = data;

        if (userId === window.currentUserId) {
            return;
        }

        const base = this.world.bases.find(b => b.id === baseId);
        if (!base) {
            console.warn(`База с id ${baseId} не найдена.`);
            return;
        }

        base.health = health;
        base.isDestroyed = isDestroyed;
        console.log(`База ${baseId} уничтожена. Health = ${health}.`);
    }

    #handlePlayerIsWin(data) {
        const { winnerId, gameStatus } = data;

        if (gameStatus !== 'completed') {
            console.warn('Неверный статус игры:', gameStatus);
            return;
        }

        if (winnerId === window.currentUserId) {
            alert("Поздравляем, вы победили!");
        } else {
            alert("Вы проиграли. Победил игрок " + winnerId);
        }

        console.log(`Игра завершена. Победитель: ${winnerId}`);
    }
}

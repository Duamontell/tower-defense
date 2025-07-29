import { towerUpgradesByType } from './upgrades.js';
import { ArrowProjectile, ExplosiveProjectile, FireballProjectile, FreezeProjectile, PoisonProjectile, Projectile } from './projectile.js';
import { uuidv4 } from '../systems/generateId.js'
import { publishToMercure } from '../mercure/mercureHandler.js';
import { SoundPanel } from './soundPanel.js';

export class Tower {
    constructor(name, damage, radius, price, position, width, height, cooldown, imageSrc, imageSrcFrozen, attackCfg, upgrades, soundPanel) {
        this.id = uuidv4();
        this.ownerId = null;
        this.name = name;
        this.damage = damage;
        this.radius = radius;
        this.price = price;
        this.position = position;
        this.width = width;
        this.height = height;
        this.cooldown = cooldown;
        this.timeUntilNextShot = 0;
        this.image = new Image;
        this.frozenImage = new Image();
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.frozenImage.onload = () => {
            this.isLoaded = true;
        };
        this.frozenImage.src = imageSrcFrozen;
        this.image.src = imageSrc;
        this.upgrades = upgrades.map(upgrade => ({
            ...upgrade,
            applyLevels: upgrade.applyLevels.map(fn => () => fn(this)),
        }));
        this.upgradeLevels = new Array(this.upgrades.length).fill(0);
        this.attackCfg = attackCfg;
        this.isFrozen = false;
        this.soundPanel = soundPanel;
    }

    applyUpgrade(index) {
        if (index < 0 || index >= this.upgrades.length) return false;
        const level = this.upgradeLevels[index];
        if (level >= this.upgrades[index].applyLevels.length) return false;

        this.upgrades[index].applyLevels[level]();
        this.upgradeLevels[index]++;

        return true;
    }

    update(delta, enemies, projectiles, effects) {
        if (this.isFrozen) return;
        this.timeUntilNextShot -= delta;

        if (this.timeUntilNextShot <= 0) {
            if (this.attack(enemies, projectiles, effects)) {
                this.timeUntilNextShot = this.cooldown;
            }
        }
    }

    draw(ctx, camera, x = null, y = null, width = null, height = null) {
        ctx.save();

        if (!this.isLoaded) {
            ctx.restore();
            return;
        }

        let worldX = x !== null ? x : this.position.x;
        let worldY = y !== null ? y : this.position.y;

        const screenPos = camera.worldToScreen(worldX, worldY);

        const drawWidth = (width ?? this.width) * camera.scale;
        const drawHeight = (height ?? this.height) * camera.scale;

        const drawX = screenPos.x - drawWidth / 2;
        const drawY = screenPos.y - drawHeight + drawHeight / 4;

        if (this.isFrozen && this.frozenImage && this.frozenImage.complete) {
            ctx.drawImage(this.frozenImage, drawX, drawY, drawWidth, drawHeight);
        } else if (this.isLoaded) {
            ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
        }

        ctx.restore();
    }

    attack(enemies, projectiles, effects) {
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;
            if (enemy.ownerId !== this.ownerId) return false;

            const dx = enemy.position.x + (enemy.width / 2) - this.position.x;
            const dy = enemy.position.y + (enemy.height / 2) - this.position.y;
            const distance = Math.hypot(dx, dy);

            return distance <= this.radius;
        });

        if (enemiesInRange.length === 0) return;

        const position = { x: this.position.x, y: this.position.y };
        const nearestEnemy = enemiesInRange[0];
        const nearestEnemyPos = { x: enemiesInRange[0].position.x, y: enemiesInRange[0].position.y - 50 };

        let projectile;
        switch (this.name) {
            case 'Archers':
                projectile = new ArrowProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
            case 'Magicians':
                projectile = new FireballProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
            case 'Poisonous':
                projectile = new PoisonProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg, this.soundPanel);
                break;
            case 'Freezing':
                projectile = new FreezeProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.slowness, this.attackCfg, this.soundPanel);
                break;
            case 'Mortar':
                projectile = new ExplosiveProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg, this.soundPanel);
                break;
        }

        if (projectile !== undefined) {
            projectiles.push(projectile);

            if (gameMode === "multiplayer") {
                const attackEventData = {
                    type: 'towerAttack',
                    towerId: this.id,
                    enemyId: nearestEnemy.id,
                    playerId: this.ownerId
                };

                if (this.name === 'Freezing' && this.slowness !== undefined) {
                    attackEventData.slowness = this.slowness;
                }

                //publishToMercure('http://localhost:8000/game', attackEventData);
            }
        }

        if (this.sound) this.sound.play();

        return true;
    }

    drawIcon(ctx, x, y, width, height) {
        ctx.save();
        if (!this.isLoaded) {
            ctx.restore();
            return;
        }
        const drawX = x - width / 2;
        const drawY = y - height / 2;
        ctx.drawImage(this.image, drawX, drawY, width, height);
        ctx.restore();
    }
}

export class ArchersTower extends Tower {
    static price = 10;
    constructor(position, cfg, soundPanel) {
        super(cfg.archer.name, cfg.archer.damage, cfg.archer.radius,
            cfg.archer.price, position, cfg.archer.width, cfg.archer.height, cfg.archer.cooldown,
            cfg.archer.imageSrc, cfg.archer.imageSrcFrozen, cfg.archer.attack, towerUpgradesByType.Archers, soundPanel);
        this.sound = new Audio('../../music/archers.ogg');
        this.sound.id = 'archers';
        soundPanel.add(this.sound);
    }
}

export class MagicianTower extends Tower {
    static price = 30;
    constructor(position, cfg, soundPanel) {
        super(cfg.magician.name, cfg.magician.damage, cfg.magician.radius,
            cfg.magician.price, position, cfg.magician.width, cfg.magician.height, cfg.magician.cooldown,
            cfg.magician.imageSrc, cfg.magician.imageSrcFrozen, cfg.magician.attack, towerUpgradesByType.Magicians, soundPanel);
        this.sound = new Audio('../../music/fireball.mp3');
        this.sound.id = 'fireball';
        soundPanel.add(this.sound);
    }
}

export class PoisonousTower extends Tower {
    static price = 50;
    constructor(position, cfg, soundPanel) {
        super(cfg.poison.name, cfg.poison.damage, cfg.poison.radius,
            cfg.poison.price, position, cfg.poison.width, cfg.poison.height, cfg.poison.cooldown,
            cfg.poison.imageSrc, cfg.poison.imageSrcFrozen, cfg.poison.attack, towerUpgradesByType.Poisonous, soundPanel);
    }
}

export class FreezingTower extends Tower {
    static price = 30;
    constructor(position, cfg, soundPanel) {
        super(cfg.freezing.name, cfg.freezing.damage, cfg.freezing.radius,
            cfg.freezing.price, position, cfg.freezing.width, cfg.freezing.height, cfg.freezing.cooldown,
            cfg.freezing.imageSrc, cfg.freezing.imageSrcFrozen, cfg.freezing.attack, towerUpgradesByType.Freezing, soundPanel);
        this.slowness = cfg.freezing.slowness;
    }
}

export class MortarTower extends Tower {
    static price = 50;
    constructor(position, cfg, soundPanel) {
        super(cfg.exp.name, cfg.exp.damage, cfg.exp.radius,
            cfg.exp.price, position, cfg.exp.width, cfg.exp.height, cfg.exp.cooldown,
            cfg.exp.imageSrc, cfg.exp.imageSrcFrozen, cfg.exp.attack, towerUpgradesByType.Mortar, soundPanel);
    }
}

import { towerUpgrades } from './upgrades.js';
import { ArrowProjectile, ExplosiveProjectile, FireballProjectile, FreezeProjectile, PoisonProjectile, Projectile } from './projectile.js';
import { ExplosionEffect, FreezeEffect, PoisonEffect } from './effect.js';
import { uuidv4 } from '../systems/generateId.js'

export class Tower {
    constructor(name, damage, radius, price, position, width, height, cooldown, imageSrc, attackCfg) {
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
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.src = imageSrc;
        this.upgrades = towerUpgrades.map(upgrade => ({
            ...upgrade,
            applyLevels: upgrade.applyLevels.map(fn => () => fn(this)),
        }));

        this.upgradeLevels = new Array(this.upgrades.length).fill(0);
        this.attackCfg = attackCfg;
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
        this.timeUntilNextShot -= delta;

        if (this.timeUntilNextShot <= 0) {
            if (this.attack(enemies, projectiles, effects)) {
                this.timeUntilNextShot = this.cooldown;
            }
        }
    }

    draw(ctx, x = null, y = null, width = null, height = null) {
        ctx.save();

        if (!this.isLoaded) {
            ctx.restore();
            return;
        }

        const drawX = x !== null ? x - (width ?? this.width) / 2 : this.position.x - this.width / 2;
        const drawY = y !== null ? y - (height ?? this.height) / 2 : this.position.y - this.height + this.height / 4;
        const drawWidth = width ?? this.width;
        const drawHeight = height ?? this.height;

        ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
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

        const position = {x: this.position.x, y: this.position.y};
        const nearestEnemy = enemiesInRange[0];
        const nearestEnemyPos = {x: enemiesInRange[0].position.x, y: enemiesInRange[0].position.y};

        let projectile;
        switch (this.name) {
            case 'Archers':
                projectile = new ArrowProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
            case 'Magicians':
                projectile = new FireballProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
            case 'Poisonous':
                projectile = new PoisonProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
            case 'Freezing':
                projectile = new FreezeProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.slowness, this.attackCfg);
                break;
            case 'Mortar':
                projectile = new ExplosiveProjectile(position, [nearestEnemyPos], nearestEnemy, this.damage, this.attackCfg);
                break;
        }

        if (projectile !== undefined) projectiles.push(projectile);

        return true;
    }
}

export class ArchersTower extends Tower {
    static price = 10;
    constructor(position, cfg) {
        super(cfg.archer.name, cfg.archer.damage, cfg.archer.radius,
            cfg.archer.price, position, cfg.archer.width, cfg.archer.height, cfg.archer.cooldown,
            cfg.archer.imageSrc, cfg.archer.attack);
    }
}

export class MagicianTower extends Tower {
    static price = 30;
    constructor(position, cfg) {
        super(cfg.magician.name, cfg.magician.damage, cfg.magician.radius,
            cfg.magician.price, position, cfg.magician.width, cfg.magician.height, cfg.magician.cooldown,
            cfg.magician.imageSrc, cfg.magician.attack);
    }
}

export class PoisonousTower extends Tower {
    static price = 50;
    constructor(position, cfg) {
        super(cfg.poison.name, cfg.poison.damage, cfg.poison.radius,
            cfg.poison.price, position, cfg.poison.width, cfg.poison.height, cfg.poison.cooldown,
            cfg.poison.imageSrc, cfg.poison.attack);
    }
}

export class FreezingTower extends Tower {
    static price = 30;
    constructor(position, cfg) {
        super(cfg.freezing.name, cfg.freezing.damage, cfg.freezing.radius,
            cfg.freezing.price, position, cfg.freezing.width, cfg.freezing.height, cfg.freezing.cooldown,
            cfg.freezing.imageSrc, cfg.freezing.attack);
        this.slowness = cfg.freezing.slowness;
    }
}

export class MortarTower extends Tower {
    static price = 50;
    constructor(position, cfg) {
        super(cfg.exp.name, cfg.exp.damage, cfg.exp.radius,
            cfg.exp.price, position, cfg.exp.width, cfg.exp.height, cfg.exp.cooldown,
            cfg.exp.imageSrc, cfg.exp.attack);
    }
}

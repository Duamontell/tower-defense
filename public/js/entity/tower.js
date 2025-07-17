import { towerUpgrades } from './upgrades.js';
import { ArrowProjectile, FireballProjectile } from './projectile.js';

export class Tower {
    constructor(name, damage, radius, price, position, width, height, attackType, cooldown, imageSrc, attackCfg) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.damage = damage;
        this.radius = radius;
        this.price = price;
        this.position = position;
        this.width = width;
        this.height = height;
        this.attackType = attackType;
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

    update(delta, enemies, projectiles) {
        this.timeUntilNextShot -= delta;

        if (this.timeUntilNextShot <= 0) {
            this.attack(enemies, projectiles);
            this.timeUntilNextShot = this.cooldown;
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


    attack(enemies, projectiles) {
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;
            if (enemy.ownerId !== currentUserId) return false;

            const dx = enemy.position.x + (enemy.width / 2) - this.position.x;
            const dy = enemy.position.y + (enemy.height / 2) - this.position.y;
            const distance = Math.hypot(dx, dy);

            return distance <= this.radius;
        });

        if (enemiesInRange.length === 0) return;

        const position = {x: this.position.x, y: this.position.y};

        if (this.attackType === 'single') {

            const nearestEnemy = enemiesInRange[0];
            let projectile;

            let enemyPosition = {x: nearestEnemy.position.x, y: nearestEnemy.position.y - 100};
            switch (this.name) {
                case 'Archers':
                    projectile = new ArrowProjectile(position, [enemyPosition], nearestEnemy, this.damage, this.attackCfg);
                    projectiles.push(projectile);
                    break;
                case 'Magicians':
                    projectile = new FireballProjectile(position, [enemyPosition], nearestEnemy, this.damage, this.attackCfg);
                    projectiles.push(projectile);
                    break;
            }

        } else if (this.attackType === 'area') {

            enemiesInRange.forEach(enemy => {
                enemy.receiveDamage(this.damage);
                console.log(`[${this.name} Tower] attacked [${enemy.name}] for ${this.damage} damage (area). Enemy health left: ${enemy.health}`);
                if (!enemy.isAlive()) {
                    console.log(`[Enemy] ${enemy.name} is dead now`);
                }
            });
        }
    }
}

export class ArchersTower extends Tower {
    static price = 10;
    constructor(position, cfg) {
        super(cfg.archer.name, cfg.archer.damage, cfg.archer.radius,
            cfg.archer.price, position, cfg.archer.width, cfg.archer.height, cfg.archer.attackType, cfg.archer.cooldown,
            cfg.archer.imageSrc, cfg.archer.attack);
    }
}

export class MagicianTower extends Tower {
    static price = 30;
    constructor(position, cfg) {
        super(cfg.magician.name, cfg.magician.damage, cfg.magician.radius,
            cfg.magician.price, position, cfg.magician.width, cfg.magician.height, cfg.magician.attackType, cfg.magician.cooldown,
            cfg.magician.imageSrc, cfg.magician.attack);
    }
}

export class MortarTower extends Tower {
    static price = 50;
    constructor(position, cfg) {
        super(cfg.mortar.name, cfg.mortar.damage, cfg.mortar.radius,
            cfg.mortar.price, position, cfg.mortar.width, cfg.mortar.height, cfg.mortar.attackType, cfg.mortar.cooldown,
            cfg.mortar.imageSrc, cfg.mortar.attack);
    }
}

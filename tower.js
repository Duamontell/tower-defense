import { towerUpgrades } from './upgrades.js';
import { ArrowProjectile } from './projectile.js';

export class Tower {
    constructor(name, damage, radius, price, position, width, height, attackType, cooldown, imageSrc, projectileCfg) {
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
        this.projectileCfg = projectileCfg;
    }

    applyUpgrade(index) {
        if (index < 0 || index >= this.upgrades.length) return false;
        const level = this.upgradeLevels[index];
        if (level >= this.upgrades[index].applyLevels.length) return false;

        this.upgrades[index].applyLevels[level]();
        this.upgradeLevels[index]++;

        return true;
    }

    update(delta, enemies) {
        this.timeUntilNextShot -= delta;

        if (this.timeUntilNextShot <= 0) {
            this.timeUntilNextShot = this.cooldown;
            return this.attack(enemies);
        }
    }

    draw(ctx, x = null, y = null, width = null, height = null) {
        ctx.save();

        if (!this.isLoaded) {
            ctx.restore();
            return;
        }

        const drawX = x !== null ? x - (width ?? this.width) / 2 : this.position.x - this.width / 2;
        const drawY = y !== null ? y - (height ?? this.height) / 2 : this.position.y - this.height / 2;
        const drawWidth = width ?? this.width;
        const drawHeight = height ?? this.height;

        ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();
    }


    attack(enemies) {
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;

            const dx = enemy.position.x + (enemy.width / 2) - this.position.x;
            const dy = enemy.position.y + (enemy.height / 2) - this.position.y;
            const distance = Math.hypot(dx, dy);

            return distance <= this.radius;
        });

        if (enemiesInRange.length === 0) return;

        if (this.attackType === 'single') {

            let projectile = new ArrowProjectile({x: this.position.x, y: this.position.y}, [enemiesInRange[0].position], enemiesInRange[0], this.damage, 
                this.projectileCfg);

            return projectile;

            enemiesInRange[0].receiveDamage(this.damage);
            console.log(`[${this.name} Tower] attacked [${enemiesInRange[0].name}] for ${this.damage} damage. Enemy health left: ${enemiesInRange[0].health}`);
            if (!enemiesInRange[0].isAlive()) {
                console.log(`[Enemy] ${enemiesInRange[0].name} is dead now`);
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
            cfg.archer.imageSrc, cfg.archer.projectile);
    }
}

export class MagicianTower extends Tower {
    static price = 30;
    constructor(position) {
        super('Magician', 20, 300, MagicianTower.price, position, 300, 300, 'single', 5, '/images/TowerMagicians.png');
    }
}

export class MortarTower extends Tower {
    static price = 50;
    constructor(position) {
        super('Mortar', 60, 500, MortarTower.price, position, 300, 300, 'area', 7, '/images/MortarTower.png');
    }
}
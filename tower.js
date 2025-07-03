export class Tower {
    constructor(name, damage, radius, price, position, attackType, cooldown, color) {
        this.name = name;
        this.damage = damage;
        this.radius = radius;
        this.price = price;
        this.position = position;
        this.attackType = attackType;
        this.cooldown = cooldown;
        this.timeUntilNextShot = 0; 
        this.colorForDraw = color || 'gray';
    }

    update(delta, enemies)
    {
        this.timeUntilNextShot -= delta;

        if (this.timeUntilNextShot <= 0)
        {
            this.attack(enemies);
            this.timeUntilNextShot = this.cooldown;
        }
    }

    draw(ctx) {
        ctx.save();
      
        ctx.fillStyle = this.colorForDraw;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2);
        ctx.fill();
   
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    
        ctx.restore();
    }

    attack(enemies) {
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;

            const dx = enemy.x + 13 - this.position.x;
            const dy = enemy.y + 13 - this.position.y;
            const distance = Math.hypot(dx, dy);
            
            return distance <= this.radius;
        });

        if (enemiesInRange.length === 0) return;

        if (this.attackType === 'single') {
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
    constructor(position) {
        super('Archers', 10, 100, 50, position, 'single', 1, 'red');
    }
}

export class MagicianTower extends Tower {
    constructor(position) {
        super('Magician', 20, 100, 150, position, 'single', 2, 'green');
    }
}

export class MortarTower extends Tower {
    constructor(position) {
        super('Mortar', 60, 100, 300, position, 'area', 3, 'blue');
    }
}
class Enemy {
    constructor(id, x, y, health, damage, name) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.damage = damage;
        this.name = name;
        this.draw(ctx);
    }

    draw(ctx) {
        ctx.fillRect(this.x, this.y, 50, 50)
    }

    recieveDamage(damage) {
        if (damage >= this.health) {
            console.log(this.name, "is dead now");
        } else {
            this.health -= damage;
        }
    }
}

newEnemy = new Enemy(1, 500, 400, 20, 2, 2);
newEnemy.draw(ctx); 
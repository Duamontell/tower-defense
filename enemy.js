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

    doDamage() {
        Base.recieveDamage(this.damage);
        this.death();
    }

    death() {
        console.log("enemy died");
    }
}

newEnemy = new Enemy(1, 500, 400, 20, 2, 2);
newEnemy.draw(ctx); 
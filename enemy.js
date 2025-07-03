export class Enemy {
    constructor(id, x, y, health, damage, name) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.damage = damage;
        this.name = name;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, 26, 26);
        ctx.restore();
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }    

    isAlive() {
        return this.health > 0;
    }
}

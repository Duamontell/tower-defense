export class Enemy {
    constructor(id, x, y, health, damage, name) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.damage = damage;
        this.name = name;
        this.waypointIndex = 0;
    }
	
    doDamage() {
        Base.recieveDamage(this.damage);
        this.death();
    }

    death() {
        console.log("enemy died");
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, 26, 26);
        ctx.restore();
    }

    update() {
        if (this.waypointIndex == waypoints.length - 1) {
            this.waypointIndex = 0
        }
        this.draw();

        const waypoint = waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.x;
        const yDistance = waypoint.y - this.y;
        const angle = Math.atan2(yDistance, xDistance);
        this.x += Math.cos(angle);
        this.y += Math.sin(angle);

        if (
            Math.round(this.x) == Math.round(waypoint.x) &&
            Math.round(this.y) == Math.round(waypoint.y)) {
            this.waypointIndex++;
        }
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }    

    isAlive() {
        return this.health > 0;
    }
}
import { Waypoints } from './waypoints.js'

export class Enemy {
    constructor(id, position, health, damage, speed, name) {
        this.id = id;
        this.position = position;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
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
        ctx.fillRect(this.position.x, this.position.y, 26, 26);
        ctx.restore();
    }

    update(delta) {
        if (this.waypointIndex == Waypoints.length - 1) {
            // Враг дошёл до базы
            this.waypointIndex = 0
        }

        const waypoint = Waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.position.x;
        const yDistance = waypoint.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);

        const distance = Math.hypot(waypoint.x - this.x, waypoint.y - this.y);
        if (distance < 1) {
            this.waypointIndex++;
            return;
        }

        const moveDistance = this.speed * delta;

        this.position.x += Math.cos(angle) * moveDistance;
        this.position.y += Math.sin(angle) * moveDistance;

        if (
            Math.round(this.position.x) == Math.round(waypoint.x) &&
            Math.round(this.position.y) == Math.round(waypoint.y)) {
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
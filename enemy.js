import { Waypoints, Controls } from './waypoints.js'

export class Enemy {
    constructor(id, x, y, health, damage, speed, name) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.name = name;
        this.waypointIndex = 0;
        this.progressOnWaypoint = 0;
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

    update(delta) {
        if (this.waypointIndex == Waypoints.length - 1) {
            // Враг дошёл до базы
            this.waypointIndex = 0;
            return;
        }

        const waypoint = Waypoints[this.waypointIndex];
        const nextWaypoint = Waypoints[this.waypointIndex + 1];
        const distance = Math.hypot(nextWaypoint.x - waypoint.x, nextWaypoint.y - waypoint.y);
        this.progressOnWaypoint += (this.speed * delta) / distance;

        this.x = Math.pow(1 - this.progressOnWaypoint, 2) * waypoint.x +
            2 * (1 - this.progressOnWaypoint) * this.progressOnWaypoint *
            50 + Math.pow(this.progressOnWaypoint, 2) * nextWaypoint.x;
        this.y = Math.pow(1 - this.progressOnWaypoint, 2) * waypoint.y +
            2 * (1 - this.progressOnWaypoint) * this.progressOnWaypoint *
            250 + Math.pow(this.progressOnWaypoint, 2) * nextWaypoint.y;

        if (this.progressOnWaypoint >= 1) {
            this.waypointIndex++;
            this.progressOnWaypoint = 0;
            this.x = nextWaypoint.x;
            this.y = nextWaypoint.y;
            return;
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
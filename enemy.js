import { Waypoints } from './waypoints.js'

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
        if (this.waypointIndex == Waypoints.length) {
            // Враг дошёл до базы
            this.waypointIndex = 0;
        }

        const waypoint = Waypoints[this.waypointIndex];

        const from = waypoint.from;
        const to = waypoint.to;
        const control = waypoint.control;
        const step = this.speed * delta;
        const startX = this.x;
        const startY = this.y;
        const getPoint = (t) => {
            if (waypoint.type === 'linear') {
                return {
                    x: (1 - t) * from.x + t * to.x,
                    y: (1 - t) * from.y + t * to.y
                };
            } else {
                return {
                    x: Math.pow(1 - t, 2) * from.x
                        + 2 * (1 - t) * t * control.x
                        + Math.pow(t, 2) * to.x,
                    y: Math.pow(1 - t, 2) * from.y
                        + 2 * (1 - t) * t * control.y
                        + Math.pow(t, 2) * to.y
                };
            };
        };

        let low = this.progressOnWaypoint;
        let high = 1;
        let mid = low;
        for (let i = 0; i < 15; i++) {
            mid = (low + high) / 2;
            const newPoint = getPoint(mid);
            const d = Math.hypot(newPoint.x - startX, newPoint.y - startY);
            if (d < step) {
                low = mid;
            } else {
                high = mid;
            }
        }

        this.progressOnWaypoint = low;
        const newPt = getPoint(this.progressOnWaypoint);
        this.x = newPt.x;
        this.y = newPt.y;

        if (this.progressOnWaypoint >= 1) {
            this.waypointIndex++;
            this.progressOnWaypoint = 0;
            this.x = waypoint.to.x;
            this.y = waypoint.to.y;
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
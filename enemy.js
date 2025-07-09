export class Enemy {
    constructor(id, name, position, width, height, health, damage, speed, waypoints, imageSrc) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.width = width;
        this.height = height;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.reachedEnd = false;
        this.image = new Image;
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.src = imageSrc;
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
        if (!this.isLoaded) return;
        ctx.drawImage(this.image, this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    update(delta) {
        if (this.waypointIndex >= this.waypoints.length) {
            this.reachedEnd = true;
            // Враг дошёл до базы
            this.waypointIndex = 0 // СТОИТ НА МЕСТЕ ПРИ ДВУХ ТОЧКАХ
        }

        const waypoint = this.waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.position.x;
        const yDistance = waypoint.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);

        const distance = Math.hypot(waypoint.x - this.position.x, waypoint.y - this.position.y);
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
            this.position.x = waypoint.x;
            this.position.y = waypoint.y;
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

export class OrkEnemy extends Enemy {
    constructor(position, waypoints) {
        super(1, 'Orc', position, 150, 150, 1000, 10, 40, waypoints, '/images/Ork.png');
    }
}

export class ZombieEnemy extends Enemy {
    constructor(position, waypoints) {
        super(1, 'Zombie', position, 150, 150, 1000, 100, 40, waypoints, '/images/Zombie.png');
    }
}

export class GoblinEnemy extends Enemy {
    constructor(position, waypoints) {
        super(1, 'Goblin', position, 150, 150, 1000, 100, 40, waypoints, '/images/Goblin.png');
    }
}
export class Projectile {

    constructor(name, position, width, height, damage, speed, animationSpeed, waypoints, enemy) {
        this.name = name;
        this.position = position;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.speed = speed;
        this.animationSpeed = animationSpeed;
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.reachedEnd = false;
        this.images = [];
        this.frame = 0;
        this.reachedEnd = false;
        this.enemy = enemy;
        this.angle = this.calcAngle();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.images[Math.round(this.frame)], -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    update(delta) {

        this.frame = this.frame + delta * this.animationSpeed;
        if (this.frame > this.images.length - 1) {
            this.frame = 0;
        }

        if (this.waypointIndex >= this.waypoints.length) {
            this.reachedEnd = true;
            return;
        }

        const waypoint = this.waypoints[this.waypointIndex];

        const distance = Math.hypot(waypoint.x - this.position.x, waypoint.y - this.position.y);
        if (distance < this.speed / 40) {
            this.waypointIndex++;
            return;
        }

        const moveDistance = this.speed * delta;

        this.position.x += Math.cos(this.angle) * moveDistance;
        this.position.y += Math.sin(this.angle) * moveDistance;

        if (
            Math.round(this.position.x) === Math.round(waypoint.x) &&
            Math.round(this.position.y) === Math.round(waypoint.y)) {
            this.waypointIndex++;
            this.position.x = waypoint.x;
            this.position.y = waypoint.y;
        }
    }

    calcAngle() {
        const waypoint = this.waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.position.x;
        const yDistance = waypoint.y - this.position.y;
        return Math.atan2(yDistance, xDistance);
    }
}

export class ArrowProjectile extends Projectile {
    constructor(position, waypoints, enemy, damage, cfg) {
        super(cfg.name, position, cfg.width, cfg.height, damage, cfg.speed, cfg.animationSpeed, waypoints, enemy);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }
}

export class FireballProjectile extends Projectile {
    constructor(position, waypoints, enemy, damage, cfg) {
        super(cfg.name, position, cfg.width, cfg.height, damage, cfg.speed, cfg.animationSpeed, waypoints, enemy);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }
}


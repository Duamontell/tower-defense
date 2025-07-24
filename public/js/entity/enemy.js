import { uuidv4 } from '../systems/generateId.js'

export class Enemy {
    constructor(name, position, width, height, health, damage, reward, speed, animationSpeed, waypoints) {
        this.id = uuidv4();
        this.ownerId = null;
        this.name = name;
        this.position = position;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.reward = reward;
        this.normalSpeed = speed;
        this.speed = speed;
        this.direction = "left"
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.reachedEnd = false;
        this.images = [];
        this.frame = 0;
        this.animationSpeed = animationSpeed;
        this.normalAnimationSpeed = animationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        if (this.direction === "right") {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.images[Math.round(this.frame)], -this.width / 2, -this.height, this.width, this.height);
        ctx.restore();

        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 100;
        const barHeight = 7;
        const x = this.position.x - barWidth / 2;
        const y = this.position.y - this.height - barHeight - 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);

        const hue = 120 * healthPercent; // 120° = зеленый, 0° = красный
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`; // Hue (оттенок), Saturation (насыщенность) и Lightness (светлота)
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
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
        const xDistance = waypoint.x - this.position.x;
        const yDistance = waypoint.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);

        const distance = Math.hypot(waypoint.x - this.position.x, waypoint.y - this.position.y);
        if (distance < 3) {
            this.waypointIndex++;
            return;
        }

        const moveDistance = this.speed * delta;

        this.position.x += Math.cos(angle) * moveDistance;
        this.position.y += Math.sin(angle) * moveDistance;

        if (xDistance >= 0) {
            this.direction = "right";
        } else {
            this.direction = "left";
        }

        if (
            Math.round(this.position.x) === Math.round(waypoint.x) &&
            Math.round(this.position.y) === Math.round(waypoint.y)) {
            this.waypointIndex++;
            this.position.x = waypoint.x;
            this.position.y = waypoint.y;
        }

        this.speed = this.normalSpeed;
        this.animationSpeed = this.normalAnimationSpeed;

    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }

    isAlive() {
        return this.health > 0;
    }
}

export class OrcEnemy extends Enemy {
    constructor(position, waypoints, cfg) {
        super(cfg.name, position, cfg.width, cfg.height, cfg.health, cfg.damage, cfg.reward, cfg.speed, cfg.animationSpeed, waypoints, cfg.imageSrcs);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }
}

export class ZombieEnemy extends Enemy {
    constructor(position, waypoints, cfg) {
        super(cfg.name, position, cfg.width, cfg.height, cfg.health, cfg.damage, cfg.reward, cfg.speed, cfg.animationSpeed, waypoints, cfg.imageSrcs);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }
}

export class GoblinEnemy extends Enemy {
    constructor(position, waypoints, cfg) {
        super(cfg.name, position, cfg.width, cfg.height, cfg.health, cfg.damage, cfg.reward, cfg.speed, cfg.animationSpeed, waypoints, cfg.imageSrcs);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }
}


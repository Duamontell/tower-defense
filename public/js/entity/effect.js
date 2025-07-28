export class Effect {
    constructor(position, radius, duration, animationSpeed, cooldown) {
        this.position = position;
        this.radius = radius;
        this.duration = duration;
        this.enemies = [];
        this.images = [];
        this.frame = 0;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.animationSpeed = animationSpeed;
        this.cooldown = cooldown;
        this.timeUntilNextTick = 0;
        this.isOnTop = false;
    }

    update(delta, enemies) {
        this.duration -= delta;
        this.frame = this.frame + delta * this.animationSpeed;
        if (this.frame > this.images.length - 1) {
            this.frame = 0;
        }

        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;

            const dx = enemy.position.x + (enemy.width / 2) - this.position.x;
            const dy = enemy.position.y + (enemy.height / 2) - this.position.y;
            const distance = Math.hypot(dx, dy);

            return distance <= this.radius;
        });

        if (enemiesInRange.length === 0) return;

        this.timeUntilNextTick -= delta;

        if (this.timeUntilNextTick <= 0) {
            this.effect(enemiesInRange);
            this.timeUntilNextTick = this.cooldown;
        }
    }

    draw(ctx, camera) {
        ctx.save();
        const { x, y } = camera.worldToScreen(this.position.x, this.position.y);
        ctx.translate(x, y);
        const width = this.width * camera.scale;
        const height = this.height * camera.scale;
        ctx.drawImage(
            this.images[Math.round(this.frame)],
            -width / 2,
            -height / 2,
            width,
            height
        );
        ctx.restore();
    }
}

export class PoisonEffect extends Effect {
    constructor(position, damage, cfg) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.damage = damage;
    }

    effect(enemies) {
        enemies.forEach(enemy => {
            enemy.receiveDamage(this.damage);
            console.log(`${enemy.name} recieved ${this.damage}, health left: ${enemy.health}`);
        });
    }
}

export class FreezeEffect extends Effect {
    constructor(position, slowness, cfg) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.slowness = slowness
    }

    effect(enemies) {
        enemies.forEach(enemy => {
            enemy.speed *= this.slowness;
            enemy.animationSpeed *= this.slowness;
        })
    }
}

export class ExplosionEffect extends Effect {
    constructor(position, damage, cfg) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.damage = damage;
        this.done = false;
        this.isOnTop = true;
    }

    update(delta, enemies) {
        const enemiesInRange = enemies.filter(enemy => {
            if (!enemy.isAlive()) return false;

            const dx = enemy.position.x + (enemy.width / 2) - this.position.x;
            const dy = enemy.position.y + (enemy.height / 2) - this.position.y;
            const distance = Math.hypot(dx, dy);

            return distance <= this.radius;
        });

        if (!this.done) {
            this.done = true;
            enemiesInRange.forEach(enemy => {
                enemy.receiveDamage(this.damage);
            })
        }

        this.frame = this.frame + delta * this.animationSpeed;
        if (this.frame > this.images.length - 1) this.duration = 0
    }

    draw(ctx, camera) {
        ctx.save();
        const { x, y } = camera.worldToScreen(this.position.x, this.position.y);
        const width = this.width * camera.scale;
        const height = this.height * camera.scale;
        ctx.translate(x, y);
        ctx.drawImage(
            this.images[Math.round(this.frame)],
            -width / 2,
            -height,
            width,
            height
        );
        ctx.restore();
    }
}
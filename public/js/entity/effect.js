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
    constructor(position, damage, cfg, soundPanel) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.damage = damage;
        this.sound = soundPanel.sounds.find((sound) => sound.id === 'poison' && sound.ended);
        if (!this.sound) {
            this.sound = new Audio('../../music/poison.ogg');
            this.sound.id = 'poison';
            if (this.sound) soundPanel.add(this.sound);
        }
        if (this.sound) this.sound.play();

    }

    effect(enemies) {
        enemies.forEach(enemy => {
            enemy.receiveDamage(this.damage);
            console.log(`${enemy.name} recieved ${this.damage}, health left: ${enemy.health}`);
        });
    }
}

export class FreezeEffect extends Effect {
    constructor(position, slowness, cfg, soundPanel) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.slowness = slowness;
        this.sound = soundPanel.sounds.find((sound) => sound.id === 'freeze' && sound.ended);
        if (!this.sound) {
            this.sound = new Audio('../../music/freeze.ogg');
            this.sound.id = 'freeze';
            if (this.sound) soundPanel.add(this.sound);
        }
        if (this.sound) this.sound.play();
    }

    effect(enemies) {
        enemies.forEach(enemy => {
            enemy.speed *= this.slowness;
            enemy.animationSpeed *= this.slowness;
        })
    }
}

export class ExplosionEffect extends Effect {
    constructor(position, damage, cfg, soundPanel) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.damage = damage;
        this.done = false;
        this.isOnTop = true;

        this.sound = soundPanel.sounds.find((sound) => sound.id === 'explosion' && sound.ended);
        if (!this.sound) {
            this.sound = new Audio('../../music/explosion.mp3');
            this.sound.id = 'explosion';
            if (this.sound) soundPanel.add(this.sound);
        }
        if (this.sound) this.sound.play();
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

export class FreezeTowerEffect {
    constructor(tower, duration) {
        this.tower = tower;
        this.duration = duration;
        this.timeLeft = duration;
        this.isOnTop = true;
    }

    update(delta) {
        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.tower.isFrozen = false;
        }
    }

    draw(ctx, camera) {
        const { x, y } = camera.worldToScreen(this.tower.position.x, this.tower.position.y);
        const baseR = this.tower.width * camera.scale * 0.7;
        const now = performance.now();

        const snowflakes = 18;
        for (let i = 0; i < snowflakes; i++) {
            const t = now / 800 + i;
            const angle = t + i * Math.PI * 2 / snowflakes;
            const spiralR = baseR * (0.5 + 0.5 * Math.sin(t + i));
            const sx = x + Math.cos(angle) * spiralR;
            const sy = y - this.tower.height * camera.scale * 0.2 + Math.sin(angle) * spiralR * 0.7;

            ctx.save();
            ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t + i);
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + 2 * Math.sin(t + i), 0, 2 * Math.PI);
            ctx.fillStyle = "#e0f7ff";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }
}

export class PortalEffect extends Effect{
    constructor(cfg) {
        (cfg) ? console.log(cfg, cfg.cooldown) : console.log('no cfg')
        super(cfg.position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
            cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
    }

    update(delta) {
        this.frame = this.frame + delta * this.animationSpeed;
        if (this.frame > this.images.length - 1) {
            this.frame = 0;
        }
    }
}

export class SpeedEffect extends Effect {
        constructor(position, boost, cfg) {
        super(position, cfg.radius, cfg.duration, cfg.animationSpeed, cfg.cooldown);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.boost = boost;
    }

    effect(enemies) {
        enemies.forEach(enemy => {
            enemy.speed *= this.boost;
            enemy.animationSpeed *= this.boost;
        })
    }
}
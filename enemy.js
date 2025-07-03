class Enemy {
    constructor(id, position, health, damage, speed, name) {
        this.id = id;
        this.position = position;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.name = name;
        this.waypointIndex = 0;
        this.draw(ctx);
    }

    draw() {
        ctx.fillRect(this.position.x, this.position.y, 50, 50)
    }

    recieveDamage(damage) {
        if (damage >= this.health) {
            console.log(this.name, "is dead now");
        } else {
            this.health -= damage;
        }
    }

    update() {
        if (this.waypointIndex == waypoints.length - 1) {
            this.waypointIndex = 0
        }
        this.draw();

        const waypoint = waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.position.x;
        const yDistance = waypoint.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);
        this.position.x += Math.cos(angle);
        this.position.y += Math.sin(angle);

        if (
            Math.round(this.position.x) == Math.round(waypoint.x) &&
            Math.round(this.position.y) == Math.round(waypoint.y)) {
            this.waypointIndex++;
        }
    }
    // updatePosition(newPosition) {
    //     this.position.x = newPosition.x;
    //     this.position.y = newPosition.y;
    // }
}

// let position = { x: 0, y: 0 };

// newEnemy = new Enemy(1, position, 20, 2, "Orc");

// function walk() {
//     requestAnimationFrame(walk)

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     newEnemy.update()
// }

// walk()
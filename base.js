class Base {
	constructor(health, x, y, width, heigth, color) {
		this.health = health;
		this.x = x;
		this.y = y;
		this.width = width;
		this.heigth = heigth;
		this.color = color;
	}

	draw() {
		ctx.rect(this.x, this.y, this.width, this.heigth);
		ctx.fillStye = this.color;
		ctx.fill();
	}

	recieveDamage(damage) {
		if (damage >= this.health) {
			console.log("Base on coordinates", this.x, "" , this.y, " was destroyed");
		} else {
			this.health -= damage;
		}
	}
}

base = new Base(20, 50, 40, 20, 50, "black");
base.draw();
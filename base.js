export class Base {
	constructor(health, x, y, width, heigth, color) {
		this.health = health;
		this.x = x;
		this.y = y;
		this.width = width;
		this.heigth = heigth;
		this.color = color;
	}

	recieveDamage(damage) {
		if (damage >= this.health) {
			console.log("Base on coordinates", this.x, "" , this.y, " was destroyed");
		} else {
			this.health -= damage;
		}
	}

	draw(ctx) {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.x, this.y, this.width, this.heigth);
		ctx.fill();
		ctx.restore();
	}
}
export class Base {
	constructor(health, position, width, heigth, color) {
		this.health = health;
		this.position = position;
		this.width = width;
		this.heigth = heigth;
		this.color = color;
	}

	recieveDamage(damage) {
		if (damage >= this.health) {
			console.log("Base on coordinates", this.position.x, "" , this.position.y, " was destroyed");
		} else {
			this.health -= damage;
		}
	}

	draw(ctx) {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.position.x, this.position.y, this.width, this.heigth);
		ctx.fill();
		ctx.restore();
	}
}
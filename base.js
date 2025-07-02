export class Base {
	constructor(health, x, y, width, heigth, color) {
		this.health = health;
		this.x = x;
		this.y = y;
		this.width = width;
		this.heigth = heigth;
		this.color = color;
	}

	draw(ctx) {
		ctx.rect(this.x, this.y, this.width, this.heigth);
		ctx.fillStye = this.color;
		ctx.fill();
	}
}
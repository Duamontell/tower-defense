class Base {
	constructor(health, position) {
		this.health = health;
		this.position = position;
		this.width = 35;
		this.height = 50;
	}

	draw() {
		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.fillStye = "gray";
		ctx.fill();
	}
}

base = new Base(20, { x: 50, y: 40 }, "black");
base.draw();
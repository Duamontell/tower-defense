export class Base {
	constructor(health, position, width, height, imageSrc) {
		this.health = health;
		this.position = position;
		this.width = width;
        this.height = height;
		this.image = new Image;
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.src = imageSrc;
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
        if (!this.isLoaded) return;
        ctx.drawImage(this.image, this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
		ctx.restore();
	}
}
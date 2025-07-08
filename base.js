export class Base {
	constructor(health, position, imageSrc) {
		this.health = health;
		this.position = position;
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
		const imgWidth = 300;
        const imgHeight = 300;
        if (!this.isLoaded) return;
        ctx.drawImage(this.image, this.position.x - imgWidth / 2, this.position.y - imgHeight / 2, imgWidth, imgHeight);
		ctx.restore();
	}
}
import { publishToMercure } from '../mercure/mercureHandler.js';

export class Base {
	constructor(health, position, width, height, imageSrc) {
		this.id = crypto.randomUUID();
		this.health = health;
		this.position = position;
		this.width = width;
		this.height = height;
		this.image = new Image;
		this.image.onload = () => {
			this.isLoaded = true;
		};
		this.image.src = imageSrc;
		this.isDestroyed = false;
	}

	recieveDamage(damage) {
		if (damage >= this.health) {
			this.health = 0;
			this.isDestroyed = true;
			console.log("Base on coordinates", this.position.x, "", this.position.y, " was destroyed");

			const destroyedEventData = {
				type: 'baseDestroyed',
				baseId: this.id,
				isDestroyed: true,
				health: 0,
			};
			publishToMercure('http://localhost:8000/game', destroyedEventData);
		} else {
			this.health -= damage;
		}

		const eventData = {
			type: 'damageToBase',
			baseId: this.id,
			damage: damage,
		};
		publishToMercure('http://localhost:8000/game', eventData);
	}

	draw(ctx) {
		ctx.save();
		if (!this.isLoaded) return;
		ctx.drawImage(this.image, this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
		ctx.restore();
	}
}

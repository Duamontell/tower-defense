import { publishToMercure } from '../mercure/mercureHandler.js';
import { uuidv4 } from '../systems/generateId.js'

export class Base {
	constructor(id, health, position, width, height, imageSrc) {
		this.id = id;
		this.ownerId = null;
		this.health = health;
		this.maxHealth = health;
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

	recieveDamage(damage, isFromServer = false) {
		if (this.isDestroyed) return;

		this.health -= damage;
		if (this.health <= 0 && !this.isDestroyed) {
			this.health = 0;
			this.isDestroyed = true;
			console.log("Base on coordinates", this.position.x, "", this.position.y, " was destroyed");
			if (gameMode === "multiplayer") {
				const destroyedEventData = {
					type: 'baseDestroyed',
					baseId: this.id,
					isDestroyed: true,
					health: 0,
					userId: this.ownerId,
				}
				publishToMercure(topic, destroyedEventData);
			}
		} else {
			if (gameMode === "multiplayer" && !isFromServer) {
				const eventData = {
					type: 'damageToBase',
					baseId: this.id,
					damage: damage,
					userId: this.ownerId,
				};
				publishToMercure(topic, eventData);
			}
		}
	}

	draw(ctx, camera) {
		ctx.save();
		if (!this.isLoaded) {
			ctx.restore();
			return;
		}

		const { x, y } = camera.worldToScreen(this.position.x, this.position.y);
		ctx.drawImage(
			this.image,
			x - this.width / 2 * camera.scale,
			y - this.height / 2 * camera.scale,
			this.width * camera.scale,
			this.height * camera.scale
		);
		ctx.restore();
	}
}

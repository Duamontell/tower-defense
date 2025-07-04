import { World } from './world.js';
import { Enemy } from './enemy.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const world = new World();

world.addTower(new ArchersTower({ x: 150, y: 130 }));
world.addTower(new MagicianTower({ x: 250, y: 220 }));
world.addTower(new MortarTower({ x: 450, y: 130 }));

world.addEnemy(new Enemy(1, 200, 160, 50, 50, 30, 'Orc'));
world.addEnemy(new Enemy(2, 300, 160, 30, 3, 100, 'Goblin'));
world.addEnemy(new Enemy(3, 600, 160, 80, 5, 15, 'Troll'));

world.addBase(new Base(20, 50, 150, 20, 50, "black"));

let lastTimestamp = 0;

function gameLoop(timestamp = 0) {
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    world.update(delta);
    world.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();

import { Enemy } from './enemy.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const towers = [
    new ArchersTower({ x: 150, y: 130 }),
    new MagicianTower({ x: 250, y: 220 }),
    new MortarTower({ x: 450, y: 130 }),
    new MortarTower({ x: 11150, y: 130 })
];

const enemies = [
    new Enemy(1, 200, 160, 50, 5, 'Orc'),
    new Enemy(2, 300, 160, 30, 3, 'Goblin'),
    new Enemy(3, 600, 160, 80, 7, 'Troll')
];

const bases = [
    new Base(20, 50, 150, 20, 50, "black"),
];


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enemies.forEach(enemy => {
        enemy.draw(ctx);
    });
    ctx.restore();
    bases.forEach(base => {
        base.draw(ctx);
    });
    ctx.restore();
    towers.forEach(tower => {
        tower.draw(ctx);
        tower.attack(enemies);
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].isAlive()) {
            //enemies.splice(i, 1);  // удалять врагов из массива
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();

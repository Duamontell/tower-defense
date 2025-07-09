import { World } from './world.js';
import { OrkEnemy } from './enemy.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = new Image();

let lastTimestamp = 0;
let world;
let currentLevel = 1;

function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

function gameLoop(timestamp = 0) {
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    world.update(delta);
    world.draw(ctx);

    requestAnimationFrame(gameLoop);
}

fetch(`/config/level${currentLevel}.json`)
    .then(response => response.json())
    .then(config => {
        background.src = config.backgroundImage;

        world = new World();

        const baseData = config.base;
        world.addBase(new Base(baseData.health, baseData.position, baseData.width, baseData.height, baseData.imageSrc));

        config.towers.forEach(towerData => {
            let tower;
            switch (towerData.type) {
                case 'ArchersTower':
                    tower = new ArchersTower(towerData.position);
                    break;
                case 'MagicianTower':
                    tower = new MagicianTower(towerData.position);
                    break;
                case 'MortarTower':
                    tower = new MortarTower(towerData.position);
                    break;
                default:
                    console.warn('Неизвестный тип башни:', towerData.type);
                    return;
            }
            world.addTower(tower);
        });

        const enemy = new OrkEnemy({ x: config.waypoints[0].x, y: config.waypoints[0].y }, config.waypoints);
        world.addEnemy(enemy);

        background.onload = () => {
            gameLoop();
        };

        function isInTowerZone(x, y) {
            return config.towerZones.some(zone =>
                x >= zone.topLeft.x && x <= zone.bottomRight.x &&
                y >= zone.topLeft.y && y <= zone.bottomRight.y
            );
        }

        canvas.addEventListener('click', (event) => {
            const coords = getClickCoordinates(canvas, event);
            console.log('Клик по координатам:', coords.x, coords.y);

            if (isInTowerZone(coords.x, coords.y)) {
                const tower = new ArchersTower({ x: coords.x, y: coords.y });
                world.addTower(tower);
                console.log(`Башня добавлена по клику в зоне: (${coords.x}, ${coords.y})`);
            } else {
                console.log('Нельзя поставить башню вне разрешённых зон');
            }

        });
    })
    .catch(err => {
        console.error('Ошибка загрузки конфигурации:', err);
    });

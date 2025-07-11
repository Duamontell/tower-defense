import { World } from './world.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';
import { TowerPanel } from './towerPanel.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = new Image();

let waveDuration = 0;
let lastTimestamp = 0;
let world;
let currentLevel = 1;
let currentWave = 0;
let config = {};
let waves = {};
let maxWave;
let towerPanel;
let selectedTowerType = null;

function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

function gameLoop(timestamp = 0) {
    if (world.gameOver) {
        return;
    }
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    waveDuration = waveDuration - delta;

    if (waveDuration <= 0 && currentWave < maxWave) {
        currentWave++;
        let wave = waves[currentWave];
        world.summonWave(wave);
        waveDuration = wave.duration;
    } else if (currentWave == maxWave && world.enemies.length == 0) {
        alert("Вы победили");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    world.update(delta);
    world.draw(ctx);
    towerPanel.draw();

    requestAnimationFrame(gameLoop);
}

// для отрисовки выбранной башни с панели на карте по клику
canvas.addEventListener('click', (event) => {
    const { x, y } = getClickCoordinates(canvas, event);
    const clickedTower = towerPanel.handleClick(x, y);

    if (clickedTower) {
        selectedTowerType = clickedTower.constructor;
        console.log('Выбрана башня:', clickedTower.name);
    } else if (selectedTowerType) {
        const placed = world.tryPlaceTower(x, y, selectedTowerType);
        if (placed) {
            console.log(`Поставлена башня ${selectedTowerType.name} на позицию`, { x, y });
        }

        selectedTowerType = null;
    } else {
        console.log('Клик по карте', { x, y });
    }
});

let response = await fetch(`/config/level${currentLevel}.json`)
if (response.ok) {
    config = await response.json();
}

initializeLevel(config);
gameLoop();

function initializeLevel(config) {
    background.src = config.backgroundImage;

    world = new World(config.towerZones);

    const baseData = config.base;
    world.addBase(new Base(baseData.health, baseData.position, baseData.width, baseData.height, baseData.imageSrc));

    //Временная инициализация стартовых башен на уровне, в дальнейшем - все башни будут созданы только игроком
    // let tower = new ArchersTower({ x: 661, y: 270 });
    // world.addTower(tower);
    // tower = new MagicianTower({ x: 919, y: 613 });
    // world.addTower(tower);
    // tower = new MortarTower({ x: 1197, y: 270 });
    // world.addTower(tower);

    waves = config.waves;
    world.waypoints = config.waypoints;
    maxWave = config.waves[0];

    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height);

    const archerTower = new ArchersTower({ x: 0, y: 0 });
    const magicianTower = new MagicianTower({ x: 0, y: 0 });
    const mortarTower = new MortarTower({ x: 0, y: 0 });

    // для теста
    // const mortarTower2 = new MortarTower({ x: 0, y: 0 });
    // const mortarTower3 = new MortarTower({ x: 0, y: 0 });
    // const mortarTower4 = new MortarTower({ x: 0, y: 0 });
    // const mortarTower5 = new MortarTower({ x: 0, y: 0 });

    towerPanel.addTower(archerTower);
    towerPanel.addTower(magicianTower);
    towerPanel.addTower(mortarTower);
    // towerPanel.addTower(mortarTower2);
    // towerPanel.addTower(mortarTower3);
    // towerPanel.addTower(mortarTower4);
    // towerPanel.addTower(mortarTower5);
}

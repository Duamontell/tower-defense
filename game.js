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
let lvlCfg = {};
let enemiesCfg = {};
let waves = {};
let maxWave;
let towerPanel;
let selectedTowerType = null;
let balance = 0;

function changeBalance(amount) {
    balance += amount;
    if (balance < 0) balance = 0;
}


function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

function drawBalancePanel(ctx, balance) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 40);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Баланс: ${balance}`, 20, 38);
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
    drawBalancePanel(ctx, balance);

    requestAnimationFrame(gameLoop);
}

// для отрисовки выбранной башни с панели на карте по клику
canvas.addEventListener('click', (event) => {
    const { x, y } = getClickCoordinates(canvas, event);
    const clickedTower = towerPanel.handleClick(x, y);

    if (clickedTower) {
        selectedTowerType = clickedTower.constructor;
        console.log('Выбрана башня:', clickedTower.name, clickedTower.price);
    } else if (selectedTowerType) {
        const towerCost = selectedTowerType.price;
        if (balance >= towerCost) { 
            const placed = world.tryPlaceTower(x, y, selectedTowerType);
            if (placed) {
              changeBalance(-towerCost);
              console.log(`Поставлена башня ${selectedTowerType.name} на позицию`, { x, y });
            }
        }
        else {
            console.log('Недостаточно средств для покупки башни!');
        }
        selectedTowerType = null;
    } else {
        console.log('Клик по карте', { x, y });
    }
});

let lvlResponse = await fetch(`/config/level${currentLevel}.json`);
if (lvlResponse.ok) {
    lvlCfg = await lvlResponse.json();
}

let enemiesResponse = await fetch('config/enemies.json');
if (enemiesResponse.ok) {
    enemiesCfg = await enemiesResponse.json();
}

initializeLevel(lvlCfg, enemiesCfg);
gameLoop();

function initializeLevel(lvlCfg, enemiesCfg) {
    background.src = lvlCfg.backgroundImage;

    world = new World(changeBalance, lvlCfg.towerZones, enemiesCfg);

    const baseData = lvlCfg.base;
    world.addBase(new Base(baseData.health, baseData.position, baseData.width, baseData.height, baseData.imageSrc));

    waves = lvlCfg.waves;
    world.waypoints = lvlCfg.waypoints;
    maxWave = lvlCfg.waves[0];
    balance = lvlCfg.startingBalance || 0;

    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height, () => balance);

    const archerTower = new ArchersTower({ x: 0, y: 0 });
    const magicianTower = new MagicianTower({ x: 0, y: 0 });
    const mortarTower = new MortarTower({ x: 0, y: 0 });

    towerPanel.addTower(archerTower);
    towerPanel.addTower(magicianTower);
    towerPanel.addTower(mortarTower);
}

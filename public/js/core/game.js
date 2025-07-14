import { World } from './world.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';
import { TowerPanel } from './towerPanel.js';
import { currentLevel } from './menu.js'
import { drawTowerZones } from './towerZones.js';
import { UpgradePanel } from './upgradePanel.js';
import { handleClick } from './towerLogic.js';
import { changeBalance, drawBalancePanel, getBalance, initBalance } from './balanceManager.js';
import { initCanvasResizer } from "./gameView.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = new Image();

let waveDuration = 0;
let lastTimestamp = 0;
let world;
let currentWave = 0;
let lvlCfg = {};
let enemiesCfg = {};
let waves = {};
let maxWave;
let towerPanel;
let upgradePanel;
let towerZones = {};
let nativeWidth = canvas.width;
let nativeHeight = canvas.height;

function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

canvas.addEventListener('click', (event) => {
    const { x, y } = getClickCoordinates(canvas, event);
    handleClick(x, y, world, towerPanel, upgradePanel, changeBalance, getBalance());
    console.log(x, y);
});

let lvlResponse = await fetch(`/config/level${currentLevel}.json`);
if (lvlResponse.ok) {
    lvlCfg = await lvlResponse.json();
}

let enemiesResponse = await fetch('config/enemies.json');
if (enemiesResponse.ok) {
    enemiesCfg = await enemiesResponse.json();
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

    drawTowerZones(ctx, towerZones);
    world.update(delta);
    world.draw(ctx);
    towerPanel.draw();
    upgradePanel.draw();
    drawBalancePanel(ctx, getBalance());

    requestAnimationFrame(gameLoop);
}

function initializeLevel(lvlCfg, enemiesCfg) {
    background.src = lvlCfg.map.backgroundImage;
    nativeWidth = lvlCfg.map.width;
    nativeHeight = lvlCfg.map.height;
    canvas.width = lvlCfg.map.width;
    canvas.height = lvlCfg.map.height;

    world = new World(changeBalance, lvlCfg, enemiesCfg);

    const baseData = lvlCfg.base;
    world.addBase(new Base(baseData.health, baseData.position, baseData.width, baseData.height, baseData.imageSrc));

    waves = lvlCfg.waves;
    world.waypoints = lvlCfg.waypoints;
    maxWave = lvlCfg.waves[0];
    initBalance(lvlCfg.startingBalance || 0);
    towerZones = world.towerZones;

    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height, getBalance, (TowerClass) => { });
    upgradePanel = new UpgradePanel(ctx, canvas.width, canvas.height)

    const archerTower = new ArchersTower({ x: 0, y: 0 });
    const magicianTower = new MagicianTower({ x: 0, y: 0 });
    const mortarTower = new MortarTower({ x: 0, y: 0 });

    towerPanel.addTower(archerTower);
    towerPanel.addTower(magicianTower);
    towerPanel.addTower(mortarTower);
}

initializeLevel(lvlCfg, enemiesCfg);
initCanvasResizer(canvas, nativeWidth, nativeHeight);
gameLoop();

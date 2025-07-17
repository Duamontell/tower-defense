import { World } from '../entity/world.js';
import { ArchersTower, MagicianTower, MortarTower } from '../entity/tower.js';
import { Base } from '../entity/base.js';
import { TowerPanel } from '../entity/towerPanel.js';
import { drawTowerZones } from '../systems/towerZones.js';
import { UpgradePanel } from '../entity/upgradePanel.js';
import { handleClick } from '../systems/towerLogic.js';
import { changeBalance, drawBalancePanel, getBalance, initBalance } from '../systems/balanceManager.js';
import { initCanvasResizer } from "../ui/gameView.js";
import { subscribeToMercure, unsubscribe } from '../mercure/mercureHandler.js';
import { GameEventHandler } from '../mercure/gameEventHandler.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = new Image();

const currentLevel = window.currentLevel;
const currentUserId = window.currentUserId;

let waveDuration = 0;
let lastTimestamp = 0;
let world = null;
let currentWave = 0;
let lvlCfg = {};
let enemiesCfg = {};
let towersCfg = {};
let maxWave;
let towerPanel;
let upgradePanel;
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
});

let lvlResponse = await fetch(`../../config/singleplayer/level${currentLevel}.json`);
if (lvlResponse.ok) {
    lvlCfg = await lvlResponse.json();
}

// Тестовый второй конфиг
let lvlCfg1 = {};
let level = 2;
let lvlResponse1 = await fetch(`../../config/singleplayer/level${level}.json`);
if (lvlResponse1.ok) {
    lvlCfg1 = await lvlResponse1.json();
}

let enemiesResponse = await fetch('../../config/entity/enemies.json');
if (enemiesResponse.ok) {
    enemiesCfg = await enemiesResponse.json();
}

let towersResponse = await fetch('./../config/entity/towers.json');
if (towersResponse.ok) {
    towersCfg = await towersResponse.json();
}

// Тестовые пользователи
const users = [
    {
        userId: currentUserId,
        userCfg: lvlCfg,
    },
    {
        userId: currentUserId + 1,
        userCfg: lvlCfg1,
    }
]

function gameLoop(timestamp = 0) {
    if (world.gameOver) {
        if (window.mercureEventSource) {
            unsubscribe(window.mercureEventSource);
        }
        return;
    }
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    waveDuration = waveDuration - delta;

    if (waveDuration <= 0 && currentWave < maxWave) {
        world.summonWaves(currentWave);
        currentWave++;
        waveDuration = 30;
    } else if (currentWave === maxWave && world.enemies.length === 0) {
        alert("Вы победили");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    drawTowerZones(ctx, world.towerZones, world.players);
    world.update(delta);
    world.draw(ctx);
    towerPanel.draw();
    upgradePanel.draw();
    drawBalancePanel(ctx, getBalance());

    requestAnimationFrame(gameLoop);
}

function initializeLevel(lvlCfg, enemiesCfg, towersCfg) {
    background.src = lvlCfg.map.backgroundImage;
    nativeWidth = lvlCfg.map.width;
    nativeHeight = lvlCfg.map.height;
    canvas.width = lvlCfg.map.width;
    canvas.height = lvlCfg.map.height;

    world = new World(lvlCfg, enemiesCfg, towersCfg);
    users.forEach((user) => {
        let data = user.userCfg
        world.addUser(user.userId, data);
        world.addBase(new Base(data.base.health, data.base.position, data.base.width, data.base.height, data.base.imageSrc), user.userId);
        world.waves.push(data.waves);
        world.addTowerZones(data.towerZones, user.userId);
    })

    // maxWave = lvlCfg.waves[0];
    maxWave = 2;

    // Баланс не сделан!
    initBalance(lvlCfg.startingBalance || 0);

    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height, getBalance, () => { });
    upgradePanel = new UpgradePanel(ctx, canvas.width, canvas.height, getBalance, () => { });

    const archerTower = new ArchersTower({ x: 0, y: 0 }, towersCfg);
    const magicianTower = new MagicianTower({ x: 0, y: 0 }, towersCfg);
    const mortarTower = new MortarTower({ x: 0, y: 0 }, towersCfg);

    towerPanel.addTower(archerTower);
    towerPanel.addTower(magicianTower);
    towerPanel.addTower(mortarTower);

    const gameEventHandler = new GameEventHandler(world);

    const topic = 'http://localhost:8000/game'

    const mercureCallback = (data) => {
        try {
            gameEventHandler.handleEvent(data);
        } catch (error) {
            console.error('Ошибка парсинга события:', error);
        }
    };

    window.mercureEventSource = subscribeToMercure(topic, mercureCallback);
}

initializeLevel(lvlCfg, enemiesCfg, towersCfg);
initCanvasResizer(canvas, nativeWidth, nativeHeight);
gameLoop();

import { World } from '../entity/world.js';
import { ArchersTower, FreezingTower, MagicianTower, MortarTower, PoisonousTower } from '../entity/tower.js';
import { Base } from '../entity/base.js';
import { TowerPanel } from '../entity/towerPanel.js';
import { drawTowerZones } from '../systems/towerZones.js';
import { UpgradePanel } from '../entity/upgradePanel.js';
import { handleClick } from '../systems/towerLogic.js';
import { drawBalancePanel } from '../systems/balanceManager.js';
import { initCanvasResizer } from "../ui/gameView.js";
import { subscribeToMercure, unsubscribe } from '../mercure/mercureHandler.js';
import { GameEventHandler } from '../mercure/gameEventHandler.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = new Image();

const gameMode = window.gameMode || 'singleplayer';
const currentLevel = window.currentLevel || 1;
const currentUserId = window.currentUserId;
const roomConfig = window.roomConfig || {};

let waveDuration = 0;
let lastTimestamp = 0;
let world = null;
let lvlCfg = {};
let enemiesCfg = {};
let towersCfg = {};
let towerPanel;
let upgradePanel;
let nativeWidth = canvas.width;
let nativeHeight = canvas.height;

function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return {x, y};
}

canvas.addEventListener('click', (event) => {
    const {x, y} = getClickCoordinates(canvas, event);
    handleClick(x, y, world, towerPanel, upgradePanel);
});

async function loadUsersConfig() {
    const users = [];
    if (gameMode === "singleplayer") {
        let lvlResponse = await fetch(`../../config/singleplayer/level${currentLevel}.json`);
        if (lvlResponse.ok) {
            lvlCfg = await lvlResponse.json();
            users.push({userId: currentUserId, userCfg: lvlCfg});
        }
    } else {
        for (const player of roomConfig.players) {
            let userResponse = await fetch(`../../config/multiplayer/player${player.config}.json`);
            if (userResponse.ok) {
                const userCfg = await userResponse.json();
                users.push({userId: player.userId, userCfg: userCfg});
            } else {
                console.warn(`Player ${player.config} not found`);
            }
        }
    }
    return users;
}

let enemiesResponse = await fetch('../../config/entity/enemies.json');
if (enemiesResponse.ok) {
    enemiesCfg = await enemiesResponse.json();
}

let towersResponse = await fetch('./../config/entity/towers.json');
if (towersResponse.ok) {
    towersCfg = await towersResponse.json();
}

let lvlResponse = await fetch(`../../config/multiplayer/level.json`);
if (lvlResponse.ok) {
    lvlCfg = await lvlResponse.json();
}

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

    if (waveDuration <= 0 && world.waves.currentWave < world.waves.maxWave) {
        world.summonWaves(world.waves.currentWave);
        world.waves.currentWave++;
        waveDuration = 30;
    } else if (world.waves.currentWave === world.waves.maxWave && world.enemies.length === 0) {
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
    drawBalancePanel(ctx, world.players.get(currentUserId).balance);

    requestAnimationFrame(gameLoop);
}

function initializeLevel(users, lvlCfg, enemiesCfg, towersCfg) {
    if (gameMode === "singleplayer") {
        lvlCfg = users[0].userCfg;
    }
    background.src = lvlCfg.map.backgroundImage;
    nativeWidth = lvlCfg.map.width;
    nativeHeight = lvlCfg.map.height;
    canvas.width = lvlCfg.map.width;
    canvas.height = lvlCfg.map.height;

    world = new World(lvlCfg, enemiesCfg, towersCfg);
    users.forEach((user) => {
        const data = user.userCfg;
        world.addUser(user.userId, data);
        world.addBase(new Base(data.base.health, data.base.position, data.base.width, data.base.height, data.base.imageSrc), user.userId);
        world.addTowerZones(data.towerZones, user.userId);
        // world.waves.push(lvlCfg.waves);
        world.waves.userWaves.set(user.userId, lvlCfg.waves);
    })
    console.log(world.waves);

    world.waves.maxWave = lvlCfg.countWaves;
    console.log(world);

    const getUserBalance = () => world.players.get(currentUserId).balance;
    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height, getUserBalance, () => {});
    upgradePanel = new UpgradePanel(ctx, canvas.width, canvas.height, getUserBalance, () => {});

    const archerTower = new ArchersTower({x: 0, y: 0}, towersCfg);
    const magicianTower = new MagicianTower({x: 0, y: 0}, towersCfg);
    const poisonousTower = new PoisonousTower({x: 0, y: 0}, towersCfg);
    const freezingTower = new FreezingTower({x: 0, y: 0}, towersCfg);
    const mortarTower = new MortarTower({x: 0, y: 0}, towersCfg);

    towerPanel.addTower(archerTower);
    towerPanel.addTower(magicianTower);
    towerPanel.addTower(poisonousTower);
    towerPanel.addTower(freezingTower);
    towerPanel.addTower(mortarTower);

    if (gameMode === "multiplayer") {
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
}

const users = await loadUsersConfig();
initializeLevel(users, lvlCfg, enemiesCfg, towersCfg);
initCanvasResizer(canvas, nativeWidth, nativeHeight);
gameLoop();

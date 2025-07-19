import { World } from '../entity/world.js';
import { ArchersTower, FreezingTower, MagicianTower, MortarTower, PoisonousTower } from '../entity/tower.js';
import { Base } from '../entity/base.js';
import { TowerPanel } from '../entity/towerPanel.js';
import { EffectPanel } from '../entity/effectPanel.js';
import { drawTowerZones } from '../systems/towerZones.js';
import { UpgradePanel } from '../entity/upgradePanel.js';
import { handleClick } from '../systems/towerLogic.js';
import { drawBalancePanel } from '../systems/balanceManager.js';
import { initCanvasResizer } from "../ui/gameView.js";
import { subscribeToMercure, unsubscribe } from '../mercure/mercureHandler.js';
import { GameEventHandler } from '../mercure/gameEventHandler.js';
import { publishToMercure } from '../mercure/mercureHandler.js';

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
let effectShopCfg = {};
let effectPanel;
let towerPanel;
let upgradePanel;
let nativeWidth = canvas.width;
let nativeHeight = canvas.height;
let gameMessage = "";

function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

canvas.addEventListener('click', (event) => {
    const user = world.players.get(currentUserId);
    if (user && user.isLose) return;
    if (world.gameOver) return;
    const { x, y } = getClickCoordinates(canvas, event);
    handleClick(x, y, world, towerPanel, upgradePanel, effectPanel);
});

async function loadUsersConfig() {
    const users = [];
    if (gameMode === "singleplayer") {
        let lvlResponse = await fetch(`../../config/singleplayer/level${currentLevel}.json`);
        if (lvlResponse.ok) {
            lvlCfg = await lvlResponse.json();
            users.push({ userId: currentUserId, userCfg: lvlCfg });
        }
    } else {
        for (const player of roomConfig.players) {
            let userResponse = await fetch(`../../config/multiplayer/player${player.config}.json`);
            if (userResponse.ok) {
                const userCfg = await userResponse.json();
                users.push({ userId: player.userId, userCfg: userCfg });
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

let effectResponse = await fetch('../../config/entity/effectShop.json');
if (effectResponse.ok) {
    effectShopCfg = await effectResponse.json();
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
    } else if (
        gameMode === "singleplayer" &&
        world.waves.currentWave === world.waves.maxWave &&
        world.enemies.length === 0 &&
        !world.gameOver
    ) {
        gameMessage = "Вы победили!";
        world.gameOver = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    drawTowerZones(ctx, world.towerZones, world.players);
    world.update(delta);
    world.draw(ctx);
    towerPanel.draw();
    upgradePanel.draw();
    effectPanel.draw();
    drawBalancePanel(ctx, world.players.get(currentUserId).balance);

    if (gameMode === "singleplayer") {
        const user = world.players.get(currentUserId);
        const base = world.bases.find(b => b.ownerId === currentUserId);

        if ((user.isLose || (base && base.isDestroyed)) && !world.gameOver) {
            gameMessage = "Вы проиграли!";
            world.gameOver = true;
        }
    } else {
        const alivePlayers = Array.from(world.players.values()).filter(user => !user.isLose);
        const currentUser = world.players.get(currentUserId);
        const base = world.bases.find(b => b.ownerId === currentUserId);

        if ((currentUser.isLose || (base && base.isDestroyed)) && !world.gameOver) {
            if (world.isWinEvent && world.winnerId) {
                const winner = world.players.get(world.winnerId);
                gameMessage = `Победил игрок ${winner.id}`;
            } else {
                gameMessage = "Вы проиграли!";
            }
        }
        if (alivePlayers.length === 1 && alivePlayers[0].id === currentUserId && !world.gameOver) {
            gameMessage = "Вы победили!";

            world.gameOver = true;
            const winEventData = {
                type: 'playerIsWin',
                winnerId: currentUser.id,
            }
            publishToMercure('http://localhost:8000/game', winEventData);
        }
    }

    if (gameMessage) {
        drawGameMessage(ctx, gameMessage);
    }

    requestAnimationFrame(gameLoop);
}

function drawGameMessage(ctx, message) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore();
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
        world.waves.userWaves.set(user.userId, lvlCfg.waves);
    })
    console.log(world.waves);

    world.waves.maxWave = lvlCfg.countWaves;

    const getUserBalance = () => world.players.get(currentUserId).balance;
    towerPanel = new TowerPanel(ctx, canvas.width, canvas.height, getUserBalance, () => { });
    upgradePanel = new UpgradePanel(ctx, canvas.width, canvas.height, getUserBalance, () => { });
    effectPanel = new EffectPanel(ctx, canvas.width, canvas.height, getUserBalance, effectShopCfg);


    const archerTower = new ArchersTower({ x: 0, y: 0 }, towersCfg);
    const magicianTower = new MagicianTower({ x: 0, y: 0 }, towersCfg);
    const poisonousTower = new PoisonousTower({ x: 0, y: 0 }, towersCfg);
    const freezingTower = new FreezingTower({ x: 0, y: 0 }, towersCfg);
    const mortarTower = new MortarTower({ x: 0, y: 0 }, towersCfg);

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

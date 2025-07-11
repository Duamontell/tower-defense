import { World } from './world.js';
import { ArchersTower, MagicianTower, MortarTower } from './tower.js';
import { Base } from './base.js';
import { currentLevel } from './menu.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let background = new Image();
let waveDuration = 0;
let lastTimestamp = 0;
let world;
let currentWave = 0;
let config = {};
let waves = {};
let maxWave;

config = await getConfig(currentLevel);
initializeLevel(config);
gameLoop();


function getClickCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}


async function getConfig(currentLevel) {
    const response = await fetch(`/config/level${currentLevel}.json`)
    if (response.ok) {
        config = await response.json();
    }
    return config 
}

function gameLoop(timestamp = 0) {
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
                                                                                     
    waveDuration = waveDuration - delta;

    if (waveDuration <= 0 && currentWave < maxWave) {
        currentWave++;                                                                                        
        const wave = waves[currentWave];
        world.summonWave(wave);
        waveDuration = wave.duration;
    } else if (currentWave == maxWave && world.enemies.length == 0) {
        alert("Вы победили");
        initializeMenu();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    world.update(delta);
    world.draw(ctx);

    requestAnimationFrame(gameLoop);

}

function initializeLevel(config) {
    background.src = config.backgroundImage;

    world = new World();

    const baseData = config.base;
    world.addBase(new Base(baseData.health, baseData.position, baseData.width, baseData.height, baseData.imageSrc));

    //Временная инициализация стартовых башен на уровне, в дальнейшем - все башни будут созданы только игроком
    let tower = new ArchersTower({x: 661, y: 270});
    world.addTower(tower);
    tower = new MagicianTower({x: 919, y: 613});
    world.addTower(tower);
    tower = new MortarTower({x: 1197, y: 270});
    world.addTower(tower);
    //

    waves = config.waves;
    world.waypoints = config.waypoints;
    maxWave = config.waves[0];

}



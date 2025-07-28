const lvl1 = document.getElementById('lvl1');
const lvl2 = document.getElementById('lvl2');

export let currentLevel;

lvl1.addEventListener('click', () => {
    currentLevel = 1;
    startLvl();

});

lvl2.addEventListener('click', () => {
    currentLevel = 2
    startLvl();
})

function startLvl() {
    // let canvas = document.createElement('canvas');
    // let script = document.createElement('script');
    // canvas.id = 'gameCanvas';
    // canvas.height = 1080;
    // canvas.width = 1920;
    // script.src = '../core/game.js';
    // script.type = 'module'
    //
    // document.body.innerHTML = '';
    // let gameContainer = document.createElement('div');
    // gameContainer.className = "gameContainer";
    // document.body.appendChild(gameContainer);
    // gameContainer.appendChild(canvas);
    // document.body.appendChild(script);
    window.location.href = `./game?level=${currentLevel}`;
}

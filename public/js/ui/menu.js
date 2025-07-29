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
    window.location.href = `./singleplayer?level=${currentLevel}`;
}

import { sendReady, checkAllReady, changeRoomStatus, leaveRoom } from "../api/roomApi.js";

const roomId = window.roomId;
const mercureUrl = window.mercureUrl;
const currentUserId = window.currentUserId;
let countdownTimer = null;

function updateButton(button, isReady) {
    button.textContent = isReady ? 'Готов' : 'Не готов';
    button.dataset.ready = isReady ? '1' : '0';
    button.classList.toggle('ready', isReady);
}

document.querySelectorAll('.ready-button').forEach(button => {
    button.addEventListener('click', () => {
        const playerId = button.dataset.playerId;
        const makeReady = button.dataset.ready === '0';
        sendReady(roomId, playerId, makeReady);
    });
});

document.querySelector('.leave-room-button').addEventListener('click', () => {
    leaveRoom(roomId);

})

function startCountdown() {
    const countdownEl = document.getElementById('start-countdown');
    const countEl = document.getElementById('count');
    let counter = 5;
    countdownEl.style.display = 'block';
    countEl.textContent = counter;

    countdownTimer = setInterval(() => {
        counter--;
        countEl.textContent = counter;
        if (counter <= 0) {
            clearInterval(countdownTimer);
            changeRoomStatus(roomId, 1)
                .then(data => {
                    console.log('Статус комнаты обновлён', data);
                    window.location.href = `/game/room/${roomId}`;
                })
                .catch(err => {
                    console.error('Не удалось сменить статус комнаты', err);
                });
        }
    }, 1000);
}

function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        document.getElementById('start-countdown').style.display = 'none';
    }
}

function allUnReady() {
    sendReady(roomId, currentUserId, false);
}

const url = new URL(mercureUrl);
url.searchParams.append('topic', `/room/${roomId}`);
const es = new EventSource(url);

es.onmessage = ({data}) => {
    const msg = JSON.parse(data);
    console.log(data);
    switch (msg.action) {
        case 'playerJoin':
            handlePlayerJoin(msg);
            cancelCountdown();
            break;
        case 'leaveRoom':
            handlePlayerLeave(msg);
            // TODO: Протестировать!
            allUnReady();
            cancelCountdown();
            break;
        case 'ready':
            handleReady(msg);
            break;
        case 'allReady':
            startCountdown()
            break;
        case 'cancel':
            cancelCountdown();
            break;
        default:
            console.warn('Unknown Mercure action:', msg.action);
            break;
    }
};

function handleReady(msg) {
    const playerCard = document.getElementById(`player-${msg.player.id}`);
    if (playerCard) {
        if (msg.player.isReady) {
            playerCard.classList.add('ready');
        } else {
            playerCard.classList.remove('ready');
        }
    }

    const button = document.querySelector(`#player-${msg.player.id} .ready-button`);
    if (button) {
        updateButton(button, msg.player.isReady);
        if (msg.player.id === currentUserId) {
            checkAllReady();
        }
    }
}

function handlePlayerJoin(msg) {
    const {id, name, slot, isReady} = msg;

    const playerSlot = document.getElementById(`empty-slot-${slot}`);
    if (playerSlot) {
        const div = document.createElement('div');
        div.className = 'player-card' + (isReady ? ' ready' : '') + (id === window.currentUserId ? ' my-card' : '');
        div.id = `player-${id}`;
        div.innerHTML = `
            <span class="player-slot">${slot}:</span>
            <img src="../styles/images/shield.png" alt="shield" class="player-shield">
            <span class="player-name">${name}</span>
            ${
            id === window.currentUserId
                ? `<button class="ready-button my-button" data-player-id="${id}" data-ready="${isReady ? '1' : '0'}">${isReady ? 'Готов' : 'Не готов'}</button>`
                : `<button class="ready-button" id="player-status-${id}" data-ready="${isReady ? '1' : '0'}" disabled>${isReady ? 'Готов' : 'Не готов'}</button>`
        }
        `;
        playerSlot.replaceWith(div);
    }
}

function handlePlayerLeave(msg) {
    const {playerId} = msg;
    const playerSlot = document.getElementById(`player-${playerId}`);
    if (playerSlot) {
        const div = document.createElement('div');
        div.className = 'player';
        const slotNumber = playerSlot.children[0].textContent.substring(0,1);
        div.id = `empty-slot-${slotNumber}`;
        div.innerHTML = `
            <span class="player-slot">${slotNumber}</span>
            <span class="player-name">Не занято</span>
        `;
        playerSlot.replaceWith(div);
    }
}

const playersList = document.getElementById('players-list');
const roomId = window.roomId;
const mercureUrl = window.mercureUrl;
const userId = window.userId;
let countdownTimer = null;

function updateButton(button, isReady) {
    button.textContent = isReady ? 'Готов' : 'Не готов';
    button.dataset.ready = isReady ? '1' : '0';
    button.classList.toggle('ready', isReady);
}

function sendReady(roomId, playerId, ready) {
    fetch(`/room/${roomId}/ready`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ready })
    }).catch(console.error);
}

function checkAllReady() {
    fetch(`/room/${roomId}/all-ready`, {
        credentials: 'include',
    }).catch(console.error);
}

document.querySelectorAll('.ready-button').forEach(button => {
    button.addEventListener('click', () => {
        const playerId = button.dataset.playerId;
        const makeReady = button.dataset.ready === '0';
        sendReady(roomId, playerId, makeReady);
    });
});

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
            window.location.href = `/game/room/${roomId}`;
        }
    }, 1000);
}

// function allPlayersReady() {
//     const statuses = playersList.querySelectorAll('.player-status, .ready-button');
//     return Array.from(statuses).every(el => el.dataset.ready === '1');
// }

function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        document.getElementById('start-countdown').style.display = 'none';
    }
}

const url = new URL(mercureUrl);
url.searchParams.append('topic', `/room/${roomId}`);
const es = new EventSource(url);

es.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    console.log(data);
    switch (msg.action) {
        case 'ready':
            handleReady(msg);
            break;
        case 'allReady':
            startCountdown()
            // Вот тут вызов handle для обработки пришедшего сообщения
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
        if (msg.player.id === userId) {
            checkAllReady();
        }
    }

    if (msg.player.id === userId) {
        const button = document.querySelector(`#player-${msg.player.id} .ready-button`);
        if (button) {
            updateButton(button, msg.player.isReady);
            checkAllReady();
        }
    } else {
        const playerStatus = document.getElementById(`player-status-${msg.player.id}`);
        if (playerStatus) {
            playerStatus.textContent = msg.player.isReady ? 'Готов' : 'Не готов';
        }
    }

}

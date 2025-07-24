const roomId = window.roomId;
const mercureUrl = window.mercureUrl;
const currentUserId = window.currentUserId;
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({playerId, ready})
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
            fetch(`/room/${roomId}/change-status`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({roomId, status: 1})
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при обновления статуса');
                    }
                    return response.json();
                })
                .then(() => {
                    window.location.href = `/game/room/${roomId}`;
                })
                .catch(error => {
                    console.error('Error updating room status:', error);
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

const url = new URL(mercureUrl);
url.searchParams.append('topic', `/room/${roomId}`);
const es = new EventSource(url);

es.onmessage = ({data}) => {
    const msg = JSON.parse(data);
    console.log(data);
    switch (msg.action) {
        case 'playerJoin':
            handlePlayerJoin(msg);
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

    // if (msg.player.id === currentUserId) {
    const button = document.querySelector(`#player-${msg.player.id} .ready-button`);
    if (button) {
        updateButton(button, msg.player.isReady);
        if (msg.player.id === currentUserId) {
            checkAllReady();
        }
    }

    // const button = document.querySelector(`#player-${msg.player.id} .ready-button`);
    // if (button) {
    //     updateButton(button, msg.player.isReady);
    //     checkAllReady();
    // }
    // } else {
    // const playerStatus = document.getElementById(`player-status-${msg.player.id}`);
    // if (playerStatus) {
    //     playerStatus.textContent = msg.player.isReady ? 'Готов' : 'Не готов';
    // }
    // }
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

// немного переписала функцию (выше)
// function handlePlayerJoin(msg) {
//     const {id, name, slot, isReady} = msg;

//     if (id === currentUserId) {
//         return;
//     }

//     const playerSlot = document.getElementById(`empty-slot-${slot}`);
//     if (playerSlot) {
//         playerSlot.id = `player-slot-${slot}`;

//         const playerName = playerSlot.querySelector(".player-name");
//         if (playerName) {
//             playerName.textContent = name;
//         }

//         const playerStatus = document.createElement('span');
//         console.log(playerStatus);
//         playerStatus.textContent = isReady ? "Готов" : "Не готов";
//         playerStatus.classList.add('player-status');
//         playerStatus.id = `player-status-${id}`;
//         playerSlot.appendChild(playerStatus);
//     }
// }

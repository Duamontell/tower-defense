const playersList = document.getElementById('players-list');

// Функция для обновления статуса кнопки
function updateButton(btn, isReady) {
    btn.textContent = isReady ? 'Готов' : 'Не готов';
    btn.dataset.ready = isReady ? '1' : '0';
    btn.classList.toggle('ready', isReady);
}

function sendReady(roomId, playerId, ready) {
    fetch(`/room/${roomId}/ready`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ready })
    }).catch(console.error);
}

// Навешиваем обработчики на существующие кнопки
document.querySelectorAll('.ready-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const playerId = btn.dataset.playerId;
        const makeReady = btn.dataset.ready === '0';
        updateButton(btn, makeReady);
        sendReady(18, playerId, makeReady);
    });
});

export function sendReady(roomId, playerId, ready) {
    fetch(`/room/${roomId}/ready`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({playerId, ready})
    }).catch(console.error);
}

export function checkAllReady() {
    fetch(`/room/${roomId}/all-ready`, {
        credentials: 'include',
    }).catch(console.error);
}

export function changeRoomStatus(roomId, status) {
    return fetch(`/room/${roomId}/change-status`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({roomId, status})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка при обновлении статуса: ${response.status}`);
            }
            return response.json();
        });
}

export function leaveRoom(roomId) {
    fetch(`/room/${roomId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({roomId})
    }).then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при выходе из конматы!')
        }
        window.location.href = '/room-list';
    })
        .catch(error => {
            console.error(error);
        });
}

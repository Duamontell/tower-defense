const createRoom = document.getElementById('create-room-button');
const roomsList = document.getElementById('rooms-list');
const mercureUrl = window.mercureUrl;

createRoom.addEventListener('click', () => {
    location.href = "/room/create";
})

document.querySelectorAll('.join-room-button').forEach(button => {
    button.addEventListener('click', () => {
        const roomId = button.dataset.roomId;
        location.href = `/room/join/${roomId}`
    });
});

const url = new URL(mercureUrl);
url.searchParams.append('topic', '/room-list');
const es = new EventSource(url);

es.onmessage = ({data}) => {
    const msg = JSON.parse(data);
    switch (msg.action) {
        case 'createRoom':
            handleCreateRoom(msg);
            break;
        case 'deleteRoom':
            handleDeleteRoom(msg)
            break;
    }
};

function handleCreateRoom(msg) {
    const {roomId} = msg;

    const roomRow = document.createElement('li');
    roomRow.id = "room-" + roomId;
    const roomName = document.createElement('span');
    roomName.textContent = "Комната " + roomId;

    const actionBlock = document.createElement('div');
    actionBlock.classList.add('room-actions');
    const playerCount = document.createElement('span');
    playerCount.id = "room-players-count-" + roomId;
    playerCount.textContent = "1/4";
    const joinButton = document.createElement('button');
    joinButton.classList.add('join-room-button');
    joinButton.dataset.roomId = roomId;
    joinButton.textContent = "Войти";
    joinButton.addEventListener('click', () => {
        location.href = `/room/join/${roomId}`
    });
    actionBlock.appendChild(playerCount);
    actionBlock.appendChild(joinButton);

    roomRow.appendChild(roomName);
    roomRow.appendChild(actionBlock);
    roomsList.appendChild(roomRow);
}

function handleDeleteRoom(msg) {
    const {roomId} = msg;

    const roomRowId = 'room-' + roomId;
    const roomRow = document.getElementById(roomRowId);
    roomRow.remove();
}

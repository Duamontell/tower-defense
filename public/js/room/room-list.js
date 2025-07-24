const createRoom = document.getElementById('create-room-button');
const roomsList = document.getElementById('rooms-list');
const mercureUrl = window.mercureUrl;

createRoom.addEventListener('click', () => {
    location.href = "/room/create";
})

document.querySelectorAll('.join-room-button').forEach(button => {
    button.addEventListener('click', () => {
        const roomId = button.dataset.roomId;
        location.href=`/room/join/${roomId}`
    });
});

const url = new URL(mercureUrl);
const eventSource = new EventSource(url);
url.searchParams.append('topic', '/room-list');

eventSource.onmessage = ({data}) => {
    const msg = JSON.parse(data);
    if (msg.action === 'create') {
        const li = document.createElement('li');
        li.id = msg.room.id;
        li.textContent = msg.room.name;
        const btn = document.createElement('button');
        btn.textContent = 'Войти';
        btn.onclick = () => window.location = '/game/join/' + msg.room.id;
        li.append(btn);
        roomsList.append(li);
    }
};



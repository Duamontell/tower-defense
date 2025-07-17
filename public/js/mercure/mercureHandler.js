const MERCURE_URL = 'http://localhost:3000/.well-known/mercure';

export function subscribeToMercure(topic, onMessageCallback) {
    const eventSource = new EventSource(`${MERCURE_URL}?topic=${encodeURIComponent(topic)}`);

    eventSource.onopen = () => {
        console.log('Подключение к Mercure успешно установлено');
        fetch(`/publish`);
    };

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Полученное сообщение:', data);
            onMessageCallback(data);
        } catch (error) {
            console.error('Ошибка при разборе сообщения Mercure:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('Ошибка подключения к Mercure:', error);
    };

    return eventSource;
}

export function unsubscribe(eventSource) {
    if (eventSource) eventSource.close();
}

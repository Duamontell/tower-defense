const MERCURE_URL = 'http://10.250.106.170:3000/.well-known/mercure';
// const MERCURE_URL = 'http://localhost:3000/.well-known/mercure';

const jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdLCJzdWJzY3JpYmUiOlsiaHR0cHM6Ly9leGFtcGxlLmNvbS9teS1wcml2YXRlLXRvcGljIiwie3NjaGVtZX06Ly97K2hvc3R9L2RlbW8vYm9va3Mve2lkfS5qc29ubGQiLCIvLndlbGwta25vd24vbWVyY3VyZS9zdWJzY3JpcHRpb25zey90b3BpY317L3N1YnNjcmliZXJ9Il0sInBheWxvYWQiOnsidXNlciI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXNlcnMvZHVuZ2xhcyIsInJlbW90ZUFkZHIiOiIxMjcuMC4wLjEifX19.KKPIikwUzRuB3DTpVw6ajzwSChwFw5omBMmMcWKiDcM';

export function subscribeToMercure(topic, onMessageCallback) {
    const eventSource = new EventSource(`${MERCURE_URL}?topic=${encodeURIComponent(topic)}`);

    eventSource.onopen = () => {
        console.log('Подключение к Mercure успешно установлено');
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

    window.addEventListener('beforeunload', function () {
        if (eventSource !== null) {
            eventSource.close();
        }
    })

    return eventSource;
}

export function unsubscribe(eventSource) {
    if (eventSource) eventSource.close();
}

export function publishToMercure(topic, data) {
    console.log('Отправка сообщения в Mercure:', data);

    fetch(MERCURE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: new URLSearchParams({
            topic: topic,
            data: JSON.stringify(data)
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json().then(data => {
                    console.log('Сообщение успешно отправлено. Ответ:', data);
                });
            } else {
                return response.text().then(text => {
                    console.log('Сообщение успешно отправлено. Ответ:', text);
                });
            }
        })
        .catch(error => {
            console.error('Ошибка отправки события:', error);
            if (error instanceof SyntaxError) {
                console.warn('Сервер вернул не JSON ответ');
            }
        });
}

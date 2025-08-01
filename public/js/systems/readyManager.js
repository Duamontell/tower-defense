import { subscribeToMercure } from '../mercure/mercureHandler.js';

export class ReadyManager {
    constructor(totalPlayers) {
        this.totalPlayers = totalPlayers;
        this.localReady = false;
        this.playersReady = new Set();
        this.resolveWait = null;
        this.eventSource = null;
    }

    async fetchInitialStatuses() {
        const resp = await fetch(`/game/room/${roomId}/statuses`);
        if (!resp.ok) throw new Error('Не удалось получить статусы');
        const playerStatuses = await resp.json();
        playerStatuses.forEach(p => {
            if (p.isReady) {
                this.playersReady.add(p.id);
            }
        });
    }

    subscribe() {
        const topic = `/game/room/${roomId}/ready`;
        this.eventSource = subscribeToMercure(topic, msg => {
            const { id, isReady } = msg;

            if (isReady) {
                this.playersReady.add(id);
            } else {
                this.playersReady.delete(id);
            }

            if (id === currentUserId) {
                this.localReady = isReady;
            }

            if (this.playersReady.size === this.totalPlayers && this.resolveWait) {
                this.resolveWait();
            }
        });
    }

    async sendLocalReady() {
        if (this.localReady) return;
        await fetch(`/game/room/${roomId}/ready`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                playerId: currentUserId,
                isReady: true
            })
        });
        this.localReady = true;
    }

    async waitForAllReady() {
        await this.fetchInitialStatuses();
        // TODO: Провести тесты после переноса подписки в начало game.js + БД
        // this.subscribe();

        if (this.playersReady.size === this.totalPlayers) {
            return;
        }

        await this.sendLocalReady();

        return new Promise(resolve => {
            this.resolveWait = resolve;
            if (this.playersReady.size === this.totalPlayers) {
                resolve();
            }
        });
    }

    cleanup() {
        this.eventSource.close();
    }
}

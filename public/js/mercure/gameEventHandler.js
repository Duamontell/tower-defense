export class GameEventHandler {
    constructor(world) {
        this.world = world;
    }

    handleEvent(data) {
        switch (data.type) {
            case 'userId':
                this.#handleUserId(data);
                break;
            case 'addTower':
                this.#handleAddTower(data);
                break;
            case 'towerAttack':
                this.#handleTowerAttack(data);
                break;
            case 'updateHealthBase':
                this.#handleUpdateHealthBase(data);
                break;
            case 'waveStart':
                this.#handleWaveStart(data);
                break;
            default:
                console.warn('Неизвестный тип события:', data.type);
        }
    }

    #handleUserId(data) {
        // this.world.players.set(data.userId, new User(data.userId, ));
    }

    #handleAddTower(data) {

    }

    #handleTowerAttack(data) {

    }

    #handleUpdateHealthBase(data) {

    }

    #handleWaveStart(data) {

    }
}

export class GameEventHandler {
    constructor(world) {
        this.world = world;
    }

    handleEvent(data) {
        switch (data.type) {
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

    #handleAddTower(data) {
        
    }

    #handleTowerAttack(data) {

    }

    #handleUpdateHealthBase(data) {

    }

    #handleWaveStart(data) {

    }
}
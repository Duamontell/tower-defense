export class User {
    constructor(id, userCfg) {
        this.id = id;
        this.towersId = [];
        this.baseId = userCfg.base.baseId;
        this.enemiesId = [];
        this.waypoints = userCfg.waypoints;
        this.towerZonesId = [];
        this.balance = userCfg.balance; // Баланс не сделан!
        this.isLose = false;
    }

    addTowerId(towerId) {
        this.towersId.push(towerId);
    }

    removeTowerId(towerId) {
        const index = this.towersId.indexOf(towerId);
        if (index !== -1) {
            this.towersId.splice(index, 1);
        }
    }

    addTowerZoneId(towerZoneId) {
        this.towerZonesId.push(towerZoneId);
    }

    setBaseId(baseId) {
        this.baseId = baseId;
    }

    addEnemyId(enemyId) {
        this.enemiesId.push(enemyId);
    }

    changeBalance(amount) {
        this.balance += amount;
    }
}

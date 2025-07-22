import { ExplosionEffect, FreezeEffect, PoisonEffect } from '../entity/effect.js';
import { publishToMercure } from '../mercure/mercureHandler.js';

let selectedZone = null;
let selectedTowerInstance = null;
let showTowerPanel = false;
let showUpgradePanel = false;
let showEffectPanel = false;
let showEnemiesPanel = false;
let showRulesPanel = false;

function resetSelections(towerPanel, upgradePanel, enemiesPanel) {
    selectedZone = null;
    selectedTowerInstance = null;
    showTowerPanel = false;
    towerPanel.hide();
    showUpgradePanel = false;
    upgradePanel.hide();
    enemiesPanel.baseOwnerId = null;
    enemiesPanel.hide();
    showEnemiesPanel = false;
}

function handleTowerPanelClick(x, y, towerPanel, world) {
    const user = world.players.get(currentUserId);
    const result = towerPanel.handleClick(x, y);
    if (result === 'close') {
        showTowerPanel = false;
        return;
    }

    if (result) {
        const clickedTower = result;
        const TowerClass = clickedTower.constructor;
        const towerCost = TowerClass.price;

        if (user.balance >= towerCost && selectedZone) {
            const placedResult = world.tryPlaceTower(
                (selectedZone.topLeft.x + selectedZone.bottomRight.x) / 2,
                (selectedZone.topLeft.y + selectedZone.bottomRight.y) / 2,
                TowerClass
            );

            if (placedResult) {
                const { tower, zone } = placedResult;
                user.changeBalance(-towerCost);
                selectedZone = null;
                showTowerPanel = false;
                towerPanel.hide();

                if (gameMode === "multiplayer") {
                    const eventData = {
                        type: 'addTower',
                        userId: currentUserId,
                        towerId: tower.id,
                        zoneId: zone.id,
                        name: TowerClass.name
                    };
                    publishToMercure('http://localhost:8000/game', eventData);
                }
            }
        }
    }
}

function handleUpgradePanelClick(x, y, upgradePanel, world) {
    const user = world.players.get(currentUserId);
    const result = upgradePanel.handleClick(x, y);
    if (result === 'close') {
        showUpgradePanel = false;
        return;
    }

    if (typeof result === 'number' && selectedTowerInstance) {
        const upgradeIndex = result;
        const upgrade = selectedTowerInstance.upgrades[upgradeIndex];
        const level = selectedTowerInstance.upgradeLevels[upgradeIndex] || 0;
        const currentCost = upgrade.costs[level];

        console.log(currentCost);
        if (user.balance >= currentCost) {
            selectedTowerInstance.applyUpgrade(upgradeIndex);
            user.changeBalance(-currentCost);
            console.log(`Улучшение "${upgrade.name}" применено к башне ${selectedTowerInstance.name}`);
        } else {
            console.log('Недостаточно средств для улучшения');
        }
    }
}

function handleEffectPanelClick(x, y, effectPanel) {
    const result = effectPanel.handleClick(x, y);
    if (result === 'close') {
        showEffectPanel = false;
        effectPanel.choosenEffect = null;
        effectPanel.isWaitingForCoords = false;
        return;
    }

    if (result) {
        effectPanel.choosenEffect = result
        effectPanel.isWaitingForCoords = true;
    }
}

function handleRulesPanelClick(x, y, rulesPanel) {
    const result = rulesPanel.handleClick(x, y);
    if (result === 'close') {
        showRulesPanel = false;
        return;
    }
}

function handleEffectCoords(x, y, effectPanel, world) {
    const user = world.players.get(currentUserId);
    const choosenEffect = effectPanel.choosenEffect;

    if (!effectPanel.isClickedOnIcon(x, y) && user.balance >= choosenEffect.price) {

        let effect;

        switch (choosenEffect.name) {
            case 'Poison':
                effect = new PoisonEffect({ x: x, y: y }, choosenEffect.damage, choosenEffect.cfg);
                break;
            case 'Freezing':
                effect = new FreezeEffect({ x: x, y: y }, choosenEffect.slowness, choosenEffect.cfg);
                break;
            case 'Bomb':
                effect = new ExplosionEffect({ x: x, y: y }, choosenEffect.damage, choosenEffect.cfg);
                break;
        }

        if (effect !== undefined) world.effects.push(effect);
        user.changeBalance(-choosenEffect.price);

    }

    showEffectPanel = false;
    effectPanel.isWaitingForCoords = false;
    effectPanel.choosenEffect = null;
    effectPanel.hide();
}


function handleEnemiesPanelClick(x, y, enemiesPanel, world) {
    const user = world.players.get(currentUserId);
    const result = enemiesPanel.handleClick(x, y);

    if (result === 'close') {
        showEnemiesPanel = false;
        return;
    }

    if (result) {
        user.changeBalance(-result.price);
        world.summonWave(result.enemies, enemiesPanel.baseOwnerId);
        showEnemiesPanel = false;
        enemiesPanel.hide();
        enemiesPanel.baseOwnerId = null;
    }
}

function handleMapClick(x, y, world, towerPanel, upgradePanel, effectPanel, rulesPanel, enemiesPanel) {
    const zone = world.getZoneByCoordinates(x, y);
    const base = world.getBaseByCoordinates(x, y);

    if (zone && !world.players.get(currentUserId).towerZonesId.includes(zone.id)) {
        console.log("Чужая зона!")
        return;
    }

    if (zone && !zone.occupied) {
        selectedZone = zone;
        showTowerPanel = true;
        towerPanel.show();
        selectedTowerInstance = null;
        showUpgradePanel = false;
        upgradePanel.hide();
        console.log('Выбрана зона для установки башни');
        return;
    }

    if (zone && zone.occupied && zone.tower) {
        selectedTowerInstance = zone.tower;
        showUpgradePanel = true;
        upgradePanel.show(selectedTowerInstance);
        selectedZone = null;
        showTowerPanel = false;
        towerPanel.hide();
        console.log('Выбрана башня для улучшения', selectedTowerInstance);
        return;
    }

    if (effectPanel.isClickedOnIcon(x, y)) {
        showEffectPanel = true;
        effectPanel.show()
        return;
    }

    if (rulesPanel.isClickedOnIcon(x, y)) {
        showRulesPanel = true;
        rulesPanel.show();
        return;
    }

    if (base && !base.isDestroyed) {
        enemiesPanel.baseOwnerId = base.ownerId;
        showEnemiesPanel = true;
        enemiesPanel.show();
        return;
    }

    resetSelections(towerPanel, upgradePanel, enemiesPanel);
}

export function handleClick(x, y, world, towerPanel, upgradePanel, effectPanel, rulesPanel, enemiesPanel) {

    if (showTowerPanel) {
        handleTowerPanelClick(x, y, towerPanel, world);
        return true;
    }
    else if (showUpgradePanel) {
        handleUpgradePanelClick(x, y, upgradePanel, world);
        return true;
    } else if (showEffectPanel) {
        (effectPanel.isWaitingForCoords) ? handleEffectCoords(x, y, effectPanel, world) : handleEffectPanelClick(x, y, effectPanel);
        return true;
    } else if (showEnemiesPanel) {
        handleEnemiesPanelClick(x, y, enemiesPanel, world);
        return true;
    } else if (showRulesPanel) {
        handleRulesPanelClick(x, y, rulesPanel);
        return true;
    }
    handleMapClick(x, y, world, towerPanel, upgradePanel, effectPanel, rulesPanel, enemiesPanel);
    return false;
}
import { ExplosionEffect, FreezeEffect, PoisonEffect, FreezeTowerEffect, SpeedEffect } from '../entity/effect.js';
import { publishToMercure } from '../mercure/mercureHandler.js';

let selectedZone = null;
let selectedTowerInstance = null;

function resetSelections(towerPanel, upgradePanel, enemiesPanel) {
    selectedZone = null;
    selectedTowerInstance = null;
    towerPanel.hide();
    upgradePanel.hide();
    enemiesPanel.baseOwnerId = null;
    enemiesPanel.hide();
}

function handleTowerPanelClick(x, y, towerPanel, world) {
    const user = world.players.get(currentUserId);
    const result = towerPanel.handleClick(x, y);
    if (result === 'close') {
        towerPanel.hide();
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
                towerPanel.hide();

                if (gameMode === "multiplayer") {
                    const eventData = {
                        type: 'addTower',
                        userId: currentUserId,
                        towerId: tower.id,
                        zoneId: zone.id,
                        name: TowerClass.name
                    };
                    publishToMercure(topic, eventData);
                }
            }
        }
    }
}

function handleUpgradePanelClick(x, y, upgradePanel, world) {
    const user = world.players.get(currentUserId);
    const result = upgradePanel.handleClick(x, y);

    if (result === 'close') {
        upgradePanel.hide();
        return;
    }

    if (result === 'sell') {
        sellSelectedTower(user, world, upgradePanel);
        return;
    }

    if (typeof result === 'number') {
        upgradeSelectedTower(user, result, upgradePanel, world);
    }
}

function sellSelectedTower(user, world, upgradePanel) {
    if (!selectedTowerInstance) return;
    const tower = selectedTowerInstance;
    const towerId = tower.id;
    const zone = world.towerZones.find(z => z.tower === tower);
    if (!zone) return;

    let basePrice = tower.constructor.price;
    let upgradesCost = 0;
    for (let i = 0; i < tower.upgrades.length; i++) {
        const level = tower.upgradeLevels[i] || 0;
        for (let l = 0; l < level; l++) {
            upgradesCost += tower.upgrades[i].costs[l];
        }
    }
    const refund = Math.floor((basePrice + upgradesCost) / 2);
    user.changeBalance(refund);

    tower.isBeingSold = true;
    tower.sellAnimationProgress = 0;

    upgradePanel.hide();
    selectedTowerInstance = null;

    if (gameMode === "multiplayer") {
        const eventData = {
            type: 'sellTower',
            userId: currentUserId,
            towerId: towerId,
        };
        publishToMercure(topic, eventData);
    }
}

function upgradeSelectedTower(user, upgradeIndex, upgradePanel, world) {
    if (!selectedTowerInstance) return;
    const upgrade = selectedTowerInstance.upgrades[upgradeIndex];
    const level = selectedTowerInstance.upgradeLevels[upgradeIndex] || 0;
    const currentCost = upgrade.costs[level];

    if (user.balance >= currentCost) {
        selectedTowerInstance.applyUpgrade(upgradeIndex);
        user.changeBalance(-currentCost);
        if (gameMode === "multiplayer") {
            const eventData = {
                type: 'upgradeTower',
                userId: currentUserId,
                towerId: selectedTowerInstance.id,
                upgradeIndex: upgradeIndex,
                newLevel: (selectedTowerInstance.upgradeLevels[upgradeIndex] || 0)
            };
            publishToMercure(topic, eventData);
        }
    } else {
        console.log('Недостаточно средств для улучшения');
    }
}

function handleEffectPanelClick(x, y, effectPanel) {
    const result = effectPanel.handleClick(x, y);
    if (result === 'close') {
        effectPanel.choosenEffect = null;
        effectPanel.isWaitingForCoords = false;
        effectPanel.hide();
        return;
    }

    if (effectPanel.isWaitingForCoords && effectPanel.isClickedOnCancel && effectPanel.isClickedOnCancel(x, y)) {
        effectPanel.isWaitingForCoords = false;
        effectPanel.choosenEffect = null;
        effectPanel.hide();
        return;
    }

    if (result) {
        effectPanel.choosenEffect = result;
        effectPanel.isWaitingForCoords = true;
    }
}

function handleRulesPanelClick(x, y, rulesPanel) {
    const result = rulesPanel.handleClick(x, y);
    if (result === 'close') {
        rulesPanel.hide();
        return;
    }
}

function handleEffectCoords(x, y, effectPanel, world, soundPanel) {
    const user = world.players.get(currentUserId);
    const choosenEffect = effectPanel.choosenEffect;

    if (!effectPanel.isClickedOnIcon(x, y) && user.balance >= choosenEffect.price) {
        let effect;
        let effectType = null;
        let effectData = {};

        switch (choosenEffect.name) {
            case 'Poison':
                effect = new PoisonEffect({ x: x, y: y }, choosenEffect.damage, choosenEffect.cfg, soundPanel);
                effectType = 'Poison';
                effectData = { damage: choosenEffect.damage, cfg: choosenEffect.cfg };
                break;
            case 'Freezing':
                effect = new FreezeEffect({ x: x, y: y }, choosenEffect.slowness, choosenEffect.cfg, soundPanel);
                effectType = 'Freezing';
                effectData = { slowness: choosenEffect.slowness, cfg: choosenEffect.cfg };
                break;
            case 'Bomb':
                effect = new ExplosionEffect({ x: x, y: y }, choosenEffect.damage, choosenEffect.cfg, soundPanel);
                effectType = 'Bomb';
                effectData = { damage: choosenEffect.damage, cfg: choosenEffect.cfg };
                break;
            case 'SpeedBoost':
                effect = new SpeedEffect({ x: x, y: y }, choosenEffect.boost, choosenEffect.cfg);
                effectType = 'Speed';
                effectData = { boost: choosenEffect.boost, cfg: choosenEffect.cfg };
            case 'FreezeTower': {
                const zone = world.getZoneByCoordinates(x, y);
                if (zone && zone.occupied && zone.tower) {
                    const tower = zone.tower;
                    if (tower.ownerId === currentUserId) {
                        return;
                    }
                    if (!tower.isFrozen) {
                        tower.isFrozen = true;
                        effect = new FreezeTowerEffect(tower, choosenEffect.duration);
                        effectType = 'FreezeTower';
                        effectData = { towerId: tower.id, duration: choosenEffect.duration };
                    }
                }
                break;
            }
        }

        if (effect !== undefined) {
            world.effects.push(effect);
            user.changeBalance(-choosenEffect.price);

            if (gameMode === "multiplayer" && effectType) {
                const eventData = {
                    type: 'addEffect',
                    userId: currentUserId,
                    effectType,
                    x, y,
                    ...effectData
                };
                publishToMercure(topic, eventData);
            }
            effectPanel.isWaitingForCoords = false;
            effectPanel.choosenEffect = null;
            effectPanel.hide();
        }
    }
}

function handleEnemiesPanelClick(x, y, enemiesPanel, world) {
    const user = world.players.get(currentUserId);
    const result = enemiesPanel.handleClick(x, y);

    if (result === 'close') {
        enemiesPanel.hide();
        return;
    }

    if (result && user.id !== enemiesPanel.baseOwnerId) {
        user.changeBalance(-result.price);
        world.summonWave(result.enemies, enemiesPanel.baseOwnerId);

        if (gameMode === "multiplayer") {
            const eventData = {
                type: 'summonWave',
                userId: currentUserId,
                targetUserId: enemiesPanel.baseOwnerId,
                enemies: result.enemies
            };
            publishToMercure(topic, eventData);
        }
    }

    enemiesPanel.hide();
    enemiesPanel.baseOwnerId = null;
}

function handleMapClick(x, y, world, towerPanel, upgradePanel, effectPanel, rulesPanel, enemiesPanel) {
    const zone = world.getZoneByCoordinates(x, y);
    const base = world.getBaseByCoordinates(x, y);

    if (zone && !world.players.get(currentUserId).towerZonesId.includes(zone.id)) {
        console.log("Чужая зона!");
        return;
    }

    if (zone && !zone.occupied) {
        selectedZone = zone;
        towerPanel.show();
        selectedTowerInstance = null;
        upgradePanel.hide();
        return;
    }

    if (zone && zone.occupied && zone.tower) {
        if (zone.tower.isFrozen) {
            return;
        }
        selectedTowerInstance = zone.tower;
        upgradePanel.show(selectedTowerInstance);
        selectedZone = null;
        towerPanel.hide();
        return;
    }

    if (base && !base.isDestroyed && base.ownerId !== currentUserId) {
        enemiesPanel.baseOwnerId = base.ownerId;
        enemiesPanel.show();
        return;
    }

    resetSelections(towerPanel, upgradePanel, enemiesPanel);
}

export function handleClick(x, y, world, towerPanel, upgradePanel, effectPanel, rulesPanel, enemiesPanel, camera, soundPanel) {
    if (towerPanel.visible) {
        handleTowerPanelClick(x, y, towerPanel, world);
        return true;
    }
    if (upgradePanel.visible) {
        handleUpgradePanelClick(x, y, upgradePanel, world);
        return true;
    }
    if (effectPanel.visible) {
        if (effectPanel.isWaitingForCoords) {
            if (effectPanel.isClickedOnCancel && effectPanel.isClickedOnCancel(x, y)) {
                handleEffectPanelClick(x, y, effectPanel);
                return true;
            }
            const worldCoords = camera.screenToWorld(x, y);
            handleEffectCoords(worldCoords.x, worldCoords.y, effectPanel, world, soundPanel);
        } else {
            handleEffectPanelClick(x, y, effectPanel);
        }
        return true;
    }
    if (enemiesPanel.visible) {
        handleEnemiesPanelClick(x, y, enemiesPanel, world);
        return true;
    }
    if (rulesPanel.visible) {
        handleRulesPanelClick(x, y, rulesPanel);
        return true;
    }

    if (effectPanel.isClickedOnIcon(x, y)) {
        effectPanel.show();
        return;
    }
    if (rulesPanel.isClickedOnIcon && rulesPanel.isClickedOnIcon(x, y)) {
        rulesPanel.show();
        return;
    }

    if (soundPanel.isClickedOnIcon(x, y)) {
        soundPanel.handleSound();
        return;
    }

    const worldCoords = camera.screenToWorld(x, y);
    handleMapClick(
        worldCoords.x,
        worldCoords.y,
        world,
        towerPanel,
        upgradePanel,
        effectPanel,
        rulesPanel,
        enemiesPanel
    );
    return false;
}

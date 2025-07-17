let selectedZone = null;
let selectedTowerInstance = null;
let showTowerPanel = false;
let showUpgradePanel = false;

function resetSelections(towerPanel, upgradePanel) {
    selectedZone = null;
    selectedTowerInstance = null;
    showTowerPanel = false;
    towerPanel.hide();
    showUpgradePanel = false;
    upgradePanel.hide();
}

function handleTowerPanelClick(x, y, towerPanel, world, changeBalance, balance) {
    const result = towerPanel.handleClick(x, y);
    if (result === 'close') {
        showTowerPanel = false;
        return;
    }
    if (result) {
        const clickedTower = result;
        const TowerClass = clickedTower.constructor;
        const towerCost = TowerClass.price;
        if (balance >= towerCost && selectedZone) {
            const placed = world.tryPlaceTower(
                (selectedZone.topLeft.x + selectedZone.bottomRight.x) / 2,
                (selectedZone.topLeft.y + selectedZone.bottomRight.y) / 2,
                TowerClass
            );
            if (placed) {
                changeBalance(-towerCost);
                selectedZone = null;
                showTowerPanel = false;
                towerPanel.hide();
                console.log(`Поставлена башня ${TowerClass.name}`);
            }
        } else {
            console.log('Недостаточно средств для покупки башни или зона не выбрана');
        }
    }
}

function handleUpgradePanelClick(x, y, upgradePanel, changeBalance, balance) {
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
        if (balance >= currentCost) {
            selectedTowerInstance.applyUpgrade(upgradeIndex);
            changeBalance(-currentCost);
            console.log(`Улучшение "${upgrade.name}" применено к башне ${selectedTowerInstance.name}`);
            console.log(selectedTowerInstance);
        } else {
            console.log('Недостаточно средств для улучшения');
        }
    }
}

function handleMapClick(x, y, world, towerPanel, upgradePanel) {
    const zone = world.getZoneByCoordinates(x, y);

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

    resetSelections(towerPanel, upgradePanel);
}

export function handleClick(x, y, world, towerPanel, upgradePanel, changeBalance, balance) {
    if (showTowerPanel) {
        handleTowerPanelClick(x, y, towerPanel, world, changeBalance, balance);
        return true;
    }
    else if (showUpgradePanel) {
        handleUpgradePanelClick(x, y, upgradePanel, changeBalance, balance);
        return true;
    }
    handleMapClick(x, y, world, towerPanel, upgradePanel);
    return false;
}

const towerZoneMarker = new Image();
towerZoneMarker.src = '../../images/tower/TowerZoneMarker.svg';

function drawTowerZones(ctx, towerZones, players, camera) {
    const myZones = players.get(currentUserId).towerZonesId;
    towerZones.forEach(zone => {
        if (!zone.occupied && myZones.includes(zone.id)) {
            const centerX = (zone.topLeft.x + zone.bottomRight.x) / 2;
            const centerY = (zone.topLeft.y + zone.bottomRight.y) / 2;
            const { x, y } = camera.worldToScreen(centerX, centerY);
            const markerWidth = 100 * camera.scale;
            const markerHeight = 100 * camera.scale;

            ctx.drawImage(
                towerZoneMarker,
                x - markerWidth / 2,
                y - markerHeight / 2,
                markerWidth,
                markerHeight
            );
        }
    });
}

export { drawTowerZones, towerZoneMarker };

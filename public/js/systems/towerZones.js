const towerZoneMarker = new Image();
towerZoneMarker.src = '/images/TowerZoneMarker.svg';

function drawTowerZones(ctx, towerZones) {
    towerZones.forEach(zone => {
        if (!zone.occupied) {
            const centerX = (zone.topLeft.x + zone.bottomRight.x) / 2;
            const centerY = (zone.topLeft.y + zone.bottomRight.y) / 2;
            const markerWidth = 130;
            const markerHeight = 130;

            ctx.drawImage(
                towerZoneMarker,
                centerX - markerWidth / 2,
                centerY - markerHeight / 2,
                markerWidth,
                markerHeight
            );
        }
    });
}

export { drawTowerZones, towerZoneMarker };

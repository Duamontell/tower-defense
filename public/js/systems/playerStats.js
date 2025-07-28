export function drawPlayerStatsPanel(ctx, balance, currentHealth, maxHealth, mapWidth, mapHeight) {
    if (!drawPlayerStatsPanel.imgCoin) {
        drawPlayerStatsPanel.imgCoin = new Image();
        drawPlayerStatsPanel.imgCoin.src = '/images/assets/balance.svg';
    }
    const imgCoin = drawPlayerStatsPanel.imgCoin;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    const panelWidth = mapWidth * 0.25;
    const panelHeight = mapHeight * 0.07;
    const panelX = mapWidth * 0.010;
    const panelY = mapHeight * 0.010;
    const radius = panelHeight * 0.2;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    ctx.filter = "blur(4px)";
    ctx.fillRect(panelX + 4, panelY + 4, panelWidth, panelHeight);
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.98;
    ctx.fillStyle = "#fffbe6";
    ctx.strokeStyle = "#bfa76f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    const iconSize = panelHeight * 0.25;
    const coinX = panelX + panelWidth * 0.1;
    const coinY = panelY + panelHeight * 0.35;

    if (imgCoin.complete) {
        ctx.drawImage(imgCoin, coinX, coinY - iconSize / 2, iconSize, iconSize);
    }

    ctx.fillStyle = '#3a2a00';
    ctx.font = `bold ${panelHeight * 0.22}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(balance, coinX + iconSize + 10, coinY);

    const healthBarWidth = panelWidth * 0.8;
    const healthBarHeight = panelHeight * 0.2;
    const healthBarX = panelX + panelWidth * 0.1;
    const healthBarY = panelY + panelHeight * 0.65;

    ctx.save();
    ctx.fillStyle = '#e6c97a';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    ctx.globalAlpha = 1;

    const healthPercent = Math.max(0, Math.min(1, currentHealth / maxHealth));
    const hue = 120 * healthPercent; // 120° = зеленый, 0° = красный
    ctx.fillStyle = `hsl(${hue}, 100%, 45%)`;
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

    ctx.strokeStyle = '#bfa76f';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    ctx.restore();

    ctx.font = `bold ${panelHeight * 0.15}px Arial`;
    ctx.fillStyle = '#7a5c1b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentHealth} / ${maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + healthBarHeight / 2);
}
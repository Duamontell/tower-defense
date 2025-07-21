export function drawPlayerStatsPanel(ctx, balance, baseHealth) {
    ctx.fillStyle = '#00000080';
    ctx.fillRect(10, 10, 150, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';

    ctx.fillText(`Баланс: ${balance}`, 20, 35);
    ctx.fillText(`HP: ${baseHealth}`, 20, 60);
}
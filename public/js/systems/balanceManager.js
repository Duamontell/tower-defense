export function drawBalancePanel(ctx, balance) {
    ctx.fillStyle = '#00000080';
    ctx.fillRect(10, 10, 150, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Баланс: ${balance}`, 20, 38);
}

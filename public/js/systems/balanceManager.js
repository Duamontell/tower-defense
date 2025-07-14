let balance = 0;

export function initBalance(startingBalance = 0) {
    balance = startingBalance;
}

export function getBalance() {
    return balance;
}

export function changeBalance(amount) {
    balance += amount;
    if (balance < 0) balance = 0;
}

export function drawBalancePanel(ctx, balance) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 40);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Баланс: ${balance}`, 20, 38);
}

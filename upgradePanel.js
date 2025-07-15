export class UpgradePanel {
    constructor(ctx, canvasWidth, canvasHeight, getBalance, onBuyUpgrade) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.visible = false;
        this.closeSize = 50;
        this.closePadding = 10;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.getBalance = getBalance;
        this.onBuyUpgrade = onBuyUpgrade;
        this.upgradePositions = [];
        this.selectedTower = null;
    }

    show(tower) {
        this.visible = true;
        this.selectedTower = tower;
        this.#updatePositions();
    }

    hide() {
        this.visible = false;
        this.selectedTower = null;
    }

    draw() {
        if (!this.visible || !this.selectedTower) return;

        const ctx = this.ctx;
        ctx.save();

        this.drawBackground();
        this.drawTitle();
        this.#drawCloseButton();
        this.drawUpgradeButtons();

        ctx.restore();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';

        const titleX = this.x + this.width / 2;
        const titleY = this.y + 30;

        const towerName = this.selectedTower.name || 'Башня';

        ctx.fillText(`Улучшения для: ${towerName}`, titleX, titleY);
    }

    drawUpgradeButtons() {
        const ctx = this.ctx;

        ctx.textAlign = 'left';
        ctx.font = '20px Arial';

        this.upgradePositions.forEach((pos, i) => {
            const upgrade = this.selectedTower.upgrades[i];
            const canBuy = this.getBalance() >= upgrade.cost;

            ctx.globalAlpha = canBuy ? 1 : 0.4;
            ctx.fillStyle = canBuy ? '#F5F5DC' : '#AAA';
            ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

            const iconSize = 40;
            if (!upgrade.icon) {
                upgrade.icon = new Image();
                upgrade.icon.src = upgrade.iconSrc;
            }
            if (upgrade.icon.complete) {
                ctx.drawImage(upgrade.icon, pos.x + 5, pos.y + (pos.height - iconSize) / 2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillRect(pos.x + 5, pos.y + (pos.height - iconSize) / 2, iconSize, iconSize);
            }

            ctx.fillStyle = 'black';
            const textX = pos.x + iconSize + 15;
            const textY = pos.y + pos.height / 2 - 5;
            ctx.font = '18px Arial';
            ctx.fillText(upgrade.description || upgrade.name, textX, textY);

            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(`Стоимость: ${upgrade.cost}`, textX, textY + 20);

            ctx.globalAlpha = 1;
        });
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        this.#updatePositions();

        if (
            x >= this.closeX - this.closeSize / 2 &&
            x <= this.closeX + this.closeSize / 2 &&
            y >= this.closeY - this.closeSize / 2 &&
            y <= this.closeY + this.closeSize / 2
        ) {
            this.hide();
            return 'close';
        }

        for (let i = 0; i < this.upgradePositions.length; i++) {
            const pos = this.upgradePositions[i];
            if (
                x >= pos.x &&
                x <= pos.x + pos.width &&
                y >= pos.y &&
                y <= pos.y + pos.height
            ) {
                const upgrade = this.selectedTower.upgrades[i];
                if (this.getBalance() >= upgrade.cost) {
                    return i;
                }
            }
        }
        return null;
    }

    #updatePositions() {
        this.upgradePositions = [];
        const startX = this.x + 20;
        let startY = this.y + 50;
        const buttonWidth = 300;
        const buttonHeight = 40;
        const gap = 15;

        if (!this.selectedTower) return;

        for (let i = 0; i < this.selectedTower.upgrades.length; i++) {
            this.upgradePositions.push({
                x: startX,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            });
            startY += buttonHeight + gap;
        }

        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
    }

    #drawCloseButton() {
        const ctx = this.ctx;
        const size = this.closeSize;
        const x = this.closeX;
        const y = this.closeY;
        const half = size / 2;

        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(x - half, y - half, size, size);

        ctx.beginPath();
        ctx.moveTo(x - half + 6, y - half + 6);
        ctx.lineTo(x + half - 6, y + half - 6);
        ctx.moveTo(x + half - 6, y - half + 6);
        ctx.lineTo(x - half + 6, y + half - 6);
        ctx.stroke();

        ctx.restore();
    }
}

export class UpgradePanel {
    constructor(ctx, canvasWidth, canvasHeight, getBalance, onBuyUpgrade) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 300;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.visible = false;
        this.closeSize = 40;
        this.closePadding = 10;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.getBalance = getBalance;
        this.onBuyUpgrade = onBuyUpgrade;
        this.upgradePositions = [];
        this.selectedTower = null;
        this.iconSize = 40;
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
        ctx.fillStyle = '#000000B3';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';

        const titleX = this.x + this.width / 2;
        const titleY = this.y + 40;

        const towerName = this.selectedTower.name || 'Башня';

        ctx.fillText(`Улучшения для ${towerName}`, titleX, titleY);
    }

    drawUpgradeButtons() {
        const ctx = this.ctx;
        ctx.textBaseline = 'middle';

        const iconSize = this.iconSize;

        this.upgradePositions.forEach((pos, i) => {
            const upgrade = this.selectedTower.upgrades[i];
            const level = this.selectedTower.upgradeLevels[i] || 0;
            const maxLevel = upgrade.applyLevels.length;

            const isMaxedOut = level >= maxLevel;
            const hasMoney = !isMaxedOut && this.getBalance() >= upgrade.costs[level];

            this.drawUpgradeButtonBackgroundAndFrame(ctx, pos, hasMoney, isMaxedOut);
            this.drawUpgradeIcon(ctx, pos, upgrade, iconSize);
            this.drawUpgradeTexts(ctx, pos, upgrade, level, maxLevel, hasMoney, iconSize);
        });
    }

    drawUpgradeButtonBackgroundAndFrame(ctx, pos, canBuy, isMaxedOut) {
        ctx.globalAlpha = canBuy ? 1 : 0.4;
        if (isMaxedOut) ctx.globalAlpha = 1;

        ctx.fillStyle = canBuy || isMaxedOut ? '#F5F5DC' : '#AAAAAA';
        ctx.fillRect(pos.x, pos.y, pos.width, pos.height);

        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

        ctx.globalAlpha = 1;
    }

    drawUpgradeIcon(ctx, pos, upgrade, iconSize) {
        const paddingLeft = 15;

        if (!upgrade.icon) {
            upgrade.icon = new Image();
            upgrade.icon.src = upgrade.iconSrc;
        }
        ctx.drawImage(upgrade.icon, pos.x + paddingLeft, pos.y + (pos.height - iconSize) / 2, iconSize, iconSize);
    }

    drawUpgradeTexts(ctx, pos, upgrade, level, maxLevel, canBuy, iconSize) {
        const paddingLeft = 15;
        const paddingRight = 15;
        const textCenterY = pos.y + pos.height / 2;
        const nameX = pos.x + paddingLeft + iconSize + 15;
        const descriptionX = pos.x + pos.width / 2 - 80;
        const costX = pos.x + pos.width - paddingRight;

        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';

        ctx.fillText(upgrade.name, nameX, textCenterY);

        let description = level < maxLevel ? upgrade.descriptions[level] : 'Максимальный уровень улучшения';
        ctx.fillText(description, descriptionX, textCenterY);

        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        let costText = level < maxLevel ? `Стоимость: ${upgrade.costs[level]}` : '';
        ctx.fillText(costText, costX, textCenterY);
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
                const level = this.selectedTower.upgradeLevels[i] || 0;
                if (level < upgrade.applyLevels.length && this.getBalance() >= upgrade.costs[level]) {
                    return i;
                }
            }
        }
        return null;
    }

    #updatePositions() {
        this.upgradePositions = [];

        const paddingSide = 20;
        const gap = 15;
        const buttonHeight = 40;
        const headerHeight = 80;

        if (!this.selectedTower) return;

        const buttonWidth = this.width - paddingSide * 2;
        const startX = this.x + paddingSide;
        let startY = this.y + headerHeight;

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
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        ctx.fillStyle = '#FF0000B3';
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
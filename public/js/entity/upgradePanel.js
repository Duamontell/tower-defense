export class UpgradePanel {
    constructor(ctx, canvasWidth, canvasHeight, getBalance, onBuyUpgrade) {
        this.ctx = ctx;
        this.width = 900;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 70;
        this.visible = false;
        this.closeSize = 36;
        this.closePadding = 16;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.getBalance = getBalance;
        this.onBuyUpgrade = onBuyUpgrade;
        this.upgradePositions = [];
        this.selectedTower = null;
        this.iconSize = 40;
        this.towerNames = {
            'Archers': 'башни лучников',
            'Magicians': 'магической башни',
            'Poisonous': 'отравляющей башни',
            'Freezing': 'замедляющей башни',
            'Mortar': 'мортиры',
        };
        if (!this.imgCoin) {
            this.imgCoin = new Image();
            this.imgCoin.src = '/images/assets/balance.svg';
        }
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
        ctx.save();

        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        ctx.filter = "blur(6px)";
        ctx.fillRect(this.x + 6, this.y + 6, this.width, this.height);
        ctx.filter = "none";
        ctx.globalAlpha = 1;

        ctx.globalAlpha = 0.98;
        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 24);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "bold 26px MedievalSharp, serif";
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";

        const titleX = this.x + this.width / 2;
        const titleY = this.y + 44;

        const towerClassName = this.selectedTower.name;
        const towerName = this.towerNames[towerClassName] || towerClassName;

        ctx.fillText(`Улучшения для ${towerName}`, titleX, titleY);
        ctx.restore();
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

            ctx.save();
            ctx.globalAlpha = hasMoney ? 1 : 0.45;
            ctx.fillStyle = "#fffbe6";
            ctx.strokeStyle = "#bfa76f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, pos.width, pos.height, 12);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();

            const paddingLeft = 15;
            if (!upgrade.icon) {
                upgrade.icon = new Image();
                upgrade.icon.src = upgrade.iconSrc;
            }
            ctx.save();
            ctx.globalAlpha = hasMoney ? 1 : 0.5;
            ctx.drawImage(upgrade.icon, pos.x + paddingLeft, pos.y + (pos.height - iconSize) / 2, iconSize, iconSize);
            ctx.restore();

            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = hasMoney ? "#3a2a00" : "#888";
            ctx.textAlign = 'left';
            const nameX = pos.x + paddingLeft + iconSize + 15;
            const nameY = pos.y + 28;
            ctx.fillText(upgrade.name, nameX, nameY);

            ctx.font = '16px Arial';
            ctx.fillStyle = hasMoney ? "#4a3a1a" : "#aaa";
            let description = level < maxLevel ? upgrade.descriptions[level] : 'Максимальный уровень улучшения';
            ctx.fillText(description, nameX, nameY + 22);

            ctx.font = "14px Arial";
            ctx.fillStyle = hasMoney ? "#7a5c1b" : "#bbb";
            ctx.textAlign = "center";
            ctx.fillText(`уровень: ${level} / ${maxLevel}`, pos.x + pos.width / 2, pos.y + pos.height / 2);

            ctx.font = '16px Arial';
            ctx.textAlign = 'right';
            let costText = level < maxLevel ? `${upgrade.costs[level]}` : '';
            const coinSize = 18;
            const costX = pos.x + pos.width - 28;
            const costY = pos.y + pos.height / 2 - 8;

            if (level < maxLevel && this.imgCoin.complete) {
                ctx.save();
                ctx.globalAlpha = hasMoney ? 1 : 0.5;
                ctx.drawImage(this.imgCoin, costX - coinSize - 22, costY - 3, coinSize, coinSize);
                ctx.restore();
            }
            ctx.fillStyle = hasMoney ? "#3a2a00" : "#bbb";
            ctx.fillText(costText, costX, costY + coinSize / 2);
        });
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        this.#updatePositions();

        const cx = this.closeX;
        const cy = this.closeY;
        const r = this.closeSize / 2;
        if (Math.hypot(x - cx, y - cy) <= r) {
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

        const paddingSide = 24;
        const gap = 18;
        const buttonHeight = 65;
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
        const r = size / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = "#e6c97a";
        ctx.fill();
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", x, y);
        ctx.restore();
    }
}
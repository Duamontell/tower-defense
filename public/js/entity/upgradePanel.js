export class UpgradePanel {
    constructor(ctx, nativeHeight, nativeWidth, getBalance, onBuyUpgrade) {
        this.ctx = ctx;
        this.width = nativeWidth * 0.72;
        this.height = nativeHeight * 0.36;
        this.x = (nativeWidth - this.width) / 2;
        this.y = nativeHeight - this.height - nativeHeight * 0.025;
        this.visible = false;
        this.closeSize = this.height * 0.11;
        this.closePadding = this.height * 0.04;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.getBalance = getBalance;
        this.onBuyUpgrade = onBuyUpgrade;
        this.upgradePositions = [];
        this.selectedTower = null;
        this.iconSize = this.height * 0.1;
        this.towerNames = {
            'Archers': 'башни лучников',
            'Magicians': 'магической башни',
            'Poisonous': 'отравляющей башни',
            'Freezing': 'замораживающей башни',
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
        this.drawSellButton();

        ctx.restore();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.save();

        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        ctx.filter = "blur(6px)";
        ctx.fillRect(this.x + this.width * 0.006, this.y + this.height * 0.02, this.width, this.height);
        ctx.filter = "none";
        ctx.globalAlpha = 1;

        ctx.globalAlpha = 0.98;
        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = this.height * 0.011;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height * 0.08);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `bold ${this.height * 0.07}px MedievalSharp, serif`;
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";

        const titleX = this.x + this.width / 2;
        const titleY = this.y + this.height * 0.11;

        const towerClassName = this.selectedTower.name;
        const towerName = this.towerNames[towerClassName] || towerClassName;
        ctx.fillText(`Улучшения для ${towerName}`, titleX, titleY);

        ctx.restore();
    }

    drawUpgradeButtons() {
        const ctx = this.ctx;
        ctx.textBaseline = 'middle';

        const iconSize = this.iconSize;
        const isFrozen = this.selectedTower.isFrozen;

        this.upgradePositions.forEach((pos, i) => {
            const upgrade = this.selectedTower.upgrades[i];
            const level = this.selectedTower.upgradeLevels[i] || 0;
            const maxLevel = upgrade.applyLevels.length;

            const isMaxedOut = level >= maxLevel;
            const hasMoney = !isMaxedOut && this.getBalance() >= upgrade.costs[level] && !isFrozen;

            ctx.save();
            ctx.globalAlpha = hasMoney ? 1 : 0.45;
            ctx.fillStyle = "#fffbe6";
            ctx.strokeStyle = "#bfa76f";
            ctx.lineWidth = this.height * 0.006;
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, pos.width, pos.height, this.height * 0.04);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();

            const paddingLeft = pos.height * 0.23;
            if (!upgrade.icon) {
                upgrade.icon = new Image();
                upgrade.icon.src = upgrade.iconSrc;
            }
            ctx.save();
            ctx.globalAlpha = hasMoney ? 1 : 0.5;
            ctx.drawImage(
                upgrade.icon,
                pos.x + paddingLeft,
                pos.y + (pos.height - iconSize) / 2,
                iconSize,
                iconSize
            );
            ctx.restore();

            ctx.font = `bold ${pos.height * 0.26}px Arial`;
            ctx.fillStyle = hasMoney ? "#3a2a00" : "#888";
            ctx.textAlign = 'left';
            const nameX = pos.x + paddingLeft + iconSize + pos.height * 0.23;
            const nameY = pos.y + pos.height * 0.43;
            ctx.fillText(upgrade.name, nameX, nameY);

            ctx.font = `${pos.height * 0.26}px Arial`;
            ctx.fillStyle = hasMoney ? "#4a3a1a" : "#aaa";
            let description = level < maxLevel ? upgrade.descriptions[level] : 'Максимальный уровень улучшения';
            if (isFrozen) {
                description = "Башня заморожена!";
            }
            ctx.fillText(description, nameX, nameY + pos.height * 0.36);

            ctx.font = `${pos.height * 0.26}px Arial`;
            ctx.fillStyle = hasMoney ? "#7a5c1b" : "#bbb";
            ctx.textAlign = "center";
            ctx.fillText(
                `уровень: ${level} / ${maxLevel}`,
                pos.x + pos.width / 2,
                pos.y + pos.height * 0.72
            );

            ctx.font = `${pos.height * 0.26}px Arial`;
            ctx.textAlign = 'right';
            let costText = level < maxLevel ? `${upgrade.costs[level]}` : '';
            const coinSize = pos.height * 0.28;
            const costX = pos.x + pos.width - pos.height * 0.5;
            const costY = pos.y + pos.height * 0.7 - coinSize / 2;

            if (level < maxLevel && this.imgCoin.complete) {
                ctx.save();
                ctx.globalAlpha = hasMoney ? 1 : 0.5;
                ctx.drawImage(this.imgCoin, costX - coinSize - pos.height * 0.45, costY + 3, coinSize, coinSize);
                ctx.restore();
            }
            ctx.fillStyle = hasMoney ? "#3a2a00" : "#bbb";
            ctx.fillText(costText, costX, costY + coinSize * 0.8);
        });
    }

    drawSellButton() {
        if (!this.selectedTower) return;
        const ctx = this.ctx;
        const btn = this.sellButton;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#e6c97a";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = this.height * 0.006;
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, btn.width, btn.height, this.height * 0.04);
        ctx.fill();
        ctx.stroke();

        ctx.font = `bold ${btn.height * 0.5}px Arial`;
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Продать башню", btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.restore();
    }

    handleClick(x, y) {
        if (!this.visible) return null;
        if (this.selectedTower && this.selectedTower.isFrozen) {
            return null;
        }

        this.#updatePositions();

        const btn = this.sellButton;
        if (
            x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height
        ) {
            return 'sell';
        }

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

        const paddingSide = this.width * 0.03;
        const gap = this.height * 0.045;
        const buttonHeight = this.height * 0.18;
        const headerHeight = this.height * 0.22;

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

        this.sellButton = {
            x: this.x + this.width * 0.35,
            y: this.y + this.height - this.height * 0.12,
            width: this.width * 0.3,
            height: this.height * 0.1
        }
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
        ctx.lineWidth = this.height * 0.009;
        ctx.stroke();

        ctx.font = `bold ${size * 0.8}px Arial`;
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", x, y);
        ctx.restore();
    }
}
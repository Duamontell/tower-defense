export class TowerPanel {
    constructor(ctx, nativeHeight, nativeWidth, balance, onTowerSelect) {
        this.ctx = ctx;
        this.width = nativeWidth * 0.72;
        this.height = nativeHeight * 0.36;
        this.x = (nativeWidth - this.width) / 2;
        this.y = nativeHeight - this.height - nativeHeight * 0.025;
        this.towers = [];
        this.padding = this.width * 0.02;
        this.paddingX = this.width * 0.05;
        this.paddingY = this.height * 0.17;
        this.iconWidth = this.width * 0.14;
        this.iconHeight = this.height * 0.5;
        this.balance = balance;
        this.onTowerSelect = onTowerSelect;
        this.visible = false;
        this.closeSize = this.height * 0.11;
        this.closePadding = this.height * 0.04;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.towerNames = {
            'ArchersTower': 'Башня лучников',
            'MagicianTower': 'Магическая башня',
            'PoisonousTower': 'Отравляющая башня',
            'FreezingTower': 'Замедляющая башня',
            'MortarTower': 'Мортира',
        };
    }

    addTower(tower) {
        this.towers.push(tower);
        this.#updatePositions();
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    draw() {
        if (!this.visible) return;

        this.drawBackground();
        this.#drawCloseButton();
        this.drawTitle();
        this.drawTowers();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.save();

        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        ctx.filter = "blur(6px)";
        ctx.fillRect(this.x + this.width * 0.006, this.y + this.height * 0.01, this.width, this.height);
        ctx.filter = "none";
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height * 0.07);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `bold ${this.height * 0.08}px MedievalSharp, serif`;
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Выберите башню", this.x + this.width / 2, this.y + this.height * 0.07);
        ctx.restore();
    }

    drawTowers() {
        const ctx = this.ctx;

        if (!this.imgCoin) {
            this.imgCoin = new Image();
            this.imgCoin.src = '/images/assets/balance.svg';
        }
        const imgCoin = this.imgCoin;

        for (const tower of this.towers) {
            const canBuild = this.balance() >= tower.price;
            ctx.save();
            ctx.globalAlpha = canBuild ? 1 : 0.4;

            tower.drawIcon(
                ctx,
                tower.panelPosition.x,
                tower.panelPosition.y,
                this.iconWidth,
                this.iconHeight
            );

            ctx.fillStyle = '#3a2a00';
            ctx.textAlign = 'center';

            const towerClassName = tower.constructor.name;
            const towerName = this.towerNames[towerClassName];

            ctx.font = `bold ${this.height * 0.05}px Arial`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                towerName,
                tower.panelPosition.x,
                tower.panelPosition.y + this.iconHeight / 2 + this.height * 0.06
            );

            ctx.font = `bold ${this.height * 0.05}px Arial`;
            ctx.textBaseline = 'middle';

            const priceText = tower.price.toString();

            const priceTextWidth = ctx.measureText(priceText).width;
            const coinSize = this.height * 0.06;
            const totalWidth = coinSize + this.width * 0.01 + priceTextWidth;

            const priceX = tower.panelPosition.x - totalWidth / 2;
            const priceY = tower.panelPosition.y + this.iconHeight / 2 + this.height * 0.15;

            if (imgCoin.complete) {
                ctx.drawImage(imgCoin, priceX, priceY - coinSize / 2 - this.height * 0.01, coinSize, coinSize);
            } else {
                imgCoin.onload = () => {
                    ctx.drawImage(imgCoin, priceX, priceY - coinSize / 2 - this.height * 0.01, coinSize, coinSize);
                };
            }

            ctx.fillText(priceText, priceX + coinSize + this.width * 0.015, priceY);

            ctx.restore();
        }
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

        for (const tower of this.towers) {
            const canBuild = this.balance() >= tower.price;
            if (!canBuild) continue;

            const tx = tower.panelPosition.x;
            const ty = tower.panelPosition.y;
            const halfWidth = this.iconWidth / 2;
            const halfHeight = this.iconHeight / 2;

            if (
                x >= tx - halfWidth &&
                x <= tx + halfWidth &&
                y >= ty - halfHeight &&
                y <= ty + halfHeight
            ) {
                if (this.onTowerSelect) {
                    this.onTowerSelect(tower.constructor);
                }
                return tower;
            }
        }
        return null;
    }

    #updatePositions() {
        const maxWidth = this.width;
        const iconW = this.iconWidth;
        const iconH = this.iconHeight;
        const paddingX = this.paddingX || this.padding;
        const paddingY = this.paddingY || this.padding;

        let x = this.x + paddingX + iconW / 2;
        let y = this.y + iconH / 2 + paddingY + this.height * 0.08;
        const rowHeight = iconH + paddingY;

        for (const tower of this.towers) {
            if (x + iconW / 2 > this.x + maxWidth) {
                x = this.x + paddingX + iconW / 2;
                y += rowHeight;
            }

            tower.panelPosition = { x: x, y: y };
            x += iconW + paddingX;
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

        ctx.font = `bold ${size * 0.8}px Arial`;
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", x, y);
        ctx.restore();
    }
}
export class TowerPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, onTowerSelect) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 300;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 50;
        this.towers = [];
        this.padding = 20;
        this.paddingX = 40;
        this.paddingY = 25;
        this.iconWidth = 150;
        this.iconHeight = 150;
        this.balance = balance;
        this.onTowerSelect = onTowerSelect;
        this.visible = false;
        this.closeSize = 36;
        this.closePadding = 16;
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
        this.drawTitle();
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
        ctx.font = "bold 28px MedievalSharp, serif";
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.fillText("Выберите башню", this.x + this.width / 2, this.y + 36);
        ctx.restore();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';

        const titleX = this.x + this.width / 2;
        const titleY = this.y + 40;

        ctx.fillText('Покупка башен', titleX, titleY);
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

            tower.draw(
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

            ctx.font = '18px Arial';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                towerName,
                tower.panelPosition.x,
                tower.panelPosition.y + this.iconHeight / 2 + 20
            );

            ctx.font = '16px Arial';
            ctx.textBaseline = 'middle';

            const priceText = tower.price.toString();

            const priceTextWidth = ctx.measureText(priceText).width;
            const coinSize = 18;
            const totalWidth = coinSize + 10 + priceTextWidth;

            const priceX = tower.panelPosition.x - totalWidth / 2;
            const priceY = tower.panelPosition.y + this.iconHeight / 2 + 44;

            if (imgCoin.complete) {
                ctx.drawImage(imgCoin, priceX, priceY - coinSize / 2 - 3, coinSize, coinSize);
            } else {
                imgCoin.onload = () => {
                    ctx.drawImage(imgCoin, priceX, priceY - coinSize / 2 - 3, coinSize, coinSize);
                };
            }

            ctx.fillText(priceText, priceX + coinSize + 10, priceY);

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
        let y = this.y + iconH / 2 + paddingY + 30;
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

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", x, y);
        ctx.restore();
    }
}
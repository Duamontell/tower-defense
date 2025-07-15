export class TowerPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, onTowerSelect) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.towers = [];
        this.padding = 10;
        this.iconWidth = 150;
        this.iconHeight = 150;
        this.balance = balance;
        this.onTowerSelect = onTowerSelect;
        this.visible = false;
        this.closeSize = 50;
        this.closePadding = 10;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
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
        this.drawTowers();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawTowers() {
        const ctx = this.ctx;

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

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                tower.price,
                tower.panelPosition.x,
                tower.panelPosition.y + this.iconHeight / 2 + 20
            );

            ctx.restore();
        }
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
        const padding = this.padding;

        let x = this.x + padding + iconW / 2;
        let y = this.y + iconH / 2 + padding;
        const rowHeight = iconH + padding;

        for (const tower of this.towers) {
            if (x + iconW / 2 > this.x + maxWidth) {
                x = this.x + padding + iconW / 2;
                y += rowHeight;
            }

            tower.panelPosition = { x: x, y: y };
            x += iconW + padding;
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

export class EffectPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, cfg) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.effects = [];
        this.padding = 10;
        this.iconWidth = 150;
        this.iconHeight = 150;
        this.balance = balance;
        // this.onEffectSelect = onTowerSelect;
        this.visible = false;
        this.closeSize = 40;
        this.closePadding = 10;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;

        this.cfg = cfg;

        this.iconX = 1450;
        this.iconY = 10;
        this.iconH = 50;
        this.iconW = 50;
        this.iconPadding = 5;

       this.cfg.forEach(effect => {
            let icon = new Image();
            icon.src = effect.icon;
            effect.icon = icon;
            this.effects.push(effect);   
        })
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
        if (!this.visible) {
            this.#drawShopIcon();
            return;
        } 
        this.show()
        this.drawBackground();
        this.#drawCloseButton();
        this.drawEffects();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000B3';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawEffects() {
        const ctx = this.ctx;

        let x = 200;
        let y = 700; //temp decision 

        for (const effect of this.effects) {
            x += 150;
            const canBuild = this.balance() >= effect.price;
            ctx.save();
            ctx.globalAlpha = canBuild ? 1 : 0.4;

            ctx.drawImage(effect.icon, x , y , 100, 100)

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                effect.price,
                x + 50,
                y + 120
            );

            ctx.restore();
        }
    } 

    isClickedOnIcon(x, y) {
        return x >= this.iconX && x <= this.iconX + this.iconW + 2 * this.padding && y >= this.iconY && y <= this.iconY + this.iconH + 2 * this.padding
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        if (
            x >= this.closeX - this.closeSize / 2 &&
            x <= this.closeX + this.closeSize / 2 &&
            y >= this.closeY - this.closeSize / 2 &&
            y <= this.closeY + this.closeSize / 2
        ) {
            this.hide();
            return 'close';
        }

        //Возможно, как пример для переделывания под башни
        /*
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
        }*/
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

    #drawShopIcon() {
        const ctx = this.ctx;
        ctx.fillStyle = '#00000080';
        ctx.fillRect(this.iconX, this.iconY, this.iconW + 2 * this.iconPadding, this.iconH + 2 * this.iconPadding);
        const icon = new Image;
        icon.src = '../../images/assets/cart.png';
        ctx.drawImage(icon, this.iconX + this.iconPadding, this.iconY + this.iconPadding, this.iconW - this.iconPadding, this.iconH - this.iconPadding);
    }
}
export class EffectPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, cfg) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.effects = [];
        this.balance = balance;
        this.visible = false;
        this.closeSize = 40;
        this.closePadding = 10;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.cfg = cfg;
        this.isWaitingForCoords = false;
        this.choosenEffect = null;
        this.iconX = 1450;
        this.iconY = 10;
        this.iconH = 50;
        this.iconW = 50;
        this.padding = 5;
        this.#initialize(cfg);
    }

    #initialize(cfg) {
        this.eX = 350;
        this.eY = 750;
        this.eH = 100;
        this.eW = 100;
        this.interval = 150;
        this.textPadding = 30;
        this.lineH = 20;
        cfg.forEach(effect => {
            let icon = new Image();
            icon.src = effect.icon;
            effect.icon = icon;
            this.effects.push(effect);   
        });
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
        if (this.isWaitingForCoords) {
            this.$drawCancelChoosing();
            return;
        }
        this.show()
        this.drawBackground();
        this.drawTitle();
        this.#drawCloseButton();
        this.drawEffects();
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

        ctx.fillText('Покупка эффектов', titleX, titleY);
    }

    drawEffects() {
        const ctx = this.ctx;

        let x = this.eX;
        let y = this.eY;

        for (const effect of this.effects) {
            const canBuild = this.balance() >= effect.price;
            ctx.save();
            ctx.globalAlpha = canBuild ? 1 : 0.4;

            ctx.drawImage(effect.icon, x, y, this.eW, this.eH)

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                effect.price,
                x + this.eW / 2, 
                y + this.eH + this.textPadding
            );
            effect.description.split('\n').forEach((line, index) => ctx.fillText(line, x + this.eW / 2, y + this.eH + this.textPadding * 2 + index * this.lineH));


            ctx.restore();

            x += this.eW + this.interval;
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

        if (x > this.eX && y > this.eY) {
            x -= this.eX;
            y -= this.eY;
            let sector = Math.trunc(x / (this.eW + this.interval));
            x -= (this.eW + this.interval) * sector;
            let effect = this.effects[sector];
            if (x <= this.eW && y <= this.eH && effect && effect.price <= this.balance()) return effect;
        }
      
        return null;
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
        ctx.fillRect(this.iconX, this.iconY, this.iconW + 2 * this.padding, this.iconH + 2 * this.padding);
        const icon = new Image;
        icon.src = '../../images/assets/cart.png';
        ctx.drawImage(icon, this.iconX + this.padding, this.iconY + this.padding, this.iconW - this.padding, this.iconH - this.padding);
    }

    $drawCancelChoosing() {
        const ctx = this.ctx;
        ctx.fillStyle = '#00000080';
        ctx.fillRect(this.iconX, this.iconY, this.iconW + 2 * this.padding, this.iconH + 2 * this.padding);
        ctx.drawImage(this.choosenEffect.icon, this.iconX + this.padding, this.iconY + this.padding, this.iconW, this.iconH);
        
        const cross = new Image;
        cross.src = '../../images/assets/cross.png';
        ctx.drawImage(cross, this.iconX + this.padding, this.iconY + this.padding, this.iconW, this.iconH);
    }
}


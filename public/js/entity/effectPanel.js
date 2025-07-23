export class EffectPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, cfg) {
        this.ctx = ctx;
        this.width = 900;
        this.height = 270;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 50;
        this.effects = [];
        this.balance = balance;
        this.visible = false;
        this.closeSize = 36;
        this.closePadding = 16;
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
        this.effectNames = {
            'Freezing': 'Замедление',
            'Poison': 'Яд',
            'Bomb': 'Бомба',
        };
        this.#initialize(cfg);

        if (!this.imgCoin) {
            this.imgCoin = new Image();
            this.imgCoin.src = '/images/assets/balance.svg';
        }
    }

    #initialize(cfg) {
        this.eX = 350;
        this.eY = 750;
        this.eH = 100;
        this.eW = 100;
        this.interval = 150;
        this.textPadding = 30;
        this.lineH = 20;
        this.effects = [];
        cfg.forEach(effect => {
            let icon = new Image();
            icon.src = effect.icon;
            effect.icon = icon;
            this.effects.push(effect);
        });
        this.cross = new Image;
        this.cross.src = '../../images/assets/cross.png';
        this.icon = new Image;
        this.icon.src = '../../images/assets/cart.png';
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
        this.drawBackground();
        this.drawTitle();
        this.#drawCloseButton();
        this.drawTitle();
        this.drawEffects();
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
        ctx.fillText("Выберите эффект", this.x + this.width / 2, this.y + 36);
        ctx.restore();
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
        const iconW = 70, iconH = 70;
        const gap = 65;
        const startX = this.x + 70;
        const y = this.y + 90;

        for (let i = 0; i < this.effects.length; i++) {
            const effect = this.effects[i];
            const effectTypeName = effect.name;
            const effectName = this.effectNames[effectTypeName] || effectTypeName;
            const canBuy = this.balance() >= effect.price;

            const x = startX + i * (iconW + gap);

            ctx.save();
            ctx.globalAlpha = canBuy ? 1 : 0.45;

            ctx.fillStyle = "#fffbe6";
            ctx.strokeStyle = "#bfa76f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x - 25, y - 28, iconW + 50, iconH + 110, 16);
            ctx.fill();
            ctx.stroke();

            ctx.drawImage(effect.icon, x, y, iconW, iconH);

            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = canBuy ? "#3a2a00" : "#888";
            ctx.textAlign = 'center';

            ctx.fillText(effectName, x + iconW / 2, y + iconH + 28);

            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            const priceText = effect.price.toString();
            const coinSize = 18;
            const priceY = y + iconH + 60;
            const priceX = x + iconW / 2 + 10;

            if (this.imgCoin.complete) {
                ctx.drawImage(this.imgCoin, priceX - coinSize - 12, priceY - coinSize / 2, coinSize, coinSize);
            }
            ctx.fillStyle = canBuy ? "#3a2a00" : "#bbb";
            ctx.fillText(priceText, priceX + 8, priceY + 1);

            ctx.restore();
        }
    }

    isClickedOnIcon(x, y) {
        return x >= this.iconX && x <= this.iconX + this.iconW + 2 * this.padding && y >= this.iconY && y <= this.iconY + this.iconH + 2 * this.padding
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        // Крестик — по кругу!
        const cx = this.closeX;
        const cy = this.closeY;
        const r = this.closeSize / 2;
        if (Math.hypot(x - cx, y - cy) <= r) {
            this.hide();
            return 'close';
        }

        // Клик по эффекту
        const iconW = 70, iconH = 70, gap = 60;
        const startX = this.x + 70;
        const y0 = this.y + 90;

        for (let i = 0; i < this.effects.length; i++) {
            const x0 = startX + i * (iconW + gap);
            if (
                x >= x0 - 10 && x <= x0 + iconW + 10 &&
                y >= y0 - 10 && y <= y0 + iconH + 80
            ) {
                const effect = this.effects[i];
                if (this.balance() >= effect.price) {
                    return effect;
                }
            }
        }
        return null;
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

    #drawShopIcon() {
        const ctx = this.ctx;
        ctx.fillStyle = '#00000080';
        ctx.fillRect(this.iconX, this.iconY, this.iconW + 2 * this.padding, this.iconH + 2 * this.padding);

        ctx.drawImage(this.icon, this.iconX + this.padding, this.iconY + this.padding, this.iconW - this.padding, this.iconH - this.padding);
    }

    $drawCancelChoosing() {
        const ctx = this.ctx;
        ctx.fillStyle = '#00000080';
        ctx.fillRect(this.iconX, this.iconY, this.iconW + 2 * this.padding, this.iconH + 2 * this.padding);
        ctx.drawImage(this.choosenEffect.icon, this.iconX + this.padding, this.iconY + this.padding, this.iconW, this.iconH);
        ctx.drawImage(this.cross, this.iconX + this.padding, this.iconY + this.padding, this.iconW, this.iconH);
    }
}
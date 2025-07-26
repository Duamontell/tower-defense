export class EnemiesPanel {
    constructor(ctx, nativeHeight, nativeWidth, balance, cfg) {
        this.ctx = ctx;
        this.width = nativeWidth * 0.5;
        this.height = nativeHeight * 0.28;
        this.x = (nativeWidth - this.width) / 2;
        this.y = nativeHeight - this.height - nativeHeight * 0.03;
        this.enemies = [];
        this.balance = balance;
        this.visible = false;
        this.closeSize = this.height * 0.16;
        this.closePadding = this.height * 0.06;
        this.closeX = this.x + this.width - this.closePadding - this.closeSize / 2;
        this.closeY = this.y + this.closePadding + this.closeSize / 2;
        this.cfg = cfg;
        this.iconW = this.width * 0.07;
        this.iconH = this.iconW;
        this.padding = this.width * 0.012;
        this.iconX = nativeWidth - this.iconW - this.width * 0.03;
        this.iconY = nativeHeight - this.iconH - this.height * 0.07;

        this.enemyNames = {};
        this.#initialize(cfg);

        if (!this.imgCoin) {
            this.imgCoin = new Image();
            this.imgCoin.src = '/images/assets/balance.svg';
        }
    }

    #initialize(cfg) {
        this.enemies = [];
        cfg.forEach(enemy => {
            let icon = new Image();
            icon.src = enemy.icon;
            enemy.icon = icon;
            this.enemies.push(enemy);
        });
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
        this.drawTitle();
        this.#drawCloseButton();
        this.drawEnemies();
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.save();

        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        ctx.filter = "blur(6px)";
        ctx.fillRect(this.x + this.width * 0.007, this.y + this.height * 0.015, this.width, this.height);
        ctx.filter = "none";
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = this.width * 0.005;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height * 0.1);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `bold ${this.height * 0.1}px MedievalSharp, serif`;
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Выберите волну врагов", this.x + this.width / 2, this.y + this.height * 0.07);
        ctx.restore();
    }

    drawEnemies() {
        const ctx = this.ctx;
        const cardW = this.width * 0.22;
        const cardH = this.height * 0.62;
        const iconW = cardW * 0.35;
        const iconH = iconW;
        const gap = this.width * 0.02;
        const totalWidth = this.enemies.length * cardW + (this.enemies.length - 1) * gap;
        const startX = this.x + (this.width - totalWidth) / 2;
        const y = this.y + this.height * 0.28;

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            const canBuy = this.balance() >= enemy.price;

            const x = startX + i * (cardW + gap);

            ctx.save();
            ctx.globalAlpha = canBuy ? 1 : 0.45;

            ctx.fillStyle = "#fffbe6";
            ctx.strokeStyle = "#bfa76f";
            ctx.lineWidth = this.width * 0.003;
            ctx.beginPath();
            ctx.roundRect(x, y, cardW, cardH, this.height * 0.08);
            ctx.fill();
            ctx.stroke();

            ctx.drawImage(enemy.icon, x + (cardW - iconW) / 2, y + this.height * 0.09, iconW, iconH);

            ctx.font = `bold ${this.height * 0.07}px Arial`;
            ctx.fillStyle = canBuy ? "#3a2a00" : "#888";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(enemy.name, x + cardW / 2, y + iconH + this.height * 0.14);

            ctx.font = `${this.height * 0.07}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const priceText = enemy.price.toString();
            const coinSize = this.height * 0.08;
            const priceY = y + cardH - this.height * 0.09;
            const priceX = x + cardW / 2 + coinSize * 0.5;

            if (this.imgCoin.complete) {
                ctx.drawImage(this.imgCoin, priceX - coinSize - this.height * 0.04, priceY - coinSize / 2, coinSize, coinSize);
            }
            ctx.fillStyle = canBuy ? "#3a2a00" : "#bbb";
            ctx.fillText(priceText, priceX + this.height * 0.03, priceY + 1);

            ctx.restore();
        }
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        const cx = this.closeX;
        const cy = this.closeY;
        const r = this.closeSize / 2;
        if (Math.hypot(x - cx, y - cy) <= r) {
            this.hide();
            return 'close';
        }

        const cardW = this.width * 0.22;
        const cardH = this.height * 0.62;
        const gap = this.width * 0.02;
        const totalWidth = this.enemies.length * cardW + (this.enemies.length - 1) * gap;
        const startX = this.x + (this.width - totalWidth) / 2;
        const y0 = this.y + this.height * 0.21;

        for (let i = 0; i < this.enemies.length; i++) {
            const x0 = startX + i * (cardW + gap);
            if (
                x >= x0 && x <= x0 + cardW &&
                y >= y0 && y <= y0 + cardH
            ) {
                const enemy = this.enemies[i];
                if (this.balance() >= enemy.price) {
                    return enemy;
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
        ctx.lineWidth = this.width * 0.004;
        ctx.stroke();

        ctx.font = `bold ${size * 0.8}px Arial`;
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", x, y);
        ctx.restore();
    }
}
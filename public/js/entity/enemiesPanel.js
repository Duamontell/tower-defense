export class EnemiesPanel {
    constructor(ctx, canvasWidth, canvasHeight, balance, cfg) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 350;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height;
        this.baseOwnerId = null;     
        this.enemies = [];
        this.balance = balance;
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
        this.padding = 5;
        this.#initialize(cfg);
    }

    #initialize(cfg) {
        this.interval = 100;
        this.eX = this.x + this.interval;
        this.eY = this.y + 85;
        this.eH = 100;
        this.eW = 100;
        cfg.forEach(enemy => {
            let icon = new Image();
            icon.src = enemy.icon;
            enemy.icon = icon;
            this.enemies.push(enemy);   
        });
        this.imgCoin = new Image;
        this.imgCoin.src = '/images/assets/balance.svg';
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    draw() {
        if (!this.visible) return;
        
        this.show()
        this.drawBackground();
        this.drawTitle();
        this.#drawCloseButton();
        this.drawEnemies();
    }

        drawTitle() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "bold 28px MedievalSharp, serif";
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.fillText("Призвать дополнительную волну", this.x + this.width / 2, this.y + 36);
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

    drawEnemies() {
        const ctx = this.ctx;

        let x = this.eX;
        let y = this.eY;

        for (const enemy of this.enemies) {
            const canBuy = this.balance() >= enemy.price;
            ctx.save();
            ctx.globalAlpha = canBuy ? 1 : 0.4;


            ctx.fillStyle = "#fffbe6";
            ctx.strokeStyle = "#bfa76f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x - 25, y - 28, this.eW + 50, this.eH + 110, 16);
            ctx.fill();
            ctx.stroke();

            ctx.drawImage(enemy.icon, x, y, this.eW, this.eH);


            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = canBuy ? "#3a2a00" : "#888";
            ctx.textAlign = 'center';
            ctx.fillText(enemy.name, x + this.eW / 2, y + this.eH + 28);

            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            const priceText = enemy.price.toString();
            const coinSize = 18;
            const priceY = y + this.eH + 60;
            const priceX = x + this.eW / 2 + 10;

            if (this.imgCoin.complete) {
                ctx.drawImage(this.imgCoin, priceX - coinSize - 12, priceY - coinSize / 2, coinSize, coinSize);
            }
            ctx.fillStyle = canBuy ? "#3a2a00" : "#bbb";
            ctx.fillText(priceText, priceX + 8, priceY + 1);

            ctx.restore();

            x += this.eW + this.interval;
        }
    } 

    isClickedOnIcon(x, y) {
        return x >= this.iconX && x <= this.iconX + this.iconW + 2 * this.padding && y >= this.iconY && y <= this.iconY + this.iconH + 2 * this.padding;
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
            let enemy = this.enemies[sector];
            if (x <= this.eW && y <= this.eH && enemy && enemy.price <= this.balance()) return enemy;
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
}


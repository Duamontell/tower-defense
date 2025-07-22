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
        this.eX = 350;
        this.eY = 750;
        this.eH = 100;
        this.eW = 100;
        this.interval = 100;
        this.textPadding = 30;
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
        
        this.show()
        this.drawBackground();
        this.drawTitle();
        this.#drawCloseButton();
        this.drawEnemies();
    }

    drawTitle() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';

        const titleX = this.x + this.width / 2;
        const titleY = this.y + 40;

        let temp = this.baseOwnerId

        ctx.fillText('Призвать дополнительную волну', titleX, titleY);
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000B3';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawEnemies() {
        const ctx = this.ctx;

        let x = this.eX;
        let y = this.eY;

        for (const enemy of this.enemies) {
            const canBuild = this.balance() >= enemy.price;
            ctx.save();
            ctx.globalAlpha = canBuild ? 1 : 0.4;

            ctx.drawImage(enemy.icon, x, y, this.eW, this.eH);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                enemy.price,
                x + this.eW / 2, 
                y + this.eH + this.textPadding
            );

            enemy.description.split('\n').forEach((line, index) => ctx.fillText(line, x + this.eW / 2, y + this.eH + this.textPadding * 2 + index * 20)) //50 = lineheight

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
}


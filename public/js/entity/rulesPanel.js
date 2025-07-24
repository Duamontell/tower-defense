export class RulesPanel {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.width = 900;
        this.height = 900;
        this.x = (canvasWidth - this.width) / 2;
        this.y = (canvasHeight - this.height) / 2;
        this.visible = false;
        this.padding = 5;
        this.closeSize = 36;
        this.closeX = this.x + this.width - this.closeSize - 16;
        this.closeY = this.y + 16;
        this.iconX = 1350;
        this.iconY = 10;
        this.iconH = 60;
        this.iconW = 60;

        this.icons = {
            help: this.loadIcon('../../images/assets/help.png'),
            archer: this.loadIcon('/images/tower/TowerArchers.webp'),
            magic: this.loadIcon('../../images/tower/TowerMagicians.webp'),
            poison: this.loadIcon('/images/tower/MortarTower.webp'),
            slow: this.loadIcon('/images/tower/MortarTower.webp'),
            mine: this.loadIcon('/images/tower/MortarTower.webp'),
            freeze: this.loadIcon('/images/projectiles/freeze/freeze1.png'),
            poisonEff: this.loadIcon('/images/projectiles/poison/poison1.png'),
            bomb: this.loadIcon('/images/projectiles/bomb/bomb8.png')
        };
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    loadIcon(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    draw() {
        if (!this.visible) {
            this.#drawRulesIcon();
            return;
        }

        this.show();

        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.98;
        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 24);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.font = "bold 28px MedievalSharp, serif";
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.fillText("Правила игры:", this.x + this.width / 2, this.y + 48);

        ctx.beginPath();
        ctx.arc(this.closeX + this.closeSize / 2, this.closeY + this.closeSize / 2, this.closeSize / 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#e6c97a";
        ctx.fill();
        ctx.strokeStyle = "#bfa76f";
        ctx.stroke();
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", this.closeX + this.closeSize / 2, this.closeY + this.closeSize / 2);

        // Основной текст
        ctx.textAlign = "left";
        let tx = this.x + 36, ty = this.y + 90, lh = 30;
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Как играть:", tx, ty);
        ty += lh;
        ctx.font = "18px Arial";
        ctx.fillText("Как поставить башню: кликните на зону на карте → выберите башню.", tx, ty);
        ty += lh;
        ctx.fillText("Как улучшить башню: кликните на башню → выберите улучшение.", tx, ty);
        ty += lh;
        ctx.fillText("Как купить эффект: кликните на корзинку → выберите эффект → выберите место на карте.", tx, ty);
        ty += lh;
        ctx.fillText("Как направить врагов на соперника: кликните на крепость соперника → выберите волну врагов.", tx, ty);
        ty += lh * 1.5;

        // Типы башен
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Типы башен:", tx, ty);
        ty += lh;
        let bx = tx + 10, by = ty;
        const towers = [
            { icon: this.icons.archer, text: "Башня лучников — точный урон по одной цели стрелами." },
            { icon: this.icons.magic, text: "Магическая башня — магический урон по одной цели." },
            { icon: this.icons.poison, text: "Отравляющая башня — периодический урон ядом на участке." },
            { icon: this.icons.slow, text: "Замедляющая башня — замедляет врагов на участке." },
            { icon: this.icons.mine, text: "Мортира — уничтожает врагов в области взрыва." }
        ];
        towers.forEach(t => {
            if (t.icon.complete) {
                ctx.drawImage(t.icon, bx, by - 18, 28, 28);
            }
            ctx.font = "16px Arial";
            ctx.fillStyle = "#3a2a00";
            ctx.fillText(t.text, bx + 36, by);
            by += lh;
        });
        ty = by + lh * 0.5;

        // Улучшения башен
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Улучшения башен:", tx, ty);
        ty += lh;
        ctx.font = "16px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Каждая башня может быть улучшена за монеты.", tx, ty);
        ty += lh;
        ctx.fillText("Улучшения увеличивают урон, радиус действия, скорость стрельбы.", tx, ty);
        ty += lh * 1.5;

        // Эффекты
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Эффекты:", tx, ty);
        ty += lh;
        const effects = [
            { icon: this.icons.freeze, text: "Замедление — замедляет врагов." },
            { icon: this.icons.poisonEff, text: "Яд — наносит урон ядом." },
            { icon: this.icons.bomb, text: "Бомба — наносит урон взрывом." }
        ];
        by = ty;
        effects.forEach(e => {
            if (e.icon.complete) {
                ctx.drawImage(e.icon, bx, by - 18, 28, 28);
            }
            ctx.font = "16px Arial";
            ctx.fillStyle = "#3a2a00";
            ctx.fillText(e.text, bx + 36, by);
            by += lh;
        });
        ty = by + lh * 0.5;

        // Ресурсы
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Ресурсы:", tx, ty);
        ty += lh;
        ctx.font = "16px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("За уничтожение врагов вы будете получать денежное вознаграждение.", tx, ty);
        ty += lh;
        ctx.fillText("Используйте их для строительства и улучшений.", tx, ty);
        ty += lh * 1.2;

        // Дополнительные волны врагов
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Дополнительные волны врагов:", tx, ty);
        ty += lh;
        ctx.font = "16px Arial";
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Вы можете покупать и отправлять дополнительные волны врагов на соперников за монеты.", tx, ty);
        ty += lh;
        ctx.fillText("Для этого кликните на крепость соперника и выберите нужную волну.", tx, ty);
    }

    handleClick(x, y) {
        if (!this.visible) return null;

        const cx = this.closeX + this.closeSize / 2;
        const cy = this.closeY + this.closeSize / 2;
        const r = this.closeSize / 2;

        if (Math.hypot(x - cx, y - cy) <= r) {
            this.hide();
            return 'close';
        }

        return null;
    }

    isClickedOnIcon(x, y) {
        return x >= this.iconX && x <= this.iconX + this.iconW + 2 * this.padding && y >= this.iconY && y <= this.iconY + this.iconH + 2 * this.padding
    }

    #drawRulesIcon() {
        const ctx = this.ctx;
        const icon = new Image;
        icon.src = '../../images/assets/help.png';
        ctx.drawImage(this.icons.help, this.iconX + this.padding, this.iconY + this.padding, this.iconW - this.padding, this.iconH - this.padding);
    }
}

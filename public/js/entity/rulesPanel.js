export class RulesPanel {
    constructor(ctx, nativeHeight, nativeWidth) {
        this.ctx = ctx;
        this.width = nativeWidth * 0.6;
        this.height = nativeHeight * 0.95;
        this.x = (nativeWidth - this.width) / 2;
        this.y = (nativeHeight - this.height) / 2;
        this.visible = false;
        this.padding = this.width * 0.015;
        this.closeSize = this.height * 0.05;
        this.closeX = this.x + this.width - this.closeSize - this.width * 0.02;
        this.closeY = this.y + this.height * 0.02;
        this.iconW = this.width * 0.06;
        this.iconH = this.iconW;
        this.iconX = nativeWidth - this.iconW - this.width * 0.01;
        this.iconY = this.height * 0.01;

        this.icons = {
            help: this.loadIcon('../../images/assets/help.png'),
            archer: this.loadIcon('/images/tower/TowerArchers.webp'),
            magic: this.loadIcon('../../images/tower/TowerMagicians.webp'),
            poison: this.loadIcon('/images/tower/TowerPoison.webp'),
            slow: this.loadIcon('/images/tower/TowerFreezing.webp'),
            mine: this.loadIcon('/images/tower/MortarTower.webp'),
            freeze: this.loadIcon('/images/projectiles/freeze/freeze1.png'),
            poisonEff: this.loadIcon('/images/projectiles/poison/poison1.png'),
            bomb: this.loadIcon('/images/projectiles/bomb/bomb8.png'),
            freezingTower: this.loadIcon('/images/assets/freezingIcon.svg')
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

        const ctx = this.ctx;
        ctx.save();

        ctx.globalAlpha = 0.98;
        ctx.fillStyle = "#fffbe6";
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = this.width * 0.005;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height * 0.04);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.font = `bold ${this.height * 0.025}px MedievalSharp, serif`;
        ctx.fillStyle = "#7a5c1b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Правила игры:", this.x + this.width / 2, this.y + this.height * 0.03);

        ctx.beginPath();
        ctx.arc(this.closeX + this.closeSize / 2, this.closeY + this.closeSize / 2, this.closeSize / 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#e6c97a";
        ctx.fill();
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = this.width * 0.004;
        ctx.stroke();
        ctx.font = `bold ${this.closeSize * 0.75}px Arial`;
        ctx.fillStyle = "#5a3e00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×", this.closeX + this.closeSize / 2, this.closeY + this.closeSize / 2);

        ctx.textAlign = "left";
        let tx = this.x + this.width * 0.04;
        let ty = this.y + this.height * 0.09;
        let lh = this.height * 0.03;

        // Как играть
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Как играть:", tx, ty);
        ty += lh;
        ctx.font = `${this.height * 0.015}px Arial`;
        ctx.fillText("Как поставить башню: кликните на зону на карте → выберите башню.", tx, ty);
        ty += lh;
        ctx.fillText("Как улучшить башню: кликните на башню → выберите улучшение.", tx, ty);
        ty += lh;
        ctx.fillText("Как купить эффект: кликните на корзинку → выберите эффект → выберите место на карте.", tx, ty);
        ty += lh;
        ctx.fillText("Как направить врагов на соперника: кликните на крепость соперника → выберите волну врагов.", tx, ty);
        ty += lh;
        ctx.fillText("Как заморозить башню соперника: кликните на корзинку → выберите заморозку → выберите башню соперника.", tx, ty);
        ty += lh * 1.2;

        // Типы башен
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Типы башен:", tx, ty);
        ty += lh;
        let bx = tx + this.width * 0.012;
        let by = ty * 1.03;
        const iconSize = this.height * 0.05;
        const towers = [
            { icon: this.icons.archer, text: "Башня лучников — точный урон по одной цели стрелами." },
            { icon: this.icons.magic, text: "Магическая башня — магический урон по одной цели." },
            { icon: this.icons.poison, text: "Отравляющая башня — периодический урон ядом на участке." },
            { icon: this.icons.slow, text: "Замедляющая башня — замедляет врагов на участке." },
            { icon: this.icons.mine, text: "Мортира — уничтожает врагов в области взрыва." }
        ];
        towers.forEach(t => {
            if (t.icon.complete) {
                ctx.drawImage(t.icon, bx, by - iconSize / 2, iconSize, iconSize);
            }
            ctx.font = `${this.height * 0.015}px Arial`;
            ctx.fillStyle = "#3a2a00";
            ctx.fillText(t.text, bx + iconSize + this.width * 0.012, by);
            by += lh * 1.4;
        });
        ty = by + lh * 0.5;

        // Улучшения башен
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Улучшения башен:", tx, ty);
        ty += lh;
        ctx.font = `${this.height * 0.015}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Каждая башня может быть улучшена за монеты.", tx, ty);
        ty += lh;
        ctx.fillText("Улучшения увеличивают урон, радиус действия, скорость стрельбы.", tx, ty);
        ty += lh * 1.3;

        // Эффекты
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Эффекты:", tx, ty);
        ty += lh;
        const effectIconSize = this.height * 0.032;
        by = ty * 1.01;
        const effects = [
            { icon: this.icons.freeze, text: "Замедление — замедляет врагов." },
            { icon: this.icons.poisonEff, text: "Яд — наносит урон ядом." },
            { icon: this.icons.bomb, text: "Бомба — наносит урон взрывом." },
            { icon: this.icons.freezingTower, text: "Заморозка - замораживает башню соперника." }
        ];
        effects.forEach(e => {
            if (e.icon.complete) {
                ctx.drawImage(e.icon, bx, by - effectIconSize / 2, effectIconSize, effectIconSize);
            }
            ctx.font = `${this.height * 0.015}px Arial`;
            ctx.fillStyle = "#3a2a00";
            ctx.fillText(e.text, bx + effectIconSize + this.width * 0.012, by);
            by += lh * 1.4;
        });
        ty = by + lh * 0.2;

        // Ресурсы
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Ресурсы:", tx, ty);
        ty += lh;
        ctx.font = `${this.height * 0.015}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("За уничтожение врагов вы будете получать денежное вознаграждение.", tx, ty);
        ty += lh;
        ctx.fillText("Используйте их для строительства и улучшений.", tx, ty);
        ty += lh * 1.2;

        // Дополнительные волны врагов
        ctx.font = `bold ${this.height * 0.02}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Дополнительные волны врагов:", tx, ty);
        ty += lh;
        ctx.font = `${this.height * 0.015}px Arial`;
        ctx.fillStyle = "#3a2a00";
        ctx.fillText("Вы можете покупать и отправлять дополнительные волны врагов на соперников за монеты.", tx, ty);

        ctx.restore();
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
        return (
            x >= this.iconX &&
            x <= this.iconX + this.iconW + 2 * this.padding &&
            y >= this.iconY &&
            y <= this.iconY + this.iconH + 2 * this.padding
        );
    }

    #drawRulesIcon() {
        const ctx = this.ctx;
        const r = this.iconW / 2;
        const cx = this.iconX + r;
        const cy = this.iconY + r;

        ctx.save();


        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,251,230,0.98)";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#bfa76f";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.icons.help.complete) {
            ctx.drawImage(
                this.icons.help,
                cx - this.iconW / 2,
                cy - this.iconH / 2,
                this.iconW,
                this.iconH
            );
        }

        ctx.restore();
    }
}
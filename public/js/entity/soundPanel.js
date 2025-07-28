export class SoundPanel {
    constructor(ctx, nativeHeight, nativeWidth) {
        this.ctx = ctx;
        this.width = nativeWidth * 0.6;
        this.height = nativeHeight * 0.9;
        this.x = (nativeWidth - this.width) / 2;
        this.y = (nativeHeight - this.height) / 2;
        this.isMuted = true;
        this.padding = this.width * 0.015;
        this.iconW = this.width * 0.06;
        this.iconH = this.iconW;
        this.iconX = nativeWidth - this.iconW - this.width * 0.10;
        this.iconY = this.height * 0.01;

        this.icons = {
            on: this.loadIcon('../../images/assets/speakers_on.png'),
            off: this.loadIcon('../../images/assets/speakers_off.png')
        };

        this.sounds = [
            this.getSound('background'),
            this.getSound('fireball'),
            this.getSound('archers'),
            this.getSound('freeze'),
            this.getSound('explosion')
        ];

        this.sounds.forEach(sound => {
            sound.volume = 0;
        });
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

    getSound(id) {
        return document.getElementById(id);
    }

    draw() {
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

        if (this.icons.on.complete && this.icons.off.complete) {
            ctx.drawImage(
                (this.isMuted) ? this.icons.off : this.icons.on,
                cx - this.iconW / 2,
                cy - this.iconH / 2,
                this.iconW,
                this.iconH
            );
        }

        ctx.restore();
    }

    handleSound() {
        this.isMuted = !this.isMuted;
        this.sounds.forEach(sound => {
            if (!this.isMuted) {
                switch (sound.id) {
                    case 'background': 
                        sound.volume = 0.5;
                        sound.play();
                        break;
                    case 'archers':
                        sound.volume = 1;
                        break;
                    case 'fireball':
                        sound.volume = 1;
                        break;
                    case 'explosion': 
                        sound.volume = 0.3;
                        break;
                    case 'freeze':
                        sound.volume = 0.7;
                        break;
                    case 'poison':
                        sound.volume = 1;
                        break;
                    default:
                        sound.volume = 1;
                }
            } else {
                sound.volume = 0
            }
        });
    }

    isClickedOnIcon(x, y) {
        return (
            x >= this.iconX &&
            x <= this.iconX + this.iconW + 2 * this.padding &&
            y >= this.iconY &&
            y <= this.iconY + this.iconH + 2 * this.padding
        );
    }
}
export class TowerPanel {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.width = 1000;
        this.height = 320;
        this.x = (canvasWidth - this.width) / 2; 
        this.y = canvasHeight - this.height;
        this.towers = [];
        this.padding = 10;
        this.iconWidth = 150;
        this.iconHeight = 150;
    }

    addTower(tower) {
        this.towers.push(tower);
        this.#updatePositions();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    
        for (const tower of this.towers) {
            tower.draw(this.ctx, tower.panelPosition.x, tower.panelPosition.y, this.iconWidth, this.iconHeight);
        }
    }
    
    handleClick(x, y) {
        for (const tower of this.towers) {
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
    }
}
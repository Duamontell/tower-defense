export class Camera {
    constructor(x, y, width, height, scale = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
    }

    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * this.scale,
            y: (wy - this.y) * this.scale
        }
    }

    screenToWorld(sx, sy) {
        return {
            x: sx / this.scale + this.x,
            y: sy / this.scale + this.y
        };
    }

    clampToBounds(mapWidth, mapHeight) {
        const viewWidth = this.width / this.scale;
        const viewHeight = this.height / this.scale;

        // X
        if (viewWidth >= mapWidth) {
            this.x = (mapWidth - viewWidth) / 2;
        } else {
            this.x = Math.max(0, Math.min(this.x, mapWidth - viewWidth));
        }

        // Y
        if (viewHeight >= mapHeight) {
            this.y = (mapHeight - viewHeight) / 2;
        } else {
            this.y = Math.max(0, Math.min(this.y, mapHeight - viewHeight));
        }
    }
}
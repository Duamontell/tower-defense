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
}
export function initCanvasResizer(canvas, nativeWidth, nativeHeight, camera, clampCamera) {
    function resizeCanvas() {
        const scale = Math.min(
            window.innerWidth / nativeWidth,
            window.innerHeight / nativeHeight,
            1
        );

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (camera) {
            camera.width = canvas.width;
            camera.height = canvas.height;
            camera.scale = scale;
            camera.x = (nativeWidth - camera.width / camera.scale) / 2;
            camera.y = (nativeHeight - camera.height / camera.scale) / 2;
            if (clampCamera) clampCamera();
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}
export function initCanvasResizer(canvas, nativeWidth, nativeHeight) {
    function resizeCanvas() {
        const scale = Math.min(
            window.innerWidth  / nativeWidth,
            window.innerHeight / nativeHeight
        );
        canvas.style.transform = `scale(${scale})`;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // return resizeCanvas;
}

export function initCameraControls(
    canvas,
    camera,
    clampCamera,
    getClickCoordinates,
    minScale = 0.5,
    maxScale = 2
) {
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - lastMouse.x) / camera.scale;
        const dy = (e.clientY - lastMouse.y) / camera.scale;
        camera.x -= dx;
        camera.y -= dy;
        lastMouse = { x: e.clientX, y: e.clientY };
        clampCamera();
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleFactor = 1.1;
        const mouse = getClickCoordinates(canvas, e);

        const worldBefore = camera.screenToWorld(mouse.x, mouse.y);

        if (e.deltaY < 0) {
            camera.scale *= scaleFactor;
        } else {
            camera.scale /= scaleFactor;
        }
        camera.scale = Math.max(minScale, Math.min(maxScale, camera.scale));

        const worldAfter = camera.screenToWorld(mouse.x, mouse.y);

        camera.x += worldBefore.x - worldAfter.x;
        camera.y += worldBefore.y - worldAfter.y;

        clampCamera();
    }, { passive: false });
}
export function onMouseMove(event, canvas, linkWidth, linkX, linkY) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const linkHeight = 48;

    return (
        x >= linkX - linkWidth / 2 &&
        x <= linkX + linkWidth / 2 &&
        y >= linkY - linkHeight &&
        y <= linkY
    );
}

export function onClick(inLink) {
    console.log(inLink);
    if (inLink) {
        window.location.href = '/menu';
    }
}

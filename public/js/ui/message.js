let inLink = false;

export function drawGameMessage(canvas, ctx, message) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

export function drawHyperGameMessage(canvas, ctx, linkText) {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    let linkX = canvas.width / 2;
    let linkY = canvas.height / 2 + 100;
    ctx.fillText(linkText, linkX, linkY);
    let linkWidth = ctx.measureText(linkText).width;

    canvas.addEventListener('mousemove', e => {
        inLink = onMouseMove(e, canvas, linkWidth, linkX, linkY);
        canvas.style.cursor = inLink ? 'pointer' : 'default';
    }, false);
    canvas.addEventListener("click", () => onClick(inLink), false)
    ctx.restore();
}

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

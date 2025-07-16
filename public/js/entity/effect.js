export class Effect {
    constructor(posiiton, radius, duration) {
        this.posiiton = posiiton;
        this.radius = radius;
        this.duration = duration;
        this.images = [];
    }
}

export class FireEffect extends Effect{
    constructor(posiiton, cfg) {
        super(posiiton, cfg.radius, cfg.duration);
        cfg.imageSrcs.forEach(imageSrc => {
            let frame = new Image();
            frame.src = imageSrc;
            this.images.push(frame);
        });
        this.damage = cfg.damage;
    }
}
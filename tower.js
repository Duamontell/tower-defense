class Tower {
    constructor(name, damage, radius, price, position, attackType, color) {
        this.name = name;
        this.damage = damage;
        this.radius = radius;
        this.price = price;
        this.position = position;
        this.attackType = attackType;
        this.colorForDraw = color || 'gray';
    }

    draw(ctx) {
        ctx.fillStyle = this.colorForDraw;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ArchersTower extends Tower {
    constructor(position) {
        super('Archers', 10, 100, 50, position, 'single', 'red');
        this.projectileSpeed = 5;
        this.fireRate = 1;
    }
}

class MagicianTower extends Tower {
    constructor(position) {
        super('Magician', 20, 100, 150, position, 'single', 'green');
        this.projectileSpeed = 5;
        this.fireRate = 1;
    }
}

class MortarTower extends Tower {
    constructor(position) {
        super('Mortar', 60, 150, 300, position, 'area', 'black');
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const towerTypes = [ArchersTower, MagicianTower, MortarTower];
let nextTowerIndex = 0;

// function createTowerAtPosition(position) {
//     const TowerClass = towerTypes[nextTowerIndex];
//     nextTowerIndex = (nextTowerIndex + 1) % towerTypes.length;
//     return new TowerClass(position);
// }

const towers = [
    new ArchersTower({ x: 150, y: 150 }),
    new MagicianTower({ x: 150, y: 200 }),
    new MortarTower({ x: 150, y: 250 })
];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    towers.forEach(tower => tower.draw(ctx));
}

// canvas.addEventListener('click', function(event) {
//     const rect = canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     const tower = createTowerAtPosition({x, y});
//     towers.push(tower);

//     draw();
// });

draw();


export const towerUpgrades = [
    {
        name: 'Урон',
        descriptions: ['+10 урона', '+15 урона', '+20 урона', '+25 урона', '+30 урона'],
        costs: [20, 30, 40, 50, 60],
        iconSrc: '/images/assets/damage.png',
        applyLevels: [
            (tower) => { tower.damage += 10; },
            (tower) => { tower.damage += 15; },
            (tower) => { tower.damage += 20; },
            (tower) => { tower.damage += 25; },
            (tower) => { tower.damage += 30; },
        ]
    },
    {
        name: 'Радиус',
        descriptions: ['+30 к радиусу', '+50 к радиусу'],
        costs: [50, 80],
        iconSrc: '/images/assets/radius.png',
        applyLevels: [
            (tower) => { tower.radius += 30; },
            (tower) => { tower.radius += 50; },
        ]
    },
    {
        name: 'Перезарядка',
        descriptions: ['-0,5 сек к перезарядке', '-1 сек к перезарядке'],
        costs: [100, 130],
        iconSrc: '/images/assets/cooldown.png',
        applyLevels: [
            (tower) => { tower.cooldown = Math.max(1, tower.cooldown - 0.5); },
            (tower) => { tower.cooldown = Math.max(1, tower.cooldown - 1); },
        ]
    }
];

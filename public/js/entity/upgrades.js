export const towerUpgradesByType = {
    Archers: [
        {
            name: 'Урон',
            descriptions: ['+20 урона', '+30 урона', '+40 урона', '+40 урона', '+50 урона'],
            costs: [10, 10, 20, 20, 30],
            iconSrc: '/images/assets/damage.png',
            applyLevels: [
                (tower) => { tower.damage += 20; },
                (tower) => { tower.damage += 30; },
                (tower) => { tower.damage += 40; },
                (tower) => { tower.damage += 40; },
                (tower) => { tower.damage += 50; },
            ]
        },
        {
            name: 'Скорострельность',
            descriptions: ['-0.4 сек к перезарядке', '-0.6 сек к перезарядке'],
            costs: [40, 60],
            iconSrc: '/images/assets/cooldown.png',
            applyLevels: [
                (tower) => { tower.cooldown = Math.max(0.4, tower.cooldown - 0.4); },
                (tower) => { tower.cooldown = Math.max(0.6, tower.cooldown - 0.6); },
            ]
        },
        {
            name: 'Радиус',
            descriptions: ['+40 к радиусу', '+70 к радиусу'],
            costs: [15, 30],
            iconSrc: '/images/assets/radius.png',
            applyLevels: [
                (tower) => { tower.radius += 40; },
                (tower) => { tower.radius += 70; },
            ]
        }
    ],
    Magicians: [
        {
            name: 'Урон',
            descriptions: ['+80 урона', '+100 урона', '+150 урона'],
            costs: [40, 50, 60],
            iconSrc: '/images/assets/damage.png',
            applyLevels: [
                (tower) => { tower.damage += 100; },
                (tower) => { tower.damage += 100; },
                (tower) => { tower.damage += 150; },
            ]
        },
        {
            name: 'Скорострельность',
            descriptions: ['-0.3 сек к перезарядке', '-0.5 сек к перезарядке'],
            costs: [40, 60],
            iconSrc: '/images/assets/cooldown.png',
            applyLevels: [
                (tower) => { tower.cooldown = Math.max(0.3, tower.cooldown - 0.3); },
                (tower) => { tower.cooldown = Math.max(0.2, tower.cooldown - 0.5); },
            ]
        },
        {
            name: 'Радиус',
            descriptions: ['+50 к радиусу', '+80 к радиусу'],
            costs: [25, 35],
            iconSrc: '/images/assets/radius.png',
            applyLevels: [
                (tower) => { tower.radius += 50; },
                (tower) => { tower.radius += 80; },
            ]
        }
    ],
    Poisonous: [
        {
            name: 'Урон от яда',
            descriptions: ['+5 урона', '+5 урона', '+10 урона', '+10 урона', '+15 урона'],
            costs: [20, 25, 25, 40, 65],
            iconSrc: '/images/assets/poison.png',
            applyLevels: [
                (tower) => { tower.attackCfg.poisonDamage = (tower.attackCfg.poisonDamage || 0) + 5; },
                (tower) => { tower.attackCfg.poisonDamage += 5; },
                (tower) => { tower.attackCfg.poisonDamage += 10; },
                (tower) => { tower.attackCfg.poisonDamage += 10; },
                (tower) => { tower.attackCfg.poisonDamage += 15; },
            ]
        },
        {
            name: 'Длительность яда',
            descriptions: ['+1 сек к длительности', '+2 сек к длительности'],
            costs: [40, 60],
            iconSrc: '/images/assets/duration.png',
            applyLevels: [
                (tower) => { tower.attackCfg.poisonDuration = (tower.attackCfg.poisonDuration || 2) + 1; },
                (tower) => { tower.attackCfg.poisonDuration += 2; },
            ]
        },
        {
            name: 'Радиус',
            descriptions: ['+30 к радиусу', '+60 к радиусу'],
            costs: [30, 60],
            iconSrc: '/images/assets/radius.png',
            applyLevels: [
                (tower) => { tower.radius += 30; },
                (tower) => { tower.radius += 60; },
            ]
        }
    ],
    Freezing: [
        {
            name: 'Сила замедления',
            descriptions: ['-10% к скорости врага', '-15% к скорости врага', '-20% к скорости врага'],
            costs: [30, 50, 70],
            iconSrc: '/images/assets/slow.png',
            applyLevels: [
                (tower) => { tower.slowness = (tower.slowness || 0) + 0.10; },
                (tower) => { tower.slowness += 0.05; },
                (tower) => { tower.slowness += 0.05; },
            ]
        },
        {
            name: 'Длительность замедления',
            descriptions: ['+1 сек', '+2 сек'],
            costs: [40, 60],
            iconSrc: '/images/assets/duration.png',
            applyLevels: [
                (tower) => { tower.slowDuration = (tower.slowDuration || 2) + 1; },
                (tower) => { tower.slowDuration += 1; },
            ]
        },
        {
            name: 'Радиус',
            descriptions: ['+30 к радиусу', '+50 к радиусу'],
            costs: [30, 50],
            iconSrc: '/images/assets/radius.png',
            applyLevels: [
                (tower) => { tower.radius += 30; },
                (tower) => { tower.radius += 50; },
            ]
        },
    ],
    Mortar: [
        {
            name: 'Урон',
            descriptions: ['+50 урона', '+50 урона', '+100 урона'],
            costs: [40, 60, 80],
            iconSrc: '/images/assets/damage.png',
            applyLevels: [
                (tower) => { tower.damage += 20; },
                (tower) => { tower.damage += 50; },
                (tower) => { tower.damage += 100; },
            ]
        },
        {
            name: 'Радиус взрыва',
            descriptions: ['+30 к радиусу взрыва', '+50 к радиусу взрыва'],
            costs: [60, 90],
            iconSrc: '/images/assets/explosion.png',
            applyLevels: [
                (tower) => { tower.attackCfg.explosionRadius = (tower.attackCfg.explosionRadius || 0) + 30; },
                (tower) => { tower.attackCfg.explosionRadius += 50; },
            ]
        },
        {
            name: 'Перезарядка',
            descriptions: ['-0.4 сек к перезарядке', '-0.6 сек к перезарядке'],
            costs: [70, 100],
            iconSrc: '/images/assets/cooldown.png',
            applyLevels: [
                (tower) => { tower.cooldown = Math.max(0.4, tower.cooldown - 0.4); },
                (tower) => { tower.cooldown = Math.max(0.6, tower.cooldown - 0.6); },
            ]
        }
    ]
};
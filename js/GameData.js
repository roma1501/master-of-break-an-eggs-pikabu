// GameData.js — данные игры: зоны, яйца, питомцы, кирки, улучшения, редкости, боты.
// Числа баланса — здесь (это таблицы данных, а не константы рендера); координаты мира — в Maps.js.

/** @typedef {{ id: string, model: string, kg: number, scale?: number, yaw?: number }} PetSpecies */
/** @typedef {{ pet: string, w: number, r: string }} EggRoll */
/** @typedef {{ id: string, zone: number, model: string, hp: number, rolls: EggRoll[], color: string }} EggType */

/** @satisfies {Record<string, any>} */
const GameData = {
    STUD: 40,                 // px мира на один «стад»: скорость в стадах/с

    // Редкости: цвет надписи, множитель дохода, кристаллы за вылупление.
    RARITY: {
        common:    { color: '#e9edf2', mult: 1,   gems: 1,   order: 0 },
        uncommon:  { color: '#5fe36a', mult: 1.8, gems: 2,   order: 1 },
        rare:      { color: '#47a8ff', mult: 3.5, gems: 4,   order: 2 },
        epic:      { color: '#c45cff', mult: 7,   gems: 8,   order: 3 },
        legendary: { color: '#ff4d4d', mult: 15,  gems: 15,  order: 4 },
        mythic:    { color: '#ff9a1f', mult: 32,  gems: 30,  order: 5 },
        secret:    { color: '#ff5fd8', mult: 80,  gems: 100, order: 6 },   // в интерфейсе — радужный перелив (UI.rar)
    },

    // Зоны каньона по порядку от хаба. income — базовый $/с питомца зоны, guard — скорость стража (стадов/с).
    ZONES: [
        { id: 'easy',       face: '😀', color: '#3bd45b', income: 1,      guard: 14, floor: 'grass'  },
        { id: 'medium',     face: '😟', color: '#ffc21a', income: 12,     guard: 21, floor: 'sand'   },
        { id: 'hard',       face: '😨', color: '#47a8ff', income: 150,    guard: 30, floor: 'snow'   },
        { id: 'extrahard',  face: '😠', color: '#c45cff', income: 2000,   guard: 41, floor: 'candy'  },
        { id: 'insane',     face: '😱', color: '#ff4d4d', income: 25000,  guard: 54, floor: 'jungle' },
        { id: 'impossible', face: '💀', color: '#ff9a1f', income: 350000, guard: 70, floor: 'beach'  },
    ],

    // Стражи зон (модель Rig: файл и _clips рядом). size — желаемая высота в px.
    GUARDIANS: [
        { id: 'chicken', model: 'assets/models/guardians/chicken.glb', clips: 'assets/models/guardians/chicken_clips.glb', size: 420, run: 683, walk: 160 },
        { id: 'lion',    model: 'assets/models/guardians/lion.glb',    clips: 'assets/models/guardians/lion_clips.glb',    size: 320, run: 880, walk: 170 },
        { id: 'yeti',    model: 'assets/models/guardians/yeti.glb',    clips: 'assets/models/guardians/yeti_clips.glb',    size: 460, run: 533, walk: 150 },
        { id: 'dragon',  model: 'assets/models/guardians/dragon.glb',  clips: 'assets/models/guardians/dragon_clips.glb',  size: 460, run: 736, walk: 170 },
        { id: 'boar',    model: 'assets/models/guardians/boar.glb',    clips: 'assets/models/guardians/boar_clips.glb',    size: 440, run: 769, walk: 170 },
        { id: 'crab',    model: 'assets/models/guardians/crab.glb',    clips: 'assets/models/guardians/crab_clips.glb',    size: 330, run: 489, walk: 140 },
    ],

    // Виды питомцев. kg — средний вес; yaw — поворот модели, чтобы нос смотрел вдоль +X.
    /** @type {Record<string, PetSpecies>} */
    PETS: {
        cat:         { id: 'cat',         model: 'assets/packs/kenney-pets/animal-cat.glb',         kg: 40,  yaw: -90 },
        dog:         { id: 'dog',         model: 'assets/packs/kenney-pets/animal-dog.glb',         kg: 55,  yaw: -90 },
        chick:       { id: 'chick',       model: 'assets/packs/kenney-pets/animal-chick.glb',       kg: 18,  yaw: -90 },
        bunny:       { id: 'bunny',       model: 'assets/packs/kenney-pets/animal-bunny.glb',       kg: 25,  yaw: -90 },
        pig:         { id: 'pig',         model: 'assets/packs/kenney-pets/animal-pig.glb',         kg: 90,  yaw: -90 },
        camel:       { id: 'camel',       model: 'assets/models/pets/camel.glb',                   kg: 180, yaw: 0 },
        hog:         { id: 'hog',         model: 'assets/packs/kenney-pets/animal-hog.glb',         kg: 110, yaw: -90 },
        lion:        { id: 'lion',        model: 'assets/packs/kenney-pets/animal-lion.glb',        kg: 160, yaw: -90 },
        giraffe:     { id: 'giraffe',     model: 'assets/packs/kenney-pets/animal-giraffe.glb',     kg: 210, yaw: -90 },
        elephant:    { id: 'elephant',    model: 'assets/packs/kenney-pets/animal-elephant.glb',    kg: 320, yaw: -90 },
        penguin:     { id: 'penguin',     model: 'assets/packs/kenney-pets/animal-penguin.glb',     kg: 35,  yaw: -90 },
        polar:       { id: 'polar',       model: 'assets/packs/kenney-pets/animal-polar.glb',       kg: 260, yaw: -90 },
        deer:        { id: 'deer',        model: 'assets/packs/kenney-pets/animal-deer.glb',        kg: 120, yaw: -90 },
        fox:         { id: 'fox',         model: 'assets/packs/kenney-pets/animal-fox.glb',         kg: 30,  yaw: -90 },
        yeti:        { id: 'yeti',        model: 'assets/models/pets/yeti.glb',                    kg: 280, yaw: 0 },
        bee:         { id: 'bee',         model: 'assets/packs/kenney-pets/animal-bee.glb',         kg: 12,  yaw: -90 },
        caterpillar: { id: 'caterpillar', model: 'assets/packs/kenney-pets/animal-caterpillar.glb', kg: 15,  yaw: -90 },
        cow:         { id: 'cow',         model: 'assets/packs/kenney-pets/animal-cow.glb',         kg: 240, yaw: -90 },
        unicorn:     { id: 'unicorn',     model: 'assets/models/pets/unicorn.glb',                 kg: 150, yaw: 0 },
        gummy_bear:  { id: 'gummy_bear',  model: 'assets/models/pets/gummy_bear.glb',              kg: 60,  yaw: 0 },
        monkey:      { id: 'monkey',      model: 'assets/packs/kenney-pets/animal-monkey.glb',      kg: 45,  yaw: -90 },
        parrot:      { id: 'parrot',      model: 'assets/packs/kenney-pets/animal-parrot.glb',      kg: 14,  yaw: -90 },
        tiger:       { id: 'tiger',       model: 'assets/packs/kenney-pets/animal-tiger.glb',       kg: 190, yaw: -90 },
        panda:       { id: 'panda',       model: 'assets/packs/kenney-pets/animal-panda.glb',       kg: 130, yaw: -90 },
        beaver:      { id: 'beaver',      model: 'assets/packs/kenney-pets/animal-beaver.glb',      kg: 28,  yaw: -90 },
        koala:       { id: 'koala',       model: 'assets/packs/kenney-pets/animal-koala.glb',       kg: 22,  yaw: -90 },
        fish:        { id: 'fish',        model: 'assets/packs/kenney-pets/animal-fish.glb',        kg: 16,  yaw: -90 },
        crab:        { id: 'crab',        model: 'assets/packs/kenney-pets/animal-crab.glb',        kg: 26,  yaw: -90 },
        shark:       { id: 'shark',       model: 'assets/models/pets/shark.glb',                   kg: 300, yaw: 0 },
        octopus:     { id: 'octopus',     model: 'assets/models/pets/octopus.glb',                 kg: 70,  yaw: 0 },
        turtle:      { id: 'turtle',      model: 'assets/models/pets/turtle.glb',                  kg: 150, yaw: 0 },
        jellyfish:   { id: 'jellyfish',   model: 'assets/models/pets/jellyfish.glb',               kg: 20,  yaw: 0 },
        dragon:      { id: 'dragon',      model: 'assets/models/pets/dragon.glb',                  kg: 500, yaw: 0 },
        phoenix:     { id: 'phoenix',     model: 'assets/models/pets/phoenix.glb',                 kg: 90,  yaw: 0 },
    },

    // Яйца: зона, модель, HP и таблица выпадения (w — вес шанса, r — редкость).
    /** @type {EggType[]} */
    EGGS: [
        { id: 'forest', zone: 0, model: 'assets/models/eggs/forest_egg.glb', hp: 12, color: '#d9b48a', rolls: [
            { pet: 'cat', w: 50, r: 'common' }, { pet: 'dog', w: 32, r: 'common' }, { pet: 'bunny', w: 13, r: 'uncommon' }, { pet: 'pig', w: 4.5, r: 'rare' }, { pet: 'chick', w: 0.5, r: 'epic' }] },
        { id: 'swamp', zone: 0, model: 'assets/models/eggs/swamp_egg.glb', hp: 18, color: '#4f7a3a', rolls: [
            { pet: 'dog', w: 45, r: 'common' }, { pet: 'chick', w: 30, r: 'common' }, { pet: 'pig', w: 18, r: 'uncommon' }, { pet: 'cat', w: 6, r: 'rare' }, { pet: 'bunny', w: 1, r: 'epic' }] },
        { id: 'rock', zone: 0, model: 'assets/models/eggs/rock_egg.glb', hp: 26, color: '#5d6b85', rolls: [
            { pet: 'pig', w: 40, r: 'common' }, { pet: 'bunny', w: 32, r: 'uncommon' }, { pet: 'chick', w: 20, r: 'uncommon' }, { pet: 'dog', w: 7, r: 'rare' }, { pet: 'cat', w: 1, r: 'legendary' }] },

        { id: 'cactus', zone: 1, model: 'assets/models/eggs/cactus_egg.glb', hp: 160, color: '#3cae3c', rolls: [
            { pet: 'hog', w: 48, r: 'common' }, { pet: 'camel', w: 34, r: 'uncommon' }, { pet: 'lion', w: 13, r: 'rare' }, { pet: 'giraffe', w: 4.5, r: 'epic' }, { pet: 'elephant', w: 0.5, r: 'legendary' }] },
        { id: 'sand', zone: 1, model: 'assets/models/eggs/sand_egg.glb', hp: 230, color: '#e8c46a', rolls: [
            { pet: 'camel', w: 45, r: 'common' }, { pet: 'giraffe', w: 30, r: 'uncommon' }, { pet: 'hog', w: 18, r: 'uncommon' }, { pet: 'elephant', w: 6, r: 'rare' }, { pet: 'lion', w: 1, r: 'epic' }] },
        { id: 'pharaoh', zone: 1, model: 'assets/models/eggs/pharaoh_egg.glb', hp: 320, color: '#f2c23a', rolls: [
            { pet: 'lion', w: 40, r: 'uncommon' }, { pet: 'elephant', w: 30, r: 'uncommon' }, { pet: 'giraffe', w: 22, r: 'rare' }, { pet: 'camel', w: 7, r: 'epic' }, { pet: 'hog', w: 1, r: 'legendary' }] },

        { id: 'frozen', zone: 2, model: 'assets/models/eggs/frozen_egg.glb', hp: 2100, color: '#bfe6ff', rolls: [
            { pet: 'penguin', w: 50, r: 'common' }, { pet: 'fox', w: 30, r: 'uncommon' }, { pet: 'deer', w: 15, r: 'rare' }, { pet: 'polar', w: 4.5, r: 'epic' }, { pet: 'yeti', w: 0.5, r: 'legendary' }] },
        { id: 'yeti', zone: 2, model: 'assets/models/eggs/yeti_egg.glb', hp: 3000, color: '#e8f4ff', rolls: [
            { pet: 'fox', w: 44, r: 'common' }, { pet: 'polar', w: 30, r: 'uncommon' }, { pet: 'penguin', w: 18, r: 'uncommon' }, { pet: 'yeti', w: 7, r: 'rare' }, { pet: 'deer', w: 1, r: 'epic' }] },
        { id: 'crystal', zone: 2, model: 'assets/models/eggs/crystal_egg.glb', hp: 4200, color: '#5fd7ff', rolls: [
            { pet: 'deer', w: 40, r: 'uncommon' }, { pet: 'polar', w: 30, r: 'rare' }, { pet: 'yeti', w: 22, r: 'rare' }, { pet: 'fox', w: 7, r: 'epic' }, { pet: 'penguin', w: 1, r: 'legendary' }] },

        { id: 'candy', zone: 3, model: 'assets/models/eggs/candy_egg.glb', hp: 32000, color: '#f58ae6', rolls: [
            { pet: 'gummy_bear', w: 48, r: 'common' }, { pet: 'bee', w: 32, r: 'uncommon' }, { pet: 'caterpillar', w: 14, r: 'rare' }, { pet: 'unicorn', w: 5.5, r: 'epic' }, { pet: 'cow', w: 0.5, r: 'legendary' }] },
        { id: 'rainbow', zone: 3, model: 'assets/models/eggs/rainbow_egg.glb', hp: 46000, color: '#ff6aa0', rolls: [
            { pet: 'bee', w: 44, r: 'common' }, { pet: 'unicorn', w: 30, r: 'uncommon' }, { pet: 'gummy_bear', w: 18, r: 'rare' }, { pet: 'cow', w: 7, r: 'epic' }, { pet: 'caterpillar', w: 1, r: 'legendary' }] },
        { id: 'bunny', zone: 3, model: 'assets/models/eggs/bunny_egg.glb', hp: 62000, color: '#ffffff', rolls: [
            { pet: 'caterpillar', w: 42, r: 'uncommon' }, { pet: 'cow', w: 30, r: 'rare' }, { pet: 'unicorn', w: 20, r: 'rare' }, { pet: 'bee', w: 7, r: 'epic' }, { pet: 'gummy_bear', w: 1, r: 'legendary' }] },

        { id: 'gooey', zone: 4, model: 'assets/models/eggs/gooey_egg.glb', hp: 420000, color: '#c8ff3a', rolls: [
            { pet: 'monkey', w: 46, r: 'common' }, { pet: 'parrot', w: 30, r: 'uncommon' }, { pet: 'koala', w: 16, r: 'rare' }, { pet: 'tiger', w: 7.5, r: 'epic' }, { pet: 'panda', w: 0.5, r: 'legendary' }] },
        { id: 'lake', zone: 4, model: 'assets/models/eggs/lake_egg.glb', hp: 610000, color: '#3fc4c0', rolls: [
            { pet: 'beaver', w: 44, r: 'common' }, { pet: 'koala', w: 30, r: 'uncommon' }, { pet: 'monkey', w: 18, r: 'rare' }, { pet: 'panda', w: 7, r: 'epic' }, { pet: 'tiger', w: 1, r: 'legendary' }] },
        { id: 'tree', zone: 4, model: 'assets/models/eggs/tree_egg.glb', hp: 820000, color: '#3f9e2f', rolls: [
            { pet: 'parrot', w: 40, r: 'uncommon' }, { pet: 'tiger', w: 30, r: 'rare' }, { pet: 'panda', w: 22, r: 'rare' }, { pet: 'beaver', w: 7, r: 'epic' }, { pet: 'monkey', w: 1, r: 'legendary' }] },

        { id: 'coral', zone: 5, model: 'assets/models/eggs/coral_egg.glb', hp: 6200000, color: '#ff5fa2', rolls: [
            { pet: 'fish', w: 46, r: 'common' }, { pet: 'crab', w: 30, r: 'uncommon' }, { pet: 'jellyfish', w: 16, r: 'rare' }, { pet: 'octopus', w: 7.5, r: 'epic' }, { pet: 'shark', w: 0.5, r: 'mythic' }] },
        { id: 'pearl', zone: 5, model: 'assets/models/eggs/pearl_egg.glb', hp: 9000000, color: '#f3f0ff', rolls: [
            { pet: 'crab', w: 44, r: 'common' }, { pet: 'turtle', w: 30, r: 'uncommon' }, { pet: 'fish', w: 18, r: 'rare' }, { pet: 'shark', w: 7, r: 'epic' }, { pet: 'octopus', w: 1, r: 'mythic' }] },
        { id: 'kraken', zone: 5, model: 'assets/models/eggs/kraken_egg.glb', hp: 12500000, color: '#7a3fc4', rolls: [
            { pet: 'jellyfish', w: 40, r: 'uncommon' }, { pet: 'octopus', w: 30, r: 'rare' }, { pet: 'turtle', w: 22, r: 'epic' }, { pet: 'shark', w: 7, r: 'legendary' }, { pet: 'crab', w: 1, r: 'mythic' }] },
    ],

    // Гигантское яйцо события. hpPerPower — HP на единицу силы лучшей кирки игрока.
    TITANIC: { id: 'titanic', model: 'assets/models/eggs/titanic_egg.glb', scale: 5.5, hpPerPower: 260, hpMin: 600, color: '#ffd23a',
        rolls: [{ pet: 'dragon', w: 60, r: 'secret' }, { pet: 'phoenix', w: 40, r: 'secret' }] },
    TITANIC_FIRST_SEC: 240,     // первое появление после старта
    TITANIC_EVERY_SEC: 600,     // затем каждые
    TITANIC_ZONE_MULT: 2.5,     // доход Secret-питомца = доход зоны игрока × это × множитель редкости

    // Мутации (машина слияния): 3 одинаковых -> следующая ступень.
    // Питомцы с собой (до FOLLOW_MAX): идут за игроком строем и дают бонус своего вида — урон киркой (power),
    // скорость (speed), доход (cash) или удачу (luck). Сила — по редкости, мутация умножает; сумма с потолком.
    FOLLOW_MAX: 4,
    FOLLOW_SCALE: 0.7,
    FOLLOW_SLOTS: [[120, -85], [120, 85], [215, -45], [215, 45]],   // [назад, вбок] от игрока
    PET_BUFF: {
        cat: 'luck', dog: 'speed', chick: 'luck', bunny: 'speed', pig: 'cash', camel: 'speed', hog: 'power', lion: 'power',
        giraffe: 'speed', elephant: 'power', penguin: 'luck', polar: 'power', deer: 'speed', fox: 'speed', yeti: 'power',
        bee: 'cash', caterpillar: 'luck', cow: 'cash', unicorn: 'luck', gummy_bear: 'cash', monkey: 'cash', parrot: 'speed',
        tiger: 'power', panda: 'cash', beaver: 'cash', koala: 'luck', fish: 'speed', crab: 'power', shark: 'power',
        octopus: 'cash', turtle: 'luck', jellyfish: 'luck', dragon: 'power', phoenix: 'luck',
    },
    BUFF_PCT: {   // % по порядку редкости: common … secret
        power: [5, 8, 12, 18, 25, 35, 50], cash: [5, 8, 12, 18, 25, 35, 50], luck: [5, 8, 12, 18, 25, 35, 50],
        speed: [3, 4, 6, 8, 11, 15, 20],
    },
    BUFF_CAP: { power: 3, cash: 2, luck: 2, speed: 0.5 },
    MUT_BUFF: { normal: 1, golden: 1.5, diamond: 2, rainbow: 3 },
    /** @param {any} p @returns {{ type: string, v: number }} */
    petBuff(p) {
        const type = this.PET_BUFF[p.sp] || 'power';
        const order = (this.RARITY[p.r] || this.RARITY.common).order;
        return { type, v: (this.BUFF_PCT[type][order] || 0) * (this.MUT_BUFF[p.mut] || 1) / 100 };
    },

    MUTATIONS: [
        { id: 'normal',  mult: 1,   tint: null },
        { id: 'golden',  mult: 3.5, tint: [1.25, 0.95, 0.35] },
        { id: 'diamond', mult: 12,  tint: [0.6, 1.05, 1.35] },
        { id: 'rainbow', mult: 40,  tint: 'rainbow' },
    ],

    // Кирки: power — урон за удар; price — $; цвета головы/рукояти для модели в коде.
    PICKAXES: [
        { id: 'wooden',    power: 1,       price: 0,          head: '#a0703f', handle: '#6b4423' },
        { id: 'stone',     power: 3,       price: 150,        head: '#8d939b', handle: '#6b4423' },
        { id: 'iron',      power: 8,       price: 1200,       head: '#d6dbe0', handle: '#6b4423' },
        { id: 'gold',      power: 20,      price: 6000,       head: '#ffcf33', handle: '#6b4423' },
        { id: 'diamond',   power: 60,      price: 35000,      head: '#62e9ff', handle: '#4a3020' },
        { id: 'emerald',   power: 180,     price: 220000,     head: '#2fe07a', handle: '#4a3020' },
        { id: 'ruby',      power: 550,     price: 1400000,    head: '#ff3b5c', handle: '#2b2b2b' },
        { id: 'obsidian',  power: 1800,    price: 9000000,    head: '#3a2457', handle: '#1b1b1b' },
        { id: 'lava',      power: 6000,    price: 65000000,   head: '#ff6a00', handle: '#2b1408', glow: '#ffb000' },
        { id: 'frost',     power: 20000,   price: 480000000,  head: '#a8ecff', handle: '#2c4f7a', glow: '#d8f8ff' },
        { id: 'candy',     power: 70000,   price: 3600000000, head: '#ff7ad9', handle: '#ffffff', glow: '#ffc8f0' },
        { id: 'cool',      power: 250000,  price: 3.2e10,     head: '#ff5a1f', handle: '#222222', glow: '#ff9a5a' },
        { id: 'galaxy',    power: 1000000, price: 2.6e11,     head: '#8a3dff', handle: '#1a1033', glow: '#d8a8ff' },
        { id: 'celestial', power: 5000000, price: 2.2e12,     head: '#ffd23a', handle: '#7a3dff', glow: '#fff3a8' },
    ],

    // Загон: мест на уровне (уровень 1 — PEN_BASE мест), цена следующего уровня.
    PEN_BASE: 4,
    PEN_MAX_LEVEL: 9,
    penPrice(level) { return Math.round(400 * Math.pow(4.2, level - 1)); },
    // Беговая дорожка: прирост скорости за секунду и потолок скорости на уровне.
    TREADMILL: [
        { rate: 1,   cap: 30,  price: 0 },
        { rate: 1.5, cap: 45,  price: 2500 },
        { rate: 2,   cap: 62,  price: 60000 },
        { rate: 3,   cap: 82,  price: 1500000 },
        { rate: 4,   cap: 105, price: 40000000 },
        { rate: 5,   cap: 130, price: 1.2e9 },
    ],
    BASE_SPEED: 16,
    SWING_RATE: 3,            // ударов в секунду
    REACH: 150,               // px: дальность удара от центра персонажа
    CARRY_SLOW: 0.0011,       // доля скорости, теряемая на каждый кг ноши
    CARRY_SLOW_MAX: 0.32,
    DROP_SECONDS: 30,         // упавший питомец лежит столько секунд
    EGG_RESPAWN: [6, 12],     // сек: новое яйцо на месте разбитого

    // Цена продажи питомца — столько секунд его дохода.
    SELL_SECONDS: 25,
    OFFLINE_MAX_SEC: 7200,
    OFFLINE_SHARE: 0.35,

    // Боты-нубы: ники (язык сборки), цвета и характер.
    BOT_NAMES: {
        ru: ['Нубик_2013', 'КирюхаПро', 'Мася_Котик', 'ДимонЛегенда', 'Лиза_Звёздочка', 'ВаняКрут', 'Тёма_228', 'Соня_Луна', 'МакснубГейм', 'Рома_Ракета'],
        en: ['NoobMaster99', 'EggSmasher', 'xXBuilderXx', 'PetHunter_7', 'LilyStar', 'Robo_Tom', 'CoolKid2013', 'MaxTheNoob', 'SunnyBloxx', 'Speedy_Sam'],
    },
    NOOB_SKIN: '#f5cd30',
    NOOB_TORSO: '#ff7a1a',
    NOOB_LEGS: '#6a3fd8',
    // Вариации нубов для ботов: [торс, ноги, кожа].
    BOT_LOOKS: [
        ['#e8343a', '#2d3a8c', '#f5cd30'], ['#ff5fa2', '#3a3a3a', '#f5cd30'], ['#ffd23a', '#e8343a', '#f5cd30'],
        ['#8a3dff', '#ffd23a', '#f5cd30'], ['#3cc24a', '#ff8a1f', '#f5cd30'], ['#ffffff', '#e8343a', '#f5cd30'],
        ['#3cc24a', '#7a4a26', '#f5cd30'], ['#ff5fa2', '#ffffff', '#f5cd30'], ['#2b2b2b', '#e8343a', '#d9a066'],
    ],

    // --- Помощники ---
    zoneOf(i) { return this.ZONES[Math.max(0, Math.min(this.ZONES.length - 1, i))]; },
    egg(id) { return id === 'titanic' ? /** @type {EggType} */ (/** @type {any} */ (this.TITANIC)) : this.EGGS.find(e => e.id === id) || this.EGGS[0]; },
    eggsOfZone(z) { return this.EGGS.filter(e => e.zone === z); },
    mutation(id) { return this.MUTATIONS.find(m => m.id === id) || this.MUTATIONS[0]; },
    pickaxe(i) { return this.PICKAXES[Math.max(0, Math.min(this.PICKAXES.length - 1, i))]; },
    penSlots(level) { return this.PEN_BASE + Math.max(0, level - 1); },

    // Выбор из таблицы яйца с удачей: удача сдвигает веса к редким.
    roll(egg, luck, rnd) {
        const r = rnd || Math.random;
        const L = Math.max(1, luck || 1);
        const ws = egg.rolls.map(x => x.w * Math.pow(L, this.RARITY[x.r].order * 0.6));
        let t = r() * ws.reduce((a, b) => a + b, 0);
        for (let i = 0; i < ws.length; i++) { t -= ws[i]; if (t <= 0) return egg.rolls[i]; }
        return egg.rolls[egg.rolls.length - 1];
    },

    // Новый питомец из яйца: вес, доход.
    // tz — зона игрока для Titanic Egg: доход Секретного питомца растёт вместе с прогрессом.
    makePet(egg, rollEntry, rnd, tz) {
        const r = rnd || Math.random;
        const sp = this.PETS[rollEntry.pet] || this.PETS.cat;
        const k = 0.55 + Math.pow(r(), 1.7) * 1.25;               // чаще лёгкие, иногда тяжёлые
        const kg = Math.max(1, Math.round(sp.kg * k));
        const base = egg.id === 'titanic' ? this.zoneOf(tz || 0).income * this.TITANIC_ZONE_MULT : this.zoneOf(egg.zone).income;
        const income = base * this.RARITY[rollEntry.r].mult * (0.75 + 0.5 * k);
        return {
            uid: 'p' + Date.now().toString(36) + Math.floor(r() * 1e6).toString(36),
            sp: sp.id, egg: egg.id, r: rollEntry.r, kg, mut: 'normal',
            inc: Math.max(1, Math.round(income)),
        };
    },

    // Редкость-подпись яйца — по зоне (как в оригинале: Common, Uncommon, Rare…).
    eggRarity(egg) { return egg.id === 'titanic' ? 'secret' : ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'][egg.zone] || 'common'; },

    incomeOf(pet) { return pet ? pet.inc * this.mutation(pet.mut).mult : 0; },

    // $ -> «$1.2K», «$45M» … (короткие суффиксы как в Roblox).
    SUFFIX: ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'],
    fmt(n) {
        n = Number(n) || 0;
        const neg = n < 0; n = Math.abs(n);
        if (n < 1000) return (neg ? '-' : '') + (n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n));
        let i = 0;
        while (n >= 1000 && i < this.SUFFIX.length - 1) { n /= 1000; i++; }
        const s = n >= 100 ? Math.floor(n) : n >= 10 ? (Math.floor(n * 10) / 10) : (Math.floor(n * 100) / 100);
        return (neg ? '-' : '') + s + this.SUFFIX[i];
    },
    money(n) { return '$' + this.fmt(n); },
};

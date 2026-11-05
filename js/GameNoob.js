// GameNoob.js — классический Roblox-«нуб» R6 из блоков: голова-цилиндр с лицом, торс, руки, ноги.
// Анимации кодом (ходьба, бег, прыжок, удар, переноска, падение), инструменты (кирки по тиру, биты),
// косметика: наряды, шапки, лица, следы, ауры, скины биты. Локальные оси: вперёд +X, вверх +Y, вправо +Z.

// Примитивы для шапок и бит: [тип, ...]. box: w,h,d, x,y,z, цвет, [rx,ry,rz]°; cyl: dTop,dBottom,h, x,y,z, цвет, tess, [rx,ry,rz]°;
// sph: d, x,y,z, цвет, [sx,sy,sz]; tor: d, thick, x,y,z, цвет, [rx,ry,rz]°; cone: d, h, x,y,z, цвет, [rx,ry,rz]°
/** @typedef {any[]} Prim */

/** @satisfies {Record<string, any>} */
const NoobLooks = {
    // Наряды: торс, руки, ноги, кожа, обувь и рисунок на груди.
    OUTFITS: {
        // Мифические брейнрот-скины (первые во вкладке «Скины»): цвета, рисунок на груди и надетые детали (extra: head/body).
        brainrot_tung:        { torso: '#b07a45', arms: '#c08850', legs: '#9a6a3a', skin: '#c99460', decal: 'woodgrain', shoes: '#7a5230' },
        brainrot_tralalero:   { torso: '#7f9fbf', arms: '#7f9fbf', legs: '#6f8fae', skin: '#8fb0cf', decal: 'sharkbelly', shoes: '#3b8bff',
            extra: { head: [['box', 30, 46, 10, -6, 40, 0, '#6f8fae', [0, 0, 22]], ['box', 6, 8, 52, 24, -12, 0, '#ffffff']] } },
        brainrot_bombardiro:  { torso: '#4f8a3a', arms: '#4f8a3a', legs: '#3f7a2f', skin: '#5f9a3f', decal: 'bomb',
            extra: { head: [['cyl', 16, 16, 8, 22, 8, 12, '#5ad1ff', 12, [0, 0, 90]], ['cyl', 16, 16, 8, 22, 8, -12, '#5ad1ff', 12, [0, 0, 90]], ['tor', 52, 5, 0, 8, 0, '#6b4423']],
                     body: [['box', 20, 8, 280, -16, 150, 0, '#9aa4ad'], ['box', 40, 40, 30, -30, 120, 0, '#6b737b']] } },
        brainrot_ballerina:   { torso: '#ff9fd0', arms: 'skin', legs: '#ffffff', skin: '#f2c39b', decal: 'tutu', shoes: '#ff9fd0',
            extra: { head: [['cyl', 44, 38, 40, 0, 44, 0, '#f4f0ea', 20], ['cyl', 42, 42, 6, 0, 66, 0, '#c8925a', 20], ['tor', 22, 5, 0, 46, 24, '#f4f0ea', [90, 0, 0]]],
                     body: [['cyl', 100, 120, 14, 0, 82, 0, '#ffb8e0', 20]] } },
        brainrot_patapim:     { torso: '#3f8a2f', arms: '#8a5a32', legs: '#8a5a32', skin: '#9a6a3a', decal: 'leaves', shoes: '#6b4423',
            extra: { head: [['sph', 34, 0, 34, 0, '#3cae3c'], ['sph', 26, 14, 30, 14, '#2f8a2a'], ['sph', 26, -12, 32, -12, '#4cc24a'], ['cyl', 6, 8, 18, 0, 50, 0, '#6b4423', 8]] } },
        brainrot_chimpanzini: { torso: '#ffe14a', arms: '#ffe14a', legs: '#ffe14a', skin: '#7a4a26', decal: 'banana', shoes: '#c8a020',
            extra: { head: [['box', 12, 44, 30, 0, 30, 24, '#ffe14a', [-25, 0, 0]], ['box', 12, 44, 30, 0, 30, -24, '#ffe14a', [25, 0, 0]], ['box', 30, 44, 12, -24, 30, 0, '#f2d23a', [0, 0, 25]], ['cyl', 6, 6, 12, 0, 56, 0, '#6b4423', 8]] } },
        brainrot_lirili:      { torso: '#3cae3c', arms: '#3cae3c', legs: '#3cae3c', skin: '#8a8f96', decal: 'spines', shoes: '#c8925a',
            extra: { head: [['box', 6, 40, 34, 0, 2, 34, '#8a8f96'], ['box', 6, 40, 34, 0, 2, -34, '#8a8f96'], ['cyl', 12, 16, 40, 30, -10, 0, '#8a8f96', 10, [0, 0, 60]]] } },
        sixseven:             { torso: '#111111', arms: '#111111', legs: '#2b2b2b', skin: '#f5cd30', decal: 'sixseven', glow: '#ffd23a', shoes: '#ffd23a' },
        classic:   { torso: '#ff7a1a', arms: 'skin', legs: '#6a3fd8', skin: '#f5cd30', decal: 'egg', shoes: '#ffffff' },
        red:       { torso: '#e8343a', arms: 'skin', legs: '#2d3a8c', skin: '#f5cd30', decal: 'star' },
        sporty:    { torso: '#ff8a1f', arms: '#ff8a1f', legs: '#3a3a3a', skin: '#f5cd30', decal: 'stripe', shoes: '#ffffff' },
        ninja:     { torso: '#1d1d22', arms: '#1d1d22', legs: '#1d1d22', skin: '#f2c39b', decal: 'belt', shoes: '#1d1d22' },
        royal:     { torso: '#8a3dff', arms: '#8a3dff', legs: '#ffd23a', skin: '#f5cd30', decal: 'crown' },
        ocean:     { torso: '#20b8a8', arms: 'skin', legs: '#24324d', skin: '#f2c39b', decal: 'wave' },
        snowman:   { torso: '#ffffff', arms: '#ffffff', legs: '#dfe8f2', skin: '#ffffff', decal: 'buttons' },
        farmer:    { torso: '#e44d3a', arms: 'skin', legs: '#3b6fc4', skin: '#f5cd30', decal: 'overalls', shoes: '#6b4423' },
        hacker:    { torso: '#101418', arms: '#101418', legs: '#1f2a1f', skin: '#d9a066', decal: 'code' },
        pinky:     { torso: '#ff5fa2', arms: 'skin', legs: '#ffffff', skin: '#f5cd30', decal: 'heart' },
        lime:      { torso: '#8be04a', arms: '#8be04a', legs: '#1f5c2a', skin: '#f5cd30', decal: 'egg' },
        doctor:    { torso: '#f4f6f8', arms: '#f4f6f8', legs: '#2c6fbb', skin: '#f2c39b', decal: 'cross' },
        firefighter: { torso: '#c8261e', arms: '#c8261e', legs: '#2b2b2b', skin: '#f5cd30', decal: 'stripe', shoes: '#2b2b2b' },
        astronaut: { torso: '#e9eef3', arms: '#e9eef3', legs: '#e9eef3', skin: '#f5cd30', decal: 'planet', shoes: '#9aa4ad' },
        pirate:    { torso: '#f1e6d0', arms: '#f1e6d0', legs: '#3a2b1f', skin: '#d9a066', decal: 'skull', shoes: '#2b1a10' },
        zombie:    { torso: '#3c6e8f', arms: '#6fbf5a', legs: '#4d3b2a', skin: '#6fbf5a', decal: 'rip' },
        robot:     { torso: '#8f99a3', arms: '#8f99a3', legs: '#6b737b', skin: '#b8c2cc', decal: 'bolt', shoes: '#3a3f44' },
        lava:      { torso: '#ff5a1f', arms: '#2b1408', legs: '#2b1408', skin: '#ffb000', decal: 'flame', glow: '#ff6a00' },
        ice:       { torso: '#a8ecff', arms: '#d8f8ff', legs: '#5fb8e8', skin: '#e8fbff', decal: 'snow', glow: '#bff4ff' },
        candy:     { torso: '#ff7ad9', arms: '#ffffff', legs: '#7ad7ff', skin: '#ffe4f4', decal: 'candy' },
        galaxy:    { torso: '#2a1458', arms: '#3b1f7a', legs: '#140a2e', skin: '#8a6dff', decal: 'stars', glow: '#7a5cff' },
        banana:    { torso: '#ffe14a', arms: '#ffe14a', legs: '#ffe14a', skin: '#ffe14a', decal: 'banana' },
        diamond:   { torso: '#62e9ff', arms: '#a8f4ff', legs: '#2fb8d8', skin: '#d8fbff', decal: 'gem', glow: '#8af2ff' },
        golden:    { torso: '#ffd23a', arms: '#ffd23a', legs: '#e0a81a', skin: '#ffe680', decal: 'crown', glow: '#ffcf33' },
        rainbow:   { torso: '#ff4d4d', arms: '#47a8ff', legs: '#5fe36a', skin: '#f5cd30', decal: 'rainbow' },
        shadow:    { torso: '#0d0d12', arms: '#0d0d12', legs: '#0d0d12', skin: '#2a2a33', decal: 'eyes', glow: '#ff2b2b' },
        king:      { torso: '#c8261e', arms: '#ffd23a', legs: '#ffffff', skin: '#f5cd30', decal: 'crown', glow: '#ffd23a' },
    },

    // Шапки (относительно центра головы; верх головы y = 24, радиус 25).
    HATS: {
        none: [],
        cap_red: [['cyl', 52, 54, 16, 0, 28, 0, '#e8343a', 24], ['box', 30, 4, 46, 30, 22, 0, '#e8343a']],
        cap_blue: [['cyl', 52, 54, 16, 0, 28, 0, '#1e6fd9', 24], ['box', 30, 4, 46, -30, 22, 0, '#1e6fd9'], ['box', 6, 6, 6, 0, 38, 0, '#ffffff']],
        beanie: [['sph', 54, 0, 26, 0, '#3cc24a', [1, 0.7, 1]], ['cyl', 55, 55, 10, 0, 22, 0, '#2a8f36', 24], ['sph', 16, 0, 46, 0, '#ffffff']],
        top_hat: [['cyl', 56, 56, 6, 0, 26, 0, '#1b1b1b', 24], ['cyl', 70, 70, 3, 0, 24, 0, '#1b1b1b', 24], ['cyl', 46, 46, 40, 0, 48, 0, '#1b1b1b', 24], ['cyl', 47, 47, 8, 0, 32, 0, '#c8261e', 24]],
        crown: [['cyl', 50, 50, 14, 0, 31, 0, '#ffd23a', 8], ['cone', 12, 16, 18, 46, 0, '#ffd23a'], ['cone', 12, 16, -18, 46, 0, '#ffd23a'], ['cone', 12, 16, 0, 46, 18, '#ffd23a'], ['cone', 12, 16, 0, 46, -18, '#ffd23a'], ['sph', 9, 25, 32, 0, '#e8343a'], ['sph', 9, -25, 32, 0, '#1e6fd9']],
        cowboy: [['cyl', 88, 92, 4, 0, 25, 0, '#8a5a32', 28], ['cyl', 42, 52, 24, 0, 38, 0, '#8a5a32', 24], ['cyl', 53, 53, 5, 0, 29, 0, '#3a2414', 24]],
        viking: [['sph', 56, 0, 24, 0, '#9aa4ad', [1, 0.75, 1]], ['cone', 12, 30, 0, 44, 30, '#f1e6d0', [-55, 0, 0]], ['cone', 12, 30, 0, 44, -30, '#f1e6d0', [55, 0, 0]], ['cyl', 57, 57, 6, 0, 22, 0, '#8a5a32', 24]],
        party: [['cone', 40, 52, 0, 50, 0, '#ff5fa2'], ['sph', 12, 0, 77, 0, '#ffd23a'], ['tor', 38, 4, 0, 34, 0, '#47a8ff']],
        chef: [['cyl', 50, 50, 22, 0, 36, 0, '#ffffff', 24], ['sph', 64, 0, 54, 0, '#ffffff', [1, 0.6, 1]]],
        pirate: [['cyl', 70, 74, 8, 0, 28, 0, '#1d1d22', 3, [0, 90, 0]], ['cyl', 46, 54, 18, 0, 36, 0, '#1d1d22', 24], ['box', 4, 10, 10, 26, 36, 0, '#ffffff']],
        wizard: [['cyl', 90, 92, 4, 0, 25, 0, '#3b1f7a', 28], ['cone', 50, 70, 0, 60, 0, '#3b1f7a', [0, 0, -10]], ['sph', 8, 10, 46, 20, '#ffd23a'], ['sph', 6, -8, 60, -14, '#ffd23a']],
        // дуга — через макушку от уха до уха (плоскость YZ), чашки по бокам головы (±Z)
        headphones: [['tor', 62, 6, 0, 4, 0, '#2b2b2b', [0, 0, 90]], ['cyl', 24, 24, 10, 0, 4, 30, '#e8343a', 16, [90, 0, 0]], ['cyl', 24, 24, 10, 0, 4, -30, '#e8343a', 16, [90, 0, 0]],
            ['cyl', 16, 16, 4, 0, 4, 36, '#2b2b2b', 16, [90, 0, 0]], ['cyl', 16, 16, 4, 0, 4, -36, '#2b2b2b', 16, [90, 0, 0]]],
        cone: [['box', 50, 4, 50, 0, 26, 0, '#ff6a1f'], ['cone', 40, 54, 0, 54, 0, '#ff6a1f'], ['cyl', 28, 33, 8, 0, 48, 0, '#ffffff', 16]],
        halo: [['tor', 46, 5, 0, 48, 0, '#ffe680']],
        horns: [['cone', 14, 30, 0, 34, 16, '#c8261e', [-25, 0, 0]], ['cone', 14, 30, 0, 34, -16, '#c8261e', [25, 0, 0]]],
        propeller: [['cyl', 50, 52, 14, 0, 28, 0, '#ffd23a', 24], ['box', 4, 4, 4, 0, 40, 0, '#1e6fd9'], ['cyl', 3, 3, 12, 0, 42, 0, '#333333', 8], ['box', 70, 2, 10, 0, 48, 0, '#e8343a']],
        bunny_ears: [['box', 10, 44, 16, 0, 46, 12, '#ffffff', [0, 0, 8]], ['box', 10, 44, 16, 0, 46, -12, '#ffffff', [0, 0, -8]], ['box', 4, 34, 8, 4, 46, 12, '#ffb3c8'], ['box', 4, 34, 8, 4, 46, -12, '#ffb3c8']],
        cat_ears: [['cone', 18, 18, 4, 30, 14, '#3a3a3a'], ['cone', 18, 18, 4, 30, -14, '#3a3a3a'], ['tor', 54, 4, 0, 22, 0, '#3a3a3a']],
        santa: [['cone', 52, 46, 0, 46, 0, '#e8343a', [0, 0, -20]], ['cyl', 56, 56, 10, 0, 24, 0, '#ffffff', 24], ['sph', 14, -12, 68, 0, '#ffffff']],
        egg_shell: [['sph', 58, 0, 30, 0, '#fff6e0', [1, 0.85, 1]], ['cone', 10, 12, 10, 50, 10, '#fff6e0'], ['cone', 10, 14, -10, 52, -6, '#fff6e0'], ['cone', 10, 12, 4, 54, -14, '#fff6e0']],
        duck: [['sph', 34, 0, 40, 0, '#ffe14a'], ['sph', 22, 8, 58, 0, '#ffe14a'], ['box', 12, 5, 10, 20, 56, 0, '#ff8a1f'], ['sph', 4, 16, 62, 6, '#111111'], ['sph', 4, 16, 62, -6, '#111111']],
        sombrero: [['cyl', 110, 116, 4, 0, 25, 0, '#e0b04a', 28], ['cone', 50, 34, 0, 42, 0, '#e0b04a'], ['tor', 56, 4, 0, 30, 0, '#e8343a']],
        flower: [['sph', 14, 0, 30, 18, '#ffd23a'], ['sph', 12, 0, 38, 18, '#ff5fa2'], ['sph', 12, 0, 22, 18, '#ff5fa2'], ['sph', 12, 0, 30, 26, '#ff5fa2'], ['sph', 12, 0, 30, 10, '#ff5fa2']],
        ninja_band: [['cyl', 54, 54, 10, 0, 12, 0, '#e8343a', 24], ['box', 4, 8, 22, -28, 10, 6, '#e8343a', [0, 20, 30]]],
        antenna: [['cyl', 3, 3, 30, 0, 38, 0, '#333333', 8], ['sph', 12, 0, 56, 0, '#ff3b5c']],
        pumpkin: [['sph', 64, 0, 36, 0, '#ff8a1f', [1, 0.8, 1]], ['cyl', 6, 8, 12, 0, 62, 0, '#3a8f2a', 8]],
        ufo: [['sph', 70, 0, 34, 0, '#9aa4ad', [1, 0.3, 1]], ['sph', 30, 0, 42, 0, '#5ad1ff', [1, 0.8, 1]]],
        dino: [['sph', 58, 0, 28, 0, '#3cae3c', [1, 0.8, 1]], ['cone', 12, 16, 0, 54, 0, '#ffe14a'], ['cone', 10, 14, -16, 48, 0, '#ffe14a'], ['cone', 10, 12, -28, 38, 0, '#ffe14a']],
    },

    // Скины биты (рукоять вдоль +X от кисти; 0..110 px).
    BATS: {
        wood:      [['cyl', 18, 9, 110, 55, 0, 0, '#c8925a', 12, [0, 0, -90]], ['cyl', 11, 11, 6, 2, 0, 0, '#6b4423', 12, [0, 0, -90]]],
        metal:     [['cyl', 18, 9, 110, 55, 0, 0, '#c8ced6', 12, [0, 0, -90]], ['cyl', 10, 10, 26, 13, 0, 0, '#2b2b2b', 12, [0, 0, -90]]],
        gold:      [['cyl', 19, 9, 112, 56, 0, 0, '#ffd23a', 12, [0, 0, -90]], ['cyl', 10, 10, 24, 12, 0, 0, '#7a4a10', 12, [0, 0, -90]]],
        diamond:   [['cyl', 19, 9, 112, 56, 0, 0, '#62e9ff', 6, [0, 0, -90]], ['cyl', 10, 10, 24, 12, 0, 0, '#2b4a7a', 12, [0, 0, -90]]],
        spiked:    [['cyl', 20, 10, 110, 55, 0, 0, '#8a5a32', 12, [0, 0, -90]], ['cone', 7, 14, 90, 10, 0, '#d6dbe0'], ['cone', 7, 14, 80, -10, 0, '#d6dbe0', [180, 0, 0]], ['cone', 7, 14, 100, 0, 10, '#d6dbe0', [90, 0, 0]], ['cone', 7, 14, 70, 0, -10, '#d6dbe0', [-90, 0, 0]]],
        hammer:    [['box', 90, 9, 9, 45, 0, 0, '#8a5a32'], ['box', 22, 30, 50, 95, 0, 0, '#8f99a3']],
        pan:       [['box', 60, 7, 7, 30, 0, 0, '#2b2b2b'], ['cyl', 60, 56, 8, 92, 0, 0, '#3a3a3a', 24, [90, 0, 0]]],
        lollipop:  [['cyl', 6, 6, 80, 40, 0, 0, '#ffffff', 8, [0, 0, -90]], ['cyl', 50, 50, 10, 100, 0, 0, '#ff5fa2', 24, [90, 0, 0]], ['tor', 34, 5, 100, 0, 0, '#ffffff', [90, 0, 0]]],
        fish:      [['sph', 36, 70, 0, 0, '#5aa6f2', [2.6, 1, 0.6]], ['cone', 26, 22, 18, 0, 0, '#3f86d8', [0, 0, 90]], ['sph', 6, 104, 6, 6, '#111111']],
        baguette:  [['sph', 22, 60, 0, 0, '#e0a24a', [5.5, 1, 1]], ['box', 4, 2, 12, 40, 10, 0, '#c47f2a'], ['box', 4, 2, 12, 70, 10, 0, '#c47f2a']],
        candy_cane:[['cyl', 10, 10, 100, 50, 0, 0, '#ffffff', 10, [0, 0, -90]], ['tor', 34, 5, 108, 0, 0, '#e8343a', [90, 0, 0]], ['box', 8, 11, 11, 20, 0, 0, '#e8343a'], ['box', 8, 11, 11, 50, 0, 0, '#e8343a'], ['box', 8, 11, 11, 80, 0, 0, '#e8343a']],
        bone:      [['cyl', 10, 10, 90, 50, 0, 0, '#f1e6d0', 10, [0, 0, -90]], ['sph', 16, 8, 6, 0, '#f1e6d0'], ['sph', 16, 8, -6, 0, '#f1e6d0'], ['sph', 16, 96, 6, 0, '#f1e6d0'], ['sph', 16, 96, -6, 0, '#f1e6d0']],
        carrot:    [['cone', 24, 100, 60, 0, 0, '#ff8a1f', [0, 0, 90]], ['box', 14, 18, 4, 8, 6, 0, '#3cae3c', [0, 0, 30]], ['box', 14, 18, 4, 8, -6, 0, '#3cae3c', [0, 0, -30]]],
        noodle:    [['cyl', 16, 16, 120, 60, 0, 0, '#ff5fa2', 12, [0, 0, -90]]],
        sword:     [['box', 22, 8, 8, 11, 0, 0, '#6b4423'], ['box', 6, 30, 10, 24, 0, 0, '#ffd23a'], ['box', 86, 16, 4, 70, 0, 0, '#d6dbe0']],
        banana:    [['sph', 24, 60, 4, 0, '#ffe14a', [4.6, 1, 1]], ['box', 8, 6, 6, 4, 0, 0, '#6b4423']],
        guitar:    [['box', 60, 8, 6, 30, 0, 0, '#3a2414'], ['sph', 52, 86, 0, 0, '#e8343a', [1, 1, 0.35]], ['sph', 40, 110, 0, 0, '#e8343a', [1, 1, 0.35]]],
        ice_pop:   [['box', 30, 8, 4, 15, 0, 0, '#e0b04a'], ['box', 70, 34, 18, 60, 0, 0, '#7ad7ff'], ['box', 20, 34, 18, 100, 0, 0, '#ff5fa2']],
        wand:      [['cyl', 6, 6, 90, 45, 0, 0, '#3a2414', 8, [0, 0, -90]], ['sph', 22, 96, 0, 0, '#ffe680']],
        plunger:   [['cyl', 8, 8, 90, 45, 0, 0, '#c8925a', 8, [0, 0, -90]], ['cone', 40, 24, 100, 0, 0, '#e8343a', [0, 0, 90]]],
        rubber_chicken: [['sph', 30, 70, 0, 0, '#ffe14a', [2.4, 0.8, 0.8]], ['sph', 18, 104, 8, 0, '#ffe14a'], ['box', 10, 5, 6, 116, 8, 0, '#ff8a1f'], ['box', 8, 14, 4, 104, 18, 0, '#e8343a']],
    },

    // Следы: цвета ленты (несколько — переливается).
    TRAILS: {
        none: null,
        white: ['#ffffff'], red: ['#ff3b3b'], blue: ['#3b8bff'], green: ['#3bdc5a'], yellow: ['#ffe14a'], purple: ['#a54dff'],
        pink: ['#ff6ad0'], cyan: ['#3ff0ff'], orange: ['#ff8a1f'], black: ['#202020'], fire: ['#ff3b00', '#ffb000'],
        ice: ['#bff4ff', '#5fb8e8'], toxic: ['#a8ff3a', '#2fe07a'], sunset: ['#ff5f6d', '#ffc371'], ocean: ['#00c6ff', '#0072ff'],
        candy: ['#ff7ad9', '#7ad7ff'], gold: ['#ffd23a', '#fff3a8'], galaxy: ['#7a3dff', '#ff5fd8', '#3b8bff'],
        rainbow: ['#ff3b3b', '#ff8a1f', '#ffe14a', '#3bdc5a', '#3b8bff', '#a54dff'], shadow: ['#000000', '#ff2b2b'],
    },

    // Ауры: частицы вокруг персонажа.
    AURAS: {
        none: null,
        sparkle:  { color: '#ffffff', color2: '#fff3a8', rate: 18, size: [6, 12], up: 40 },
        gold:     { color: '#ffd23a', color2: '#fff3a8', rate: 22, size: [6, 13], up: 50 },
        fire:     { color: '#ff5a00', color2: '#ffd000', rate: 40, size: [10, 20], up: 120 },
        ice:      { color: '#bff4ff', color2: '#ffffff', rate: 20, size: [6, 12], up: -20 },
        toxic:    { color: '#a8ff3a', color2: '#2fe07a', rate: 26, size: [7, 14], up: 70 },
        love:     { color: '#ff3b6b', color2: '#ff9ab8', rate: 14, size: [9, 16], up: 60 },
        ocean:    { color: '#3ff0ff', color2: '#3b8bff', rate: 24, size: [6, 12], up: 80 },
        shadow:   { color: '#3a0a4a', color2: '#ff2b2b', rate: 30, size: [10, 18], up: 50, blend: 'standard' },
        galaxy:   { color: '#7a3dff', color2: '#ff5fd8', rate: 30, size: [6, 14], up: 30 },
        rainbow:  { color: '#ff3b3b', color2: '#3b8bff', rate: 34, size: [7, 13], up: 60 },
        leaves:   { color: '#3bdc5a', color2: '#2f7d24', rate: 14, size: [8, 14], up: -30, blend: 'standard' },
        candy:    { color: '#ff7ad9', color2: '#7ad7ff', rate: 22, size: [7, 13], up: 40 },
        thunder:  { color: '#fff7a0', color2: '#5ad1ff', rate: 36, size: [4, 10], up: 140 },
        snow:     { color: '#ffffff', color2: '#dfe8f2', rate: 22, size: [5, 10], up: -60, blend: 'standard' },
        sun:      { color: '#ffb000', color2: '#ff5a00', rate: 28, size: [8, 16], up: 90 },
        bubble:   { color: '#bff4ff', color2: '#ffffff', rate: 12, size: [10, 18], up: 90 },
        void:     { color: '#111111', color2: '#7a3dff', rate: 30, size: [8, 16], up: 40, blend: 'standard' },
        emerald:  { color: '#2fe07a', color2: '#bfffd8', rate: 22, size: [6, 12], up: 50 },
        ruby:     { color: '#ff3b5c', color2: '#ffc0cb', rate: 22, size: [6, 12], up: 50 },
        star:     { color: '#fff3a8', color2: '#ffd23a', rate: 16, size: [10, 18], up: 30 },
    },
};

/** @param {BABYLON.Scene} scene @param {Prim[]} prims @param {BABYLON.Node} parent */
function buildPrims(scene, prims, parent, name) {
    const out = [];
    const D = Math.PI / 180;
    for (const p of prims || []) {
        let m = null, col = '#ffffff', rot = null, scl = null;
        if (p[0] === 'box') { m = BABYLON.MeshBuilder.CreateBox(name, { width: p[1], height: p[2], depth: p[3] }, scene); m.position.set(p[4], p[5], p[6]); col = p[7]; rot = p[8]; }
        else if (p[0] === 'cyl') { m = BABYLON.MeshBuilder.CreateCylinder(name, { diameterTop: p[1], diameterBottom: p[2], height: p[3], tessellation: p[8] || 16 }, scene); m.position.set(p[4], p[5], p[6]); col = p[7]; rot = p[9]; }
        else if (p[0] === 'sph') { m = BABYLON.MeshBuilder.CreateSphere(name, { diameter: p[1], segments: 10 }, scene); m.position.set(p[2], p[3], p[4]); col = p[5]; scl = p[6]; }
        else if (p[0] === 'tor') { m = BABYLON.MeshBuilder.CreateTorus(name, { diameter: p[1], thickness: p[2], tessellation: 24 }, scene); m.position.set(p[3], p[4], p[5]); col = p[6]; rot = p[7]; }
        else if (p[0] === 'cone') { m = BABYLON.MeshBuilder.CreateCylinder(name, { diameterTop: 0, diameterBottom: p[1], height: p[2], tessellation: 12 }, scene); m.position.set(p[3], p[4], p[5]); col = p[6]; rot = p[7]; }
        if (!m) continue;
        if (rot) m.rotation.set(rot[0] * D, rot[1] * D, rot[2] * D);
        if (scl) m.scaling.set(scl[0], scl[1], scl[2]);
        m.material = Gfx.mat(col, { scene });
        m.parent = parent;
        m.isPickable = false;
        out.push(m);
    }
    return out;
}

class Noob {
    /** @param {BABYLON.Scene} scene */
    constructor(scene, look, opts) {
        const o = opts || {};
        this.scene = scene;
        this.name = o.name || 'noob';
        this.root = new BABYLON.Mesh(this.name, scene);   // Mesh без геометрии: World3D.addObject и тени
        this.body = new BABYLON.TransformNode(this.name + '-body', scene);
        this.body.parent = this.root;
        this.phase = 0;
        this.swing = 0;            // 0..1 ход удара
        this.fall = 0;             // 0..1 падение
        this.look = {};
        this.toolKind = null;
        this.toolTier = 0;
        this._matSkin = this._mat('skin');
        this._matTorso = this._mat('torso');
        this._matArms = this._mat('arms');
        this._matLegs = this._mat('legs');
        this._build();
        /** @type {any[]} */
        this._hat = [];
        /** @type {any[]} */
        this._tool = [];
        this._trail = null;
        this._aura = null;
        this._decal = null;
        /** @type {(() => void) | null} */
        this.onLook = null;
        /** @type {BABYLON.Mesh[]} */
        this._extra = [];
        this.setLook(look || {});
    }

    _mat(n) {
        const m = new BABYLON.StandardMaterial(this.name + '-' + n, this.scene);
        m.specularColor = new BABYLON.Color3(0.12, 0.12, 0.12);
        m.specularPower = 32;
        return m;
    }

    _box(w, h, d, mat, parent, x, y, z) {
        const m = BABYLON.MeshBuilder.CreateBox(this.name + '-p', { width: w, height: h, depth: d }, this.scene);
        m.material = mat; m.parent = parent; m.position.set(x || 0, y || 0, z || 0); m.isPickable = false;
        return m;
    }

    _pivot(x, y, z) {
        const t = new BABYLON.TransformNode(this.name + '-j', this.scene);
        t.parent = this.body; t.position.set(x, y, z);
        return t;
    }

    _build() {
        // Ноги: шарнир у бедра (y 80), руки — у плеча (y 150).
        this.legL = this._pivot(0, 80, -20); this.legR = this._pivot(0, 80, 20);
        this._box(40, 80, 39, this._matLegs, this.legL, 0, -40, 0); this._box(40, 80, 39, this._matLegs, this.legR, 0, -40, 0);
        this.torso = this._box(40, 80, 80, this._matTorso, this.body, 0, 120, 0);
        this.armL = this._pivot(0, 150, -60); this.armR = this._pivot(0, 150, 60);
        this._box(40, 80, 40, this._matArms, this.armL, 0, -30, 0); this._box(40, 80, 40, this._matArms, this.armR, 0, -30, 0);
        this.hand = new BABYLON.TransformNode(this.name + '-hand', this.scene);
        this.hand.parent = this.armR; this.hand.position.set(4, -68, 0);
        // Голова: цилиндр с фаской (классическая голова R6) + лицо на дуге спереди.
        this.headNode = this._pivot(0, 184, 0);
        const h1 = BABYLON.MeshBuilder.CreateCylinder(this.name + '-head', { height: 40, diameter: 50, tessellation: 22 }, this.scene);
        const h2 = BABYLON.MeshBuilder.CreateCylinder(this.name + '-head2', { height: 48, diameter: 42, tessellation: 22 }, this.scene);
        const head = BABYLON.Mesh.MergeMeshes([h1, h2], true, true);
        head.material = this._matSkin; head.parent = this.headNode; head.isPickable = false;
        this.head = head;
        const face = BABYLON.MeshBuilder.CreateCylinder(this.name + '-face', { height: 40, diameter: 51.2, tessellation: 22, arc: 0.36, enclose: false, cap: BABYLON.Mesh.NO_CAP }, this.scene);
        face.rotation.y = Math.PI * 0.36 - Math.PI * 0.5;   // середина дуги — на +X
        const fm = new BABYLON.StandardMaterial(this.name + '-facem', this.scene);
        fm.specularColor = new BABYLON.Color3(0, 0, 0);
        fm.useAlphaFromDiffuseTexture = true;
        fm.metadata = { toon: false };
        face.material = fm; face.parent = this.headNode; face.isPickable = false;
        this.face = face; this._faceMat = fm;
        // Обувь (у части нарядов) — тонкие бруски внизу ног.
        this.shoeL = this._box(42, 14, 41, this._matLegs, this.legL, 0, -73, 0);
        this.shoeR = this._box(42, 14, 41, this._matLegs, this.legR, 0, -73, 0);
        this.shoeMat = this._mat('shoes');
        this.shoeL.material = this.shoeMat; this.shoeR.material = this.shoeMat;
        this.hatNode = new BABYLON.TransformNode(this.name + '-hat', this.scene);
        this.hatNode.parent = this.headNode;
    }

    // look: { outfit, hat, face, bat, trail, aura } — id из NoobLooks (или custom: { torso, legs, skin })
    setLook(look) {
        const l = Object.assign({ outfit: 'classic', hat: 'none', face: 'smile', bat: 'wood', trail: 'none', aura: 'none' }, look || {});
        const prev = this.look;
        this.look = l;
        const of = l.custom || NoobLooks.OUTFITS[l.outfit] || NoobLooks.OUTFITS.classic;
        const c3 = (h) => BABYLON.Color3.FromHexString(h);
        this._matSkin.diffuseColor = c3(of.skin);
        this._matTorso.diffuseColor = c3(of.torso);
        this._matArms.diffuseColor = c3(of.arms === 'skin' || !of.arms ? of.skin : of.arms);
        this._matLegs.diffuseColor = c3(of.legs);
        this.shoeMat.diffuseColor = c3(of.shoes || of.legs);
        const glow = of.glow ? c3(of.glow).scale(0.18) : new BABYLON.Color3(0, 0, 0);
        for (const m of [this._matTorso, this._matArms, this._matLegs]) m.emissiveColor = glow;
        this._faceMat.diffuseTexture = Gfx.faceTexture(l.face);
        this._faceMat.diffuseTexture.hasAlpha = true;
        if (prev.outfit !== l.outfit || l.custom) { this._setDecal(of.decal); this._setExtra(of.extra); }
        if (prev.hat !== l.hat) {
            for (const m of this._hat) m.dispose();
            this._hat = buildPrims(this.scene, NoobLooks.HATS[l.hat] || [], this.hatNode, this.name + '-hatp');
        }
        if (prev.bat !== l.bat && this.toolKind === 'bat') this.setTool('bat', 0, true);
        if (prev.trail !== l.trail) this._setTrail(l.trail);
        if (prev.aura !== l.aura) this._setAura(l.aura);
        if (this.onLook) this.onLook();
    }

    // Детали наряда (уши, плавник, чашка, крылья…): примитивы на голове и на теле.
    _setExtra(extra) {
        for (const m of this._extra || []) m.dispose();
        this._extra = [];
        if (!extra) return;
        if (extra.head) this._extra.push(...buildPrims(this.scene, extra.head, this.headNode, this.name + '-xh'));
        if (extra.body) this._extra.push(...buildPrims(this.scene, extra.body, this.body, this.name + '-xb'));
    }

    // Рисунок на груди: плоскость с текстурой спереди торса.
    _setDecal(kind) {
        if (this._decal) { this._decal.dispose(false, true); this._decal = null; }
        if (!kind) return;
        const p = Gfx.textPlane(this.name + '-decal', 66, 66, 2, (c, w, h) => Noob.drawDecal(c, kind, w, h));
        p.parent = this.body;
        p.position.set(20.6, 120, 0);
        p.rotation.y = -Math.PI / 2;
        /** @type {BABYLON.StandardMaterial} */ (p.material).emissiveColor = new BABYLON.Color3(0.25, 0.25, 0.25);
        this._decal = p;
    }

    static drawDecal(c, kind, w, h) {
        const cx = w / 2, cy = h / 2, s = w / 132;
        c.save(); c.scale(s, s);
        const X = 66, Y = 66;
        c.lineJoin = 'round'; c.lineCap = 'round';
        const star = (x, y, r1, r2, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); };
        switch (kind) {
            case 'star': star(X, Y, 36, 15, '#ffd23a'); break;
            case 'stripe': c.fillStyle = '#ffffff'; c.fillRect(0, 54, 132, 14); c.fillRect(0, 76, 132, 6); break;
            case 'belt': c.fillStyle = '#c8261e'; c.fillRect(0, 100, 132, 14); break;
            case 'crown': c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(30, 90); c.lineTo(30, 50); c.lineTo(48, 68); c.lineTo(66, 42); c.lineTo(84, 68); c.lineTo(102, 50); c.lineTo(102, 90); c.closePath(); c.fill(); break;
            case 'wave': c.strokeStyle = '#ffffff'; c.lineWidth = 8; for (const y of [50, 74]) { c.beginPath(); for (let x = 10; x <= 122; x += 4) c.lineTo(x, y + Math.sin(x / 12) * 8); c.stroke(); } break;
            case 'buttons': c.fillStyle = '#1b1b1b'; for (const y of [40, 66, 92]) { c.beginPath(); c.arc(X, y, 7, 0, 7); c.fill(); } c.fillStyle = '#e8343a'; c.fillRect(0, 10, 132, 12); break;
            case 'overalls': c.fillStyle = '#3b6fc4'; c.fillRect(30, 50, 72, 82); c.fillRect(30, 0, 12, 60); c.fillRect(90, 0, 12, 60); c.fillStyle = '#ffd23a'; c.fillRect(34, 52, 8, 8); c.fillRect(90, 52, 8, 8); break;
            case 'code': c.fillStyle = '#2fe07a'; c.font = '900 22px monospace'; c.fillText('</>', 30, 60); c.fillText('01', 44, 92); break;
            case 'heart': c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(X, 98); c.bezierCurveTo(10, 60, 40, 22, X, 50); c.bezierCurveTo(92, 22, 122, 60, X, 98); c.fill(); break;
            case 'egg': c.fillStyle = '#fff6e0'; c.beginPath(); c.ellipse(X, Y + 4, 26, 34, 0, 0, 7); c.fill(); c.strokeStyle = '#7a4a26'; c.lineWidth = 5; c.beginPath(); c.moveTo(42, 62); c.lineTo(54, 72); c.lineTo(66, 60); c.lineTo(78, 72); c.lineTo(90, 62); c.stroke(); break;
            case 'cross': c.fillStyle = '#e8343a'; c.fillRect(54, 30, 24, 72); c.fillRect(30, 54, 72, 24); break;
            case 'planet': c.fillStyle = '#ff8a1f'; c.beginPath(); c.arc(X, Y, 24, 0, 7); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 6; c.beginPath(); c.ellipse(X, Y, 44, 12, -0.4, 0, 7); c.stroke(); break;
            case 'skull': c.fillStyle = '#1b1b1b'; c.beginPath(); c.arc(X, 58, 26, 0, 7); c.fill(); c.fillRect(50, 70, 32, 22); c.fillStyle = '#f1e6d0'; c.beginPath(); c.arc(56, 58, 7, 0, 7); c.arc(76, 58, 7, 0, 7); c.fill(); break;
            case 'rip': c.fillStyle = '#8f99a3'; c.beginPath(); c.roundRect(36, 30, 60, 76, 26); c.fill(); c.fillStyle = '#1b1b1b'; c.font = '900 22px Montserrat, sans-serif'; c.textAlign = 'center'; c.fillText('RIP', X, 76); break;
            case 'bolt': c.fillStyle = '#ffe14a'; c.beginPath(); c.moveTo(74, 18); c.lineTo(40, 72); c.lineTo(64, 72); c.lineTo(56, 114); c.lineTo(94, 56); c.lineTo(70, 56); c.closePath(); c.fill(); break;
            case 'flame': c.fillStyle = '#ffd000'; c.beginPath(); c.moveTo(X, 16); c.quadraticCurveTo(104, 64, 90, 104); c.quadraticCurveTo(X, 124, 42, 104); c.quadraticCurveTo(28, 64, X, 16); c.fill(); c.fillStyle = '#ff5a00'; c.beginPath(); c.moveTo(X, 52); c.quadraticCurveTo(88, 84, 78, 104); c.lineTo(54, 104); c.quadraticCurveTo(44, 84, X, 52); c.fill(); break;
            case 'snow': c.strokeStyle = '#ffffff'; c.lineWidth = 7; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(X - Math.cos(a) * 36, Y - Math.sin(a) * 36); c.lineTo(X + Math.cos(a) * 36, Y + Math.sin(a) * 36); c.stroke(); } break;
            case 'candy': for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff3b6b'; c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, 34, i * Math.PI / 3, (i + 1) * Math.PI / 3); c.fill(); } break;
            case 'stars': for (const [x, y, r] of [[34, 34, 10], [90, 48, 14], [56, 92, 9], [104, 100, 7], [20, 80, 6]]) star(x, y, r, r * 0.45, '#ffffff'); break;
            case 'banana': c.strokeStyle = '#7a5a10'; c.lineWidth = 6; c.beginPath(); c.arc(X, 20, 70, 0.6 * Math.PI, 0.4 * Math.PI, true); c.stroke(); break;
            case 'gem': c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(40, 50); c.lineTo(92, 50); c.lineTo(X, 104); c.closePath(); c.fill(); c.fillStyle = '#bff4ff'; c.beginPath(); c.moveTo(40, 50); c.lineTo(52, 32); c.lineTo(80, 32); c.lineTo(92, 50); c.closePath(); c.fill(); break;
            case 'rainbow': ['#ff3b3b', '#ff8a1f', '#ffe14a', '#3bdc5a', '#3b8bff', '#a54dff'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 22, 132, 22); }); break;
            case 'woodgrain': c.strokeStyle = '#7a5230'; c.lineWidth = 5; for (const y of [24, 52, 84, 110]) { c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(40, y - 10, 90, y + 10, 132, y - 4); c.stroke(); } c.beginPath(); c.ellipse(86, 66, 10, 6, 0, 0, 7); c.stroke(); break;
            case 'sharkbelly': c.fillStyle = '#f4f8fb'; c.beginPath(); c.ellipse(X, 86, 46, 50, 0, 0, 7); c.fill(); c.strokeStyle = '#4f6f8f'; c.lineWidth = 5; for (const x of [22, 34, 98, 110]) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, 56); c.stroke(); } break;
            case 'bomb': c.fillStyle = '#2b2b2b'; c.beginPath(); c.arc(X, 74, 30, 0, 7); c.fill(); c.fillRect(56, 32, 20, 16); c.strokeStyle = '#ffd23a'; c.lineWidth = 5; c.beginPath(); c.moveTo(66, 32); c.quadraticCurveTo(78, 16, 92, 20); c.stroke(); c.fillStyle = '#ff5a00'; c.beginPath(); c.arc(94, 18, 7, 0, 7); c.fill(); break;
            case 'tutu': c.fillStyle = '#ffffff'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 17, 90); c.lineTo(i * 17 + 8, 132); c.lineTo(i * 17 + 17, 90); c.fill(); } c.fillStyle = '#ff5fa2'; c.fillRect(0, 84, 132, 10); break;
            case 'leaves': c.fillStyle = '#5ad14a'; for (const [x, y] of [[30, 30], [80, 26], [56, 64], [104, 70], [24, 96], [76, 104]]) { c.beginPath(); c.ellipse(x, y, 18, 10, 0.6, 0, 7); c.fill(); } break;
            case 'spines': c.strokeStyle = '#e9f5c8'; c.lineWidth = 4; for (const [x, y] of [[24, 24], [70, 30], [110, 22], [40, 70], [92, 74], [22, 110], [64, 112], [112, 108]]) { c.beginPath(); c.moveTo(x - 7, y - 7); c.lineTo(x + 7, y + 7); c.moveTo(x + 7, y - 7); c.lineTo(x - 7, y + 7); c.stroke(); } break;
            case 'sixseven': { c.font = '900 64px Montserrat, "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = '#ffffff';
                const g = c.createLinearGradient(20, 0, 112, 0); g.addColorStop(0, '#ffd23a'); g.addColorStop(0.5, '#ff5fd8'); g.addColorStop(1, '#3bdcff');
                c.strokeText('67', X, 70); c.fillStyle = g; c.fillText('67', X, 70); break; }
            case 'eyes': c.fillStyle = '#ff2b2b'; c.beginPath(); c.ellipse(46, 60, 12, 6, 0.3, 0, 7); c.ellipse(86, 60, 12, 6, -0.3, 0, 7); c.fill(); break;
        }
        c.restore();
    }

    _setTrail(id) {
        if (this._trail) { this._trail.dispose(); this._trail = null; }
        const cols = NoobLooks.TRAILS[id];
        if (!cols) return;
        const t = new BABYLON.TrailMesh(this.name + '-trail', /** @type {any} */ (this.torso), this.scene, 26, 34, true);
        const m = new BABYLON.StandardMaterial(this.name + '-trailm', this.scene);
        m.emissiveColor = BABYLON.Color3.FromHexString(cols[0]);
        m.diffuseColor = new BABYLON.Color3(0, 0, 0);
        m.disableLighting = true;
        m.alpha = 0.55;
        m.backFaceCulling = false;
        m.metadata = { toon: false };
        t.material = m;
        t.isPickable = false;
        t.renderingGroupId = World3D.LAYER.OVERLAY;
        this._trail = t;
        this._trailCols = cols.map(h => BABYLON.Color3.FromHexString(h));
        this._trailT = 0;
    }

    _setAura(id) {
        if (this._aura) { this._aura.dispose(); this._aura = null; }
        const a = NoobLooks.AURAS[id];
        const fx = window.app && window.app.fx;
        if (!a || !fx) return;
        const root = this.root;
        this._aura = fx.create({
            follow: () => root.position.add(new BABYLON.Vector3(0, 100, 0)),
            rate: Math.round(a.rate * (IS_MOBILE ? 0.6 : 1)), capacity: 80,
            life: [0.6, 1.3], size: a.size, speed: [10, 30],
            box: [[-55, -90, -55], [55, 90, 55]],
            direction: [[-0.3, a.up > 0 ? 0.6 : -0.6, -0.3], [0.3, a.up > 0 ? 1 : -1, 0.3]],
            gravity: [0, a.up * 0.6, 0],
            color: a.color, color2: a.color2, blend: a.blend || 'additive',
            sizeGradient: [[0, 0.4], [0.3, 1], [1, 0]],
        });
    }

    // Инструмент в руке: 'pickaxe' (tier — индекс кирки), 'bat' (скин из look.bat), null.
    setTool(kind, tier, force) {
        if (!force && kind === this.toolKind && tier === this.toolTier) return;
        for (const m of this._tool) m.dispose();
        this._tool = [];
        this.toolKind = kind; this.toolTier = tier || 0;
        if (kind === 'pickaxe') this._tool = Noob.buildPickaxe(this.scene, GameData.pickaxe(tier), this.hand, this.name);
        else if (kind === 'bat') this._tool = buildPrims(this.scene, NoobLooks.BATS[this.look.bat] || NoobLooks.BATS.wood, this.hand, this.name + '-bat');
    }

    static buildPickaxe(scene, px, parent, name) {
        const big = 1 + Math.min(0.6, GameData.PICKAXES.indexOf(px) * 0.05);
        const prims = [
            ['box', 104, 9, 9, 52, 0, 0, px.handle],
            ['box', 12, 12, 12, 2, 0, 0, px.handle],
            ['box', 18 * big, 20 * big, 16, 104, 0, 0, px.head],
            ['box', 14 * big, 30 * big, 12, 104, 22 * big, 0, px.head, [0, 0, 18]],
            ['box', 14 * big, 30 * big, 12, 104, -22 * big, 0, px.head, [0, 0, -18]],
            ['box', 10 * big, 18 * big, 9, 98, 44 * big, 0, px.head, [0, 0, 36]],
            ['box', 10 * big, 18 * big, 9, 98, -44 * big, 0, px.head, [0, 0, -36]],
        ];
        const parts = buildPrims(scene, prims, parent, name + '-pick');
        if (px.glow) {
            const m = Gfx.mat(px.head, { emissive: px.glow, scene });
            for (let i = 2; i < parts.length; i++) parts[i].material = m;
        }
        return parts;
    }

    // Кадр анимации. s: { moving (0..1 доля скорости), air (bool), swing (0..1|-1), carry (bool), fall (0..1), dt }
    animate(dt, s) {
        const mv = s.moving || 0;
        this.phase += dt * (6 + 10 * mv) * (mv > 0.05 ? 1 : 0);
        const sw = Math.sin(this.phase) * Math.min(1, mv * 1.4);
        const legA = s.air ? 0.35 : sw * 0.75;
        this.legL.rotation.z = legA;
        this.legR.rotation.z = s.air ? -0.25 : -legA;
        let aL = -sw * 0.7, aR = sw * 0.7;
        const idle = Math.sin(performance.now() / 600) * 0.04;
        if (mv < 0.05 && !s.air) { aL = idle; aR = -idle; }
        if (s.air) { aL = 0.6; aR = 0.6; }
        if (this.toolKind && !s.carry) aR = 0.45 + aR * 0.25;   // рука с инструментом вперёд
        if (s.swing > 0) {
            // Замах: вверх-назад -> удар вперёд-вниз.
            const t = s.swing;
            aR = t < 0.35 ? 0.45 + (2.7 - 0.45) * (t / 0.35) : 2.7 - (2.7 - 0.25) * Math.min(1, (t - 0.35) / 0.3);
        }
        if (s.carry) { aL = 2.95; aR = 2.95; }
        // Приветствие (NPC): правая рука вверх и машет.
        if (s.wave > 0) aR = aR + (2.75 + Math.sin(performance.now() / 70) * 0.35 - aR) * s.wave;
        this.armL.rotation.z = aL;
        this.armR.rotation.z = aR;
        this.armL.rotation.x = s.carry ? -0.12 : 0;
        this.armR.rotation.x = s.carry ? 0.12 : (s.wave > 0 ? -0.35 * s.wave : 0);
        // Падение (оглушение): тело ложится на спину.
        const f = s.fall || 0;
        this.body.rotation.z = -f * Math.PI / 2;
        this.body.position.y = f * 22;
        this.body.position.x = -f * 60;
        if (this._trail && this._trailCols && this._trailCols.length > 1) {
            this._trailT += dt * 1.5;
            const n = this._trailCols.length, i = Math.floor(this._trailT) % n, k = this._trailT % 1;
            /** @type {BABYLON.StandardMaterial} */ (this._trail.material).emissiveColor = BABYLON.Color3.Lerp(this._trailCols[i], this._trailCols[(i + 1) % n], k);
        }
    }

    setVisible(on) { this.root.setEnabled(on); if (this._trail) this._trail.setEnabled(on); }

    dispose() {
        if (this._trail) this._trail.dispose();
        if (this._aura) this._aura.dispose();
        if (this._decal) this._decal.dispose(false, true);
        this.root.dispose(false, false);
    }
}

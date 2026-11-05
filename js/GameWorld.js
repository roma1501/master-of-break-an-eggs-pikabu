// GameWorld.js — мир по маркерам карты: зоны, базы-загоны (места питомцев, дорожка, табличка),
// яйца и их появление, Titanic Egg, упавшие питомцы, стражи зон, линия Safe Zone, вода, табло
// лидеров, стрелки-шевроны пути. Логика — в своих полях (x, y), Babylon — только вид.

// Свои типы покраски земли (до загрузки первой карты: скрипт выполняется раньше main.js).
if (typeof Terrain3D !== 'undefined') {
    Object.assign(Terrain3D.PAINT_COLORS, { candy: 0xf7a3ea, jungle: 0x3a9e3c, beach: 0xf2d9a0 });
    Object.assign(Terrain3D.PAINT_COLORS, { sand: 0xf0cf72, snow: 0xf3f8ff });
}

// Фигуры столкновений моделей карты (px модели; Nav.register).
if (typeof Nav !== 'undefined') {
    const P = 'assets/models/props/', N = 'assets/models/nature/';
    const blockShape = [{ t: 'box', x: 0, y: 0, w: 100, d: 100 }];
    const reg = {};
    // block_brick и block_caramel — тонкие полоски на границах зон (по ним ходят), не стены.
    for (const b of ['block_top_grass', 'block_top_sand', 'block_top_snow', 'block_top_pink', 'block_top_jungle', 'block_top_beach', 'block_blue']) reg[P + b + '.glb'] = blockShape;
    reg[P + 'plot.glb'] = [
        { t: 'box', x: 0, y: -444, w: 1200, d: 14, los: false }, { t: 'box', x: 0, y: 444, w: 1200, d: 14, los: false },
        { t: 'box', x: -594, y: 0, w: 14, d: 900, los: false },
        { t: 'box', x: 594, y: -300, w: 14, d: 300, los: false }, { t: 'box', x: 594, y: 300, w: 14, d: 300, los: false },
    ];
    reg[P + 'stall_pickaxe.glb'] = [{ t: 'box', x: 0, y: 0, w: 190, d: 370 }];
    reg[P + 'stall_trails.glb'] = [{ t: 'box', x: 0, y: 0, w: 190, d: 370 }];
    reg[P + 'merge_machine.glb'] = [{ t: 'box', x: 0, y: 0, w: 260, d: 430 }];
    reg[P + 'wheel_kiosk.glb'] = [{ t: 'box', x: 0, y: 0, w: 140, d: 240 }];
    reg[P + 'gift_box.glb'] = [{ t: 'box', x: 0, y: 0, w: 130, d: 130 }];
    for (const c of ['green', 'blue', 'pink']) reg[P + 'leaderboard_' + c + '.glb'] = [{ t: 'box', x: 0, y: 0, w: 60, d: 440 }];
    reg[P + 'lava_altar.glb'] = [{ t: 'circle', x: 0, y: 0, r: 140 }];
    reg[P + 'lamp_post.glb'] = [{ t: 'circle', x: 0, y: 0, r: 18 }];
    for (const t of ['tree_round', 'tree_tall', 'tree_dead', 'candy_tree', 'jungle_tree', 'palm_tree', 'pine_snow']) reg[N + t + '.glb'] = [{ t: 'circle', x: 0, y: 0, r: 40 }];
    for (const t of ['lollipop_red', 'lollipop_blue', 'lollipop_pink', 'candy_cane', 'bamboo']) reg[N + t + '.glb'] = [{ t: 'circle', x: 0, y: 0, r: 22 }];
    reg[N + 'cactus.glb'] = [{ t: 'circle', x: 0, y: 0, r: 34 }];
    reg[N + 'rock_big.glb'] = [{ t: 'circle', x: 0, y: 0, r: 120 }];
    reg[N + 'rock_slab.glb'] = [{ t: 'box', x: 0, y: 0, w: 240, d: 160, los: false }];
    reg[N + 'pyramid.glb'] = [{ t: 'box', x: 0, y: 0, w: 900, d: 900 }];
    reg[N + 'sphinx.glb'] = [{ t: 'box', x: 0, y: 0, w: 700, d: 300 }];
    reg[N + 'igloo.glb'] = [{ t: 'circle', x: 0, y: 0, r: 200 }];
    reg[N + 'jungle_ruin.glb'] = [{ t: 'box', x: 0, y: 0, w: 300, d: 500 }];
    reg[N + 'tiki.glb'] = [{ t: 'circle', x: 0, y: 0, r: 70 }];
    reg[N + 'shipwreck.glb'] = [{ t: 'box', x: 0, y: 0, w: 640, d: 260 }];
    reg[N + 'ice_crystal.glb'] = [{ t: 'circle', x: 0, y: 0, r: 60 }];
    reg[N + 'choco_block.glb'] = [{ t: 'box', x: 0, y: 0, w: 240, d: 140, los: false }];
    reg[N + 'coral_pink.glb'] = [{ t: 'circle', x: 0, y: 0, r: 60 }];
    reg[N + 'coral_purple.glb'] = [{ t: 'circle', x: 0, y: 0, r: 50 }];
    Nav.register(reg);
}

// Локальная точка базы -> мир (yaw — курс базы, градусы).
function baseToWorld(b, lx, ly) {
    const a = b.yaw * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return { x: b.x + lx * c - ly * s, y: b.y + lx * s + ly * c };
}

class Base {
    constructor(world, def, index) {
        this.world = world;
        this.index = index;
        this.x = def.x; this.y = def.y; this.yaw = (def.rot && def.rot[1]) || 0;
        /** @type {any} */
        this.owner = null;
        this.level = 1;
        this.tread = 0;
        /** @type {{ x: number, y: number, pet: any, view: any, label: any }[]} */
        this.slots = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
            const p = baseToWorld(this, -470 + c * 200, -290 + r * 290);
            this.slots.push({ x: p.x, y: p.y, pet: null, view: null, label: null });
        }
        this.entry = baseToWorld(this, 640, 0);
        this.signPos = baseToWorld(this, 470, 300);
        this.treadPos = baseToWorld(this, 420, -290);
        this.heading = this.yaw * Math.PI / 180;
    }
    get slotCount() { return GameData.penSlots(this.level); }
    // Внутри участка (локальные координаты с запасом).
    contains(x, y, pad) {
        const a = -this.heading, dx = x - this.x, dy = y - this.y;
        const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
        const p = pad || 0;
        return lx > -600 - p && lx < 600 + p && ly > -450 - p && ly < 450 + p;
    }
    onTreadmill(x, y) {
        const a = -this.heading, dx = x - this.treadPos.x, dy = y - this.treadPos.y;
        const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
        return Math.abs(lx) < 130 && Math.abs(ly) < 70;
    }
    freeSlot() {
        for (let i = 0; i < this.slotCount; i++) if (!this.slots[i].pet) return i;
        return -1;
    }
    pets() { return this.slots.filter(s => s.pet).map(s => s.pet); }
    income() {
        let sum = 0;
        for (let i = 0; i < this.slotCount; i++) if (this.slots[i].pet) sum += GameData.incomeOf(this.slots[i].pet);
        return sum;
    }
}

/** @satisfies {Record<string, any>} */
const World = {
    /** @type {LoryApp | null} */
    app: null,
    /** @type {any[]} */
    zones: [],
    /** @type {Base[]} */
    bases: [],
    /** @type {any[]} */
    spots: [],
    /** @type {any[]} */
    dropped: [],
    /** @type {any[]} */
    guardians: [],
    /** @type {any} */
    titanic: null,
    titanicTimer: 0,
    safeY: 3950,
    /** @type {Record<string, { x: number, y: number }>} */
    shops: {},
    /** @type {any[]} */
    chevrons: [],
    /** @type {any[]} */
    pools: [],
    /** @type {ShopNpc[]} */
    npcs: [],
    _t: 0,

    async init(app) {
        this.app = app;
        const loc = app.location;
        const scene = loc.view.scene;
        Gfx.init(scene);
        Models.init(loc.view);
        // Камера видит дальше (длинный каньон), небо-купол внутри дальности.
        loc.view.camera.maxZ = 40000;
        // «Стады» на блоках и постройках.
        for (const rec of loc.objects) {
            const m = rec.def && rec.def.model || '';
            if (rec.mesh && /props\/(block_|plot|stall_|merge|wheel_kiosk|leaderboard|bridge)/.test(m)) Gfx.studMesh(rec.mesh);
        }
        // Земля — тоже пластик со «стадами» (текстура тайла).
        // Зоны по маркерам, по порядку от хаба (y).
        this.zones = loc.markers('zone').slice().sort((a, b) => a.y - b.y).map((m, i) => ({
            i, x: m.x, y: m.y, hx: (m.scale[0] || 10) * 100, hy: (m.scale[2] || 14) * 100,
            y0: m.y - (m.scale[2] || 14) * 100, y1: m.y + (m.scale[2] || 14) * 100, data: GameData.zoneOf(i),
        }));
        const sz = loc.marker('safezone');
        if (sz) this.safeY = sz.y;
        this.shops = {};
        for (const n of ['shop-pickaxe', 'shop-cosmetic', 'merge', 'wheel', 'gift']) { const m = loc.marker(n); if (m) this.shops[n] = { x: m.x, y: m.y }; }
        this.pools = loc.markers('pool').map(m => ({ x: m.x, y: m.y, hx: m.scale[0] * 100, hy: m.scale[2] * 100 }));
        Nav.build(loc);
        // Базы.
        this.bases = loc.markers('base').slice().sort((a, b) => (a.name === 'base' ? -1 : b.name === 'base' ? 1 : a.name.localeCompare(b.name, 'en', { numeric: true })))
            .map((m, i) => new Base(this, m, i));
        await Promise.all(this.bases.map(b => this.buildBase(b)));
        this.buildSafeLine(scene);
        this.buildPools(scene);
        this.buildChevrons(scene);
        this.buildTitanicSign(scene);
        this.buildLeaderboards(scene);
        // Яйца на точках.
        this.spots = loc.markers('egg').map(m => ({ x: m.x, y: m.y, zone: this.zoneAt(m.x, m.y), egg: null, timer: Math.random() * 2 }));
        await Promise.all(this.spots.filter(s => s.zone >= 0).map(s => this.spawnEgg(s)));
        this.titanicTimer = GameData.TITANIC_FIRST_SEC;
        // Стражи.
        this.guardians = [];
        for (const m of loc.markers('guardian')) {
            const z = this.zoneAt(m.x, m.y);
            if (z < 0) continue;
            this.guardians.push(new Guardian(this, z, m));
        }
        await Promise.all(this.guardians.map(g => g.load()));
        // Продавцы-NPC: роль — по ближайшей точке магазина.
        const roles = [['shop-pickaxe', 'pickaxe'], ['shop-cosmetic', 'cosmetic'], ['merge', 'merge'], ['wheel', 'wheel']];
        this.npcs = loc.markers('npc').map(m => {
            let role = 'pickaxe', bd = Infinity;
            for (const [key, r] of roles) { const s = this.shops[key]; if (s) { const d = Math.hypot(s.x - m.x, s.y - m.y); if (d < bd) { bd = d; role = r; } } }
            return new ShopNpc(this, m, role);
        });
    },

    zoneAt(x, y) {
        for (const z of this.zones) if (y >= z.y0 && y < z.y1 && Math.abs(x - z.x) <= z.hx + 1600) return z.i;
        return -1;
    },
    inHub(x, y) { return y < this.safeY; },
    // Открытое пространство (пол хаба или каньона, без стен-блоков) — для камеры.
    // Табло моста над входом в каньон (камера не должна в него влезать).
    inBridge(x, y, h) {
        const br = this._bridge;
        return !!br && h > br.h0 && h < br.h0 + 520 && Math.abs(y - br.y) < 130 && x > 1500 && x < 3700;
    },
    isOpen(x, y, pad) {
        const p = pad || 0;
        if (y > 400 + p && y < 4000 && x > 400 + p && x < 4800 - p) return true;
        const z = this.zones;
        const yEnd = z.length ? z[z.length - 1].y1 : 20800;
        return y >= 3900 && y < yEnd - p && x > 1600 + p && x < 3600 - p;
    },
    inPool(x, y) { return this.pools.some(p => Math.abs(x - p.x) < p.hx && Math.abs(y - p.y) < p.hy); },
    // Высота опоры: земля (Nav) или лента беговой дорожки базы (40 px).
    ground(x, y) {
        for (const b of this.bases) if (b.onTreadmill(x, y)) return Nav.height(x, y) + 40;
        return Nav.height(x, y);
    },

    // --- Базы ---
    async buildBase(b) {
        const scene = this.app.location.view.scene;
        const view = this.app.location.view;
        // Плитки мест (светлая трава в деревянной рамке), табличка, дорожка.
        b.pads = [];
        for (let i = 0; i < b.slots.length; i++) {
            const s = b.slots[i];
            const pad = BABYLON.MeshBuilder.CreateBox('pad', { width: 150, height: 6, depth: 150 }, scene);
            pad.position.set(s.x, 16, s.y);
            pad.rotation.y = -b.heading;
            pad.material = Gfx.mat('#7ad957', { studs: true });
            pad.isPickable = false;
            pad.receiveShadows = true;
            b.pads.push(pad);
        }
        const load = async (url, x, y, yaw, h) => {
            try {
                const model = await Model3D.load(url);
                const mesh = Model3D.build(model, scene, { name: 'base' + b.index });
                mesh.position.set(x, h || 0, y);
                mesh.rotation.y = -yaw;
                World3D.addObject(view, mesh, 'prop');
                Gfx.studMesh(mesh);
                return mesh;
            } catch (e) { return null; }
        };
        b.signMesh = await load('assets/models/props/sign_board.glb', b.signPos.x, b.signPos.y, b.heading + Math.PI);
        b.treadMesh = await load('assets/models/props/treadmill.glb', b.treadPos.x, b.treadPos.y, b.heading + Math.PI);
        if (b.treadMesh) b.belt = b.treadMesh.getChildMeshes(false).find(m => m.metadata && m.metadata.part === 'Belt') || null;
        // Надпись на табличке — плоскость перед доской (доска смотрит к выходу участка).
        // Надпись с обеих сторон доски: лицевая (к выходу участка) и задняя.
        b.signText = Gfx.textPlane('sign' + b.index, 250, 140, 2, () => {});
        const fp = baseToWorld(b, 470 - 9, 300);
        b.signText.position.set(fp.x, 120 + 75, fp.y);
        b.signText.rotation.y = -b.heading + Math.PI / 2;
        b.signBack = Gfx.textPlane('signb' + b.index, 250, 140, 2, () => {});
        const bp = baseToWorld(b, 470 + 25, 300);
        b.signBack.position.set(bp.x, 120 + 75, bp.y);
        b.signBack.rotation.y = -b.heading - Math.PI / 2;
        this.updateSign(b);
        this.updatePads(b);
    },

    updateSign(b) {
        if (!b.signText) return;
        const max = b.level >= GameData.PEN_MAX_LEVEL;
        const price = GameData.penPrice(b.level);
        const draw = (c, w, h) => {
            Gfx.strokeText(c, Lang.t('sign.upgradePen'), w / 2, h * 0.2, Math.round(h * 0.16), '#ffffff', '#0b1430');
            Gfx.strokeText(c, max ? Lang.t('sign.max') : Lang.t('sign.lv', { a: b.level, b: b.level + 1 }), w / 2, h * 0.46, Math.round(h * 0.17), '#7dff6a', '#0b1430');
            if (!max) {
                c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(w * 0.18, h * 0.62, w * 0.64, h * 0.3, 10); c.fill();
                Gfx.strokeText(c, GameData.money(price), w / 2, h * 0.775, Math.round(h * 0.18), '#1b1b1b', '#ffffff');
            }
        };
        b.signText.metadata.redraw(draw);
        if (b.signBack) b.signBack.metadata.redraw(draw);
    },

    updatePads(b) {
        for (let i = 0; i < b.pads.length; i++) {
            const open = i < b.slotCount;
            b.pads[i].setEnabled(open);
        }
    },

    // Поставить питомца на место базы (вид + подпись).
    async placePet(b, slotIdx, pet) {
        const s = b.slots[slotIdx];
        if (!s) return;
        s.pet = pet;
        const v = await PetView.create(pet);
        if (s.pet !== pet) { v.dispose(); return; }
        if (s.view) s.view.dispose();
        s.view = v;
        v.place(s.x, s.y, 20, b.heading);   // мордой ко входу в загон
        v.home = { x: s.x, y: s.y };
        v.showLabel(true);
    },
    clearSlot(b, slotIdx) {
        const s = b.slots[slotIdx];
        if (!s) return null;
        const pet = s.pet;
        s.pet = null;
        if (s.view) { s.view.dispose(); s.view = null; }
        return pet;
    },

    // --- Яйца ---
    pickEggType(zone) {
        const list = GameData.eggsOfZone(zone);
        const w = [0.5, 0.32, 0.18];
        let t = Math.random();
        for (let i = 0; i < list.length; i++) { t -= w[i] || 0; if (t <= 0) return list[i]; }
        return list[0];
    },

    async spawnEgg(spot, type) {
        const et = type || this.pickEggType(spot.zone);
        const egg = { type: et, hp: et.hp, max: et.hp, x: spot.x, y: spot.y, mesh: null, nest: null, shake: 0, spot, titanic: et.id === 'titanic', hits: new Map(), height: 112, r: 60, tz: 0 };
        spot.egg = egg;
        const scale = egg.titanic ? GameData.TITANIC.scale : 1;
        const [e, n] = await Promise.all([Models.egg(et, scale), Models.nest(scale)]);
        if (spot.egg !== egg) { e.mesh.dispose(); n.mesh.dispose(); return; }
        egg.mesh = e.mesh; egg.nest = n.mesh; egg.height = e.height; egg.r = 60 * scale;
        const yaw = Math.random() * Math.PI * 2;
        egg.nest.position.set(spot.x, 0, spot.y); egg.nest.rotation.y = yaw;
        egg.mesh.position.set(spot.x, 9 * scale, spot.y); egg.mesh.rotation.y = yaw;
        egg.pop = 0;
        egg.mesh.scaling.setAll(0.01);
        egg.baseScale = scale;
        egg.label = UI.labels.add({ kind: 'egg', egg, x: spot.x, y: spot.y, h: egg.height + 34 * scale });
        return egg;
    },

    removeEgg(egg) {
        if (egg.mesh) egg.mesh.dispose();
        if (egg.nest) egg.nest.dispose();
        if (egg.label) UI.labels.remove(egg.label);
        egg.mesh = null;
        if (egg.spot && egg.spot.egg === egg) { egg.spot.egg = null; egg.spot.timer = GameData.EGG_RESPAWN[0] + Math.random() * (GameData.EGG_RESPAWN[1] - GameData.EGG_RESPAWN[0]); }
    },

    // Ближайшее яйцо перед точкой (для удара).
    eggNear(x, y, heading, reach) {
        let best = null, bd = Infinity;
        const all = this.spots.map(s => s.egg).concat(this.titanic ? [this.titanic] : []);
        for (const e of all) {
            if (!e || !e.mesh || e.hp <= 0) continue;
            const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) - e.r;
            if (d > reach) continue;
            if (heading != null && d > 30) {
                let da = Math.atan2(dy, dx) - heading;
                da = Math.atan2(Math.sin(da), Math.cos(da));
                if (Math.abs(da) > 1.3) continue;
            }
            if (d < bd) { bd = d; best = e; }
        }
        return best;
    },

    // --- Titanic Egg ---
    async spawnTitanic(power) {
        if (this.titanic) return;
        // Точное имя: marker('titanic') по префиксу вернул бы и табличку 'titanic-sign'.
        const m = this.app.location.markers('titanic').find(d => d.name === 'titanic');
        if (!m) return;
        const spot = { x: m.x, y: m.y, zone: this.zoneAt(m.x, m.y), egg: null, timer: 0, titanic: true };
        const t = /** @type {any} */ (GameData.TITANIC);
        // Площадка под Титана: обычные яйца рядом убираются и не появляются, пока он жив.
        this._titanicSpot = { x: m.x, y: m.y, r: 560 };
        for (const sp of this.spots) if (sp.egg && Math.hypot(sp.x - m.x, sp.y - m.y) < 560) this.removeEgg(sp.egg);
        const egg = await this.spawnEgg(spot, t);
        if (!egg) return;
        egg.max = egg.hp = Math.max(t.hpMin, Math.round(t.hpPerPower * power));
        // Зона игрока: самая дальняя, где яйцо бьётся не дольше 60 ударов.
        let tz = 0;
        for (let z = 0; z < GameData.ZONES.length; z++) if (GameData.eggsOfZone(z)[0].hp / Math.max(1, power) <= 60) tz = z;
        egg.tz = tz;
        this.titanic = egg;
        spot.egg = null;   // не точка респавна
        egg.spot = null;
    },

    // --- Упавшие питомцы (лежат с таймером, взять может кто угодно) ---
    async dropPet(pet, x, y, h, owner) {
        const v = await PetView.create(pet);
        const d = { pet, view: v, x, y, t: GameData.DROP_SECONDS, owner: owner || null, from: h || 0 };
        v.place(x, y, 0, Math.random() * 6.28);
        v.showLabel(true, d);
        this.dropped.push(d);
        return d;
    },
    removeDropped(d) {
        const i = this.dropped.indexOf(d);
        if (i >= 0) this.dropped.splice(i, 1);
        d.view.dispose();
    },
    droppedNear(x, y, r) {
        let best = null, bd = r;
        for (const d of this.dropped) { const dd = Math.hypot(d.x - x, d.y - y); if (dd < bd) { bd = dd; best = d; } }
        return best;
    },

    // --- Линия Safe Zone: красная полоса, надписи и щиты на полу ---
    buildSafeLine(scene) {
        const m = this.app.location.marker('safezone');
        if (!m) return;
        const w = (m.scale[0] || 10) * 200;
        const strip = BABYLON.MeshBuilder.CreateBox('safe-line', { width: w, height: 4, depth: 22 }, scene);
        strip.position.set(m.x, 2, m.y);
        strip.material = Gfx.mat('#ff2424', { emissive: '#7a0000' });
        strip.receiveShadows = true;
        for (let i = 0; i < 2; i++) {
            const p = Gfx.textPlane('safe-text' + i, 520, 110, 1.4, (c, tw, th) => {
                c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, tw, th);
                Gfx.strokeText(c, Lang.t('hud.safeZone'), tw / 2, th / 2, Math.round(th * 0.62), '#ffffff', '#111111');
            });
            p.rotation.x = Math.PI / 2;
            p.rotation.y = i ? Math.PI : 0;   // i=0 читается из хаба, i=1 — со стороны каньона (проверено скриншотами)
            p.position.set(m.x + (i ? 520 : -520), 3, m.y + (i ? 80 : -80));
            /** @type {BABYLON.StandardMaterial} */ (p.material).emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        }
    },

    // --- Вода: плоские прозрачные «детали» Roblox с бегущими бликами ---
    buildPools(scene) {
        if (!this.pools.length) return;
        const tex = new BABYLON.DynamicTexture('water-tex', { width: 256, height: 256 }, scene, true);
        const c = /** @type {CanvasRenderingContext2D} */ (tex.getContext());
        c.fillStyle = '#2f9cff'; c.fillRect(0, 0, 256, 256);
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 5;
        for (let i = 0; i < 9; i++) { c.beginPath(); const y = i * 30 + 10; c.moveTo(0, y); c.bezierCurveTo(64, y - 12, 128, y + 12, 256, y); c.stroke(); }
        tex.update(true);
        const mat = new BABYLON.StandardMaterial('water', scene);
        mat.diffuseTexture = tex; mat.alpha = 0.78; mat.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6); mat.specularPower = 64;
        mat.emissiveColor = new BABYLON.Color3(0.12, 0.2, 0.32);
        mat.metadata = { toon: false };
        this._waterTex = tex;
        for (const p of this.pools) {
            const plane = BABYLON.MeshBuilder.CreateGround('pool', { width: p.hx * 2, height: p.hy * 2 }, scene);
            plane.position.set(p.x, 7, p.y);
            plane.material = mat;
            plane.isPickable = false;
            tex.uScale = p.hx / 200; tex.vScale = p.hy / 200;
            const bank = BABYLON.MeshBuilder.CreateBox('bank', { width: p.hx * 2 + 30, height: 5, depth: p.hy * 2 + 30 }, scene);
            bank.position.set(p.x, 2, p.y);
            bank.material = Gfx.mat('#e9d38f', { studs: true });
        }
    },

    // --- Шевроны пути к цели (как в видео): пул белых треугольников по земле ---
    buildChevrons(scene) {
        const t = Gfx.chevronTemplate(scene);
        t.material = Gfx.mat('#ffffff', { emissive: '#5a5a5a' });
        t.isVisible = false;
        World3D.addObject(this.app.location.view, t, 'actor', { castShadow: false, ink: false, outline: false });
        this.chevronTpl = t;
        this.chevrons = [];
        for (let i = 0; i < 26; i++) {
            const c = t.createInstance('chev' + i);
            c.isPickable = false;
            c.setEnabled(false);
            this.chevrons.push(c);
        }
        this._chevPath = null;
        this._chevTarget = null;
    },

    // Путь от (x, y) к цели: шевроны через каждые 120 px, бегут вперёд.
    updateChevrons(dt, from, target) {
        this._t += dt;
        if (!target) { for (const c of this.chevrons) c.setEnabled(false); this._chevPath = null; return; }
        this._chevAge = (this._chevAge || 0) + dt;
        const moved = !this._chevFrom || Math.hypot(from.x - this._chevFrom.x, from.y - this._chevFrom.y) > 120;
        if (!this._chevPath || moved || this._chevAge > 1.2 || !this._chevTarget || this._chevTarget.x !== target.x || this._chevTarget.y !== target.y) {
            const way = Nav.path(from.x, from.y, target.x, target.y, 30, { partial: true }) || [{ x: target.x, y: target.y }];
            this._chevPath = [{ x: from.x, y: from.y }].concat(way);
            this._chevFrom = { x: from.x, y: from.y };
            this._chevTarget = { x: target.x, y: target.y };
            this._chevAge = 0;
        }
        const path = this._chevPath;
        const step = 120, off = (this._t * 140) % step;
        let i = 0, seg = 0, acc = -off + 90;
        let ax = path[0].x, ay = path[0].y;
        for (let k = 1; k < path.length && i < this.chevrons.length; k++) {
            const bx = path[k].x, by = path[k].y, len = Math.hypot(bx - ax, by - ay);
            const hd = Math.atan2(by - ay, bx - ax);
            while (acc <= len && i < this.chevrons.length) {
                if (acc >= 0) {
                    const t = acc / Math.max(1, len), x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
                    const c = this.chevrons[i++];
                    c.setEnabled(true);
                    c.position.set(x, this.ground(x, y) + 8, y);
                    c.rotation.y = -hd;
                    const fade = Math.min(1, (path.length - k) * 0.5 + (len - acc) / 300);
                    c.scaling.setAll(0.75 + 0.25 * Math.min(1, fade));
                }
                acc += step;
            }
            acc -= len; seg++;
            ax = bx; ay = by;
        }
        for (; i < this.chevrons.length; i++) this.chevrons[i].setEnabled(false);
    },

    // --- Табло Titanic Egg на мосту ---
    buildTitanicSign(scene) {
        const m = this.app.location.marker('titanic-sign');
        if (!m) return;
        this._bridge = { y: m.y, h0: m.h - 150 };
        // Меши балки-табло (для полупрозрачности, когда закрывает игрока).
        const rec = this.app.location.objects.find(r => r.def && /bridge_sign\.glb$/.test(r.def.model || ''));
        this._bridgeMeshes = rec && rec.mesh ? [rec.mesh].concat(rec.mesh.getChildMeshes(false)) : [];
        this._bridgeA = 1;
        this.titanicSigns = [];
        for (let i = 0; i < 2; i++) {
            const p = Gfx.textPlane('titanic-sign' + i, 960, 220, 1, () => {});
            p.position.set(m.x, m.h, m.y + (i ? 76 : -76));
            p.rotation.y = i ? Math.PI : 0;   // проверено в игре: лицом наружу с обеих сторон моста
            /** @type {BABYLON.StandardMaterial} */ (p.material).emissiveColor = new BABYLON.Color3(0.85, 0.85, 0.85);
            this.titanicSigns.push(p);
        }
        this._signSec = -1;
    },

    drawTitanicSign() {
        if (!this.titanicSigns) return;
        const sec = this.titanic ? -2 : Math.max(0, Math.ceil(this.titanicTimer));
        if (sec === this._signSec) return;
        this._signSec = sec;
        const cols = ['#ff3b3b', '#ff8a1f', '#ffe14a', '#3bdc5a', '#3b8bff', '#a54dff'];
        const text = this.titanic ? Lang.t('titanic.active') : Lang.t('titanic.in', { t: UI.clock(sec) });
        for (const p of this.titanicSigns) p.metadata.redraw((c, w, h) => {
            const title = '??? ' + Lang.t('titanic.name');
            let fs = Math.round(h * 0.34);
            c.font = '900 ' + fs + 'px Montserrat, sans-serif';
            let tw = c.measureText(title).width;
            if (tw > w * 0.92) { fs = Math.floor(fs * w * 0.92 / tw); c.font = '900 ' + fs + 'px Montserrat, sans-serif'; tw = c.measureText(title).width; }
            let x = (w - tw) / 2;
            c.textBaseline = 'middle'; c.textAlign = 'left'; c.lineWidth = 9; c.lineJoin = 'round';
            for (let i = 0; i < title.length; i++) {
                const ch = title[i];
                c.strokeStyle = '#111'; c.strokeText(ch, x, h * 0.36);
                c.fillStyle = cols[i % cols.length]; c.fillText(ch, x, h * 0.36);
                x += c.measureText(ch).width;
            }
            Gfx.strokeText(c, text, w / 2, h * 0.76, Math.round(h * 0.2), '#ffffff', '#111111');
        });
    },

    setBridgeFade(target, dt) {
        if (!this._bridgeMeshes) return;
        const a = this._bridgeA + (target - this._bridgeA) * Math.min(1, dt * 8);
        if (Math.abs(a - this._bridgeA) < 0.004 && Math.abs(a - target) < 0.01) return;
        this._bridgeA = a;
        for (const m of this._bridgeMeshes) m.visibility = a;
        for (const p of this.titanicSigns || []) p.visibility = a;
    },

    // --- Табло лидеров (Top Money / Top Speed / Top Playtime) ---
    buildLeaderboards(scene) {
        this.boards = [];
        const kinds = ['money', 'speed', 'time'];
        this.app.location.markers('leaderboard').sort((a, b) => a.x - b.x).forEach((m, i) => {
            const p = Gfx.textPlane('lb' + i, 380, 440, 1, () => {});
            const a = (m.rot[1] || 0) * Math.PI / 180;
            p.position.set(m.x + Math.cos(a) * 34, 300, m.y + Math.sin(a) * 34);
            p.rotation.y = -a - Math.PI / 2;   // лицом в сторону, куда смотрит табло (проверено: плоскость видна с −Z при повороте 0)
            /** @type {BABYLON.StandardMaterial} */ (p.material).emissiveColor = new BABYLON.Color3(0.95, 0.95, 0.95);
            this.boards.push({ plane: p, kind: kinds[i % 3] });
        });
    },

    drawLeaderboards(rows) {
        if (!this.boards) return;
        const titles = { money: Lang.t('lb.money'), speed: Lang.t('lb.speed'), time: Lang.t('lb.time') };
        const colors = { money: '#3bdc5a', speed: '#3b8bff', time: '#ff5fa2' };
        for (const b of this.boards) {
            const list = rows[b.kind] || [];
            b.plane.metadata.redraw((c, w, h) => {
                c.fillStyle = 'rgba(14,20,36,0.92)'; c.beginPath(); c.roundRect(0, 0, w, h, 18); c.fill();
                c.fillStyle = colors[b.kind]; c.beginPath(); c.roundRect(0, 0, w, 64, [18, 18, 0, 0]); c.fill();
                Gfx.strokeText(c, titles[b.kind], w / 2, 34, 30, '#ffffff', '#111111');
                list.slice(0, 8).forEach((r, i) => {
                    const y = 96 + i * 42;
                    c.fillStyle = r.me ? 'rgba(255,230,80,0.22)' : (i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)');
                    c.fillRect(10, y - 18, w - 20, 38);
                    c.font = '900 22px Montserrat, sans-serif'; c.textBaseline = 'middle';
                    c.textAlign = 'left'; c.fillStyle = i < 3 ? ['#ffd23a', '#d6dbe0', '#e0a060'][i] : '#ffffff';
                    c.fillText('#' + (i + 1), 18, y);
                    c.fillStyle = '#ffffff'; c.font = '800 20px Montserrat, sans-serif';
                    c.fillText(UI.clip(r.name, 15), 70, y);
                    c.textAlign = 'right'; c.fillStyle = colors[b.kind]; c.font = '900 21px Montserrat, sans-serif';
                    c.fillText(r.value, w - 18, y);
                });
            });
        }
    },

    // --- Кадр мира ---
    update(dt) {
        this._t += dt;
        Models.update(dt);
        if (this._waterTex) this._waterTex.vOffset = (this._waterTex.vOffset + dt * 0.05) % 1;
        // Яйца: появление, тряска от ударов, респавн.
        for (const s of this.spots) {
            if (!s.egg && s.zone >= 0) {
                const ts = this.titanic && this._titanicSpot;
                if (ts && Math.hypot(s.x - ts.x, s.y - ts.y) < ts.r) continue;   // место Титана
                s.timer -= dt;
                if (s.timer <= 0) { s.timer = 99; this.spawnEgg(s); }
            }
        }
        const eggs = this.spots.map(s => s.egg).concat(this.titanic ? [this.titanic] : []);
        for (const e of eggs) {
            if (!e || !e.mesh) continue;
            e.pop = Math.min(1, (e.pop || 0) + dt * 3);
            const pk = e.pop < 1 ? 1 + Math.sin(e.pop * Math.PI) * 0.25 : 1;
            e.shake = Math.max(0, e.shake - dt * 5);
            const sh = e.shake;
            const sq = 1 + sh * 0.12 * Math.sin(this._t * 60);
            e.mesh.scaling.set(e.baseScale * pk * (2 - sq), e.baseScale * pk * sq, e.baseScale * pk * (2 - sq));
            e.mesh.rotation.z = sh * 0.08 * Math.sin(this._t * 47);
        }
        // Упавшие питомцы: таймер.
        for (let i = this.dropped.length - 1; i >= 0; i--) {
            const d = this.dropped[i];
            d.t -= dt;
            d.view.idle(dt);
            if (d.t <= 0) { this.app.fx && this.app.fx.play('magic', new BABYLON.Vector3(d.x, 60, d.y)); this.removeDropped(d); }
        }
        // Питомцы на базах.
        for (const b of this.bases) {
            for (const s of b.slots) if (s.view) s.view.idle(dt);
            if (b.belt) b.belt.position.x = 12.5 - ((this._t * (b.running ? 140 : 25)) % 25);   // лента едет к хвосту дорожки
        }
        // Titanic Egg.
        if (!this.titanic) {
            this.titanicTimer -= dt;
            if (this.titanicTimer <= 0) {
                this.titanicTimer = GameData.TITANIC_EVERY_SEC;
                if (typeof Game !== 'undefined') Game.onTitanic();
            }
        }
        this.drawTitanicSign();
        for (const g of this.guardians) g.update(dt);
        const pl = typeof Game !== 'undefined' ? Game.player : null;
        for (const n of this.npcs || []) n.update(dt, pl);
    },
};

// Вид питомца в мире: инстанс модели, подпрыгивание, подпись.
class PetView {
    static async create(pet) {
        const r = await Models.pet(pet);
        return new PetView(pet, r);
    }
    constructor(pet, r) {
        this.pet = pet;
        this.mesh = r.mesh;
        this.height = r.height;
        this.t = Math.random() * 10;
        this.x = 0; this.y = 0; this.h = 0; this.heading = 0;
        this.label = null;
        /** @type {{ x: number, y: number } | null} */
        this.home = null;
    }
    place(x, y, h, heading) {
        this.x = x; this.y = y; this.h = h || 0; this.heading = heading || 0;
        this.mesh.position.set(x, this.h, y);
        this.mesh.rotation.y = -this.heading;
    }
    idle(dt) {
        this.t += dt;
        const hop = Math.max(0, Math.sin(this.t * 2.2)) * 10;
        this.mesh.position.set(this.x, this.h + hop, this.y);
        this.mesh.rotation.y = -this.heading + Math.sin(this.t * 0.7) * 0.25;
    }
    showLabel(on, dropped) {
        if (on && !this.label) this.label = UI.labels.add({ kind: dropped ? 'dropped' : 'pet', pet: this.pet, drop: dropped || null, view: this, x: this.x, y: this.y, h: this.height + 40 });
        else if (!on && this.label) { UI.labels.remove(this.label); this.label = null; }
    }
    dispose() {
        this.showLabel(false);
        if (this.mesh) this.mesh.dispose();
        this.mesh = null;
    }
}

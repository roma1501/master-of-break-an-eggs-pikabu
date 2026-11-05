// Game.js — игра «Master of Break an Eggs»: сохранение, экономика, игрок и боты, удары по яйцам,
// вылупление, переноска и доставка питомцев, воровство, стражи, квесты со стрелками, туториал,
// камера от третьего лица, реклама (раунд = вылазка: питомец доставлен или потерян), рекорды.

/** @satisfies {Record<string, any>} */
const Game = {
    /** @type {LoryApp | null} */
    app: null,
    /** @type {any} */
    save: null,
    /** @type {Actor | null} */
    player: null,
    /** @type {Actor[]} */
    actors: [],
    state: 'menu',
    autoSwing: false,
    cam: { yaw: 0, pitch: 0.38, dist: 820, user: 1, d: 820 },
    _incomeT: 0,
    _saveT: 0,
    _promptHeld: false,
    _promptT: 0,
    /** @type {any} */
    _prompt: null,
    _menuT: 0,
    _offline: 0,
    _lbT: 0,

    defaults() {
        return {
            v: 1, money: 0, gems: 0, speed: GameData.BASE_SPEED, pick: 0, pen: 1, tread: 0,
            pets: [], index: {}, quest: 0, tutorialDone: false,
            boosts: { money: 0, luck: 0, speed: 0 },
            stats: { earned: 0, time: 0, hatched: 0, stolen: 0, best: 0 },
            settings: { music: true, steal: true },
            shop: null, daily: null, wheel: null, last: Date.now(),
            superAd: { cycle: 0, views: 0 }, adCd: {},
            bots: null,
        };
    },

    async init(app) {
        this.app = app;
        this.initAspectCap();
        HudLayout.init(this.playablesUi() ? { app, touch: () => true } : { app });
        Input.init({
            app, mouse: 'none',   // мышиный взгляд (ПКМ) ведёт игра сама: initMouseLook
            actions: Object.assign({}, Input.DEFAULTS, {
                attack: { keys: ['Mouse0', 'KeyF'], pad: [7] },
                interact: { keys: ['KeyE'], pad: [2] },
                drop: { keys: ['KeyQ', 'Backspace'], pad: [1] },
                tool1: { keys: ['Digit1'], pad: [4] },
                tool2: { keys: ['Digit2'], pad: [5] },
                auto: { keys: ['KeyT'], pad: [3] },
            }),
        });
        this.initMouseLook();
        if (this.playablesUi()) this.initPcTouch();
        this.initAdPause();
        this.autoSwing = this.playablesUi();   // Playables: автоудар всегда включён, кнопки нет
        if (app.camera) {
            app.camera.detach();   // камерой управляет игра (взгляд — Input)
            app.camera.c.edgeGuard = typeof GAME_CAMERA_EDGE_GUARD !== 'undefined' ? GAME_CAMERA_EDGE_GUARD : 0;
            app.camera.c.pitchMin = typeof GAME_CAMERA_PITCH_MIN_DEG !== 'undefined' ? GAME_CAMERA_PITCH_MIN_DEG : 5;
            app.camera.c.pitchMax = typeof GAME_CAMERA_PITCH_MAX_DEG !== 'undefined' ? GAME_CAMERA_PITCH_MAX_DEG : 80;
        }
        this.applyRenderLook();
        Gfx.studsOn = (typeof GAME_STUDS !== 'undefined' ? GAME_STUDS : 1) > 0;
        UI.init();
        // Сохранение.
        let loaded = null;
        try { loaded = await Platform.load(); } catch (e) { loaded = null; }
        this.save = Object.assign(this.defaults(), loaded || {});
        const s = this.save;
        s.boosts = Object.assign({ money: 0, luck: 0, speed: 0 }, s.boosts);
        s.stats = Object.assign(this.defaults().stats, s.stats);
        s.settings = Object.assign({ music: true, steal: true }, s.settings);
        s.superAd = Object.assign({ cycle: 0, views: 0 }, s.superAd);
        s.adCd = Object.assign({}, s.adCd);
        await World.init(app);
        Shops.init(s, () => this.persist());
        this.spawnActors();
        await this.restorePets();
        await this.syncFollowers();
        // Метки магазинов и баз.
        const shopLabel = (name, key, color, h) => { const m = World.shops[name]; if (m) UI.labels.add({ kind: 'shop', text: Lang.t(key), color, x: m.x, y: m.y, h: h || 380 }); };
        shopLabel('shop-pickaxe', 'shop.pickaxe', '#4fd6ff', 380);
        shopLabel('shop-cosmetic', 'shop.cosmetic', '#7dff6a', 380);
        shopLabel('merge', 'shop.merge', '#4fd6ff', 480);
        shopLabel('wheel', 'shop.wheel', '#ffd23a', 460);
        shopLabel('gift', 'shop.gift', '#ff5f6d', 200);
        for (const b of World.bases) UI.labels.add({ kind: 'base', base: b, x: b.entry.x, y: b.entry.y, h: 330 });
        // Туториал. У движка одна стрелка: если у шага есть и элемент (стик, кнопка), и точка в мире (яйцо, база),
        // она прыгала между ними каждый кадр — мерцала. Элемент только подсвечивается, стрелка — на цель в мире.
        const T = /** @type {any} */ (Tutorial), placePointer = T._placePointer;
        T._placePointer = function (el) {
            if (this._w) return;
            // поле 2:1 по центру (initAspectCap): слой обучения отсчитывается от страницы, а не от окна
            const off = document.body.getBoundingClientRect();
            if (el && off.left) {
                const src = el;
                el = { getBoundingClientRect: () => { const r = src.getBoundingClientRect(); return { left: r.left - off.left, right: r.right - off.left, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; } };
            }
            return placePointer.call(this, el);
        };
        Tutorial.init({
            app,
            steps: this.tutorialSteps(),
            state: () => this.save, field: 'tutorialDone',
            persist: () => this.persist(),
            onFinish: (reason) => {
                this.persist();
                if (reason !== 'abort') { Platform.analytics(reason === 'skip' ? 'tutorial_skipped' : 'tutorial_completed', {}); this.afterTutorial(); }
            },
        });
        // Офлайн-доход.
        const away = Math.min(GameData.OFFLINE_MAX_SEC, Math.max(0, (Date.now() - (s.last || Date.now())) / 1000));
        const inc = this.player.base.income();
        this._offline = away > 120 && inc > 0 ? Math.floor(inc * away * GameData.OFFLINE_SHARE) : 0;
        this.cam.yaw = Math.PI / 2;
        app.camera.follow(this.camTarget = { x: this.player.x, y: this.player.y, h: 150 });
        window.addEventListener('lory-release-input', () => { this._promptHeld = false; });
        window.addEventListener('beforeunload', () => this.persist());
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.persist(); });
        this.setTrack(Sfx.MUSIC_MENU, 0.7);
    },

    async ready() {
        this.drawBoards();
        UI.showMenu(true);
        this.state = 'menu';
        Platform.gameplay(false);
        this.devParams();
    },

    // Отладка только на локальном сервере: ?play&skiptut&at=x,y&yaw=deg&open=pickaxes|pets|index|eggs|settings|shop|daily|wheel
    devParams() {
        if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
        const q = new URLSearchParams(location.search);
        if (q.has('skiptut')) this.save.tutorialDone = true;
        if (q.has('stats')) {
            const scene = this.app.location.view.scene, ins = new BABYLON.SceneInstrumentation(scene);
            ins.captureFrameTime = true;
            const el = document.createElement('div');
            el.style.cssText = 'position:fixed;left:50%;top:60px;transform:translateX(-50%);z-index:99;background:#000b;color:#0f0;font:14px monospace;padding:4px 8px';
            document.body.appendChild(el);
            setInterval(() => { el.textContent = 'fps ' + World3D.engine.getFps().toFixed(0) + ' | draws ' + ins.drawCallsCounter.current + ' | active ' + scene.getActiveMeshes().length + ' | meshes ' + scene.meshes.length + ' | frame ' + ins.frameTimeCounter.average.toFixed(1) + 'ms | pause ' + [...Pause.reasons].join(',') + ' | t ' + World.titanicTimer.toFixed(1); }, 500);
        }
        if (q.has('money')) this.save.money = Number(q.get('money')) || 0;
        if (!q.has('play')) return;
        this._offline = 0;
        this._noDaily = q.has('nodaily');
        this.play();
        const at = (q.get('at') || '').split(',').map(Number);
        if (at.length === 2 && at.every(Number.isFinite)) { this.player.x = at[0]; this.player.y = at[1]; }
        if (q.has('yaw')) this.app.camera.azimuth = Number(q.get('yaw')) * Math.PI / 180;
        if (q.has('selftest')) setTimeout(() => this.selfTest(), 500);
        if (q.has('titanic')) this.onTitanic();
        // Примерка шапки лицом к камере: ?hat=headphones&nopause (zoom — дистанция камеры, yawoff — поворот героя, градусы)
        if (q.has('hat')) setTimeout(() => {
            const P = this.player, A = this.app.camera.azimuth;
            P.noob.setLook(Object.assign({}, Shops.look(), { hat: q.get('hat') }));
            P.heading = A + Math.PI + (Number(q.get('yawoff')) || 0) * Math.PI / 180;
            this.cam.pitch = 0.2; this.cam.user = Number(q.get('zoom')) || 0.4;
        }, 400);
        // Виды питомцев в ряд мордой к камере (проверка поворота моделей): ?petline=0..5&nopause — по 6 штук
        if (q.has('petline')) setTimeout(async () => {
            const pv = q.get('petline') || '0', batch = Number(pv) || 0;
            const ids = /^\d+$/.test(pv) ? Object.keys(GameData.PETS).slice(batch * 6, batch * 6 + 6) : pv.split(',').filter(id => GameData.PETS[id]);
            const A = Math.PI / 2, P = this.player;
            P.x = 2600; P.y = 2950; this.app.camera.azimuth = A; this.cam.pitch = 0.3; this.cam.user = Number(q.get('zoom')) || 0.8;
            for (let i = 0; i < ids.length; i++) {
                const v = await PetView.create({ sp: ids[i], r: 'common', mut: 'normal', kg: 40, uid: 'line' + i });
                const x = 2600 + (i - (ids.length - 1) / 2) * 150, y = 2950 + 330;
                v.place(x, y, World.ground(x, y), A + Math.PI);
                UI.labels.add({ kind: 'shop', text: ids[i], color: '#fff', x, y, h: 150 });
            }
            if (q.has('petwin')) { for (const id of ids) this.save.pets.push({ uid: 'w' + id, sp: id, egg: 'e1', r: 'common', kg: 40, mut: 'normal', inc: 1, slot: -1 }); UI.openPets(); }
        }, 400);
        if (q.has('npcsay')) for (const n of World.npcs) { n.near = true; n.say('hi'); n.sayT = 99; n.waveT = 99; }
        if (q.has('nopause')) {   // безголовые снимки: вкладка «скрыта», автопаузу не ставим
            const set = Pause.set.bind(Pause);
            Pause.set = (r, on) => set(r, r === 'auto' ? false : on);
            Pause.set('auto', false);
        }
        const w = q.get('open');
        const map = { pickaxes: () => UI.openPickaxes(), pets: () => UI.openPets(), index: () => UI.openIndex(), eggs: () => UI.openEggs(),
            settings: () => UI.openSettings(), merge: () => UI.openMerge(), boosts: () => UI.openBoosts(), shop: () => Shops.openShop(), daily: () => Shops.openDaily(), wheel: () => Shops.openWheel(), super: () => UI.openSuper(), converter: () => UI.openConverter(),
            wheelwin: () => { Shops.openWheel(); setTimeout(() => Shops._wheelShowResult({ got: [{ type: 'coins', amount: 150 }] }), 300); } };
        if (w && map[w]) setTimeout(map[w], 300);
    },

    // Локальный самотест систем (только ?selftest на localhost): результат — в оверлее.
    selfTest() {
        const out = [], ok = (name, cond) => out.push((cond ? 'OK   ' : 'FAIL ') + name);
        const s = this.save, b = this.player.base;
        s.money = 1e7;
        ok('buy pickaxe stone', this.buyPickaxe(1) && s.pick === 1);
        ok('buy pickaxe skip blocked', !this.buyPickaxe(3));
        const lv = b.level; this.upgradePen(); ok('pen upgrade', b.level === lv + 1 && s.pen === b.level);
        const tr = b.tread; this.upgradeTread(); ok('treadmill upgrade', b.tread === tr + 1);
        const egg = GameData.egg('forest');
        for (let i = 0; i < 3; i++) { const pt = GameData.makePet(egg, egg.rolls[0]); pt.slot = -1; s.pets.push(pt); }
        const groups = this.mergeGroups(); ok('merge group found', groups.some(g => g.sp === 'cat' && g.mut === 'normal'));
        const before = s.pets.length; this.merge('cat', 'normal'); ok('merge 3->1 golden', s.pets.length === before - 2 && s.pets.some(p => p.sp === 'cat' && p.mut === 'golden'));
        this.equipBest(true); ok('equip best fills pen', b.pets().length === Math.min(b.slotCount, s.pets.length));
        ok('income > 0', this.incomeNow() > 0);
        const m0 = s.money, victim = s.pets[s.pets.length - 1]; this.sellPet(victim.uid); ok('sell pet', s.money > m0 && !s.pets.includes(victim));
        const json = JSON.stringify(s); ok('save size < 500KB (' + Math.round(json.length / 1024) + 'KB)', json.length < 500000);
        ok('shop validate', typeof Shop.validate !== 'function' || (Shop.validate() || {}).ok !== false);
        const el = document.createElement('pre');
        el.style.cssText = 'position:fixed;left:10px;top:70px;z-index:99;background:#000c;color:#0f0;font:13px monospace;padding:6px;white-space:pre';
        el.textContent = out.join(String.fromCharCode(10));
        document.body.appendChild(el);
        console.log(out.join(String.fromCharCode(10)));
    },

    // Вращение камеры правой кнопкой мыши. Состояние кнопки берётся из КАЖДОГО движения мыши (e.buttons),
    // поэтому поворот не «залипает» и не теряется после смены вкладки, потери фокуса, пропущенного
    // pointerdown (ПКМ, нажатая вместе с ЛКМ, приходит без pointerdown) или кнопки, отпущенной вне окна.
    // Playgama: на ПК поле игры не шире 2:1 — на сверхшироком окне страница сужается по центру, по бокам поля.
    // transform у body делает её блоком отсчёта для position:fixed: канвас, подписи, окна и HUD остаются внутри.
    // Локально — ?cap21.
    initAspectCap() {
        const on = (typeof GAME_PLATFORM !== 'undefined' && /** @type {string} */ (GAME_PLATFORM) === 'playgama')
            || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('cap21'));
        if (!on) return;
        const st = document.createElement('style');
        st.textContent = '@media (min-aspect-ratio: 2/1) { html.cap21 { background: #141a24; } ' +
            'html.cap21 body { width: 200vh; margin: 0 auto; position: relative; transform: translateZ(0); } }';
        document.head.appendChild(st);
        document.documentElement.classList.add('cap21');
        const H = /** @type {any} */ (HudLayout), vp = H.viewport;
        H.viewport = function () { const v = vp.call(this); return { W: Math.min(v.W, v.H * 2), H: v.H }; };
    },

    // Интерфейс Playables: в сборке Playables и по ?touchui на localhost. Сенсорное управление и на ПК
    // (площадка требует мышь для всех действий): стик, кнопка действия и прыжок видны всегда, клавиатура
    // и ПКМ-взгляд тоже работают. Автоудар включён всегда, кнопки «Автоудар» нет; ношу бросают слотом 3.
    playablesUi() {
        if (typeof GAME_PLATFORM !== 'undefined' && /** @type {string} */ (GAME_PLATFORM) === 'playables') return true;
        return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('touchui');
    },

    // Плашка «Paused» не перекрывает рекламу: площадка (YouTube Playables) шлёт паузу на время ролика, а показ
    // запросила сама игра. Пока идёт наша реклама — плашки нет; пауза площадки осталась после ролика — плашка вернётся.
    initAdPause() {
        const P = /** @type {any} */ (Pause), Pl = /** @type {any} */ (Platform);
        const sync = P._syncOverlay;
        P._syncOverlay = function () {
            if (Pl._adBusy) { if (this._overlay) { this._overlay.remove(); this._overlay = null; } return; }
            return sync.call(this);
        };
        const show = Pl._showAd;
        Pl._showAd = async function (kind, id) {
            P._syncOverlay();
            // после ролика площадка снимает паузу сама; плашка — только если пауза так и осталась
            try { return await show.call(this, kind, id); } finally { setTimeout(() => P._syncOverlay(), 400); }
        };
    },

    // ЛКМ по игровому полю работает как палец: слева — плавающий стик, справа — свайп-взгляд и тап-удар.
    // Движок включает экранные элементы только после настоящего касания — здесь они включены сразу,
    // а события мыши отдаются его сенсорной ветке (устройство при этом остаётся «клавиатура»).
    initPcTouch() {
        const I = /** @type {any} */ (Input);
        I.touchSeen = true;
        I.configure({ stickIdle: true });
        I._ensureUi();
        const sync = I._syncUi;
        I._syncUi = function () { sync.call(this); if (this.ui && this.touchEnabled) this.ui.layer.classList.remove('lory-input-off'); };
        I._syncUi();
        const asTouch = (e) => new Proxy(e, { get: (t, k) => k === 'pointerType' ? 'touch' : (typeof t[k] === 'function' ? t[k].bind(t) : t[k]) });
        const held = (e) => e.pointerType === 'mouse' && ((I._stick && I._stick.id === e.pointerId) || (I._lookP && I._lookP.id === e.pointerId));
        let quiet = false;
        const setDevice = I._setDevice;
        I._setDevice = function (d) { if (!quiet) setDevice.call(this, d); };
        const wrap = (name, test) => {
            const f = I[name];
            I[name] = function (e) {
                if (!test(e)) return f.call(this, e);
                quiet = true;
                try { return f.call(this, asTouch(e)); } finally { quiet = false; }
            };
        };
        wrap('_onPointerDown', (e) => e.pointerType === 'mouse' && e.button === 0 && I._isSurface(e.target));
        wrap('_onPointerMove', held);
        wrap('_onPointerUp', held);
    },

    initMouseLook() {
        const m = this._mouse = { dx: 0, dy: 0, lx: null, ly: null };
        // Контекстное меню браузера (ПКМ) — нигде в игре, кроме полей ввода: ловим в фазе захвата, раньше всех.
        const field = (t) => t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
        const noMenu = (e) => { if (!field(e.target)) { e.preventDefault(); e.stopPropagation(); } };
        window.addEventListener('contextmenu', noMenu, true);
        document.addEventListener('contextmenu', noMenu, true);
        window.addEventListener('mousedown', (e) => { if (e.button === 2 && !field(e.target)) e.preventDefault(); }, true);
        document.addEventListener('selectstart', (e) => { if (!field(e.target)) e.preventDefault(); }, true);
        const cv = document.getElementById('world3d');
        const surface = (t) => t === cv || t === document.body || t === document.documentElement;
        const reset = () => { m.lx = null; m.ly = null; };
        const move = (e) => {
            if (e.pointerType === 'touch') return;
            if (!(e.buttons & 2) || UI.open) { reset(); return; }
            if (m.lx === null) {
                // Начало поворота: только если ПКМ зажата над миром (не над окном/кнопкой).
                if (!surface(e.target)) return;
                m.lx = e.clientX; m.ly = e.clientY;
                return;
            }
            let dx = e.movementX, dy = e.movementY;
            if (!dx && !dy) { dx = e.clientX - m.lx; dy = e.clientY - m.ly; }
            m.lx = e.clientX; m.ly = e.clientY;
            m.dx += Math.max(-160, Math.min(160, dx || 0));
            m.dy += Math.max(-160, Math.min(160, dy || 0));
        };
        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch' && e.button === 2 && surface(e.target)) { m.lx = e.clientX; m.ly = e.clientY; } }, true);
        window.addEventListener('pointerup', (e) => { if (!(e.buttons & 2)) reset(); }, true);
        window.addEventListener('blur', reset);
        window.addEventListener('lory-release-input', reset);
        document.addEventListener('visibilitychange', reset);
    },
    consumeMouseLook() {
        const m = this._mouse;
        if (!m) return { dx: 0, dy: 0 };
        const r = { dx: m.dx, dy: m.dy };
        m.dx = 0; m.dy = 0;
        return r;
    },

    // --- Персонажи ---
    spawnActors() {
        const names = (GameData.BOT_NAMES[Lang.code] || GameData.BOT_NAMES.en).slice();
        const s = this.save;
        const b0 = World.bases[0];
        const spawn = this.app.location.marker('spawn') || b0.entry;
        this.player = new Actor({ id: 'player', name: Lang.t('player.you'), isPlayer: true, base: b0, x: spawn.x, y: spawn.y, heading: 0, speed: s.speed, pick: s.pick, look: Shops.look() });
        b0.owner = this.player; b0.level = s.pen; b0.tread = s.tread;
        World.updateSign(b0); World.updatePads(b0);
        this.actors = [this.player];
        const saved = Array.isArray(s.bots) ? s.bots : [];
        for (let i = 1; i < World.bases.length; i++) {
            const b = World.bases[i];
            const st = saved[i - 1] || {};
            const k = Math.floor(Math.random() * names.length);
            const name = st.name && names.includes(st.name) ? st.name : names.splice(k, 1)[0] || ('Noob' + i);
            const look = GameData.BOT_LOOKS[(i * 3 + 1) % GameData.BOT_LOOKS.length];
            const hats = Object.keys(NoobLooks.HATS), faces = Gfx.FACES;
            const prog = this.playerProgress();
            const a = new Actor({
                id: 'bot' + i, name, base: b, x: b.entry.x, y: b.entry.y, heading: b.heading + Math.PI,
                speed: Math.min(st.speed || 99, Math.round(12 + Math.random() * 8 + prog * 20 + (st.speed ? 15 : 0))),   // старые сохранения: слишком быстрых не оставляем
                pick: st.pick != null ? st.pick : Math.max(0, Math.min(GameData.PICKAXES.length - 1, s.pick + Math.floor(Math.random() * 3) - 1)),
                look: { custom: { torso: look[0], legs: look[1], skin: look[2], arms: Math.random() < 0.4 ? look[0] : 'skin' }, hat: Math.random() < 0.55 ? hats[1 + Math.floor(Math.random() * (hats.length - 1))] : 'none', face: faces[Math.floor(Math.random() * 10)], bat: 'wood' },
            });
            b.owner = a;
            b.level = st.pen || Math.min(GameData.PEN_MAX_LEVEL, 1 + Math.floor(Math.random() * 2 + prog * 4));
            World.updateSign(b); World.updatePads(b);
            a.brain = new BotBrain(a, 0.25 + Math.random() * 0.6);
            a.brain.money = st.money || 0;
            this.actors.push(a);
        }
    },

    // Питомцы игрока из сохранения — на места загона; ботам — стартовые питомцы.
    async restorePets() {
        const s = this.save, b = this.player.base;
        const jobs = [];
        for (const p of s.pets) {
            if (p.eq) p.slot = -1;   // с собой — не в загоне
            else if (p.slot >= 0 && p.slot < b.slotCount && !b.slots[p.slot].pet) jobs.push(World.placePet(b, p.slot, p));
            else p.slot = -1;
        }
        const saved = Array.isArray(s.bots) ? s.bots : [];
        for (let i = 1; i < this.actors.length; i++) {
            const a = this.actors[i], st = saved[i - 1];
            const list = st && Array.isArray(st.pets) ? st.pets : this.starterBotPets(a);
            list.slice(0, a.base.slotCount).forEach((p, k) => { jobs.push(World.placePet(a.base, k, p)); });
        }
        await Promise.all(jobs);
    },

    starterBotPets(a) {
        const prog = this.playerProgress();
        const out = [];
        const n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
            const z = Math.max(0, Math.min(5, Math.floor(prog * 3 + Math.random() * 1.6)));
            const eggs = GameData.eggsOfZone(z);
            const e = eggs[Math.floor(Math.random() * eggs.length)];
            out.push(GameData.makePet(e, GameData.roll(e, 1)));
        }
        return out;
    },

    // Прогресс игрока 0..1 (по кирке): боты подстраиваются.
    playerProgress() { return Math.min(1, ((this.save && this.save.pick) || 0) / (GameData.PICKAXES.length - 1)); },

    // --- Сохранение ---
    persist() {
        const s = this.save;
        if (!s) return;
        s.last = Date.now();
        if (this.player) s.speed = Math.round(this.player.speedStat * 10) / 10;
        s.bots = this.actors.filter(a => a.brain).map(a => ({ name: a.name, speed: Math.round(a.speedStat), pick: a.pick, pen: a.base.level, money: Math.round(a.brain.money), pets: a.base.pets().slice(0, 12) }));
        Platform.save(s);
    },
    async reloadSave() {
        const loaded = await Platform.load().catch(() => null);
        if (loaded) { this.save = Object.assign(this.defaults(), loaded); location.reload(); }
    },

    // --- Состояния: меню / игра ---
    play(howto) {
        if (this.state === 'play') return;
        UI.showMenu(false);
        this.state = 'play';
        Platform.gameplay(true);
        // Камера за спиной, лицом ко входу в каньон (к яйцам).
        const p0 = this.player, sz = this.app.location.marker('safezone') || { x: 2600, y: 3950 };
        this.app.camera.azimuth = Math.atan2(sz.y - p0.y, sz.x - p0.x);
        p0.heading = this.app.camera.azimuth;
        this.cam.pitch = 0.36;
        this.setTrack(Sfx.MUSIC_MAIN, 0.5);
        Telemetry.progress && Telemetry.progress('started', 'session');
        if (howto) this.replayTutorial();
        else if (!this.save.tutorialDone) Tutorial.autoStart();
        else this.afterTutorial();
        if (this._offline > 0) { UI.openOffline(this._offline); }
    },
    toMenu() {
        this.persist();
        this.state = 'menu';
        Platform.gameplay(false);
        UI.showMenu(true);
        this.setTrack(Sfx.MUSIC_MENU, 0.7);
    },
    // Музыка: трек меню/игры, выключатель в настройках.
    setTrack(url, vol) { this._track = url; this._trackVol = vol || 0.6; this.applyMusic(); },
    applyMusic() {
        if (this.save.settings.music && this._track) Sound.music(this._track, { volume: this._trackVol });
        else Sound.stopMusic();
    },
    afterTutorial() {
        Tutorial.whenIdle(() => {
            if (this._offline > 0 || UI.open || this._noDaily) return;
            if (Shops.shouldOfferDaily && Shops.shouldOfferDaily()) Shops.openDaily();
        });
    },
    replayTutorial() { Tutorial.start({ replay: true }); },

    // Любое окно (пауза, магазины, настройки…) замораживает игру: мир и доход стоят, интерфейс и звук живут.
    onWindow(open, id) {
        Input.setEnabled(!open);
        if (open) this._promptHeld = false;
        if (this.state === 'play') Platform.gameplay(!open);
    },

    // Кнопки меню/магазина — точка показа уже заработанной межстраничной рекламы.
    openWithAd(fn) {
        if (UI.open) UI.closeWindow();
        Platform.ads.next(() => fn());
    },

    // --- Туториал: шаги действиями ---
    tutorialSteps() {
        const egg = () => { const e = this.nearestEgg(0); return e ? { x: e.x, y: e.y, h: 160 } : null; };
        return [
            // Playables: на ПК ходят и клавишами, и мышью по экранному стику; бьёт автоудар — без кнопки.
            Object.assign(Tutorial.preset('move'), { world: egg, title: 'tut.go.t' },
                this.playablesUi() ? { hint: { keyboard: 'tut.move.pl', touch: 'tut.move.touch', pad: 'tut.move.pad' }, target: { keyboard: '@stick', touch: '@stick' } } : {}),
            this.playablesUi()
                ? { id: 'hit', title: 'tut.hit.t', hint: 'tut.hit.auto', event: 'hit', world: egg }
                : { id: 'hit', title: 'tut.hit.t', hint: { keyboard: 'tut.hit.kb', touch: 'tut.hit.touch', pad: 'tut.hit.kb' }, event: 'hit', world: egg, target: { touch: '#btn-auto' } },
            { id: 'hatch', title: this.playablesUi() ? 'tut.hatch.auto' : 'tut.hatch.t', hint: 'tut.hatch.h', event: 'hatch', world: egg },
            { id: 'deliver', title: 'tut.deliver.t', hint: 'tut.deliver.h', event: 'deliver', world: () => { const b = this.player.base; return { x: b.x, y: b.y, h: 200 }; } },
            { id: 'income', title: 'tut.income.t', hint: 'tut.income.h', check: (ctx) => ctx.time > 3.5, target: '#st-money' },
        ];
    },

    // --- Квесты сверху + цель для стрелок ---
    QUESTS: [
        { id: 'hatch', done: (s) => s.stats.hatched >= 1, target: () => Game.nearestEggTarget(0) },
        { id: 'deliver', done: (s) => s.pets.length >= 1, target: () => Game.baseTarget() },
        { id: 'pickaxe', done: (s) => s.pick >= 1, target: () => World.shops['shop-pickaxe'] },
        { id: 'pen', done: (s) => s.pen >= 2, target: () => Game.signTarget() },
        { id: 'tread', done: (s) => Game.player.speedStat >= 22, target: () => Game.player.base.treadPos },
        { id: 'zone2', done: (s) => s.index.hog || s.index.camel || s.index.lion || s.index.giraffe || s.index.elephant, target: () => Game.nearestEggTarget(1) },
        { id: 'pick3', done: (s) => s.pick >= 3, target: () => World.shops['shop-pickaxe'] },
        { id: 'merge', done: (s) => s.pets.some(p => p.mut !== 'normal'), target: () => World.shops.merge },
        { id: 'zone3', done: (s) => s.index.penguin || s.index.fox || s.index.deer || s.index.polar || s.index.yeti, target: () => Game.nearestEggTarget(2) },
        { id: 'titanic', done: (s) => s.index.dragon || s.index.phoenix, target: () => World.titanic ? { x: World.titanic.x, y: World.titanic.y } : null },
        { id: 'zone4', done: (s) => s.index.bee || s.index.unicorn || s.index.gummy_bear || s.index.caterpillar || s.index.cow, target: () => Game.nearestEggTarget(3) },
        { id: 'zone5', done: (s) => s.index.monkey || s.index.parrot || s.index.tiger || s.index.panda || s.index.beaver || s.index.koala, target: () => Game.nearestEggTarget(4) },
        { id: 'zone6', done: (s) => s.index.fish || s.index.crab || s.index.shark || s.index.octopus || s.index.turtle || s.index.jellyfish, target: () => Game.nearestEggTarget(5) },
    ],
    quest() {
        const s = this.save;
        while (s.quest < this.QUESTS.length && this.QUESTS[s.quest].done(s)) {
            s.quest++;
            if (this.state === 'play') { Shops.addGems(15); UI.toast(Lang.t('quest.done', { n: 15 }), '#f2b8ff'); Sfx.play('win', 0.5); }
            if (typeof Telemetry !== 'undefined' && Telemetry.progress) Telemetry.progress('completed', 'quest_' + this.QUESTS[s.quest - 1].id, { step_index: s.quest });
        }
        return s.quest < this.QUESTS.length ? this.QUESTS[s.quest] : null;
    },
    questText() {
        const p = this.player;
        if (p && p.carry) return Lang.t(p.carry.stolenFrom ? 'quest.runStolen' : 'quest.run');
        const q = this.quest();
        if (q) return Lang.t('quest.' + q.id);
        const next = GameData.PICKAXES[this.save.pick + 1];
        return next ? Lang.t('quest.nextPick', { n: Lang.t('pick.' + next.id) }) : Lang.t('quest.master');
    },
    questTarget() {
        const p = this.player;
        if (!p) return null;
        if (p.carry) { const b = p.base; return { x: b.x, y: b.y }; }
        const q = this.quest();
        return q ? q.target() : null;
    },
    nearestEgg(zone) {
        let best = null, bd = Infinity;
        for (const sp of World.spots) {
            if (sp.zone !== zone || !sp.egg || !sp.egg.mesh) continue;
            const d = Math.hypot(sp.x - this.player.x, sp.y - this.player.y);
            if (d < bd) { bd = d; best = sp.egg; }
        }
        return best;
    },
    nearestEggTarget(zone) { const e = this.nearestEgg(zone); return e ? { x: e.x, y: e.y } : null; },
    baseTarget() { const b = this.player.base; return { x: b.x, y: b.y }; },
    signTarget() { const b = this.player.base; return { x: b.signPos.x, y: b.signPos.y }; },

    // --- Доход ---
    incomeNow() {
        const base = this.player ? this.player.base.income() : 0;
        return base * (this.boostOn('money') ? 2 : 1) * (1 + this.buff('cash'));
    },
    boostOn(k) { return (this.save.boosts[k] || 0) > Date.now(); },
    luck() { return (this.boostOn('luck') ? 2 : 1) * (1 + Object.keys(this.save.index).length * 0.01) * (1 + this.buff('luck')); },
    addMoney(n) { this.save.money += n; this.save.stats.earned += Math.max(0, n); },

    // --- Кадр ---
    update(dt) {
        if (!this.player) return;
        const s = this.save;
        if (UI.open) { UI.update(dt); return; }   // окно открыто — игра на паузе
        World.update(dt);
        Rig.updateAll(dt);
        // Доход раз в секунду.
        this._incomeT += dt;
        if (this._incomeT >= 1) {
            this._incomeT -= 1;
            const inc = this.incomeNow();
            if (inc > 0) this.addMoney(inc);
            // Музыка события: пока Титаническое яйцо в мире — своя тема.
            if (this.state === 'play') { const want = World.titanic ? Sfx.MUSIC_TITANIC : Sfx.MUSIC_MAIN; if (this._track !== want) this.setTrack(want, World.titanic ? 0.6 : 0.5); }
            for (const a of this.actors) if (a.brain) { a.brain.money += a.base.income(); this.botSpend(a); }
            if (this.state === 'play') s.stats.time += 1;
            const best = this.player.base.income();
            if (best > s.stats.best) s.stats.best = best;
        }
        this._saveT += dt;
        if (this._saveT > 15) { this._saveT = 0; this.persist(); }
        this._lbT -= dt;
        if (this._lbT <= 0) { this._lbT = 5; this.drawBoards(); }
        if (this.state === 'play') { this.updatePlayer(dt); this.updateOffers(dt); }
        else { this.player.step(dt, 0, 0, false, false); this.updateMenuCamera(dt); }
        for (const a of this.actors) if (a.brain) a.brain.update(dt);
        if (this.state === 'play') this.updateCamera(dt);
        // Бег по дорожке у ботов не нужен; у игрока — прирост скорости.
        this.updateTreadmill(dt);
        this.updateFollowers(dt);
        World.updateChevrons(dt, this.player, this.state === 'play' && !Tutorial.active ? this.questTarget() : (Tutorial.active && this.player.carry ? this.baseTarget() : null));
        UI.bigRun(this.state === 'play' && !!this.player.carry && World.guardians.some(g => g.target === this.player));
        UI.update(dt);
    },

    updatePlayer(dt) {
        const p = this.player;
        const blocked = !!UI.open;
        // Направление от камеры.
        const m = blocked ? { x: 0, y: 0 } : Input.move();
        const az = this.app.camera.azimuth;
        const fx = Math.cos(az), fy = Math.sin(az), rx = -Math.sin(az), ry = Math.cos(az);
        let dx = fx * m.y + rx * m.x, dy = fy * m.y + ry * m.x;
        const jump = !blocked && Input.pressed('jump');
        let attack = !blocked && (Input.down('attack') || this._tapAttack > 0);
        this._tapAttack = Math.max(0, (this._tapAttack || 0) - dt);
        // Касания справа — удар.
        for (const t of Input.consumeTaps()) if (!blocked && t.x > window.innerWidth * 0.4) this._tapAttack = 0.2;
        if (!blocked) {
            if (Input.pressed('tool1')) this.selectSlot(1);
            if (Input.pressed('tool2')) this.selectSlot(2);
            if (Input.pressed('drop')) this.dropCarry();
            if (Input.pressed('auto')) this.toggleAuto();
            if (Input.pressed('pause')) this.openWithAd(() => UI.openPause());
        }
        // Auto Swing: киркой — по ближайшему яйцу, битой — по ближайшему боту.
        if (this.autoSwing && !p.carry && p.tool === 'pickaxe') {
            const e = World.eggNear(p.x, p.y, null, GameData.REACH + 40);
            if (e) { attack = true; if (Math.hypot(dx, dy) < 0.1) p.heading = Math.atan2(e.y - p.y, e.x - p.x); }
        } else if (this.autoSwing && !p.carry && p.tool === 'bat') {
            let t = null, td = GameData.REACH + 30;
            for (const o of this.actors) {
                if (o === p || !o.brain || o.stun > 0 || o.invuln > 0) continue;
                const d = Math.hypot(o.x - p.x, o.y - p.y);
                if (d < td) { td = d; t = o; }
            }
            if (t) { attack = true; if (Math.hypot(dx, dy) < 0.1) p.heading = Math.atan2(t.y - p.y, t.x - p.x); }
        }
        // Удар киркой без яйца рядом — повернуться к ближайшему в досягаемости.
        if (attack && p.tool === 'pickaxe' && Math.hypot(dx, dy) < 0.1) {
            const e = World.eggNear(p.x, p.y, null, GameData.REACH + 20);
            if (e) p.heading = Math.atan2(e.y - p.y, e.x - p.x);
        }
        p.boost = (this.boostOn('speed') ? 1.25 : 1) * (1 + this.buff('speed'));
        p.step(dt, dx, dy, jump, attack);
        // Доставка на свою базу.
        if (p.carry && p.base.contains(p.x, p.y, -40)) this.deliver(p);
        this.updateInteract(dt);
    },

    // Камера Roblox-стиля: за спиной, ПКМ/свайп вращают, колесо — дистанция; не залезает в стены.
    updateCamera(dt) {
        const cam = this.app.camera, c = this.cam, p = this.player;
        const look = Input.consumeLook();   // касания (свайп справа) и правый стик геймпада
        const ml = this.consumeMouseLook();  // мышь: ПКМ-драг
        look.dx += ml.dx; look.dy += ml.dy;
        if (!UI.open) {
            const sens = this.save.settings.sens || 1;
            cam.azimuth += look.dx * 0.0062 * sens;
            c.pitch = Math.max(0.12, Math.min(1.2, c.pitch + look.dy * 0.0045 * sens));
            const w = Input.consumeWheel();
            if (w) c.user = Math.max(0.45, Math.min(2.2, c.user * (w > 0 ? 1.12 : 1 / 1.12)));
        }
        // Камера мягко уходит за спину при беге (если игрок не крутит сам).
        if (Math.abs(look.dx) < 0.5 && p.moving > 0.6 && (Input.device === 'touch' || Input.stick.active)) {
            let d = p.heading - cam.azimuth; d = Math.atan2(Math.sin(d), Math.cos(d));
            cam.azimuth += d * Math.min(1, dt * 0.8);
        }
        cam.pitch = c.pitch;
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        let want = 820 * c.user * (window.innerHeight < 500 ? 0.85 : 1) * (aspect < 1 ? 1.3 : 1);
        // Стены: отодвинуть камеру ближе, если позади блок.
        const az = cam.azimuth, cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
        const th = (p.gh || 0) + p.h + 150;
        for (let d = 80; d <= want; d += 40) {
            const x = p.x - Math.cos(az) * cp * d, y = p.y - Math.sin(az) * cp * d, h = th + sp * d;
            if (h < 500 && !World.isOpen(x, y, 30)) { want = Math.max(140, d - 60); break; }
        }
        c.d += (want - c.d) * Math.min(1, dt * (want < c.d ? 14 : 3));
        // Табло моста между камерой и игроком — полупрозрачное (камера не прыгает к игроку).
        let hide = false;
        for (let d = 60; d <= c.d; d += 40) { const x = p.x - Math.cos(az) * cp * d, y = p.y - Math.sin(az) * cp * d; if (World.inBridge(x, y, th + sp * d)) { hide = true; break; } }
        World.setBridgeFade(hide ? 0.25 : 1, dt);
        const H = (World3D.engine.getRenderingCanvas().clientHeight) || 600;
        const z = H / (2 * Math.tan(cam.cam.fov / 2) * c.d);
        cam.zoom = cam.zoomTarget = z;
        const t = this.camTarget;
        t.x = p.x; t.y = p.y; t.h = th;
    },

    updateMenuCamera(dt) {
        const cam = this.app.camera, c = this.cam;
        this._menuT += dt;
        cam.azimuth = Math.PI / 2 + Math.sin(this._menuT * 0.08) * 0.6 - 0.2;
        cam.pitch = 0.42;
        const t = this.camTarget;
        t.x = 2600 + Math.sin(this._menuT * 0.05) * 300; t.y = 2700; t.h = 350;
        const H = (World3D.engine.getRenderingCanvas().clientHeight) || 600;
        cam.zoom = cam.zoomTarget = H / (2 * Math.tan(cam.cam.fov / 2) * 1700);
        Input.consumeLook(); Input.consumeTaps(); this.consumeMouseLook();
    },

    // --- Взаимодействия (подсказка [E]) ---
    updateInteract(dt) {
        const p = this.player;
        let best = null;
        const near = (x, y, r) => Math.hypot(p.x - x, p.y - y) < r;
        const add = (o) => { if (!best || o.pri > best.pri) best = o; };
        if (!p.carry && p.stun <= 0) {
            const sh = World.shops;
            if (sh['shop-pickaxe'] && near(sh['shop-pickaxe'].x, sh['shop-pickaxe'].y, 230)) add({ id: 'pick', pri: 2, x: sh['shop-pickaxe'].x, y: sh['shop-pickaxe'].y, h: 200, t1: Lang.t('shop.pickaxe'), t2: Lang.t('act.open'), fn: () => UI.openPickaxes() });
            if (sh['shop-cosmetic'] && near(sh['shop-cosmetic'].x, sh['shop-cosmetic'].y, 230)) add({ id: 'cos', pri: 2, x: sh['shop-cosmetic'].x, y: sh['shop-cosmetic'].y, h: 200, t1: Lang.t('shop.cosmetic'), t2: Lang.t('act.open'), fn: () => Shops.openShop('trail') });
            if (sh.merge && near(sh.merge.x, sh.merge.y, 260)) add({ id: 'merge', pri: 2, x: sh.merge.x, y: sh.merge.y, h: 220, t1: Lang.t('shop.merge'), t2: Lang.t('act.open'), fn: () => UI.openMerge() });
            if (sh.wheel && near(sh.wheel.x, sh.wheel.y, 240)) add({ id: 'wheel', pri: 2, x: sh.wheel.x, y: sh.wheel.y, h: 220, t1: Lang.t('shop.wheel'), t2: Lang.t('act.spin'), fn: () => Shops.openWheel() });
            if (sh.gift && near(sh.gift.x, sh.gift.y, 220)) add({ id: 'gift', pri: 2, x: sh.gift.x, y: sh.gift.y, h: 160, t1: Lang.t('shop.gift'), t2: Lang.t('act.open'), fn: () => Shops.openDaily() });
            const b = p.base;
            if (near(b.signPos.x, b.signPos.y, 200) && b.level < GameData.PEN_MAX_LEVEL) add({ id: 'pen', pri: 3, x: b.signPos.x, y: b.signPos.y, h: 240, t1: Lang.t('act.upgradePen') + ' ' + GameData.money(GameData.penPrice(b.level)), t2: Lang.t('act.slots', { n: b.slotCount + 1 }), fn: () => this.upgradePen() });
            if (near(b.treadPos.x, b.treadPos.y, 220) && b.tread < GameData.TREADMILL.length - 1) {
                const nx = GameData.TREADMILL[b.tread + 1];
                add({ id: 'tread', pri: 1, x: b.treadPos.x, y: b.treadPos.y, h: 330, t1: Lang.t('act.upgradeTread') + ' ' + GameData.money(nx.price), t2: Lang.t('act.treadInfo', { n: nx.cap }), fn: () => this.upgradeTread() });
            }
            const d = World.droppedNear(p.x, p.y, 140);
            if (d) add({ id: 'pickup', pri: 5, x: d.x, y: d.y, h: 150, t1: Lang.t('act.pickup'), t2: Lang.t('pet.' + d.pet.sp), fn: () => this.pickupDropped(p, d) });
            // Воровство из чужого загона (держать E).
            if (this.stealEnabled()) for (const ob of World.bases) {
                if (ob === b || !ob.owner || !ob.contains(p.x, p.y, 30)) continue;
                for (let i = 0; i < ob.slotCount; i++) {
                    const sl = ob.slots[i];
                    if (!sl.pet || !near(sl.x, sl.y, 120)) continue;
                    const info = Lang.t('pet.' + sl.pet.sp) + ' ' + GameData.money(GameData.incomeOf(sl.pet)) + '/' + Lang.t('t.s');
                    // Редкие (Редкий и выше) у ботов — только за рекламу; без рекламы на площадке — как обычные.
                    const rare = GameData.RARITY[sl.pet.r].order >= 2 && Platform.rewardedSupported();
                    if (rare) add({ id: 'steal' + ob.index + '-' + i, pri: 4, x: sl.x, y: sl.y, h: 170, t1: Lang.t('act.stealAd'), t2: info, fn: () => this.stealRareForAd(p, ob, i) });
                    else add({ id: 'steal' + ob.index + '-' + i, pri: 4, hold: 1.2, x: sl.x, y: sl.y, h: 170, t1: Lang.t('act.steal'), t2: info, fn: () => this.stealPet(p, ob, i) });
                }
            }
        }
        if (!best || (this._prompt && this._prompt.id !== best.id)) { this._promptT = 0; }
        this._prompt = best;
        UI.prompt = best ? Object.assign({ progress: best.hold ? this._promptT / best.hold : 0 }, best) : null;
        if (best) Input.setContext({ id: 'act', label: best.t1, icon: best.hold ? '✋' : '👆' });
        else Input.clearContext('act');
        if (!best) return;
        const down = Input.down('interact') || this._promptHeld;
        if (best.hold) {
            if (down) {
                if (this._promptT === 0) this.onStealStart(p, null, null);
                this._promptT += dt;
                if (this._promptT >= best.hold) { this._promptT = 0; this._promptHeld = false; best.fn(); }
            } else this._promptT = 0;
        } else if (Input.pressed('interact') || this._promptTap) { this._promptTap = false; Sfx.play('click', 0.5); best.fn(); }
    },
    promptPress(on) { this._promptHeld = on; if (on) this._promptTap = true; },

    stealEnabled() { return this.save.settings.steal !== false && this.state === 'play'; },

    // --- Хотбар и инструменты ---
    selectSlot(k) {
        const p = this.player;
        if (k === 3 && p.carry && this.playablesUi()) { this.dropCarry(); return; }   // Playables: бросить ношу (кнопки нет)
        if (k === 3 || p.carry) return;
        p.setTool(k === 2 ? 'bat' : 'pickaxe');
    },
    toggleAuto() {
        if (this.player.carry) { this.dropCarry(); return; }
        if (this.playablesUi()) return;   // Playables: автоудар всегда включён
        this.autoSwing = !this.autoSwing;
        if (this.autoSwing && this.player.tool !== 'pickaxe') this.player.setTool('pickaxe');
    },
    dropCarry() {
        const p = this.player;
        if (!p.carry) return;
        this.loseCarry(p, true);
        Sfx.play('drop', 0.6);
    },

    // --- Удары ---
    onSwingHit(a) {
        if (a.tool === 'pickaxe') {
            const e = World.eggNear(a.x, a.y, a.heading, GameData.REACH);
            if (e) this.hitEgg(a, e);
        } else {
            // Бита: ближайший персонаж впереди.
            let best = null, bd = GameData.REACH + 30;
            for (const o of this.actors) {
                if (o === a || o.stun > 0) continue;
                const dx = o.x - a.x, dy = o.y - a.y, d = Math.hypot(dx, dy);
                if (d > bd) continue;
                let da = Math.atan2(dy, dx) - a.heading; da = Math.atan2(Math.sin(da), Math.cos(da));
                if (Math.abs(da) > 1.4 && d > 60) continue;
                bd = d; best = o;
            }
            if (best) this.batHit(a, best);
        }
    },

    hitEgg(a, e) {
        const power = GameData.pickaxe(a.pick).power * (a.isPlayer ? 1 + this.buff('power') : 1);
        e.hp -= power;
        e.shake = 1;
        e.hits.set(a, (e.hits.get(a) || 0) + power);
        if (a.isPlayer || Math.hypot(a.x - this.player.x, a.y - this.player.y) < 900) {
            const k = 1 + Math.floor(Math.random() * 3);
            Sfx.play('hit' + k, a.isPlayer ? 0.55 : 0.25, 0.9 + Math.random() * 0.2);
            this.app.fx.create({ position: new BABYLON.Vector3(e.x, e.height * 0.6 * (e.titanic ? GameData.TITANIC.scale * 0.5 : 1), e.y), burst: 10, capacity: 12, life: [0.3, 0.7], size: [6, 13], speed: [120, 260], gravity: [0, -900, 0], direction: [[-1, 0.4, -1], [1, 1, 1]], color: e.type.color || '#d9b48a', color2: '#ffffff', blend: 'standard', duration: 0.05 });
        }
        if (a.isPlayer) {
            Tutorial.complete('hit');
            if (Math.random() < 0.18) UI.floater(e.x, e.y, e.height + 60, '🍀 x' + this.luck().toFixed(2) + ' ' + Lang.t('hud.luck'), 'ui-o', '#7dff6a', 18);
        }
        if (e.hp <= 0) this.breakEgg(a, e);
    },

    breakEgg(a, e) {
        const luck = a.isPlayer ? this.luck() : 1;
        const roll = GameData.roll(e.type, luck);
        const pet = GameData.makePet(e.type, roll, null, e.tz);
        const x = e.x, y = e.y, titanic = e.titanic;
        World.removeEgg(e);
        if (titanic) {
            World.titanic = null;
            // Награда участникам — кристаллы по вкладу.
            const mine = e.hits.get(this.player) || 0;
            if (mine > 0 && a !== this.player) { const g = Math.max(5, Math.round(60 * mine / e.max)); Shops.addGems(g); UI.toast(Lang.t('titanic.share', { n: g }), '#f2b8ff'); }
        }
        this.app.fx.play('magic', new BABYLON.Vector3(x, 80, y));
        this.app.fx.create({ position: new BABYLON.Vector3(x, 90, y), burst: 46, capacity: 50, life: [0.4, 1.1], size: [10, 26], speed: [150, 420], gravity: [0, -300, 0], color: '#ffffff', color2: '#fff3a8', duration: 0.05 });
        PetView.create(pet).then(v => {
            if (a.carry || a.stun > 0) { World.dropPet(pet, x, y, 0, null); v.dispose(); return; }
            v.place(x, y, 0, a.heading);
            a.takeCarry(pet, v, { zone: World.zoneAt(x, y) });
            if (a.isPlayer) {
                this.save.index[pet.sp] = true;
                this.save.stats.hatched++;
                Shops.addGems(GameData.RARITY[pet.r].gems, { save: false });
                Sfx.play('crack', 0.7); Sfx.play('hatch', 0.6);
                UI.floater(x, y, 260, Lang.t('hud.yay'), 'bubble', '#111', 22);
                setTimeout(() => {
                    UI.floater(x, y, 210, Lang.t('pet.' + pet.sp), 'ui-o', '#ffffff', 30);
                    UI.floater(x, y, 170, Lang.t('rar.' + pet.r) + ' · ' + GameData.money(GameData.incomeOf(pet)) + '/' + Lang.t('t.s'), 'ui-o', pet.r === 'secret' ? 'rainbow' : GameData.RARITY[pet.r].color, 22);
                }, 250);
                if (GameData.RARITY[pet.r].order >= 3) { Sfx.play('win', 0.6); this.app.camera.shake(250, 0.01); }
                Tutorial.complete('hatch');
                if (!this.playablesUi()) this.autoSwing = false;
                this.persist();
            }
        });
    },

    batHit(a, t) {
        const near = a.isPlayer || t.isPlayer || Math.hypot(a.x - this.player.x, a.y - this.player.y) < 900;
        if (!t.knock(a.x, a.y, 900, 1.1)) return;
        if (near) Sfx.play('bonk', 0.6, 0.95 + Math.random() * 0.15);
        this.app.fx.create({ position: new BABYLON.Vector3(t.x, 170, t.y), burst: 12, capacity: 14, life: [0.3, 0.6], size: [8, 16], speed: [100, 250], color: '#ffe14a', color2: '#ffffff', duration: 0.05 });
        if (t.carry) this.loseCarry(t, false, a);
        if (t.isPlayer && a.brain) UI.toast(Lang.t('hud.hitBy', { n: a.name }), '#ff6a6a');
    },

    // Несущий теряет ношу: краденое возвращается владельцу, найденное — падает на землю.
    loseCarry(t, voluntary, by) {
        const c = t.releaseCarry();
        if (!c) return;
        if (c.stolenFrom) {
            const b = c.stolenFrom;
            c.view.dispose();
            const slot = b.freeSlot();
            if (slot >= 0) World.placePet(b, slot, c.pet);
            if (b.owner && b.owner.isPlayer) { this.syncPlayerPets(); UI.toast(Lang.t('hud.saved', { n: Lang.t('pet.' + c.pet.sp) }), '#7dff6a'); }
            else if (t.isPlayer) UI.toast(Lang.t('hud.stealFail'), '#ff6a6a');
        } else {
            c.view.dispose();
            World.dropPet(c.pet, t.x + 40, t.y, 0, t).then(d => { if (t.isPlayer && !voluntary && !Tutorial.active) this.offerRescue(d); });
        }
        if (t.isPlayer) {
            this.roundEnd(false);
            if (!voluntary) UI.toast(Lang.t('hud.lost'), '#ff6a6a');
        }
    },

    pickupDropped(a, d) {
        if (a.carry || World.dropped.indexOf(d) < 0) return;
        const i = World.dropped.indexOf(d);
        World.dropped.splice(i, 1);
        d.view.showLabel(false);
        a.takeCarry(d.pet, d.view, { zone: World.zoneAt(d.x, d.y) });
        if (a.isPlayer) { Sfx.play('pickup', 0.6); this.save.index[d.pet.sp] = true; }
    },

    // --- Воровство из загона ---
    onStealStart(a, base, slot) {
        const victim = base ? base.owner : null;
        if (victim && victim.isPlayer && slot && slot.pet) {
            UI.toast(Lang.t('hud.thief', { n: a.name, p: Lang.t('pet.' + slot.pet.sp) }), '#ff6a6a', 3.5);
            Sfx.play('alarm', 1);
        }
    },
    // Кража редкого питомца у бота: награда за рекламу (только по подтверждению SDK).
    async stealRareForAd(a, base, slotIdx) {
        if (this._stealAdBusy) return;
        this._stealAdBusy = true;
        try {
            const pet = base.slots[slotIdx] && base.slots[slotIdx].pet;
            if (!pet) return;
            const ok = await Platform.rewarded('steal-rare');
            if (!ok) { UI.toast(Lang.t('ad.none'), '#ffd23a'); return; }
            if (base.slots[slotIdx].pet === pet && !a.carry) this.stealPet(a, base, slotIdx);
        } finally { this._stealAdBusy = false; }
    },
    stealPet(a, base, slotIdx) {
        if (a.carry) return;
        const sl = base.slots[slotIdx];
        if (!sl || !sl.pet) return;
        const pet = sl.pet;
        const view = sl.view;
        sl.pet = null; sl.view = null;
        if (!view) return;
        a.takeCarry(pet, view, { stolenFrom: base, slot: slotIdx });
        if (base.owner && base.owner.isPlayer) { this.syncPlayerPets(); UI.toast(Lang.t('hud.stolen', { n: a.name }), '#ff3b3b', 3); }
        if (a.isPlayer) { Sfx.play('pickup', 0.6); UI.toast(Lang.t('hud.stealRun'), '#ffd23a'); if (base.owner && base.owner.brain) { const br = base.owner.brain; br.state = 'hunt'; br.target = a; br.defending = true; br.setGoal(a.x, a.y); } }
    },

    // --- Доставка на базу ---
    deliver(a) {
        const c = a.carry;
        if (!c) return;
        const b = a.base;
        a.releaseCarry();
        c.view.dispose();
        const pet = c.pet;
        if (a.isPlayer) {
            pet.slot = -1;
            this.save.pets.push(pet);
            const slot = b.freeSlot();
            if (slot >= 0) { pet.slot = slot; World.placePet(b, slot, pet); }
            else UI.toast(Lang.t('hud.penFull'), '#ffd23a', 3);
            Sfx.play('deliver', 0.7);
            UI.floater(a.x, a.y, 260, '+' + Lang.t('pet.' + pet.sp) + '!', 'ui-o', '#7dff6a', 30);
            this.app.fx.play('magic', new BABYLON.Vector3(a.x, 120, a.y));
            if (c.stolenFrom) { this.save.stats.stolen++; UI.toast(Lang.t('hud.stealOk'), '#7dff6a'); }
            Tutorial.complete('deliver');
            this.roundEnd(true);
            this.persist();
        } else {
            let slot = b.freeSlot();
            if (slot < 0) {
                // Полный загон — заменить самого слабого, если новый лучше.
                let worst = 0;
                for (let i = 1; i < b.slotCount; i++) if (GameData.incomeOf(b.slots[i].pet) < GameData.incomeOf(b.slots[worst].pet)) worst = i;
                if (GameData.incomeOf(pet) > GameData.incomeOf(b.slots[worst].pet)) { World.clearSlot(b, worst); slot = worst; }
            }
            if (slot >= 0) World.placePet(b, slot, pet);
            else a.brain.money += GameData.incomeOf(pet) * GameData.SELL_SECONDS;
        }
    },

    // Раунд = вылазка (питомец доставлен или потерян): правило рекламы и рекорды.
    roundEnd(win) {
        if (Tutorial.active) return;
        Platform.ads.roundEnded(win);
        Platform.submitScore(Math.floor(this.player.base.income()));
    },

    // --- Стражи ---
    onGuardianAngry(g, t) {
        if (t.isPlayer) { Sfx.play('roar', 0.9, 0.85 + g.zone * 0.04); this.app.camera.shake(300, 0.012); }
    },
    onGuardianHit(g, t) {
        if (t.knock(g.x, g.y, 950, 1.5)) {
            if (t.isPlayer || Math.hypot(t.x - this.player.x, t.y - this.player.y) < 1000) Sfx.play('bonk', 0.8, 0.8);
            if (t.isPlayer) this.app.camera.shake(350, 0.02);
            if (t.carry) this.loseCarry(t, false);
        }
    },

    // --- Titanic Egg ---
    onTitanic() {
        const best = Math.max(...this.actors.map(a => GameData.pickaxe(a.pick).power));
        World.spawnTitanic(GameData.pickaxe(this.save.pick).power * 0.6 + best * 0.4);
        if (this.state === 'play') { UI.toast(Lang.t('titanic.spawned'), '#ffd23a', 4); Sfx.play('titanic', 0.9); }
    },

    // --- Дорожка ---
    updateTreadmill(dt) {
        const p = this.player, b = p.base;
        const on = this.state === 'play' && p.grounded && b.onTreadmill(p.x, p.y) && !p.carry;
        if (on) {
            const tr = GameData.TREADMILL[b.tread];
            if (p.speedStat < tr.cap) {
                p.speedStat = Math.min(tr.cap, p.speedStat + tr.rate * dt);
                this._treadPop = (this._treadPop || 0) + tr.rate * dt;
                if (this._treadPop >= 1) { this._treadPop = 0; UI.floater(p.x, p.y, 260, '+1 ' + Lang.t('hud.speed'), 'ui-o', '#5ad1ff', 20); }
            } else if (!this._capShown) { this._capShown = true; UI.toast(Lang.t('hud.treadCap'), '#ffd23a', 3); }
            // Бег на месте лицом к поручням (дорожка повёрнута на курс базы + 180°), пока игрок не идёт сам.
            if (p.moving < 0.15) { let d = (b.heading + Math.PI) - p.heading; d = Math.atan2(Math.sin(d), Math.cos(d)); p.heading += d * Math.min(1, dt * 10); }
            p.forceRun = 1;
            b.running = true;
            if (!this._treadLoop) this._treadLoop = Sound.loop(Sfx.FILES.treadmill, { volume: 0.25 });
            if (this._treadLoop) this._treadLoop.set(0.25, null);
            Tutorial.complete('tread');
        } else {
            this._capShown = false;
            p.forceRun = 0;
            b.running = false;
            if (this._treadLoop) this._treadLoop.set(0, null);
        }
    },

    // --- Покупки ---
    spend(n) {
        if (this.save.money < n) { Sfx.play('error', 0.5); UI.toast(Lang.t('hud.noMoney'), '#ff6a6a'); return false; }
        this.save.money -= n;
        return true;
    },
    buyPickaxe(i) {
        const s = this.save;
        if (i !== s.pick + 1) return false;
        const px = GameData.PICKAXES[i];
        if (!this.spend(px.price)) return false;
        s.pick = i;
        this.player.setPick(i);
        Sfx.play('buy', 0.6);
        UI.toast(Lang.t('hud.bought', { n: Lang.t('pick.' + px.id) }), '#7dff6a');
        this.app.fx.play('magic', new BABYLON.Vector3(this.player.x, 150, this.player.y));
        this.persist();
        return true;
    },
    upgradePen() {
        const b = this.player.base;
        if (b.level >= GameData.PEN_MAX_LEVEL) return;
        if (!this.spend(GameData.penPrice(b.level))) return;
        b.level++; this.save.pen = b.level;
        World.updateSign(b); World.updatePads(b);
        Sfx.play('upgrade', 0.7);
        UI.toast(Lang.t('hud.penUp', { n: b.slotCount }), '#7dff6a');
        this.app.fx.play('magic', new BABYLON.Vector3(b.signPos.x, 200, b.signPos.y));
        this.equipBest(true);
        this.persist();
    },
    upgradeTread() {
        const b = this.player.base;
        const nx = GameData.TREADMILL[b.tread + 1];
        if (!nx || !this.spend(nx.price)) return;
        b.tread++; this.save.tread = b.tread;
        Sfx.play('upgrade', 0.7);
        UI.toast(Lang.t('hud.treadUp', { n: nx.cap }), '#7dff6a');
        this.persist();
    },
    botSpend(a) {
        const br = a.brain;
        const next = GameData.PICKAXES[a.pick + 1];
        if (next && br.money >= next.price * 1.1 && a.pick < this.save.pick + 2) { br.money -= next.price; a.setPick(a.pick + 1); }
        const b = a.base;
        if (b.level < GameData.PEN_MAX_LEVEL && br.money >= GameData.penPrice(b.level) * 1.3) { br.money -= GameData.penPrice(b.level); b.level++; World.updateSign(b); World.updatePads(b); }
    },

    // --- Питомцы игрока: загон и хранилище ---
    syncPlayerPets() {
        // Сохранение = то, что в загоне + хранилище.
        const b = this.player.base, s = this.save;
        const inPen = new Set();
        b.slots.forEach((sl, i) => { if (sl.pet) { sl.pet.slot = i; inPen.add(sl.pet.uid); } });
        const stored = s.pets.filter(p => !inPen.has(p.uid) && p.slot === -1);
        const pen = b.slots.filter(sl => sl.pet).map(sl => sl.pet);
        // Питомцы, которые были в загоне, но пропали (украдены), — убрать из сохранения.
        s.pets = pen.concat(stored);
        this.persist();
    },
    togglePet(uid) {
        const s = this.save, b = this.player.base;
        const p = s.pets.find(q => q.uid === uid);
        if (!p) return;
        if (p.slot >= 0) { World.clearSlot(b, p.slot); p.slot = -1; }
        else {
            const i = b.freeSlot();
            if (i < 0) { UI.toast(Lang.t('hud.penFull'), '#ffd23a'); Sfx.play('error', 0.5); return; }
            if (p.eq) { p.eq = false; this.syncFollowers(); }
            p.slot = i; World.placePet(b, i, p);
        }
        this.persist();
    },
    equipBest(silent) {
        const s = this.save, b = this.player.base;
        const sorted = s.pets.filter(p => !p.eq).sort((u, v) => GameData.incomeOf(v) - GameData.incomeOf(u));   // кто с собой — не трогаем
        const want = new Set(sorted.slice(0, b.slotCount).map(p => p.uid));
        for (const p of s.pets) if (p.slot >= 0 && !want.has(p.uid)) { World.clearSlot(b, p.slot); p.slot = -1; }
        for (const p of sorted) if (want.has(p.uid) && p.slot < 0) { const i = b.freeSlot(); if (i >= 0) { p.slot = i; World.placePet(b, i, p); } }
        if (!silent) Sfx.play('click', 0.5);
        this.persist();
    },
    sellPet(uid) {
        const s = this.save, b = this.player.base;
        const i = s.pets.findIndex(q => q.uid === uid);
        if (i < 0) return;
        const p = s.pets[i];
        if (p.slot >= 0) World.clearSlot(b, p.slot);
        s.pets.splice(i, 1);
        if (p.eq) this.syncFollowers();
        this.addMoney(GameData.incomeOf(p) * GameData.SELL_SECONDS);
        Sfx.play('coin', 0.4);
        this.persist();
    },
    // --- Питомцы с собой: до FOLLOW_MAX идут за игроком и дают бонус своего вида (не в загоне — без дохода) ---
    /** @type {{ uid: string, mut: string, pet: any, view: any, x: number, y: number, heading: number, t: number }[]} */
    followers: [],
    /** @type {Record<string, number> | null} */
    _buffs: null,
    _folTok: 0,
    buffs() {
        if (this._buffs) return this._buffs;
        /** @type {Record<string, number>} */
        const t = { power: 0, speed: 0, cash: 0, luck: 0 };
        for (const p of this.save.pets) if (p.eq) { const b = GameData.petBuff(p); t[b.type] += b.v; }
        for (const k of Object.keys(t)) t[k] = Math.min(GameData.BUFF_CAP[k], t[k]);
        return (this._buffs = t);
    },
    buff(type) { return this.save ? this.buffs()[type] || 0 : 0; },
    followCount() { return this.save.pets.filter(p => p.eq).length; },
    toggleFollow(uid) {
        const s = this.save, p = s.pets.find(q => q.uid === uid);
        if (!p) return;
        if (p.eq) { p.eq = false; Sfx.play('click', 0.5); }
        else {
            if (this.followCount() >= GameData.FOLLOW_MAX) { UI.toast(Lang.t('pets.full', { n: GameData.FOLLOW_MAX }), '#ffd23a'); Sfx.play('error', 0.5); return; }
            if (p.slot >= 0) { World.clearSlot(this.player.base, p.slot); p.slot = -1; }
            p.eq = true;
            Sfx.play('pickup', 0.6, 1.2);
        }
        this.syncFollowers();
        this.persist();
    },
    // Лучших с собой — из тех, кто не в загоне (доход загона не трогаем).
    followBest() {
        const s = this.save;
        for (const p of s.pets) p.eq = false;
        s.pets.filter(p => p.slot < 0).sort((u, v) => GameData.petBuff(v).v - GameData.petBuff(u).v)
            .slice(0, GameData.FOLLOW_MAX).forEach(p => { p.eq = true; });
        Sfx.play('click', 0.5);
        this.syncFollowers();
        this.persist();
    },
    // Виды спутников под список «с собой»: лишних убрать, новых создать (мутация сменилась — пересоздать).
    async syncFollowers() {
        this._buffs = null;
        const want = this.save.pets.filter(p => p.eq).slice(0, GameData.FOLLOW_MAX);
        const tok = ++this._folTok;
        this.followers = this.followers.filter(f => {
            const p = want.find(q => q.uid === f.uid);
            if (p && p.mut === f.mut) { f.pet = p; return true; }
            f.view.dispose();
            return false;
        });
        const pl = this.player;
        for (const p of want) {
            if (this.followers.some(f => f.uid === p.uid)) continue;
            const view = await PetView.create(p);
            if (tok !== this._folTok || !p.eq || this.followers.some(f => f.uid === p.uid)) { view.dispose(); continue; }
            view.mesh.scaling.scaleInPlace(GameData.FOLLOW_SCALE);
            this.followers.push({ uid: p.uid, mut: p.mut, pet: p, view, x: pl.x, y: pl.y, heading: pl.heading, t: Math.random() * 6 });
        }
        if (tok === this._folTok) this.followers.sort((a, b) => want.findIndex(p => p.uid === a.uid) - want.findIndex(p => p.uid === b.uid));
    },
    // Строй за спиной игрока: мягкое догоняние, прыжки на бегу, отстал далеко (телепорт) — сразу на место.
    updateFollowers(dt) {
        const p = this.player;
        if (!p || !this.followers.length) return;
        const fx = Math.cos(p.heading), fy = Math.sin(p.heading), k = 1 - Math.exp(-dt * 7);
        this.followers.forEach((f, i) => {
            const o = GameData.FOLLOW_SLOTS[i] || GameData.FOLLOW_SLOTS[0];
            const tx = p.x - fx * o[0] - fy * o[1], ty = p.y - fy * o[0] + fx * o[1];
            if (Math.hypot(tx - f.x, ty - f.y) > 1200) { f.x = tx; f.y = ty; }
            const vx = (tx - f.x) * k, vy = (ty - f.y) * k, sp = Math.hypot(vx, vy) / Math.max(dt, 1e-3);
            f.x += vx; f.y += vy; f.t += dt;
            const want = sp > 40 ? Math.atan2(vy, vx) : p.heading;
            let da = want - f.heading; da = Math.atan2(Math.sin(da), Math.cos(da));
            f.heading += da * Math.min(1, dt * 8);
            const hop = sp > 40 ? Math.abs(Math.sin(f.t * 11)) * 14 : Math.max(0, Math.sin(f.t * 2.4)) * 6;
            const m = f.view.mesh;
            if (!m) return;
            m.position.set(f.x, World.ground(f.x, f.y) + hop, f.y);
            m.rotation.y = -f.heading;
        });
    },

    mergeGroups() {
        const map = new Map();
        for (const p of this.save.pets) {
            if (p.mut === 'rainbow') continue;
            const k = p.sp + '|' + p.mut;
            map.set(k, (map.get(k) || 0) + 1);
        }
        return [...map.entries()].filter(([, n]) => n >= 3).map(([k, n]) => { const [sp, mut] = k.split('|'); return { sp, mut, count: n }; });
    },
    merge(sp, mut) {
        const s = this.save, b = this.player.base;
        const list = s.pets.filter(p => p.sp === sp && p.mut === mut).sort((u, v) => v.inc - u.inc).slice(0, 3);
        if (list.length < 3) return;
        const keep = list[0];
        for (const p of list.slice(1)) { if (p.slot >= 0) World.clearSlot(b, p.slot); s.pets.splice(s.pets.indexOf(p), 1); }
        const next = GameData.MUTATIONS[GameData.MUTATIONS.findIndex(m => m.id === mut) + 1];
        keep.mut = next.id;
        keep.kg = Math.round(keep.kg * 1.15);
        if (keep.slot >= 0) { const sl = keep.slot; World.clearSlot(b, sl); World.placePet(b, sl, keep); }
        this.syncFollowers();   // слитые могли быть с собой; у оставшегося сменилась мутация
        Sfx.play('merge', 0.8);
        UI.toast(Lang.t('hud.merged', { n: Lang.t('pet.' + sp), m: Lang.t('mut.' + next.id) }), '#ffd23a', 3);
        if (World.shops.merge) this.app.fx.play('magic', new BABYLON.Vector3(World.shops.merge.x, 220, World.shops.merge.y));
        this.persist();
    },

    // --- Обменник: деньги -> кристаллы. Курс дорогой и растёт с доходом: 1 💎 = 3 минуты дохода (не меньше $1000).
    GEM_PACKS: [{ n: 10, k: 1 }, { n: 50, k: 0.95 }, { n: 250, k: 0.9 }],
    gemPrice() { return Math.max(1000, Math.round(this.player.base.income() * 180)); },
    packPrice(pack) { return Math.round(this.gemPrice() * pack.n * pack.k); },
    buyGems(i) {
        const pack = this.GEM_PACKS[i];
        if (!pack) return false;
        const price = this.packPrice(pack);
        if (!this.spend(price)) return false;
        Shops.addGems(pack.n);
        Sfx.play('buy', 0.6);
        UI.toast('+' + pack.n + ' 💎', '#f2b8ff');
        this.persist();
        return true;
    },

    // --- Награды за рекламу ---
    // Кулдаун предложения: id -> время (мс), когда снова можно.
    adCooldown(id) { return Math.max(0, ((this.save.adCd[id] || 0) - Date.now()) / 1000); },
    setAdCooldown(id, sec) { this.save.adCd[id] = Date.now() + sec * 1000; },
    async rewardOnce(id) {
        if (this._adBusy) return false;
        this._adBusy = true;
        try { return await Platform.rewarded(id); } finally { this._adBusy = false; }
    },

    // Супер-награда: 5 просмотров (между ними кулдаун) -> крупный приз, призы идут по кругу.
    SUPER_VIEWS: 5,
    SUPER_COOLDOWN: 75,
    superPrize(cycle) {
        const k = cycle % 3;
        if (k === 0) return { kind: 'pet', sp: 'dragon', gems: 300 };
        if (k === 1) return { kind: 'pet', sp: 'phoenix', gems: 500 };
        return { kind: 'chest', gems: 1500 + 500 * Math.floor(cycle / 3), boost: 30 };
    },
    async superWatch() {
        const st = this.save.superAd;
        if (st.views >= this.SUPER_VIEWS || this.adCooldown('super') > 0) return false;
        const ok = await this.rewardOnce('super-reward');
        if (!ok) return false;
        st.views++;
        if (st.views < this.SUPER_VIEWS) this.setAdCooldown('super', this.SUPER_COOLDOWN);
        Sfx.play('coin', 0.5);
        this.persist();
        return true;
    },
    superClaim() {
        const st = this.save.superAd;
        if (st.views < this.SUPER_VIEWS) return null;
        /** @type {any} */
        const prize = this.superPrize(st.cycle);
        if (prize.kind === 'pet') {
            const egg = /** @type {any} */ (GameData.TITANIC);
            let tz = 0;
            const power = GameData.pickaxe(this.save.pick).power;
            for (let z = 0; z < GameData.ZONES.length; z++) if (GameData.eggsOfZone(z)[0].hp / power <= 60) tz = z;
            const pet = GameData.makePet(egg, egg.rolls.find(r => r.pet === prize.sp) || egg.rolls[0], null, tz);
            pet.slot = -1;
            this.save.pets.push(pet);
            this.save.index[pet.sp] = true;
            this.equipBest(true);
            prize.pet = pet;
        } else if (prize.boost) {
            this.save.boosts.money = Math.max(Date.now(), this.save.boosts.money || 0) + prize.boost * 60000;
        }
        if (prize.gems) Shops.addGems(prize.gems);
        st.cycle++; st.views = 0;
        Sfx.play('win', 0.8); Sfx.play('hatch', 0.6);
        this.app.fx.play('magic', new BABYLON.Vector3(this.player.x, 150, this.player.y));
        this.persist();
        return prize;
    },

    // Всплывающий подарок «+10 минут дохода за рекламу» (раз в 90–150 с игры) и «разбить сразу».
    updateOffers(dt) {
        if (!Platform.rewardedSupported() || Tutorial.active) { this.giftOffer = null; this.breakOffer = null; return; }
        this._giftT = (this._giftT == null ? 60 : this._giftT) - dt;
        if (!this.giftOffer && this._giftT <= 0 && !UI.open && !this.player.carry) {
            this.giftOffer = { until: Date.now() + 25000, amount: Math.max(250, Math.round(this.player.base.income() * 600)) };
            Sfx.play('gift', 0.4);
        }
        if (this.giftOffer && Date.now() > this.giftOffer.until) { this.giftOffer = null; this._giftT = 90 + Math.random() * 60; }
        const p = this.player;
        const e = !p.carry && p.tool === 'pickaxe' ? World.eggNear(p.x, p.y, null, GameData.REACH + 40) : null;
        const left = e ? Math.ceil(e.hp / GameData.pickaxe(p.pick).power) : 0;
        this.breakOffer = e && left > 25 && e.hp < e.max && this.adCooldown('break') <= 0 ? e : null;
        if (this.rescueOffer && (Date.now() > this.rescueOffer.until || World.dropped.indexOf(this.rescueOffer.drop) < 0)) this.rescueOffer = null;
    },
    async claimGift() {
        const g = this.giftOffer;
        if (!g) return;
        const ok = await this.rewardOnce('cash-gift');
        this.giftOffer = null; this._giftT = 100 + Math.random() * 50;
        if (!ok) return;
        this.addMoney(g.amount);
        UI.toast('+' + GameData.money(g.amount), '#7dff6a');
        Sfx.play('deliver', 0.6);
        this.persist();
    },
    async instantBreak() {
        const e = this.breakOffer;
        if (!e) return;
        const ok = await this.rewardOnce('instant-break');
        if (!ok || !e.mesh || e.hp <= 0) return;
        this.setAdCooldown('break', 60);
        e.hp = 0;
        this.breakEgg(this.player, e);
    },
    // Спасение выбитого стражем питомца: сразу в загон за рекламу (10 секунд на решение).
    offerRescue(d) {
        if (!Platform.rewardedSupported() || !d) return;
        this.rescueOffer = { drop: d, until: Date.now() + 10000 };
    },
    async rescuePet() {
        const r = this.rescueOffer;
        this.rescueOffer = null;
        if (!r || World.dropped.indexOf(r.drop) < 0) return;
        const ok = await this.rewardOnce('rescue-pet');
        if (!ok || World.dropped.indexOf(r.drop) < 0) return;
        const pet = r.drop.pet;
        World.removeDropped(r.drop);
        pet.slot = -1;
        this.save.pets.push(pet);
        const slot = this.player.base.freeSlot();
        if (slot >= 0) { pet.slot = slot; World.placePet(this.player.base, slot, pet); }
        this.save.index[pet.sp] = true;
        UI.toast(Lang.t('ad.rescued', { n: Lang.t('pet.' + pet.sp) }), '#7dff6a');
        Sfx.play('deliver', 0.7);
        this.persist();
    },
    // Титаническое яйцо сейчас (раз в полкруга таймера).
    async titanicNow() {
        if (World.titanic || this.adCooldown('titanic') > 0) return false;
        const ok = await this.rewardOnce('titanic-now');
        if (!ok) return false;
        this.setAdCooldown('titanic', GameData.TITANIC_EVERY_SEC * 0.5);
        World.titanicTimer = 0;
        return true;
    },
    // +3 к скорости навсегда (кулдаун 90 с, общий предел 150).
    async speedUp() {
        if (this.adCooldown('speed') > 0) return false;
        const ok = await this.rewardOnce('speed-up');
        if (!ok) return false;
        this.setAdCooldown('speed', 90);
        this.player.speedStat = Math.min(150, this.player.speedStat + 3);
        UI.toast(Lang.t('ad.speedUp'), '#5ad1ff');
        Sfx.play('upgrade', 0.6);
        this.persist();
        return true;
    },
    async rewardBoost(k) {
        const ok = await Platform.rewarded('boost-' + k);
        if (!ok) return false;
        const s = this.save;
        s.boosts[k] = Math.max(Date.now(), s.boosts[k] || 0) + 5 * 60 * 1000;
        Sfx.play('win', 0.6);
        UI.toast(Lang.t('boost.got.' + k), '#ffd23a');
        this.persist();
        return true;
    },
    claimOffline(mult) {
        if (this._offline <= 0) return;
        this.addMoney(this._offline * mult);
        UI.toast('+' + GameData.money(this._offline * mult), '#7dff6a');
        Sfx.play('coin', 0.5);
        this._offline = 0;
        this.persist();
    },
    async claimOfflineX2() {
        const ok = await Platform.rewarded('offline-x2');
        if (!ok) return false;
        this.claimOffline(2);
        return true;
    },

    // --- Табло лидеров (хаб) и локальные рекорды ---
    drawBoards() {
        const rows = { money: [], speed: [], time: [] };
        const all = this.actors.map(a => ({
            name: a.name, me: a.isPlayer,
            money: a.isPlayer ? this.save.stats.earned : Math.max(0, a.brain.money * 3 + a.base.income() * 600),
            speed: a.speedStat,
            time: a.isPlayer ? this.save.stats.time : Math.round(a.base.income() / 3 + 300 + a.id.length * 97),
        }));
        for (const k of Object.keys(rows)) {
            rows[k] = all.slice().sort((u, v) => v[k] - u[k]).map(r => ({ name: r.name, me: r.me, value: k === 'money' ? GameData.money(r[k]) : k === 'speed' ? String(Math.floor(r[k])) : UI.clock(r[k]) }));
        }
        World.drawLeaderboards(rows);
    },
    localBoard() {
        return this.actors.map(a => ({ name: a.name, me: a.isPlayer, score: Math.floor(a.base.income()) }))
            .sort((u, v) => v.score - u.score).map((r, i) => Object.assign(r, { rank: i + 1 }));
    },

    applyLook() { if (this.player) this.player.noob.setLook(Shops.look()); },
};

// Вид мира игры поверх констант движка: гладкий свет без toon и без чёрной обводки (Roblox).
// Quality.apply снимает переопределения обводки — поэтому вид ставится сразу после него
// (и при старте до загрузки карты, и при смене уровня графики игроком).
Game.applyRenderLook = function () {
    if (typeof World3D === 'undefined' || !World3D.setOverrides) return;
    const toon = typeof GAME_RENDER_TOON !== 'undefined' ? GAME_RENDER_TOON : 0;
    const outline = typeof GAME_RENDER_OUTLINE !== 'undefined' ? GAME_RENDER_OUTLINE : 0;
    World3D.setOverrides(Object.assign({ toon }, outline ? {} : { outline: 0, ink: 0 }));
};
if (typeof Quality !== 'undefined' && Quality.apply) {
    const qualityApply = Quality.apply;
    Quality.apply = function () { qualityApply.call(Quality); Game.applyRenderLook(); };
}
Game.applyRenderLook();

// GameModels.js — модели игры: шаблоны питомцев, яиц и гнёзд (GLB -> один нормализованный меш,
// копии — инстансы: один draw call на вид), мутации (золото, алмаз, радуга), стражи (Rig).
// Нормализация: низ модели на земле, центр по X/Z в начале координат, нос вдоль +X, высота задана.

/** @satisfies {Record<string, any>} */
const Models = {
    /** @type {View3D | null} */
    view: null,
    /** @type {Map<string, Promise<any>>} */
    _tpl: new Map(),
    /** @type {BABYLON.StandardMaterial[]} */
    _rainbow: [],
    _t: 0,

    init(view) {
        this.view = view;
        this._tpl = new Map();
        this._rainbow = [];
    },

    // Объединить части модели в один меш, повернуть носом в +X, низ на 0, центр в 0, высота -> size.
    _normalize(root, size, yawDeg, name) {
        const scene = this.view.scene;
        const kids = root.getChildMeshes(false).filter(m => m.getTotalVertices() > 0);
        let mesh;
        if (!kids.length) {
            mesh = BABYLON.MeshBuilder.CreateBox(name, { size: size * 0.8 }, scene);
            mesh.position.y = size * 0.4;
            mesh.material = Gfx.mat('#ff00ff');
            mesh.bakeCurrentTransformIntoVertices();
        } else {
            for (const k of kids) { k.computeWorldMatrix(true); k.bakeCurrentTransformIntoVertices(); k.parent = null; }
            const mats = new Set(kids.map(k => k.material));
            mesh = kids.length === 1 ? kids[0] : BABYLON.Mesh.MergeMeshes(kids, true, true, undefined, false, mats.size > 1);
        }
        root.dispose(false, false);
        mesh.name = name;
        if (yawDeg) mesh.bakeTransformIntoVertices(BABYLON.Matrix.RotationY(-yawDeg * Math.PI / 180));
        mesh.refreshBoundingInfo();
        const bb = mesh.getBoundingInfo().boundingBox;
        const h = Math.max(1, bb.maximum.y - bb.minimum.y);
        const k = size / h;
        const cx = (bb.maximum.x + bb.minimum.x) / 2, cz = (bb.maximum.z + bb.minimum.z) / 2;
        mesh.bakeTransformIntoVertices(BABYLON.Matrix.Translation(-cx, -bb.minimum.y, -cz).multiply(BABYLON.Matrix.Scaling(k, k, k)));
        mesh.refreshBoundingInfo();
        mesh.isPickable = false;
        mesh.alwaysSelectAsActiveMesh = false;
        const bb2 = mesh.getBoundingInfo().boundingBox;
        return { mesh, height: size, width: bb2.maximum.x - bb2.minimum.x, depth: bb2.maximum.z - bb2.minimum.z };
    },

    // Шаблон (скрытый меш-источник инстансов). key уникален на модель + вариант.
    template(key, url, size, yaw, mut) {
        let p = this._tpl.get(key);
        if (p) return p;
        p = (async () => {
            let model = null;
            try { model = await Model3D.load(url); } catch (e) { console.warn('Models: нет модели ' + url, e && e.message); }
            const scene = this.view.scene;
            const root = model ? Model3D.build(model, scene, { name: key }) : new BABYLON.Mesh(key, scene);
            const t = this._normalize(root, size, yaw, key);
            const mesh = t.mesh;
            if (mut && mut !== 'normal') this._tintMesh(mesh, mut);
            World3D.addObject(this.view, mesh, 'actor', { castShadow: false, ink: false, outline: false });
            mesh.setEnabled(true);
            mesh.isVisible = false;   // источник инстансов не рисуется сам
            return t;
        })();
        this._tpl.set(key, p);
        return p;
    },

    // Мутация: свой материал (клон) с оттенком; радуга — переливается в update().
    _tintMesh(mesh, mut) {
        const mu = GameData.mutation(mut);
        const list = mesh.material && mesh.material.subMaterials ? mesh.material.subMaterials : [mesh.material];
        const clones = list.map(m => {
            if (!m) return m;
            const c = /** @type {BABYLON.StandardMaterial} */ (m.clone(m.name + '-' + mut));
            c.metadata = Object.assign({}, m.metadata);
            if (Array.isArray(mu.tint)) {
                c.diffuseColor = new BABYLON.Color3(mu.tint[0], mu.tint[1], mu.tint[2]);
                c.emissiveColor = new BABYLON.Color3(mu.tint[0] * 0.18, mu.tint[1] * 0.18, mu.tint[2] * 0.18);
                c.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
                c.specularPower = 18;
            } else {
                this._rainbow.push(c);
            }
            return c;
        });
        if (mesh.material && mesh.material.subMaterials) {
            const mm = new BABYLON.MultiMaterial(mesh.name + '-mm', mesh.getScene());
            mm.subMaterials = clones; mesh.material = mm;
        } else mesh.material = clones[0];
    },

    update(dt) {
        this._t += dt;
        if (this._rainbow.length) {
            const c = BABYLON.Color3.FromHSV((this._t * 90) % 360, 0.75, 1);
            for (const m of this._rainbow) { m.diffuseColor = c; m.emissiveColor = c.scale(0.25); }
        }
    },

    // Инстанс шаблона в мир. Возвращает InstancedMesh (позицию и масштаб ставит игра).
    async instance(key, url, size, yaw, mut) {
        const t = await this.template(key, url, size, yaw, mut);
        const inst = t.mesh.createInstance(key + '-i');
        inst.isPickable = false;
        this.view.addShadowCaster(inst, false);
        return { mesh: inst, height: t.height, width: t.width, depth: t.depth };
    },

    // --- Питомцы ---
    PET_SIZE: 120,   // px: высота питомца при весе = средний вес вида
    petScale(pet) {
        const sp = GameData.PETS[pet.sp];
        const k = sp ? pet.kg / sp.kg : 1;
        const base = pet.r === 'secret' ? 1.7 : 1;
        return base * Math.max(0.7, Math.min(1.9, 0.6 + 0.45 * k));
    },
    async pet(pet) {
        const sp = GameData.PETS[pet.sp] || GameData.PETS.cat;
        const r = await this.instance('pet-' + sp.id + '-' + (pet.mut || 'normal'), sp.model, this.PET_SIZE, sp.yaw || 0, pet.mut);
        const s = this.petScale(pet);
        r.mesh.scaling.set(s, s, s);
        r.height *= s;
        return r;
    },

    // --- Яйца и гнёзда ---
    EGG_SIZE: 112,
    async egg(eggType, scale) {
        const r = await this.instance('egg-' + eggType.id, eggType.model, this.EGG_SIZE, 0, 'normal');
        const s = scale || 1;
        r.mesh.scaling.set(s, s, s);
        r.height *= s;
        return r;
    },
    async nest(scale) {
        const r = await this.instance('nest', 'assets/models/eggs/nest.glb', 36, 0, 'normal');
        const s = scale || 1;
        r.mesh.scaling.set(s, s, s);
        return r;
    },

    // --- Стражи (Rig) ---
    async guardian(g) {
        let rig = null;
        try {
            rig = await Rig.spawn(g.model, this.view, { name: 'guard-' + g.id, kind: 'actor', clips: [g.clips] });
        } catch (e) {
            console.warn('Models: нет стража ' + g.model, e && e.message);
        }
        if (!rig) return null;
        // Масштаб по высоте модели.
        const bb = rig.root.getHierarchyBoundingVectors(true);
        const h = Math.max(1, bb.max.y - bb.min.y);
        const k = Math.max(0.2, Math.min(5, g.size / h));
        rig.root.scaling.set(k, k, k);
        return rig;
    },
};

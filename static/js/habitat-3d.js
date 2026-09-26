import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ZONES = [
    {
        id: 'zone-1',
        number: 1,
        title: 'Crew Quarters',
        module: 'Module B',
        position: [-2.2, 1.35, 0.9],
        summary: 'Four private sleeping bunks with personal storage for the 4-person crew.',
        systems: 'Life support feed · Thermal comfort · Privacy partitions'
    },
    {
        id: 'zone-2',
        number: 2,
        title: 'Kitchen / Dining',
        module: 'Module A',
        position: [1.6, 1.2, 0.4],
        summary: 'Communal galley and dining table — primary social hub of Hab-Module-Alpha.',
        systems: 'Water · Power · Waste · Galley thermal load'
    },
    {
        id: 'zone-3',
        number: 3,
        title: 'Laboratory',
        module: 'Module A',
        position: [2.4, 1.25, -0.8],
        summary: 'Science workstations, sample handling, and experiment monitoring consoles.',
        systems: 'Power · Data · Clean airflow (ECLSS)'
    },
    {
        id: 'zone-4',
        number: 4,
        title: 'Hygiene',
        module: 'Module A',
        position: [0.9, 1.15, 1.5],
        summary: 'Compact hygiene wet-area: shower, waste, and water recovery interface.',
        systems: 'Water recycle · Waste · Humidity control'
    },
    {
        id: 'zone-5',
        number: 5,
        title: 'Exercise',
        module: 'Module A',
        position: [2.8, 1.2, 1.1],
        summary: 'Fitness zone with treadmill / cycle facing the habitat viewport.',
        systems: 'Power · Thermal · Crew countermeasure protocols'
    },
    {
        id: 'zone-6',
        number: 6,
        title: 'Medical',
        module: 'Module B',
        position: [-3.0, 1.2, -0.5],
        summary: 'Clinical bay with diagnostic bed and emergency medical kit storage.',
        systems: 'Power · ECLSS isolation mode · Medical inventory'
    },
    {
        id: 'zone-7',
        number: 7,
        title: 'Airlock',
        module: 'Corridor',
        position: [-0.1, 0.95, 2.35],
        summary: 'Primary pressurized transition between habitat interior and lunar surface.',
        systems: 'Pressure cycle · Fire & safety · Communications'
    },
    {
        id: 'zone-8',
        number: 8,
        title: 'Storage',
        module: 'Module B',
        position: [-2.6, 1.15, 0.1],
        summary: 'Logistics racks for consumables, spare parts, and mission cargo.',
        systems: 'Inventory tracking · Mass / center-of-gravity awareness'
    },
    {
        id: 'zone-9',
        number: 9,
        title: 'Equipment Room',
        module: 'Module A',
        position: [1.2, 1.1, -1.5],
        summary: 'Core technical bay for ECLSS pumps, power distribution, and thermal loops.',
        systems: 'SYS-ECLSS · SYS-POWER · SYS-THERMAL'
    },
    {
        id: 'zone-10',
        number: 10,
        title: 'EVA Preparation',
        module: 'Near Airlock',
        position: [0.85, 1.05, 2.1],
        summary: 'Suit-up and checkout area before extravehicular activity.',
        systems: 'Suit power · Comms · Airlock interlock'
    }
];

const container = document.getElementById('habitat-3d');
if (!container) {
    console.warn('habitat-3d container missing');
} else {
    initHabitat3D(container);
}

function initHabitat3D(container) {
    const width = () => container.clientWidth || 640;
    const height = () => container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.Fog(0x050508, 18, 42);

    const camera = new THREE.PerspectiveCamera(42, width() / height(), 0.1, 200);
    camera.position.set(9.5, 6.2, 10.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 1.2, 0);

    scene.add(new THREE.AmbientLight(0xb8c4d8, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.35);
    sun.position.set(12, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
    fill.position.set(-10, 6, -8);
    scene.add(fill);

    const habitat = buildHabitat();
    scene.add(habitat);

    const hotspotGroup = new THREE.Group();
    const hotspotMeshes = [];
    ZONES.forEach((zone) => {
        const marker = buildHotspot(zone);
        hotspotGroup.add(marker);
        hotspotMeshes.push(marker);
    });
    scene.add(hotspotGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let selectedId = null;

    function selectZone(zone, mesh) {
        selectedId = zone.id;
        hotspotMeshes.forEach((m) => {
            const core = m.userData.core;
            if (!core) return;
            const active = m.userData.zoneId === zone.id;
            core.material.color.set(active ? 0x3b82f6 : 0xf0c674);
            core.material.emissive.set(active ? 0x1d4ed8 : 0x8a6a20);
            m.scale.setScalar(active ? 1.25 : 1);
        });
        window.dispatchEvent(new CustomEvent('luna-zone-select', { detail: zone }));
    }

    function onPointer(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(hotspotMeshes, true);
        if (!hits.length) return;
        let obj = hits[0].object;
        while (obj && !obj.userData.zoneId) obj = obj.parent;
        if (!obj) return;
        const zone = ZONES.find((z) => z.id === obj.userData.zoneId);
        if (zone) selectZone(zone, obj);
    }

    renderer.domElement.addEventListener('pointerdown', onPointer);

    const hint = document.getElementById('habitat-3d-hint');
    if (hint) {
        hint.textContent = 'Drag to rotate · Scroll to zoom · Click gold markers for zone info';
    }

    // default selection
    selectZone(ZONES[6]);

    function onResize() {
        const w = width();
        const h = height();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        hotspotMeshes.forEach((m, i) => {
            m.position.y = m.userData.baseY + Math.sin(t * 2 + i) * 0.05;
            m.lookAt(camera.position);
        });
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function buildHabitat() {
    const root = new THREE.Group();

    // Lunar ground
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x6b6b6b,
        roughness: 0.95,
        metalness: 0.05
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(22, 64), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    root.add(ground);

    // subtle craters
    for (let i = 0; i < 8; i++) {
        const r = 0.4 + Math.random() * 1.2;
        const crater = new THREE.Mesh(
            new THREE.RingGeometry(r * 0.55, r, 24),
            new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, transparent: true })
        );
        crater.rotation.x = -Math.PI / 2;
        crater.position.set((Math.random() - 0.5) * 16, 0.02, (Math.random() - 0.5) * 16);
        root.add(crater);
    }

    const hull = new THREE.MeshStandardMaterial({
        color: 0xe8e6e1,
        roughness: 0.45,
        metalness: 0.35
    });
    const dark = new THREE.MeshStandardMaterial({
        color: 0x2a2a2e,
        roughness: 0.6,
        metalness: 0.4
    });
    const accent = new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        roughness: 0.35,
        metalness: 0.5,
        emissive: 0x0a1a33,
        emissiveIntensity: 0.4
    });

    // Module A (larger living / working) — right-ish center
    const modA = buildModule(2.6, 1.7, hull, dark, accent);
    modA.position.set(2.1, 0, 0);
    root.add(modA);

    // Module B (sleeping / medical) — left
    const modB = buildModule(2.0, 1.45, hull, dark, accent);
    modB.position.set(-2.5, 0, 0);
    root.add(modB);

    // Corridor / airlock bridge
    const corridor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 2.4, 16),
        hull
    );
    corridor.rotation.z = Math.PI / 2;
    corridor.position.set(-0.2, 0.85, 0);
    corridor.castShadow = true;
    root.add(corridor);

    // Airlock porch facing camera-ish
    const airlock = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.9, 16), dark);
    airlock.position.set(-0.1, 0.55, 1.85);
    airlock.castShadow = true;
    root.add(airlock);

    const stairs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.6), dark);
    stairs.position.set(-0.1, 0.12, 2.7);
    root.add(stairs);

    // Solar arrays
    root.add(buildSolarArray(2.1, 3.05, 0));
    root.add(buildSolarArray(-2.5, 2.75, 0));

    // Comms dish
    const dishArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), dark);
    dishArm.position.set(0.3, 2.5, -0.2);
    root.add(dishArm);
    const dish = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })
    );
    dish.rotation.x = Math.PI / 2.5;
    dish.position.set(0.3, 3.1, -0.55);
    root.add(dish);

    // Rover hint
    const rover = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.7), dark);
    body.position.y = 0.35;
    rover.add(body);
    [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.07, 8, 12), dark);
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(x, 0.18, z);
        rover.add(wheel);
    });
    rover.position.set(5.2, 0, 2.8);
    root.add(rover);

    return root;
}

function buildModule(radius, height, hull, dark, accent) {
    const g = new THREE.Group();

    const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 32),
        hull
    );
    drum.position.y = height / 2;
    drum.castShadow = true;
    drum.receiveShadow = true;
    g.add(drum);

    // ring bands
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius + 0.02, 0.04, 8, 48),
            dark
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.35 + i * (height / 3);
        g.add(ring);
    }

    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 0.98, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        hull
    );
    dome.position.y = height;
    dome.castShadow = true;
    g.add(dome);

    // viewport band
    const windowMat = accent;
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.08), windowMat);
        win.position.set(Math.cos(a) * (radius + 0.02), height * 0.55, Math.sin(a) * (radius + 0.02));
        win.lookAt(0, height * 0.55, 0);
        g.add(win);
    }

    return g;
}

function buildSolarArray(x, y, z) {
    const g = new THREE.Group();
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 })
    );
    mast.position.set(x, y - 0.4, z);
    g.add(mast);

    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x123a7a,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x061530,
        emissiveIntensity: 0.35
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 1.4), panelMat);
    panel.position.set(x, y + 0.35, z);
    panel.rotation.z = 0.18;
    g.add(panel);

    return g;
}

function buildHotspot(zone) {
    const group = new THREE.Group();
    group.position.set(zone.position[0], zone.position[1], zone.position[2]);
    group.userData.zoneId = zone.id;
    group.userData.baseY = zone.position[1];

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xf0c674,
            emissive: 0x8a6a20,
            emissiveIntensity: 0.7,
            metalness: 0.2,
            roughness: 0.35
        })
    );
    core.userData.zoneId = zone.id;
    group.userData.core = core;
    group.add(core);

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.3, 24),
        new THREE.MeshBasicMaterial({ color: 0xf0c674, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.userData.zoneId = zone.id;
    group.add(ring);

    // number badge (canvas sprite)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0c674';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(zone.number), 64, 68);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.scale.set(0.55, 0.55, 0.55);
    sprite.position.y = 0.42;
    sprite.userData.zoneId = zone.id;
    group.add(sprite);

    return group;
}

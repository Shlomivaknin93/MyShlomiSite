(function () {
    const assets = [
        {
            id: 'ECLSS-PMP-001',
            name: 'Primary O2 Circulation Pump',
            system: 'SYS-ECLSS',
            space: 'SPC-MOD-A',
            mass_kg: 48.2,
            power_draw_w: 620,
            status: 'Operational',
            failure_mode: 'Bearing seize / flow cutoff',
            req: 'REQ-ECLSS-014 · Maintain O2 circulation ≥ 95%'
        },
        {
            id: 'ECLSS-SCR-002',
            name: 'CO2 Scrubber Module A',
            system: 'SYS-ECLSS',
            space: 'SPC-MOD-A',
            mass_kg: 36.5,
            power_draw_w: 410,
            status: 'Operational',
            failure_mode: 'Filter saturation',
            req: 'REQ-ECLSS-022 · CO2 ≤ 0.5% within 4 min of primary loss'
        },
        {
            id: 'PWR-BAT-001',
            name: 'Main Power Distribution Unit',
            system: 'SYS-POWER',
            space: 'SPC-MOD-B',
            mass_kg: 112.0,
            power_draw_w: 0,
            status: 'Operational',
            failure_mode: 'Bus overload',
            req: 'REQ-PWR-003 · Maintain distribution redundancy'
        },
        {
            id: 'WTR-RCL-001',
            name: 'Water Recovery System',
            system: 'SYS-WATER',
            space: 'SPC-MOD-C',
            mass_kg: 89.4,
            power_draw_w: 540,
            status: 'Warning',
            failure_mode: 'Membrane clog',
            req: 'REQ-WTR-009 · Recovery rate ≥ 90%'
        }
    ];

    let selectedId = 'ECLSS-PMP-001';

    const detailEl = document.getElementById('asset-detail');
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const failBtn = document.getElementById('simulate-fail-btn');
    const healthEl = document.getElementById('stat-health');
    const o2El = document.getElementById('stat-o2');
    const powerEl = document.getElementById('stat-power');
    const waterEl = document.getElementById('stat-water');
    const habStatus = document.getElementById('hab-status-label');
    const nodes = Array.prototype.slice.call(document.querySelectorAll('.spatial-node'));

    function getAsset(id) {
        return assets.find(function (a) { return a.id === id; });
    }

    function appendChat(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble chat-' + sender;
        bubble.innerHTML =
            '<span class="chat-role">' + (sender === 'user' ? 'OPERATOR' : 'LUNA-AI') + '</span>' +
            '<p></p>';
        bubble.querySelector('p').textContent = text;
        chatLog.appendChild(bubble);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function renderDetail() {
        const asset = getAsset(selectedId);
        if (!asset || !detailEl) return;

        detailEl.innerHTML =
            '<div class="detail-id">' + asset.id + '</div>' +
            '<h2 class="detail-name">' + asset.name + '</h2>' +
            '<dl class="detail-grid">' +
            '<div><dt>System</dt><dd>' + asset.system + '</dd></div>' +
            '<div><dt>Space</dt><dd>' + asset.space + '</dd></div>' +
            '<div><dt>Status</dt><dd class="st-' + asset.status.toLowerCase() + '">' + asset.status + '</dd></div>' +
            '<div><dt>Power</dt><dd>' + asset.power_draw_w + ' W</dd></div>' +
            '<div><dt>Mass</dt><dd>' + asset.mass_kg + ' kg</dd></div>' +
            '<div><dt>Failure Mode</dt><dd>' + asset.failure_mode + '</dd></div>' +
            '</dl>' +
            '<p class="detail-req">' + asset.req + '</p>';
    }

    function renderNodes() {
        nodes.forEach(function (node) {
            const asset = getAsset(node.dataset.id);
            if (!asset) return;
            node.className = 'spatial-node';
            if (asset.status === 'Failed') node.classList.add('is-failed');
            else if (asset.status === 'Warning') node.classList.add('is-warning');
            else node.classList.add('is-ok');
            if (asset.id === selectedId) node.classList.add('is-selected');
        });
    }

    function refresh() {
        renderDetail();
        renderNodes();
    }

    function answerQuery(query) {
        const q = query.toLowerCase();
        const failed = assets.filter(function (a) { return a.status === 'Failed'; });

        if (q.indexOf('eclss') !== -1 || q.indexOf('pump') !== -1 || q.indexOf('fail') !== -1 || q.indexOf('oxygen') !== -1 || q.indexOf('o2') !== -1) {
            return 'ECLSS-PMP-001 failure drops Module A O2 circulation to 0%. ECLSS-SCR-002 enter fail-safe within 4 minutes per REQ-ECLSS-022. Dependent loop assets remain degraded until primary restored.';
        }
        if (q.indexOf('water') !== -1 || q.indexOf('maintenance') !== -1 || q.indexOf('warning') !== -1) {
            return 'WTR-RCL-001 is Warning (membrane clog risk). Recovery currently ' + waterEl.textContent + '. Tracked under REQ-WTR-009.';
        }
        if (q.indexOf('power') !== -1 || q.indexOf('battery') !== -1) {
            return 'PWR-BAT-001 status: ' + getAsset('PWR-BAT-001').status + '. Reserve ' + powerEl.textContent + '. Requirement: REQ-PWR-003.';
        }
        if (q.indexOf('crew') !== -1 || q.indexOf('status') !== -1 || q.indexOf('health') !== -1) {
            return 'Crew 4/4. System health ' + healthEl.textContent + '/100. Failed assets: ' +
                (failed.length ? failed.map(function (a) { return a.id; }).join(', ') : 'none') + '.';
        }
        return 'No matching telemetry or requirement found for that query. LUNA-AI will not invent values outside the habitat database.';
    }

    nodes.forEach(function (node) {
        node.addEventListener('click', function () {
            selectedId = node.dataset.id;
            refresh();
        });
    });

    failBtn.addEventListener('click', function () {
        const asset = getAsset(selectedId);
        if (!asset || asset.status === 'Failed') return;

        asset.status = 'Failed';

        const dependents = assets.filter(function (a) {
            return a.system === asset.system && a.id !== asset.id;
        });

        const health = Math.max(38, parseInt(healthEl.textContent, 10) - 14);
        healthEl.textContent = String(health);
        healthEl.classList.add('stat-danger');
        habStatus.textContent = 'Hab Status: DEGRADED';
        habStatus.classList.add('is-degraded');

        if (asset.system === 'SYS-ECLSS') {
            o2El.textContent = '41.0%';
            o2El.classList.add('stat-danger');
        }
        if (asset.system === 'SYS-POWER') {
            powerEl.textContent = '61.2%';
            powerEl.classList.add('stat-danger');
        }
        if (asset.system === 'SYS-WATER') {
            waterEl.textContent = '54.0%';
            waterEl.classList.add('stat-danger');
        }

        refresh();

        appendChat(
            'ai',
            'CRITICAL_FAILURE on ' + asset.id + '. System ' + asset.system +
            ' health degradation engaged. Impacted components: ' +
            (dependents.length ? dependents.map(function (d) { return d.id; }).join(', ') : 'none') +
            '. Linked requirement: ' + asset.req + '.'
        );
    });

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        appendChat('user', text);
        chatInput.value = '';
        setTimeout(function () {
            appendChat('ai', answerQuery(text));
        }, 400);
    });

    appendChat('ai', 'LUNA-AI connected to asset DB and MBSE requirements matrix. Hab-Module-Alpha telemetry streaming.');
    refresh();
})();

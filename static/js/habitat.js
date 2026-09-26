(function () {
    let selectedZone = null;

    const detailEl = document.getElementById('zone-detail');
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const failBtn = document.getElementById('simulate-fail-btn');
    const healthEl = document.getElementById('stat-health');
    const o2El = document.getElementById('stat-o2');
    const powerEl = document.getElementById('stat-power');
    const waterEl = document.getElementById('stat-water');
    const habStatus = document.getElementById('hab-status-label');

    function appendChat(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble chat-' + sender;
        const role = document.createElement('span');
        role.className = 'chat-role';
        role.textContent = sender === 'user' ? 'OPERATOR' : 'LUNA-AI';
        const p = document.createElement('p');
        p.textContent = text;
        bubble.appendChild(role);
        bubble.appendChild(p);
        chatLog.appendChild(bubble);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function renderZone(zone) {
        selectedZone = zone;
        if (!detailEl || !zone) return;

        detailEl.innerHTML =
            '<div class="detail-id">ZONE ' + zone.number + ' · ' + zone.module + '</div>' +
            '<h2 class="detail-name">' + zone.title + '</h2>' +
            '<p class="detail-summary">' + zone.summary + '</p>' +
            '<p class="detail-req">' + zone.systems + '</p>';
    }

    function answerQuery(query) {
        const q = query.toLowerCase();

        if (q.indexOf('crew') !== -1 || q.indexOf('quarter') !== -1 || q.indexOf('sleep') !== -1) {
            return 'Zone 1 · Crew Quarters in Module B: four private bunks for the 4-person crew with personal storage.';
        }
        if (q.indexOf('kitchen') !== -1 || q.indexOf('dining') !== -1 || q.indexOf('galley') !== -1) {
            return 'Zone 2 · Kitchen / Dining in Module A is the communal hub for meals and crew briefings.';
        }
        if (q.indexOf('lab') !== -1 || q.indexOf('science') !== -1) {
            return 'Zone 3 · Laboratory provides science workstations and sample handling under clean ECLSS airflow.';
        }
        if (q.indexOf('eclss') !== -1 || q.indexOf('pump') !== -1 || q.indexOf('fail') !== -1 || q.indexOf('oxygen') !== -1 || q.indexOf('o2') !== -1) {
            return 'Critical ECLSS hardware sits in Zone 9 (Equipment Room). Failure of primary O2 circulation drops Module A oxygen loop; scrubber fail-safe engages under linked requirements.';
        }
        if (q.indexOf('airlock') !== -1 || q.indexOf('eva') !== -1) {
            return 'Zone 7 Airlock + Zone 10 EVA Preparation handle pressure transition and suit checkout before surface ops.';
        }
        if (q.indexOf('water') !== -1 || q.indexOf('hygiene') !== -1) {
            return 'Zone 4 Hygiene interfaces with water recovery. Current recycle telemetry: ' + waterEl.textContent + '.';
        }
        if (q.indexOf('medical') !== -1) {
            return 'Zone 6 Medical bay in Module B includes diagnostic bed and emergency kit storage.';
        }
        if (q.indexOf('volume') !== -1 || q.indexOf('size') !== -1 || q.indexOf('diameter') !== -1) {
            return 'Habitable volume ~180 m³. Main module diameter 12 m, height 6 m, crew capacity 4.';
        }
        if (selectedZone) {
            return 'Focused zone: ' + selectedZone.title + ' (' + selectedZone.module + '). ' + selectedZone.summary;
        }
        return 'No matching habitat zone or telemetry found. Ask about a zone name, ECLSS, airlock, or crew systems.';
    }

    window.addEventListener('luna-zone-select', function (e) {
        renderZone(e.detail);
    });

    failBtn.addEventListener('click', function () {
        if (!selectedZone) {
            appendChat('ai', 'Select a habitat zone marker before running a failure simulation.');
            return;
        }

        const health = Math.max(38, parseInt(healthEl.textContent, 10) - 10);
        healthEl.textContent = String(health);
        healthEl.classList.add('stat-danger');
        habStatus.textContent = 'Hab Status: DEGRADED';
        habStatus.classList.add('is-degraded');

        const title = selectedZone.title.toLowerCase();
        if (title.indexOf('equipment') !== -1 || title.indexOf('lab') !== -1 || title.indexOf('kitchen') !== -1) {
            o2El.textContent = '61.0%';
            o2El.classList.add('stat-danger');
        }
        if (title.indexOf('hygiene') !== -1 || title.indexOf('storage') !== -1) {
            waterEl.textContent = '58.0%';
            waterEl.classList.add('stat-danger');
        }
        if (title.indexOf('exercise') !== -1 || title.indexOf('medical') !== -1) {
            powerEl.textContent = '72.0%';
            powerEl.classList.add('stat-danger');
        }

        appendChat(
            'ai',
            'FAILURE CASCADE from Zone ' + selectedZone.number + ' (' + selectedZone.title + '). ' +
            'Affected loops: ' + selectedZone.systems + '. Hab health now ' + health + '/100.'
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
        }, 350);
    });

    appendChat('ai', 'LUNA-AI online. 3D twin linked to Hab-Module-Alpha zones. Click a marker or ask about a zone.');
})();

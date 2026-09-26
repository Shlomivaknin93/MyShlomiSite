(function () {
    const assets = [
        {
            id: 'ECLSS-PMP-001',
            name: 'Primary O2 Circulation Pump',
            system: 'ECLSS',
            status: 'Operational'
        },
        {
            id: 'ECLSS-SCR-002',
            name: 'CO2 Scrubber Module A',
            system: 'ECLSS',
            status: 'Operational'
        },
        {
            id: 'PWR-BAT-001',
            name: 'Main Power Distribution Unit',
            system: 'Power',
            status: 'Operational'
        },
        {
            id: 'WTR-RCL-001',
            name: 'Water Recovery System',
            system: 'Water',
            status: 'Warning'
        }
    ];

    let selectedId = assets[0].id;

    const listEl = document.getElementById('asset-list');
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const failBtn = document.getElementById('simulate-fail-btn');
    const healthEl = document.getElementById('stat-health');
    const o2El = document.getElementById('stat-o2');

    function appendChat(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble chat-' + sender;
        bubble.innerHTML =
            '<span class="chat-role">' + (sender === 'user' ? 'OPERATOR' : 'LUNA-AI') + '</span>' +
            '<p>' + text + '</p>';
        chatLog.appendChild(bubble);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function renderAssets() {
        listEl.innerHTML = '';
        assets.forEach(function (asset) {
            const li = document.createElement('li');
            li.className = 'asset-item' +
                (asset.id === selectedId ? ' selected' : '') +
                (asset.status === 'Failed' ? ' failed' : '') +
                (asset.status === 'Warning' ? ' warning' : '');
            li.dataset.id = asset.id;
            li.innerHTML =
                '<div class="asset-id">' + asset.id + '</div>' +
                '<div class="asset-name">' + asset.name + '</div>' +
                '<div class="asset-meta">' + asset.system + ' · ' + asset.status + '</div>';
            li.addEventListener('click', function () {
                selectedId = asset.id;
                renderAssets();
            });
            listEl.appendChild(li);
        });
    }

    function answerQuery(query) {
        const q = query.toLowerCase();
        if (q.indexOf('eclss') !== -1 || q.indexOf('משאב') !== -1 || q.indexOf('כשל') !== -1 || q.indexOf('fail') !== -1) {
            return 'אם ECLSS-PMP-001 נכשל, זרימת החמצן במודול A יורדת ב־100%. scrubber ה־CO2 (ECLSS-SCR-002) נכנס לגיבוי תוך כ־4 דקות. מקור: מטריצת דרישות + מלאי נכסים.';
        }
        if (q.indexOf('תחזוק') !== -1 || q.indexOf('critical') !== -1 || q.indexOf('maintenance') !== -1) {
            return 'כרגע מסומנים לתחזוקה קרובה: WTR-RCL-001 (Water Recovery) ו־PWR-BAT-001. אין המצאת נתונים — לפי סטטוס הנכסים בדמו.';
        }
        if (q.indexOf('crew') !== -1 || q.indexOf('צוות') !== -1) {
            return 'יעד התכנון: צוות של 4 אנשים. סטטוס צוות בדמו: 4 / 4 Nominal.';
        }
        return 'שאילתה נותחה מול מלאי המערכות והדרישות שבדמו. לא נמצא מידע מספיק — LUNA-AI לא ממציא עובדות מחוץ להקשר.';
    }

    failBtn.addEventListener('click', function () {
        const asset = assets.find(function (a) { return a.id === selectedId; });
        if (!asset) return;

        asset.status = 'Failed';
        renderAssets();

        const health = Math.max(40, parseInt(healthEl.textContent, 10) - 12);
        healthEl.textContent = String(health);
        if (asset.system === 'ECLSS') {
            o2El.textContent = '41.0%';
            o2El.classList.add('stat-danger');
        }
        healthEl.classList.add('stat-danger');

        appendChat(
            'ai',
            'CRITICAL ALERT: ' + asset.id + ' → FAILED. מערכת ' + asset.system +
            ' במצב מדרדר. רכיבים תלויים באותה לולאה מסומנים לבדיקה.'
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
        }, 450);
    });

    appendChat('ai', 'LUNA-AI online. מחובר למלאי נכסים ולמטריצת דרישות (דמו מקומי). איך אפשר לעזור?');
    renderAssets();
})();

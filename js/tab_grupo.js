// ----------------------------------------------------
// Player Features: Party & Initiative Tracker (Extracted)
// ----------------------------------------------------

function renderPartyInfo(players, isDM) {
    const container = document.getElementById('tab-party');

    if (players.length === 0) {
        container.innerHTML = '<p>El grupo aún no se ha formado.</p>';
        return;
    }

    let html = '<div class="grid-2">';

    players.forEach(p => {
        let hpPercent = Math.max(0, Math.min(100, (p.hpCurrent / p.hpMax) * 100));
        let hpColor = hpPercent > 50 ? 'darkolivegreen' : (hpPercent > 20 ? 'darkgoldenrod' : 'darkred');

        const getSaveBonus = (stat) => {
            let s = p.saves && p.saves[stat];
            if (typeof s === 'boolean') return s ? '+2' : '0';
            if (s && s.bonus) return (s.bonus > 0 ? '+' : '') + s.bonus;
            return '0';
        };

        html += `
            <div class="card" ondblclick="window.openQuickLook('${p.id}', 'player')" style="cursor: pointer;" title="Doble toque para Visión Rápida">
                <div class="flex-between" style="border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                    <h3 style="margin:0;">${p.name || 'Desconocido'} <span style="font-size:0.9rem; color:var(--text-muted)">Lvl ${p.level} ${p.class}</span></h3>
                    ${isDM ? `
                        <div style="display:flex; gap:0.3rem;" ondblclick="event.stopPropagation()">
                            <button class="btn" style="padding: 0.3rem 0.7rem; font-size: 1rem; font-weight:bold;" onclick="event.stopPropagation(); window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent - 1})">−</button>
                            <button class="btn" style="padding: 0.3rem 0.7rem; font-size: 1rem; font-weight:bold;" onclick="event.stopPropagation(); window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent + 1})">+</button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="party-hp-bar-container">
                    <div class="party-hp-bar-fill" style="width: ${hpPercent}%; background-color: ${hpColor};"></div>
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1rem; font-weight: 900; text-shadow: 1px 1px 3px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5); letter-spacing: 1px;">
                        ${p.hpCurrent} / ${p.hpMax} HP
                    </div>
                </div>

                <div class="flex-between mb-1" style="font-size: 0.95rem; border-bottom: 1px dashed var(--parchment-dark); padding-bottom: 0.5rem;">
                    <span><i class="fa-solid fa-shield" style="color:var(--leather-light)"></i> CA: <strong style="font-size:1.1em; color:var(--leather-dark);">${p.ac || 10}</strong></span>
                    <span><i class="fa-solid fa-bolt" style="color:var(--gold-dim)"></i> Inic: <strong style="font-size:1.1em; color:var(--leather-dark);">${p.initiative || 0}</strong></span>
                    <span><i class="fa-solid fa-eye" style="color:var(--leather-light)"></i> Pasiva: <strong style="font-size:1.1em; color:var(--leather-dark);">${p.passivePerception || 10}</strong></span>
                </div>

                <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; margin-bottom: 0.2rem;">Tiradas de Salvación:</div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; text-align: center; background: rgba(255,255,255,0.4); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; padding: 0.2rem 0.4rem;">
                    <div title="Fuerza"><strong style="font-size:0.6rem; color:var(--leather-light);">FUE</strong><br><span style="font-weight:bold">${getSaveBonus('str')}</span></div>
                    <div title="Destreza"><strong style="font-size:0.6rem; color:var(--leather-light);">DES</strong><br><span style="font-weight:bold">${getSaveBonus('dex')}</span></div>
                    <div title="Constitución"><strong style="font-size:0.6rem; color:var(--leather-light);">CON</strong><br><span style="font-weight:bold">${getSaveBonus('con')}</span></div>
                    <div title="Inteligencia"><strong style="font-size:0.6rem; color:var(--leather-light);">INT</strong><br><span style="font-weight:bold">${getSaveBonus('int')}</span></div>
                    <div title="Sabiduría"><strong style="font-size:0.6rem; color:var(--leather-light);">SAB</strong><br><span style="font-weight:bold">${getSaveBonus('wis')}</span></div>
                    <div title="Carisma"><strong style="font-size:0.6rem; color:var(--leather-light);">CAR</strong><br><span style="font-weight:bold">${getSaveBonus('cha')}</span></div>
                </div>
            </div>
            `;
    });

    html += '</div>';

    // Inject Initiative Tracker if combat is active
    const combatTracker = window.state.get().combatTracker;
    if (combatTracker && combatTracker.active) {
        html += renderInitiativeTracker(combatTracker, isDM, players);
    }

    container.innerHTML = html;
}

window.startCombatFromEncounter = function (encounterId) {
    const currentState = window.state.get();
    if (currentState.combatTracker && currentState.combatTracker.active) {
        if (!confirm('Ya hay un combate activo. ¿Deseas reemplazarlo con un nuevo encuentro?')) return;
    }

    const encounter = (currentState.encuentros || []).find(e => e.id === encounterId);
    if (!encounter) { alert('Encuentro no encontrado.'); return; }

    // Create entries for PJs only (preparation phase)
    const playerEntries = currentState.players.map(p => ({
        type: 'player',
        id: p.id,
        initiative: null,
        revealed: true
    }));

    const tracker = {
        active: true,
        phase: 'preparation',
        encounterName: encounter.name,
        encounterId: encounterId,
        turnIndex: 0,
        entries: playerEntries,
        // Store monster templates for later injection
        _monsterTemplates: JSON.parse(JSON.stringify(encounter.monsters || []))
    };

    window.state.update({ combatTracker: tracker });
    // Switch to party tab to see the tracker
    if (window.switchTab) window.switchTab('tab-party');
};

window.setPlayerInitiative = function (playerId) {
    const val = prompt('Introduce la Iniciativa de este personaje:');
    if (val === null) return;
    const initiative = parseInt(val, 10);
    if (isNaN(initiative)) { alert('Valor inválido.'); return; }

    const tracker = JSON.parse(JSON.stringify(window.state.get().combatTracker));
    if (!tracker) return;

    const entry = tracker.entries.find(e => e.type === 'player' && e.id === playerId);
    if (entry) entry.initiative = initiative;

    window.state.update({ combatTracker: tracker });
};

window.beginCombat = function () {
    const tracker = JSON.parse(JSON.stringify(window.state.get().combatTracker));
    if (!tracker) return;

    // Check all PJs have initiative
    const unset = tracker.entries.filter(e => e.type === 'player' && (e.initiative === null || e.initiative === undefined));
    if (unset.length > 0) {
        alert('Todos los Personajes Jugadores deben tener una iniciativa asignada antes de comenzar.');
        return;
    }

    // Expand monster templates into individual instances
    const bestiario = window.state.get().bestiario || [];
    const monsterEntries = [];
    (tracker._monsterTemplates || []).forEach(template => {
        const monsterData = bestiario.find(b => b.id === template.id);
        for (let i = 0; i < template.qty; i++) {
            const hpMax = parseInt(monsterData?.hp, 10) || 10;
            monsterEntries.push({
                type: 'monster',
                monsterId: template.id,
                instanceId: 'minst_' + Date.now() + '_' + Math.random().toString(36).substring(7),
                name: template.qty > 1 ? `${template.name} ${i + 1}` : template.name,
                url: monsterData?.url || '',
                hpCurrent: hpMax,
                hpMax: hpMax,
                ac: monsterData?.ac || '?',
                initiative: template.initiative,
                revealed: false
            });
        }
    });

    // Merge and sort by initiative desc
    tracker.entries = [...tracker.entries, ...monsterEntries];
    tracker.entries.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
    tracker.phase = 'combat';
    tracker.turnIndex = 0;

    // Reveal if first turn is a monster
    const first = tracker.entries[0];
    if (first && first.type === 'monster' && !first.revealed) {
        first.revealed = true;
    }

    delete tracker._monsterTemplates;

    window.state.update({ combatTracker: tracker });
};

window.nextTurn = function () {
    const tracker = JSON.parse(JSON.stringify(window.state.get().combatTracker));
    if (!tracker || tracker.phase !== 'combat') return;

    const alive = tracker.entries.filter(e => !(e.type === 'monster' && e.hpCurrent <= 0));
    if (alive.length === 0) { window.endCombat(); return; }

    let idx = tracker.turnIndex;
    let attempts = 0;
    do {
        idx = (idx + 1) % tracker.entries.length;
        attempts++;
    } while (tracker.entries[idx].type === 'monster' && tracker.entries[idx].hpCurrent <= 0 && attempts < tracker.entries.length);

    tracker.turnIndex = idx;

    // Auto-reveal monster on first turn
    const current = tracker.entries[idx];
    if (current.type === 'monster' && !current.revealed) {
        current.revealed = true;
    }

    window.state.update({ combatTracker: tracker });
};

window.prevTurn = function () {
    const tracker = JSON.parse(JSON.stringify(window.state.get().combatTracker));
    if (!tracker || tracker.phase !== 'combat') return;

    let idx = tracker.turnIndex;
    let attempts = 0;
    do {
        idx = (idx - 1 + tracker.entries.length) % tracker.entries.length;
        attempts++;
    } while (tracker.entries[idx].type === 'monster' && tracker.entries[idx].hpCurrent <= 0 && attempts < tracker.entries.length);

    tracker.turnIndex = idx;
    window.state.update({ combatTracker: tracker });
};

window.applyTrackerHP = function (instanceId, inputEl) {
    const expression = inputEl.value.trim();
    if (!expression) return;

    const tracker = JSON.parse(JSON.stringify(window.state.get().combatTracker));
    if (!tracker) return;

    const entry = tracker.entries.find(e =>
        (e.type === 'monster' && e.instanceId === instanceId) ||
        (e.type === 'player' && e.id === instanceId)
    );
    if (!entry) return;

    // Parse expression
    let newHP;
    if (expression.startsWith('+') || expression.startsWith('-')) {
        const delta = parseInt(expression, 10);
        if (isNaN(delta) || delta === 0) { inputEl.value = ''; return; }
        if (entry.type === 'monster') {
            newHP = Math.max(0, entry.hpCurrent + delta);
        } else {
            const player = window.state.get().players.find(p => p.id === entry.id);
            newHP = Math.max(0, ((player?.hpCurrent) || 0) + delta);
        }
    } else {
        const abs = parseInt(expression, 10);
        if (isNaN(abs)) { inputEl.value = ''; return; }
        newHP = Math.max(0, abs);
    }

    inputEl.value = '';

    // Build a SINGLE atomic update to prevent bounce-back
    const updatePayload = { combatTracker: tracker };

    if (entry.type === 'monster') {
        entry.hpCurrent = newHP;
        // Auto-reveal if dead
        if (newHP <= 0) entry.revealed = true;
    } else if (entry.type === 'player') {
        // Update player HP in both tracker and players array atomically
        updatePayload.players = window.state.get().players.map(p =>
            p.id === entry.id ? { ...p, hpCurrent: newHP } : p
        );
    }

    window.state.update(updatePayload);
};

window.endCombat = function () {
    if (confirm('¿Finalizar el combate? El tracker de iniciativa se eliminará.')) {
        window.state.update({ combatTracker: null });
    }
};

function renderInitiativeTracker(combatTracker, isDM, players) {
    if (!combatTracker || !combatTracker.active) return '';

    // Helper: HP percentage class
    const getHpHaloClass = (current, max) => {
        if (max <= 0) return '';
        const pct = (current / max) * 100;
        if (pct > 50) return 'init-token-hp-healthy';
        if (pct > 20) return 'init-token-hp-wounded';
        return 'init-token-hp-critical';
    };

    let html = `
        <div class="initiative-tracker-container">
            <div class="initiative-tracker-wrapper" style="border: 3px solid var(--red-ink); border-radius: var(--border-radius-md); padding: 1.5rem; background: rgba(139,0,0,0.05); box-shadow: 0 0 30px rgba(0,0,0,0.3);">
                <div class="flex-between mb-1" style="border-bottom: 3px solid var(--red-ink); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="margin:0; color: var(--red-ink); font-size: 2rem; font-family: 'Times New Roman', serif; text-transform: uppercase; letter-spacing: 2px;"><i class="fa-solid fa-swords"></i> Orden de Iniciativa</h3>
                <div style="display:flex; gap:0.5rem;">
    `;

    if (combatTracker.phase === 'combat' && isDM) {
        html += `
            <button class="btn" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.prevTurn()" title="Turno anterior"><i class="fa-solid fa-backward-step"></i></button>
            <button class="btn" style="padding:0.3rem 0.8rem; font-size:0.85rem; background:var(--red-ink); color:#fff; border-color:var(--red-ink);" onclick="window.nextTurn()"><i class="fa-solid fa-forward-step"></i> Siguiente</button>
        `;
    }
    if (isDM) {
        html += `<button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="window.endCombat()" title="Finalizar combate"><i class="fa-solid fa-flag-checkered"></i></button>`;
    }

    html += `</div></div>`;

    if (combatTracker.phase === 'preparation') {
        html += `<p style="font-size:0.85em; color:var(--text-muted); margin-bottom:0.8rem;"><i class="fa-solid fa-circle-info"></i> Haz clic en cada retrato para asignar su iniciativa. Después pulsa <strong>Comenzar Combate</strong>.</p>`;
        html += `<div class="initiative-track-row">`;

        combatTracker.entries.forEach(entry => {
            if (entry.type !== 'player') return;
            const player = players.find(p => p.id === entry.id);
            if (!player) return;

            const hasInit = entry.initiative !== null && entry.initiative !== undefined;
            const haloClass = hasInit ? 'init-token-ready' : 'init-token-preparation';

            html += `
                <div class="init-token ${haloClass}" onclick="${isDM ? `window.setPlayerInitiative('${entry.id}')` : ''}" style="${isDM ? 'cursor:pointer;' : ''}">
                    <div class="init-token-portrait">
                        ${player.avatarUrl
                    ? `<img src="${player.avatarUrl}" alt="${player.name}">`
                    : `<i class="fa-solid fa-user fa-2x"></i>`
                }
                    </div>
                    <div class="init-token-name">${player.name}</div>
                    ${hasInit ? `<div class="init-token-init" style="color:#1a73e8;">✓</div>` : ''}
                </div>
            `;
        });

        html += `</div>`;

        if (isDM) {
            const allSet = combatTracker.entries.every(e => e.type !== 'player' || (e.initiative !== null && e.initiative !== undefined));
            html += `
                <div style="text-align:center; margin-top:1rem;">
                    <button class="btn" style="padding:0.5rem 1.5rem; font-size:1rem; background:var(--red-ink); color:#fff; border-color:var(--red-ink); ${allSet ? '' : 'opacity:0.4; pointer-events:none;'}" onclick="window.beginCombat()">
                        <i class="fa-solid fa-swords"></i> Ordenar y Comenzar Combate
                    </button>
                </div>
            `;
        }
    } else if (combatTracker.phase === 'combat') {
        html += `<div class="initiative-track-row">`;

        combatTracker.entries.forEach((entry, idx) => {
            const isActive = idx === combatTracker.turnIndex;
            const isDead = entry.type === 'monster' && entry.hpCurrent <= 0;
            const isHidden = entry.type === 'monster' && !entry.revealed;

            // STRICT FOG OF WAR: unrevealed monsters are NOT rendered for players
            if (isHidden && !isDM) return;

            if (isDead && !isDM) {
                html += `
                    <div class="init-token init-token-dead">
                        <div class="init-token-portrait"><i class="fa-solid fa-skull fa-2x" style="color:#666;"></i></div>
                        <div class="init-token-name" style="text-decoration:line-through;">${entry.name}</div>
                    </div>
                `;
                return;
            }

            let portraitHtml = '';
            let nameHtml = '';
            let hpHaloClass = '';
            const entryId = entry.type === 'player' ? entry.id : entry.instanceId;

            if (entry.type === 'player') {
                const player = players.find(p => p.id === entry.id);
                portraitHtml = player?.avatarUrl
                    ? `<img src="${player.avatarUrl}" alt="${player?.name}">`
                    : `<i class="fa-solid fa-user fa-2x"></i>`;
                nameHtml = player?.name || 'PJ';
                hpHaloClass = getHpHaloClass(player?.hpCurrent ?? 0, player?.hpMax ?? 1);
            } else {
                portraitHtml = entry.url
                    ? `<img src="${entry.url}" alt="${entry.name}">`
                    : `<i class="fa-solid fa-dragon fa-2x" style="color:var(--red-ink);"></i>`;
                nameHtml = entry.name;
                hpHaloClass = getHpHaloClass(entry.hpCurrent, entry.hpMax);
            }

            const hiddenDmStyle = (isHidden && isDM) ? 'opacity:0.5;' : '';

            html += `
                <div class="init-token ${isActive ? 'init-token-active' : ''} ${isDead ? 'init-token-dead' : ''} ${hpHaloClass}" 
                     style="${hiddenDmStyle}" 
                     ondblclick="event.stopPropagation(); window.openQuickLook('${entry.type === 'player' ? entry.id : entry.monsterId}', '${entry.type}')">
                    <div class="init-token-portrait">${portraitHtml}</div>
                    <div class="init-token-name">${nameHtml}</div>
                    ${isDM ? `<input class="init-hp-input" placeholder="" onkeydown="if(event.key==='Enter'){window.applyTrackerHP('${entryId}', this);}">` : ''}
                </div>
            `;
        });

        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

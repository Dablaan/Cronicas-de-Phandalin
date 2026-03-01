import { state } from './state.js';
import { storageAdapter } from './storageAdapter.js';

export function initUI() {
    // Setup tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active to clicked
            const target = e.currentTarget.getAttribute('data-target');
            e.currentTarget.classList.add('active');
            document.getElementById(target).classList.add('active');

            // Re-render only the specific tab content to reflect state
            renderTabContent(target, state.get());
        });
    });

    // Setup player creation in auth screen
    document.getElementById('btn-create-player').addEventListener('click', () => {
        const newPlayerId = 'player_' + Date.now();
        const newPlayer = {
            id: newPlayerId,
            name: 'Nuevo Personaje',
            playerName: '',
            class: '',
            background: '',
            race: '',
            alignment: '',
            level: 1,
            xp: 0,
            hpCurrent: 10,
            hpMax: 10,
            hitDice: { total: '1d10', current: '1' },
            ac: 10,
            speed: 30,
            initiative: 0,
            passivePerception: 10,
            inspiration: false,
            stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
            skills: {
                acrobatics: { prof: false, exp: false, bonus: 0 }, animalHandling: { prof: false, exp: false, bonus: 0 },
                arcana: { prof: false, exp: false, bonus: 0 }, athletics: { prof: false, exp: false, bonus: 0 },
                deception: { prof: false, exp: false, bonus: 0 }, history: { prof: false, exp: false, bonus: 0 },
                insight: { prof: false, exp: false, bonus: 0 }, intimidation: { prof: false, exp: false, bonus: 0 },
                investigation: { prof: false, exp: false, bonus: 0 }, medicine: { prof: false, exp: false, bonus: 0 },
                nature: { prof: false, exp: false, bonus: 0 }, perception: { prof: false, exp: false, bonus: 0 },
                performance: { prof: false, exp: false, bonus: 0 }, persuasion: { prof: false, exp: false, bonus: 0 },
                religion: { prof: false, exp: false, bonus: 0 }, sleightOfHand: { prof: false, exp: false, bonus: 0 },
                stealth: { prof: false, exp: false, bonus: 0 }, survival: { prof: false, exp: false, bonus: 0 }
            },
            deathSaves: { successes: 0, failures: 0 },
            attacks: [],
            equipment: { equipped: '', backpack: '' },
            traits: '',
            spells: [],
            spellSlots: {
                1: { max: 0, used: 0 }, 2: { max: 0, used: 0 }, 3: { max: 0, used: 0 },
                4: { max: 0, used: 0 }, 5: { max: 0, used: 0 }, 6: { max: 0, used: 0 },
                7: { max: 0, used: 0 }, 8: { max: 0, used: 0 }, 9: { max: 0, used: 0 }
            }
        };

        const currentPlayers = state.get().players;
        state.update({
            players: [...currentPlayers, newPlayer]
        });
        window.openLoginModal('setup', newPlayerId);
    });
}

export function renderApp(currentState) {
    const { session, players } = currentState;

    // 1. Screen routing
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    if (!session || (!session.role)) {
        // Show Auth
        document.getElementById('auth-screen').classList.add('active');
        renderAuthPlayerList(players);
    } else {
        // Show Main App
        document.getElementById('main-screen').classList.add('active');
        setupMainScreenForRole(session);
        renderCurrentTab(currentState);
    }
}

function renderAuthPlayerList(players) {
    const container = document.getElementById('player-list-container');
    if (players.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay personajes creados.</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 16px; align-items: center; max-width: 500px; margin: 0 auto; width: 100%;">';
    players.forEach(p => {
        const fallbackAvatar = `<div style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #c0a062; margin-right: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);"><i class="fa-solid fa-dragon" style="color: var(--gold-dim); font-size: 1.5rem;"></i></div>`;
        const avatarHtml = p.avatarUrl ? `<img src="${p.avatarUrl}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #c0a062; margin-right: 16px; flex-shrink: 0;">` : fallbackAvatar;

        html += `
            <div class="epic-hero-card" onclick="window.loginAsPlayer('${p.id}')">
                ${avatarHtml}
                <div style="display: flex; flex-direction: column; flex-grow: 1;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">${p.name || 'Sin nombre'}</span>
                    <span style="font-size: 0.9rem; color: #e6d4b8; opacity: 0.8;">${p.class || 'Aventurero'} - Nivel ${p.level}</span>
                </div>
                <button class="btn btn-danger" onclick="event.stopPropagation(); window.deletePlayer('${p.id}', '${(p.name || 'Sin nombre').replace(/'/g, "\\'")}')" title="Borrar Personaje" style="padding: 0.3rem 0.6rem; margin-left: auto;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Attach global functions
window.loginAsPlayer = function (playerId) {
    const player = state.get().players.find(p => p.id === playerId);
    if (!player) return;

    if (!player.passcode) {
        window.openLoginModal('setup', playerId);
    } else {
        window.openLoginModal('login', playerId);
    }
};

window.openLoginModal = function (mode, playerId) {
    const overlay = document.getElementById('login-modal-overlay');
    const title = document.getElementById('login-modal-title');
    const desc = document.getElementById('login-modal-desc');
    const pass1 = document.getElementById('login-modal-pass1');
    const pass2 = document.getElementById('login-modal-pass2');
    const errorMsg = document.getElementById('login-modal-error');
    const submitBtn = document.getElementById('login-modal-submit');

    // Store data for the submit button
    submitBtn.setAttribute('data-mode', mode);
    submitBtn.setAttribute('data-player-id', playerId);

    // Reset visual state
    pass1.value = '';
    pass2.value = '';
    errorMsg.style.display = 'none';

    if (mode === 'setup') {
        title.innerHTML = '<i class="fa-solid fa-lock"></i> Sella tu Ficha';
        desc.innerText = 'Establece una contraseña maestra (Cerrojo Mágico).';
        pass2.style.display = 'block';
        submitBtn.innerHTML = '<i class="fa-solid fa-key"></i> Guardar';
    } else {
        title.innerHTML = '<i class="fa-solid fa-key"></i> Ficha Protegida';
        desc.innerText = 'Introduce tu Cerrojo Mágico para entrar.';
        pass2.style.display = 'none';
        submitBtn.innerHTML = '<i class="fa-solid fa-door-open"></i> Entrar';
    }

    // Enter key support for modal inputs
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            window.submitLoginModal();
        }
    };

    // Remove old listeners to avoid duplicates if modal is opened multiple times
    pass1.removeEventListener('keypress', handleEnter);
    pass2.removeEventListener('keypress', handleEnter);

    pass1.addEventListener('keypress', handleEnter);
    pass2.addEventListener('keypress', handleEnter);

    overlay.classList.remove('hidden');
    pass1.focus();
};

window.closeLoginModal = function () {
    const overlay = document.getElementById('login-modal-overlay');
    overlay.classList.add('hidden');
};

window.submitLoginModal = function () {
    const submitBtn = document.getElementById('login-modal-submit');
    const mode = submitBtn.getAttribute('data-mode');
    const playerId = submitBtn.getAttribute('data-player-id');
    const player = state.get().players.find(p => p.id === playerId);

    const pass1 = document.getElementById('login-modal-pass1').value;
    const pass2 = document.getElementById('login-modal-pass2').value;
    const errorMsg = document.getElementById('login-modal-error');

    if (!pass1) {
        errorMsg.innerText = "La contraseña no puede estar vacía.";
        errorMsg.style.display = 'block';
        return;
    }

    if (mode === 'setup') {
        if (pass1 !== pass2) {
            errorMsg.innerText = "Las contraseñas no coinciden.";
            errorMsg.style.display = 'block';
            return;
        }
        // Save passcode and login
        const currentPlayers = state.get().players.map(p =>
            p.id === playerId ? { ...p, passcode: pass1 } : p
        );
        state.update({ players: currentPlayers, session: { role: 'Player', playerId } }).then(() => {
            if (window.switchTab) window.switchTab('tab-ficha');
        });
        window.closeLoginModal();
    } else if (mode === 'login') {
        if (pass1 === player.passcode) {
            state.update({ session: { role: 'Player', playerId } }).then(() => {
                if (window.switchTab) window.switchTab('tab-ficha');
            });
            window.closeLoginModal();
        } else {
            // Keep modal open, show specific error
            errorMsg.innerText = "Ponte en contacto con tu DM para resetear la contraseña";
            errorMsg.style.display = 'block';
        }
    }
};

window.deletePlayer = function (playerId, playerName) {
    if (confirm(`¿Estás seguro de que deseas borrar a ${playerName} para siempre?\n\nEsta acción no se puede deshacer.`)) {
        const currentPlayers = state.get().players.filter(p => p.id !== playerId);
        state.update({ players: currentPlayers });
    }
};

window.isSheetEditMode = false;

function setupMainScreenForRole(session) {
    const isDM = session.role === 'DM';
    const headerTitle = document.getElementById('main-header-title');
    headerTitle.innerText = isDM ? 'Panel del Dungeon Master' : 'Crónicas de Phandalin';

    const tabSheetBtn = document.getElementById('tab-btn-sheet');
    const tabBestiarioBtn = document.getElementById('tab-btn-bestiario');
    const tabEncuentrosBtn = document.getElementById('tab-btn-encuentros');

    if (isDM) {
        tabSheetBtn.innerHTML = '<i class="fa-solid fa-dragon"></i> Dashboard';
        if (tabBestiarioBtn) tabBestiarioBtn.style.display = 'inline-block';
        if (tabEncuentrosBtn) tabEncuentrosBtn.style.display = 'inline-block';
    } else {
        tabSheetBtn.innerHTML = '<i class="fa-solid fa-scroll"></i> Ficha';
        if (tabBestiarioBtn) tabBestiarioBtn.style.display = 'none';
        if (tabEncuentrosBtn) tabEncuentrosBtn.style.display = 'none';
    }
}

function renderCurrentTab(currentState) {
    // Render initial active tab based on DOM
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        renderTabContent(activeTabBtn.getAttribute('data-target'), currentState);
    }
}

function renderTabContent(tabId, currentState) {
    const { session, players } = currentState;
    const isDM = session.role === 'DM';

    if (tabId === 'tab-sheet') {
        if (isDM) {
            renderDMSheet();
        } else {
            renderPlayerSheet(session.playerId, players);
        }
    } else if (tabId === 'tab-party') {
        renderPartyInfo(players, isDM);
    } else if (tabId === 'tab-npcs') {
        renderNpcs(currentState);
    } else if (tabId === 'tab-maps') {
        renderMaps(currentState);
    } else if (tabId === 'tab-library') {
        renderLibrary(currentState);
    } else if (tabId === 'tab-notes') {
        renderNotes(currentState);
    } else if (tabId === 'tab-bestiario') {
        renderBestiario(currentState);
    } else if (tabId === 'tab-encuentros') {
        renderEncuentros(currentState);
    }
}

// ----------------------------------------------------
// Player Features: Sheet
// ----------------------------------------------------

function renderPlayerSheet(playerId, players, targetId = 'tab-sheet') {
    const container = document.getElementById(targetId);
    const player = players.find(p => p.id === playerId);

    if (!player) {
        container.innerHTML = '<p>Error: Jugador no encontrado.</p>';
        return;
    }

    // Save existing accordion states before replacing DOM
    window.accordionStates = window.accordionStates || {};
    const existingAccordions = container.querySelectorAll('details.sheet-accordion');
    existingAccordions.forEach(el => {
        if (el.dataset.id) {
            window.accordionStates[playerId + '_' + el.dataset.id] = el.open;
        }
    });

    const existingGrimorio = container.querySelector('#sheet-grimorio-container');
    if (existingGrimorio) {
        window.accordionStates[playerId + '_grimorio'] = existingGrimorio.style.display === 'block';
    }

    // Default to view mode if viewing a different player
    if (window.currentSheetPlayerId !== playerId) {
        window.isSheetEditMode = false;
        window.currentSheetPlayerId = playerId;
    }

    let html = `<div class="sheet-container ${window.isSheetEditMode ? 'edit-mode' : 'view-mode'}" style="position: relative; padding-bottom: 2rem;">`;
    html += renderSheetHeader(playerId, player);

    html += '<div class="sheet-layout mt-1">';
    html += `<div class="area-stats">${renderStatsComp(player)}</div>`;

    html += `<div class="area-center-col">`;
    html += `<div class="area-hp">${renderHPDeathComp(playerId, player)}</div>`;
    html += `<div class="area-defense">${renderDefenseComp(player)}</div>`;
    html += `<div class="area-saves">${renderSavesComp(player)}</div>`;
    html += `<div class="area-passive">${renderPassiveComp(player)}</div>`;
    html += `<div class="area-attacks">${renderAttacksComp(playerId, player)}</div>`;
    html += `</div>`;

    html += `<div class="area-right-col">`;
    html += `<div class="area-skills">${renderSkillsComp(player)}</div>`;
    html += `<div class="area-inv">${renderInventoryComp(player)}</div>`;
    html += `<div class="area-traits">${renderTraitsComp(player)}</div>`;
    html += `</div>`;

    html += '</div>';

    html += renderActionBarComp(playerId);

    const isGrimorioOpen = window.accordionStates && window.accordionStates[playerId + '_grimorio'] ? 'block' : 'none';
    html += `<div id="sheet-grimorio-container" style="display: ${isGrimorioOpen};">${renderGrimorioComp(playerId, player)}</div>`;
    html += '</div>';

    container.innerHTML = html;
}

function renderSheetHeader(playerId, player) {
    return `
    <div class="card sheet-header-wrapper" style="margin-bottom: 0; padding: 1rem;">
        <div class="sheet-header-top" style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--parchment-dark); padding-bottom: 1rem;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div class="header-avatar" style="flex: 0 0 auto; width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--leather-dark); overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--parchment-dark);">
                    ${player.avatarUrl
            ? `<img src="${player.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i class="fa-solid fa-dragon" style="font-size: 2.5rem; color: var(--gold-dim); object-fit: cover;"></i>`
        }
                </div>
                ${window.isSheetEditMode ? `
                <div style="text-align: center; margin-top: -3px;">
                    <label style="font-size: 0.7rem; cursor: pointer; color: var(--leather-dark); text-decoration: underline;">
                        Subir Foto
                        <input type="file" accept=".png, .jpg, .jpeg, .webp" style="display: none;" onchange="window.uploadPlayerAvatar(this, '${playerId}')">
                    </label>
                </div>
                ` : ''}
            </div>
            <div class="header-names-container">
                <input type="text" name="playerName" value="${player.playerName || ''}" placeholder="Nombre del Jugador" class="header-input-player">
                <input type="text" name="name" value="${player.name || ''}" placeholder="Nombre del Personaje" class="header-input-char">
            </div>
        </div>
        <div class="sheet-header-details">
            <div>
                <label>Clase y Nivel</label>
                <div class="flex-row">
                    <input type="text" name="class" value="${player.class || ''}" placeholder="Clase" style="width: 70%;">
                    <input type="number" name="level" value="${player.level || 1}" title="Nivel" style="width: 30%;">
                </div>
            </div>
            <div>
                <label>Trasfondo</label>
                <input type="text" name="background" value="${player.background || ''}" placeholder="Trasfondo">
            </div>
            <div>
                <label>Raza</label>
                <input type="text" name="race" value="${player.race || ''}" placeholder="Raza">
            </div>
            <div>
                <label>Alineamiento</label>
                <input type="text" name="alignment" value="${player.alignment || ''}" placeholder="Alineamiento">
            </div>
            <div>
                <label>Puntos de Exp.</label>
                <input type="number" name="xp" value="${player.xp || 0}" placeholder="XP">
            </div>
        </div>
    </div>
    `;
}

function renderStatsComp(player) {
    const statsList = [
        { key: 'str', label: 'Fuerza' }, { key: 'dex', label: 'Destreza' },
        { key: 'con', label: 'Constitución' }, { key: 'int', label: 'Inteligencia' },
        { key: 'wis', label: 'Sabiduría' }, { key: 'cha', label: 'Carisma' }
    ];
    const getMod = (val) => {
        const m = Math.floor((val - 10) / 2);
        return m >= 0 ? '+' + m : m;
    };

    let html = '<div class="card" style="padding: 0.5rem;"><div style="display: flex; flex-direction: column; gap: 0.5rem;">';
    statsList.forEach(s => {
        const val = player.stats[s.key];
        const mod = getMod(val);
        html += `
            <div class="stat-box" style="margin-bottom: 12px;">
                <label>${s.label}</label>
                <input class="stat-val" type="number" name="stats.${s.key}" value="${val}">
                <div class="stat-mod">${mod}</div>
            </div>
        `;
    });
    html += '</div></div>';
    return html;
}

function renderHPDeathComp(playerId, player) {
    let hpBarPercent = Math.max(0, Math.min(100, (player.hpCurrent / player.hpMax) * 100));
    let hpColor = hpBarPercent > 50 ? '#556b2f' : (hpBarPercent > 20 ? '#b8860b' : '#8b0000');

    return `
    <div class="card" style="padding: 0.5rem; display: flex; flex-direction: column; justify-content: center;">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <label style="font-size: 0.75rem; text-transform:uppercase; font-weight:bold; color: var(--text-muted); margin:0;">
                <i class="fa-solid fa-heart" style="color:var(--red-ink);"></i> Salud
            </label>
            <div style="display:flex; align-items:center; gap: 0.2rem;">
                <button class="btn" style="padding: 0 0.4rem; font-size: 1.2rem;" onclick="window.modifyHP('${playerId}', -1)">-</button>
                <div style="font-size: 1.5rem; font-family: var(--font-heading); font-weight:bold; color: var(--leather-dark); display:flex; align-items:baseline;">
                    <input type="number" class="hp-input" name="hpCurrent" value="${player.hpCurrent}" style="width:45px; text-align:center; font-size:1.5rem; border:none; border-bottom: 2px solid var(--leather-dark); background:transparent; padding:0; margin:0;" onchange="window.updateSheet('${playerId}', 'hpCurrent', Number(this.value))">
                    <span style="font-size:0.9rem; color:var(--text-muted); margin:0 2px;">/</span>
                    <input type="number" class="hp-input" name="hpMax" value="${player.hpMax}" style="width:35px; text-align:center; font-size:0.9rem; border:none; background:transparent; padding:0; margin:0;" onchange="window.updateSheet('${playerId}', 'hpMax', Number(this.value))">
                </div>
                <button class="btn" style="padding: 0 0.4rem; font-size: 1.2rem;" onclick="window.modifyHP('${playerId}', 1)">+</button>
            </div>
        </div>
        
        <div style="width:100%; height:14px; background:var(--parchment-dark); border-radius:4px; overflow:hidden; margin-bottom: 0.4rem; border: 1px solid var(--parchment-dark);">
            <div id="hp-bar-fill-sheet" style="width:${hpBarPercent}%; height:100%; background:${hpColor}; transition: width 0.3s ease, background-color 0.3s ease;"></div>
        </div>

        <div style="text-align:center;">
            <label style="font-size: 0.65rem; font-weight:bold; color:var(--text-muted); text-transform:uppercase; margin-bottom:0;">Salvaciones de Muerte</label>
            <div style="display:flex; justify-content:center; gap: 1rem; align-items: center; margin-top:0.2rem;">
                 <div style="display:flex; align-items:center; gap:2px;">
                     <span style="font-size: 0.6rem; color: var(--leather-light); margin-right:4px;">Éxitos</span>
                     ${[1, 2, 3].map(i => `<input type="checkbox" class="death-save-control" ${player.deathSaves && player.deathSaves.successes >= i ? 'checked' : ''} onchange="window.updateDeathSave('${playerId}', 'successes', this.checked ? ${i} : ${i - 1})" style="width: 14px; height: 14px; accent-color: var(--leather-dark); margin:0; cursor: pointer;">`).join('')}
                 </div>
                 <div style="display:flex; align-items:center; gap:2px;">
                     <span style="font-size: 0.6rem; color: var(--red-ink); margin-right:4px;">Fallos</span>
                     ${[1, 2, 3].map(i => `<input type="checkbox" class="death-save-control" ${player.deathSaves && player.deathSaves.failures >= i ? 'checked' : ''} onchange="window.updateDeathSave('${playerId}', 'failures', this.checked ? ${i} : ${i - 1})" style="width: 14px; height: 14px; accent-color: var(--red-ink); margin:0; cursor: pointer;">`).join('')}
                 </div>
             </div>
        </div>
    </div>
    `;
}

function renderDefenseComp(player) {
    return `
    <div class="card" style="padding: 0.5rem; display: flex; align-items: center; justify-content: center;">
        <div class="combat-stats-grid" style="display: grid; width: 100%; gap: 0.5rem;">
            <div class="defense-box">
                <label>CA</label>
                <input type="number" name="ac" value="${player.ac}" style="width: 100%;">
            </div>
            <div class="defense-box">
                <label>Velocidad</label>
                <input type="number" name="speed" value="${player.speed || 30}" style="width: 100%;">
            </div>
            <div class="defense-box">
                <label>Iniciativa</label>
                <input type="number" name="initiative" value="${player.initiative || 0}" style="width: 100%;">
            </div>
             <div class="defense-box">
                <label>Insp.</label>
                <div style="display:flex; justify-content:center; align-items:center; height: 100%;">
                    <input type="checkbox" class="inspiration-input" name="inspiration" ${player.inspiration ? 'checked' : ''} style="width:18px; height:18px; accent-color: var(--gold-dim); cursor:pointer;" onchange="window.updateSheet('${player.id}', 'inspiration', this.checked)">
                </div>
            </div>
        </div>
    </div>
    `;
}

function renderSavesComp(player) {
    const savesList = [
        { key: 'str', label: 'Fue' }, { key: 'dex', label: 'Des' },
        { key: 'con', label: 'Con' }, { key: 'int', label: 'Int' },
        { key: 'wis', label: 'Sab' }, { key: 'cha', label: 'Car' }
    ];
    let html = '<div class="card" style="padding: 0.5rem;">';
    html += '<h4 style="font-size:0.75rem; text-transform:uppercase; color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); margin-bottom: 0.4rem; text-align:center; padding-bottom: 0.2rem;">Tiradas de Salvación</h4>';
    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.2rem;">';
    savesList.forEach(s => {
        let saveData = (player.saves && player.saves[s.key]) || { prof: false, bonus: 0 };
        if (typeof saveData === 'boolean') { saveData = { prof: saveData, bonus: 0 }; }
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.3); border: 1px solid var(--parchment-dark); border-radius: 4px; padding: 0.2rem;">
                <input type="text" name="saves.${s.key}.bonus" value="${saveData.bonus !== undefined ? saveData.bonus : '0'}" style="text-align:center; font-size:1.1rem; font-weight:bold; color:var(--leather-dark); border:none; background:transparent; width:100%; padding:0; margin:0; line-height: 1;">
                <label style="font-size: 0.6rem; color: var(--text-muted); margin-top: 0.1rem; text-transform:uppercase;">${s.label}</label>
            </div>
        `;
    });
    html += '</div></div>';
    return html;
}

function renderPassiveComp(player) {
    return `
    <div class="card" style="padding: 0.5rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 1rem; background: rgba(255, 255, 255, 0.4);">
        <label style="font-size: 0.8rem; text-transform:uppercase; font-weight:bold; color: var(--leather-light); margin: 0;">Percepción Pasiva</label>
        <div style="font-size: 1.5rem; font-family: var(--font-heading); color: var(--leather-dark); font-weight: bold;">
            <input type="number" name="passivePerception" value="${player.passivePerception || 10}" style="width: 50px; text-align:center; font-size: 1.5rem; border:none; border-bottom: 2px solid var(--leather-dark); background:transparent; padding:0; margin:0;">
        </div>
    </div>
    `;
}

function renderSkillsComp(player) {
    const skillsMap = [
        { id: 'acrobatics', name: 'Acrobacias', stat: 'dex' }, { id: 'animalHandling', name: 'Manejo de Animales', stat: 'wis' },
        { id: 'arcana', name: 'Arcano', stat: 'int' }, { id: 'athletics', name: 'Atletismo', stat: 'str' },
        { id: 'deception', name: 'Engaño', stat: 'cha' }, { id: 'history', name: 'Historia', stat: 'int' },
        { id: 'insight', name: 'Perspicacia', stat: 'wis' }, { id: 'intimidation', name: 'Intimidación', stat: 'cha' },
        { id: 'investigation', name: 'Investigación', stat: 'int' }, { id: 'medicine', name: 'Medicina', stat: 'wis' },
        { id: 'nature', name: 'Naturaleza', stat: 'int' }, { id: 'perception', name: 'Percepción', stat: 'wis' },
        { id: 'performance', name: 'Interpretación', stat: 'cha' }, { id: 'persuasion', name: 'Persuasión', stat: 'cha' },
        { id: 'religion', name: 'Religión', stat: 'int' }, { id: 'sleightOfHand', name: 'Juego de Manos', stat: 'dex' },
        { id: 'stealth', name: 'Sigilo', stat: 'dex' }, { id: 'survival', name: 'Supervivencia', stat: 'wis' }
    ];

    const isOpen = window.accordionStates && window.accordionStates[player.id + '_skills'] ? 'open' : '';
    let html = '<div class="card" style="padding: 0.5rem 1rem;">';
    html += `<details class="sheet-accordion" data-id="skills" ${isOpen}>`;
    html += '<summary style="font-size:1.17em; color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); margin-bottom: 0.5rem; padding-bottom: 0.5rem; cursor:pointer;"><i class="fa-solid fa-chevron-down accordion-icon"></i> <i class="fa-solid fa-list-check"></i> Habilidades</summary>';
    html += '<div class="accordion-content">';
    skillsMap.forEach(sk => {
        const skillData = (player.skills && player.skills[sk.id]) || { prof: false, bonus: 0 };
        html += `
            <div class="skill-row">
                <input type="checkbox" name="skills.${sk.id}.prof" ${skillData.prof ? 'checked' : ''}>
                <input class="skill-val" type="text" name="skills.${sk.id}.bonus" value="${skillData.bonus !== undefined ? skillData.bonus : '0'}" style="border:none; border-bottom: 1px solid var(--leather-dark); background:transparent; margin:0; padding:0; height:auto; width: 30px;" title="Bono Total">
                <label>${sk.name} <span style="font-size:0.6rem; color:#aaa;">(${sk.stat})</span></label>
            </div>
        `;
    });
    html += '</div></details></div>';
    return html;
}

function renderAttacksComp(playerId, player) {
    return `
    <div class="card">
        <div class="flex-between mb-1" style="border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3 style="margin:0;"><i class="fa-solid fa-khanda"></i> Ataques y Conjuros</h3>
            <button class="btn edit-only-btn" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;" onclick="window.addAttack('${playerId}')">
                <i class="fa-solid fa-plus"></i> Añadir
            </button>
        </div>
        <div id="attacks-container">
            ${renderAttacksList(playerId, player.attacks || [])}
        </div>
    </div>
    `;
}

function renderInventoryComp(player) {
    const isOpen = window.accordionStates && window.accordionStates[player.id + '_inventory'] ? 'open' : '';
    return `
    <div class="card">
        <details class="sheet-accordion" data-id="inventory" ${isOpen}>
            <summary style="font-size:1.17em; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--parchment-dark); cursor:pointer;"><i class="fa-solid fa-chevron-down accordion-icon"></i> <i class="fa-solid fa-sack-xmark"></i> Inventario y Equipo</summary>
            <div class="accordion-content">
                <div class="mt-1">
                    <h4 style="font-size: 0.8rem; text-transform:uppercase; color: var(--leather-light);"><i class="fa-solid fa-shield-halved"></i> Equipado</h4>
                    <textarea name="equipment.equipped" placeholder="Armadura puesta, armas en mano, anillos..." style="min-height: 80px; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm); margin-bottom:0.5rem;">${player.equipment ? player.equipment.equipped : ''}</textarea>
                </div>
                <div class="mt-1">
                    <h4 style="font-size: 0.8rem; text-transform:uppercase; color: var(--leather-light);"><i class="fa-solid fa-backpack"></i> Mochila y Riquezas</h4>
                    <textarea name="equipment.backpack" placeholder="Oro, raciones, antorchas..." style="min-height: 120px; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm);">${player.equipment ? player.equipment.backpack : ''}</textarea>
                </div>
            </div>
        </details>
    </div>
    `;
}

function renderTraitsComp(player) {
    const isOpen = window.accordionStates && window.accordionStates[player.id + '_traits'] ? 'open' : '';
    return `
    <div class="card">
        <details class="sheet-accordion" data-id="traits" ${isOpen}>
            <summary style="font-size:1.17em; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--parchment-dark); cursor:pointer;"><i class="fa-solid fa-chevron-down accordion-icon"></i> <i class="fa-solid fa-scroll"></i> Rasgos y Dotes</summary>
            <div class="accordion-content">
                <textarea name="traits" placeholder="Anota tus rasgos raciales, dotes, origen de clase, etc." style="min-height: 250px; height: 85%; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm);">${player.traits || ''}</textarea>
            </div>
        </details>
    </div>
    `;
}

function renderActionBarComp(playerId) {
    return `
    <div class="sheet-mode-controls view-only-hide sheet-action-bar" style="justify-content: center; gap: 20px;">
        <button class="btn" onclick="window.toggleGrimorio()" style="background: var(--leather-light); color: #fff; border:1px solid #111; padding: 0.5rem 1.5rem;"><i class="fa-solid fa-book-journal-whills"></i> Grimorio</button>
        <button class="btn btn-edit-sheet view-only-btn" onclick="window.toggleSheetEditMode()" style="background: var(--leather-dark); color: var(--gold); border:1px solid #111; padding: 0.5rem 1.5rem;"><i class="fa-solid fa-pencil"></i> Editar Ficha</button>
        <button class="btn btn-save-sheet edit-only-btn" onclick="window.saveSheetChanges('${playerId}')" style="background: var(--gold-dim); color: var(--leather-dark); font-weight: bold; border:1px solid #111; padding: 0.5rem 1.5rem;"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
    </div>
    `;
}

function renderGrimorioComp(playerId, player) {
    return `
    <div class="card mt-1">
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3 style="margin:0;"><i class="fa-solid fa-wand-sparkles"></i> Libro de Hechizos</h3>
            <button class="btn edit-only-btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.addSpell('${playerId}')">
                <i class="fa-solid fa-plus"></i> Añadir Conjuro
            </button>
        </div>
        
        <!-- Spell Slots -->
        <div class="mb-1" style="background: rgba(255,255,255,0.3); padding: 0.5rem; border-radius: var(--border-radius-sm); border: 1px solid var(--parchment-dark);">
            <h4 style="font-size: 0.8rem; text-transform:uppercase; color: var(--leather-light); margin-bottom: 0.5rem;">Espacios de Conjuro (Slots)</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: flex-start;">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => `
                    <div style="background: var(--parchment-bg); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--parchment-dark); text-align: center; font-size: 0.8em; min-width: 50px;">
                        <strong>Nvl ${lvl}</strong><br>
                        <input type="number" name="spellSlots.${lvl}.used" value="${(player.spellSlots && player.spellSlots[lvl]) ? player.spellSlots[lvl].used : 0}" style="width: 30px; padding: 2px; margin: 0; text-align: center; background: transparent; border: none; border-bottom: 1px solid var(--leather-dark); color: var(--red-ink); font-weight:bold;"> / 
                        <input type="number" name="spellSlots.${lvl}.max" value="${(player.spellSlots && player.spellSlots[lvl]) ? player.spellSlots[lvl].max : 0}" style="width: 30px; padding: 2px; margin: 0; text-align: center; background: transparent; border: none; border-bottom: 1px solid var(--leather-dark); color: var(--leather-dark);">
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Spell List sorted by level -->
        <div id="spells-container">
            ${renderSpellsList(playerId, player.spells || [])}
        </div>
    </div>
    `;
}

window.modifyHP = function (playerId, amount) {
    const currentState = state.get();

    // Create a new players array with the modified HP
    const players = currentState.players.map(p => {
        if (p.id === playerId) {
            const max = p.hpMax || 0;
            let current = p.hpCurrent || 0;
            current += amount;
            if (current > max) current = max;
            if (current < 0) current = 0;
            return { ...p, hpCurrent: current };
        }
        return p;
    });

    const updatedPlayer = players.find(p => p.id === playerId);
    if (!updatedPlayer) return;

    // Use the safe smart state update with skipNotify = true to prevent full re-render
    state.update({ players }, true);

    // Manually update the DOM for the HP input and bar in the individual sheet
    const hpInput = document.querySelector('input[name="hpCurrent"]');
    if (hpInput) hpInput.value = updatedPlayer.hpCurrent;

    const hpBarPercent = Math.max(0, Math.min(100, (updatedPlayer.hpCurrent / updatedPlayer.hpMax) * 100));
    let hpColor = hpBarPercent > 50 ? 'var(--leather-light)' : (hpBarPercent > 20 ? 'var(--gold-dim)' : 'var(--red-ink)');

    const hpBarFill = document.getElementById('hp-bar-fill-sheet');
    if (hpBarFill) {
        hpBarFill.style.width = hpBarPercent + '%';
        hpBarFill.style.backgroundColor = hpColor;
    }
};

window.updateSkill = function (playerId, skillId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const skills = p.skills || {};
            const skill = skills[skillId] || { prof: false, bonus: 0 };
            return { ...p, skills: { ...skills, [skillId]: { ...skill, [field]: value } } };
        }
        return p;
    });
    state.update({ players });
};

window.updateHitDice = function (playerId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const hitDice = p.hitDice || { total: '1d10', current: '1' };
            return { ...p, hitDice: { ...hitDice, [field]: value } };
        }
        return p;
    });
    state.update({ players });
};

window.renderAttacksList = function (playerId, attacks) {
    if (!attacks || attacks.length === 0) return '<p class="text-muted text-center" style="font-size: 0.9em; margin-top: 0.5rem;">Ves desarmado por la vida.</p>';

    let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">';
    attacks.forEach(atk => {
        html += `
            <div class="card attack-item" data-item-id="${atk.id}" style="padding: 0.5rem; background: rgba(255,255,255,0.4); margin-bottom: 0;">
                <div class="flex-between mb-1">
                    <input type="text" name="name" value="${atk.name || ''}" placeholder="Arma o Truco" style="font-weight: bold; padding: 0.2rem; margin-bottom: 0; width: 100%; margin-right: 0.5rem;">
                    <button class="btn btn-danger edit-only-btn" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.deleteAttack('${playerId}', '${atk.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" name="bonus" value="${atk.bonus || ''}" placeholder="Bono (ej. +5)" style="flex: 1; font-size: 0.85em; margin-bottom: 0;">
                    <input type="text" name="damage" value="${atk.damage || ''}" placeholder="Daño (ej. 1d8+3 Cort.)" style="flex: 2; font-size: 0.85em; margin-bottom: 0;">
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
};

window.addAttack = function (playerId) {
    window.syncAndModifySheet(playerId, (p) => {
        const attacks = p.attacks || [];
        const newAttack = { id: 'atk_' + Date.now(), name: '', bonus: '', damage: '' };
        return { ...p, attacks: [...attacks, newAttack] };
    });
};

window.updateAttack = function (playerId, atkId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const attacks = p.attacks.map(a => a.id === atkId ? { ...a, [field]: value } : a);
            return { ...p, attacks };
        }
        return p;
    });
    state.update({ players });
};

window.deleteAttack = function (playerId, atkId) {
    if (!confirm('¿Eliminar este ataque?')) return;
    window.syncAndModifySheet(playerId, (p) => {
        const attacks = p.attacks.filter(a => a.id !== atkId);
        return { ...p, attacks };
    });
};

window.updateSave = function (playerId, stat, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const saves = p.saves || {};
            // Backward comp
            let statObj = saves[stat];
            if (typeof statObj === 'boolean') {
                statObj = { prof: statObj, bonus: 0 };
            } else if (!statObj) {
                statObj = { prof: false, bonus: 0 };
            }
            return { ...p, saves: { ...saves, [stat]: { ...statObj, [field]: value } } };
        }
        return p;
    });
    state.update({ players });
};

window.updateDeathSave = function (playerId, type, value) {
    window.syncAndModifySheet(playerId, (p) => {
        const deathSaves = p.deathSaves || { successes: 0, failures: 0 };
        return { ...p, deathSaves: { ...deathSaves, [type]: value } };
    });
};

window.updateEquipment = function (playerId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const equipment = p.equipment || { equipped: '', backpack: '' };
            return { ...p, equipment: { ...equipment, [field]: value } };
        }
        return p;
    });
    state.update({ players });
};

window.renderSpellsList = function (playerId, spells) {
    if (!spells || spells.length === 0) return '<p class="text-muted mt-1 text-center">No has aprendido ningún conjuro aún.</p>';

    // Group by level
    const grouped = spells.reduce((acc, spell) => {
        const lvl = spell.level || 0;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(spell);
        return acc;
    }, {});

    let html = '';
    // Sort levels 0 to 9
    Object.keys(grouped).sort().forEach(level => {
        const lvlName = level == 0 ? 'Trucos (Cantrips)' : `Nivel ${level}`;
        html += `<h5 class="mt-1" style="border-bottom: 1px solid var(--parchment-dark); color: var(--leather-dark);">${lvlName}</h5>`;
        html += `<div class="grid-2">`;

        grouped[level].forEach(spell => {
            html += `
                <div class="card spell-item" data-item-id="${spell.id}" style="padding: 0.5rem; ${spell.prepared ? 'border-color: var(--gold-dim); box-shadow: 0 0 5px rgba(212,175,55,0.3); background: rgba(255,255,255,0.4);' : ''}">
                    <div class="flex-between mb-1">
                        <div class="flex-row" style="width: 70%;">
                            <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 0.8em; background: ${spell.prepared ? 'var(--gold-dim)' : 'transparent'}; color: ${spell.prepared ? '#fff' : 'var(--text-muted)'}; border: 1px solid var(--parchment-dark); box-shadow: none;" onclick="window.toggleSpellPrepared('${playerId}', '${spell.id}')" title="Preparar hechizo">
                                <i class="fa-solid fa-sun"></i>
                            </button>
                            <input type="text" name="name" value="${spell.name}" placeholder="Nombre del conjuro" style="margin-bottom: 0; font-weight: bold; padding: 0.2rem;">
                        </div>
                        <button class="btn btn-danger edit-only-btn" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.deleteSpell('${playerId}', '${spell.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="flex-row mb-1" style="gap: 0.2rem;">
                        <input type="hidden" name="prepared" value="${spell.prepared}">
                        <select name="level" style="margin-bottom: 0; padding: 0.1rem; font-size: 0.8em; width: 60px;">
                            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}" ${l == spell.level ? 'selected' : ''}>Nv ${l}</option>`).join('')}
                        </select>
                        <input type="text" name="castingTime" value="${spell.castingTime || ''}" placeholder="Tiempo (ej. 1 Acción)" style="margin-bottom: 0; padding: 0.1rem; font-size: 0.8em;">
                    </div>
                    
                    <textarea name="description" placeholder="Descripción y efectos..." style="min-height: 50px; margin-bottom: 0; font-size: 0.85em; padding: 0.3rem;">${spell.description || ''}</textarea>
                </div>
            `;
        });

        html += `</div>`;
    });

    return html;
};

window.addSpell = function (playerId) {
    window.syncAndModifySheet(playerId, (p) => {
        const spells = p.spells || [];
        const newSpell = {
            id: 'spell_' + Date.now(),
            name: 'Nuevo Conjuro',
            level: 0,
            castingTime: '',
            description: '',
            prepared: false
        };
        return { ...p, spells: [...spells, newSpell] };
    });
};

window.updateSpell = function (playerId, spellId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const spells = p.spells.map(s => s.id === spellId ? { ...s, [field]: value } : s);
            return { ...p, spells };
        }
        return p;
    });
    state.update({ players });
};

window.toggleSpellPrepared = function (playerId, spellId) {
    window.syncAndModifySheet(playerId, (p) => {
        const spells = p.spells.map(s => s.id === spellId ? { ...s, prepared: !s.prepared } : s);
        return { ...p, spells };
    });
};

window.deleteSpell = function (playerId, spellId) {
    if (!confirm('¿Eliminar este conjuro del grimorio?')) return;
    window.syncAndModifySheet(playerId, (p) => {
        const spells = p.spells.filter(s => s.id !== spellId);
        return { ...p, spells };
    });
};

window.updateSpellSlot = function (playerId, level, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const spellSlots = p.spellSlots || {};
            const slotLvl = spellSlots[level] || { max: 0, used: 0 };
            return {
                ...p,
                spellSlots: {
                    ...spellSlots,
                    [level]: { ...slotLvl, [field]: value }
                }
            };
        }
        return p;
    });
    state.update({ players });
};

window.gatherSheetData = function (playerId) {
    const container = document.querySelector('.sheet-container');
    if (!container) return null;

    const data = {
        stats: {},
        skills: {},
        saves: {},
        equipment: {},
        spellSlots: {},
        attacks: [],
        spells: []
    };

    // Recolectar campos simples (inputs, textareas, selects)
    const inputs = container.querySelectorAll('input[name], textarea[name], select[name]');
    inputs.forEach(input => {
        const name = input.getAttribute('name');
        if (!name) return;

        // Si es parte de un item de lista (ataque o hechizo), saltarlo aquí
        if (input.closest('.attack-item') || input.closest('.spell-item')) return;

        let value = input.type === 'checkbox' ? input.checked :
            input.type === 'number' ? Number(input.value) : input.value;

        // Manejar estructura anidada ej: stats.str
        if (name.includes('.')) {
            const parts = name.split('.');
            let current = data;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } else {
            data[name] = value;
        }
    });

    // Recolectar ataques
    const attackItems = container.querySelectorAll('.attack-item');
    attackItems.forEach(item => {
        const id = item.getAttribute('data-item-id');
        const attack = { id };
        item.querySelectorAll('input[name]').forEach(input => {
            let val = input.value;
            if (input.type === 'number') val = Number(val);
            attack[input.getAttribute('name')] = val;
        });
        data.attacks.push(attack);
    });

    // Recolectar hechizos
    const spellItems = container.querySelectorAll('.spell-item');
    spellItems.forEach(item => {
        const id = item.getAttribute('data-item-id');
        const spell = { id };
        item.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
            let val = input.value;
            if (input.getAttribute('name') === 'level') val = Number(val);
            if (input.getAttribute('name') === 'prepared') val = val === 'true';
            spell[input.getAttribute('name')] = val;
        });
        data.spells.push(spell);
    });

    return data;
};

// Helper para sincronizar el estado visual del DOM antes de aplicar modificaciones (ej. añadir ataque)
window.syncAndModifySheet = function (playerId, modifierFn) {
    const newData = window.isSheetEditMode ? window.gatherSheetData(playerId) : null;

    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            let pMerged = { ...p };
            if (newData) {
                pMerged = {
                    ...pMerged,
                    ...newData,
                    stats: { ...p.stats, ...newData.stats },
                    skills: { ...p.skills, ...newData.skills },
                    saves: { ...p.saves, ...newData.saves },
                    equipment: { ...p.equipment, ...newData.equipment },
                    spellSlots: { ...p.spellSlots, ...newData.spellSlots },
                    attacks: newData.attacks,
                    spells: newData.spells
                };
            }
            if (modifierFn) {
                pMerged = modifierFn(pMerged);
            }
            return pMerged;
        }
        return p;
    });
    state.update({ players });
};

window.saveSheetChanges = function (playerId) {
    const newData = window.gatherSheetData(playerId);

    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            return {
                ...p,
                ...newData,
                stats: { ...p.stats, ...newData.stats },
                skills: { ...p.skills, ...newData.skills },
                saves: { ...p.saves, ...newData.saves },
                equipment: { ...p.equipment, ...newData.equipment },
                spellSlots: { ...p.spellSlots, ...newData.spellSlots },
                attacks: newData.attacks,
                spells: newData.spells
            };
        }
        return p;
    });

    window.isSheetEditMode = false;
    state.update({ players });
};

window.toggleSheetEditMode = function () {
    window.isSheetEditMode = !window.isSheetEditMode;
    const p = state.get().players.find(p => p.id === window.currentSheetPlayerId);
    if (p) {
        renderPlayerSheet(p.id, state.get().players);
    }
};

window.updateSheet = function (playerId, field, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            return { ...p, [field]: value };
        }
        return p;
    });
    state.update({ players });
};

window.updateSheetStat = function (playerId, stat, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            return { ...p, stats: { ...p.stats, [stat]: value } };
        }
        return p;
    });
    state.update({ players });
};

function renderDMSheet() {
    const container = document.getElementById('tab-sheet');
    container.innerHTML = `
        <div class="card text-center">
            <h3>Bienvenido, Dungeon Master</h3>
            <p>Utiliza las pestañas superiores para gestionar el Grupo, NPCs, Mapas y las Notas de los jugadores.</p>
        </div>
    `;
}

// ----------------------------------------------------
// Player Features: Party
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
                        <div>
                            <button class="btn" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent - 1})">-</button>
                            <button class="btn" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent + 1})">+</button>
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
    const combatTracker = state.get().combatTracker;
    if (combatTracker && combatTracker.active) {
        html += renderInitiativeTracker(combatTracker, isDM, players);
    }

    container.innerHTML = html;
}

// ----------------------------------------------------
// Player Features: World & Notes
// ----------------------------------------------------

function renderNotes(currentState) {
    const { session, notes, players } = currentState;
    const container = document.getElementById('tab-notes');

    if (session.role === 'DM') {
        renderDMMirrorNotes(currentState);
        return;
    }

    const playerId = session.playerId;
    const playerNotes = notes[playerId] || '';

    container.innerHTML = `
        <div class="card">
            <h3><i class="fa-solid fa-book-journal-whills"></i> Diario Personal</h3>
            <p class="text-muted mb-1">Estas notas son privadas (solo tú y el DM pueden verlas).</p>
            <textarea id="personal-notes" placeholder="Escribe aquí tus aventuras...">${playerNotes}</textarea>
            <button class="btn mt-1" onclick="window.savePersonalNotes('${playerId}')">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Notas
            </button>
            <span id="notes-saved-msg" style="color: var(--leather-light); display: none; margin-left: 1rem;"><i class="fa-solid fa-check"></i> Guardado</span>
        </div>
    `;
}

window.savePersonalNotes = function (playerId) {
    const text = document.getElementById('personal-notes').value;
    const notes = { ...state.get().notes, [playerId]: text };
    state.update({ notes });

    const msg = document.getElementById('notes-saved-msg');
    msg.style.display = 'inline-block';
    setTimeout(() => msg.style.display = 'none', 2000);
};

// ----------------------------------------------------
// Player Features: NPCs
// ----------------------------------------------------
function renderNpcs(currentState) {
    const { session, npcs } = currentState;
    const container = document.getElementById('tab-npcs');

    if (session.role === 'DM') {
        renderDMNpcs(currentState);
        return;
    }

    const visibleNpcs = npcs.filter(n => n.isVisible);

    if (visibleNpcs.length === 0) {
        container.innerHTML = '<div class="card text-center"><p class="text-muted">Aún no has descubierto personajes importantes.</p></div>';
        return;
    }

    let html = '<h3><i class="fa-solid fa-users"></i> Personajes Conocidos</h3><div class="grid-2">';
    visibleNpcs.forEach(n => {
        const playerNotesOnNpc = n.notes?.find(note => note.playerId === session.playerId)?.text || '';
        html += `
            <div class="card card-horizontal" ondblclick="window.openQuickLook('${n.id}', 'npc')" style="cursor: pointer; position: relative;">
                 
                 <!-- Image (Left/Top) -->
                 ${n.url
                ? `<img src="${n.url}" class="card-horizontal-img" onclick="event.stopPropagation(); window.openLightbox('${n.url}')" title="Clic para ampliar">`
                : `<div class="card-horizontal-img" style="background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark);"><i class="fa-solid fa-user fa-2x text-muted"></i></div>`
            }
                 
                 <!-- Content (Right/Bottom) -->
                 <div class="card-horizontal-content">
                     <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${n.name}">${n.name} <span style="font-size:0.6em; color:var(--text-muted); font-family: var(--font-body); text-transform: uppercase;">(${n.raceAlignment || 'Desconocido'})</span></h4>
                     
                     <div style="display:flex; gap:15px; font-size: 0.85em; margin-bottom: 0.8rem; color: var(--leather-dark); font-weight: bold;">
                         <span title="Clase de Armadura"><i class="fa-solid fa-shield"></i> CA: ${n.ac || '-'}</span>
                         <span title="Puntos de Golpe"><i class="fa-solid fa-heart" style="color: var(--red-ink);"></i> HP: ${n.hp || '-'}</span>
                     </div>
                     
                     <p style="white-space: pre-wrap; margin-bottom: 0.5rem; font-size: 0.9em;"><i class="fa-solid fa-theater-masks"></i> <strong>Actitud/Voz:</strong> ${n.behavior || '...'}</p>
                     
                     ${(n.secrets || []).filter(s => s.isVisible).map(s => `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 0.85em;"><strong>Secreto Descubierto:</strong> ${s.text}</p>`).join('')}
                     
                     <!-- Apuntes Privados (Ahora dentro del flujo correcto) -->
                     <div style="border-top: 1px dashed var(--parchment-dark); padding-top: 0.8rem; margin-top: 0.8rem; width: 100%;">
                         <label style="font-size: 0.85em; color: var(--text-muted);"><i class="fa-solid fa-feather"></i> Tus apuntes privados:</label>
                         <textarea id="note-npc-${n.id}" placeholder="Escribe aquí tus apuntes..." style="min-height: 80px; font-family: 'Lora', serif; font-size: 0.9rem; line-height: 1.4; white-space: pre-wrap; resize: vertical; margin-bottom: 0.5rem;" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'">${playerNotesOnNpc}</textarea>
                         <div style="display:flex; justify-content:flex-end;">
                             <button class="btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="event.stopPropagation(); window.saveEntityNote(event, '${session.playerId}', 'npc', '${n.id}')">Guardar</button>
                         </div>
                     </div>
                 </div>
             </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// ----------------------------------------------------
// Player Features: Maps
// ----------------------------------------------------
function renderMaps(currentState) {
    const { session, maps } = currentState;
    const container = document.getElementById('tab-maps');

    if (session.role === 'DM') {
        renderDMMaps(currentState);
        return;
    }

    const visibleMaps = maps.filter(m => m.isVisible);

    if (visibleMaps.length === 0) {
        container.innerHTML = '<div class="card text-center"><p class="text-muted">Aún no has descubierto localizaciones.</p></div>';
        return;
    }

    let html = '<h3><i class="fa-solid fa-map"></i> Mapas y Lugares</h3><div class="grid-2">';
    visibleMaps.forEach(m => {
        const playerNotesOnMap = m.notes?.find(note => note.playerId === session.playerId)?.text || '';
        html += `
            <div class="card card-horizontal" style="position: relative;">
                
                <!-- Image (Left/Top) -->
                ${m.url
                ? `<img src="${m.url}" class="card-horizontal-img" onclick="event.stopPropagation(); window.openLightbox('${m.url}')" title="Clic para ampliar">`
                : `<div class="card-horizontal-img" style="background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark);"><i class="fa-solid fa-map fa-2x text-muted"></i></div>`
            }
                
                <!-- Content (Right/Bottom) -->
                <div class="card-horizontal-content">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2em;">${m.name} ${m.environmentType ? `<span style="font-size:0.6em; color:var(--text-muted); text-transform:uppercase;">(${m.environmentType})</span>` : ''}</h4>
                     ${(m.secrets || []).filter(s => s.isVisible).map(s => `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 0.85em;"><strong>Descubrimiento:</strong> ${s.text}</p>`).join('')}
                    
                    <!-- Apuntes Privados (Ahora dentro del flujo correcto) -->
                    <div style="border-top: 1px dashed var(--parchment-dark); padding-top: 0.8rem; margin-top: 0.8rem; width: 100%;">
                        <label style="font-size: 0.85em; color: var(--text-muted);"><i class="fa-solid fa-feather"></i> Tus apuntes cartográficos:</label>
                        <textarea id="note-map-${m.id}" placeholder="Notas sobre este lugar..." style="min-height: 80px; font-family: 'Lora', serif; font-size: 0.9rem; line-height: 1.4; white-space: pre-wrap; resize: vertical; margin-bottom: 0.5rem;" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'">${playerNotesOnMap}</textarea>
                        <div style="display:flex; justify-content:flex-end;">
                            <button class="btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="event.stopPropagation(); window.saveEntityNote(event, '${session.playerId}', 'map', '${m.id}')">Guardar</button>
                        </div>
                    </div>
                </div>
             </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

window.saveEntityNote = function (event, playerId, type, entityId) {
    const text = document.getElementById(`note-${type}-${entityId}`).value;
    const listKey = type + 's';

    // Nested update inside maps or npcs array
    const list = state.get()[listKey].map(e => {
        if (e.id === entityId) {
            const currentNotes = e.notes || [];
            const existingIndex = currentNotes.findIndex(n => n.playerId === playerId);
            let updatedNotes = [...currentNotes];

            if (existingIndex >= 0) {
                updatedNotes[existingIndex] = { ...updatedNotes[existingIndex], text };
            } else {
                updatedNotes.push({ playerId, text });
            }
            return { ...e, notes: updatedNotes };
        }
        return e;
    });

    state.update({ [listKey]: list });

    // Quick aesthetic feedback
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => btn.innerHTML = oldText, 1000);
}

// Stubs for DM versions
window.renderDMMirrorNotes = function (currentState) {
    const { players, notes, npcs, maps, session } = currentState;
    const container = document.getElementById('tab-notes');

    // UI State for selected player in mirror
    // Store it temporarily in DOM or a local variable, since we rebuild the HTML
    // We'll use a data attribute on the container or simply default to the first player
    const currentlySelected = container.getAttribute('data-mirror-player') || (players.length > 0 ? players[0].id : null);

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>El Espejo del Master</h3>
            <p class="text-muted" style="font-size: 0.9em;">Observa las crónicas de tus jugadores</p>
        </div>
    `;

    if (players.length === 0) {
        html += '<p class="text-muted">Aún no hay jugadores en la mesa.</p>';
        container.innerHTML = html;
        return;
    }

    // Selector
    html += `
        <div class="mb-1">
            <label>Selecciona un jugador:</label>
            <select onchange="document.getElementById('tab-notes').setAttribute('data-mirror-player', this.value); window.renderDMMirrorNotes(window.state.get())">
                ${players.map(p => `<option value="${p.id}" ${p.id === currentlySelected ? 'selected' : ''}>${p.name} (Lvl ${p.level})</option>`).join('')}
            </select>
        </div>
    `;

    if (!currentlySelected) {
        container.innerHTML = html;
        return;
    }

    const selectedPlayer = players.find(p => p.id === currentlySelected);
    const personalNotes = notes[currentlySelected] || '<em class="text-muted">El jugador no ha escrito notas personales aún.</em>';

    // Personal notes
    html += `
        <div class="card mb-1" style="background: rgba(255,255,255,0.3);">
            <div class="flex-between">
                <h4><i class="fa-solid fa-book-journal-whills"></i> Diario Privado de ${selectedPlayer.name}</h4>
                <button class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="window.resetPlayerPassword('${selectedPlayer.id}')" title="Borrar Cerrojo Mágico de este jugador">
                    <i class="fa-solid fa-unlock-keyhole"></i> Resetear Contraseña
                </button>
            </div>
            <div style="white-space: pre-wrap; margin-top: 1rem; padding: 1rem; border-left: 3px solid var(--leather-dark);">${personalNotes}</div>
        </div>
    `;

    // Get all nested notes belonging to this player inside Maps and NPCs
    const playerEntityNotes = [];

    npcs.forEach(n => {
        const pNote = n.notes?.find(note => note.playerId === currentlySelected);
        if (pNote && pNote.text.trim() !== '') {
            playerEntityNotes.push({ type: 'npc', name: n.name, text: pNote.text });
        }
    });

    maps.forEach(m => {
        const pNote = m.notes?.find(note => note.playerId === currentlySelected);
        if (pNote && pNote.text.trim() !== '') {
            playerEntityNotes.push({ type: 'map', name: m.name, text: pNote.text });
        }
    });

    html += `<h4><i class="fa-solid fa-feather"></i> Crónicas Guardadas (NPCs y Mapas)</h4>`;

    if (playerEntityNotes.length === 0) {
        html += '<p class="text-muted">No ha escrito apuntes sobre ningún NPC o Mapa aún.</p>';
    } else {
        html += '<div class="grid-2">';
        playerEntityNotes.forEach(en => {
            html += `
                <div class="card" style="background: rgba(255,255,255,0.3);">
                    <h5 style="color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.2rem;"><i class="fa-solid ${en.type === 'map' ? 'fa-map' : 'fa-user'}"></i> ${en.name}</h5>
                    <div style="white-space: pre-wrap; font-size: 0.9em; margin-top: 0.5rem;">${en.text}</div>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

// Ensure state is globally accessible for the inline onchange handler
window.state = state;
window.renderDMNpcs = function (currentState) {
    const { npcs } = currentState;
    const container = document.getElementById('tab-npcs');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Gestión de NPCs</h3>
            <button class="btn" onclick="window.openEntityModal('npc')"><i class="fa-solid fa-user-plus"></i> Nuevo NPC</button>
        </div>
        <div class="grid-2">
    `;

    if (!npcs || npcs.length === 0) html += '<p class="text-muted">No hay NPCs.</p>';
    else {
        npcs.forEach(n => {
            const isSecretVisible = n._uiSecretVisible || false;

            html += `
                <div class="card card-horizontal" ondblclick="window.openQuickLook('${n.id}', 'npc')" style="cursor: pointer; position: relative; ${n.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    ${n.url
                    ? `<img src="${n.url}" class="card-horizontal-img" onclick="event.stopPropagation(); window.openLightbox('${n.url}')" title="Clic para ampliar">`
                    : `<div class="card-horizontal-img" style="background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark);"><i class="fa-solid fa-user fa-2x text-muted"></i></div>`
                }
                    
                    <!-- Content -->
                    <div class="card-horizontal-content">
                        <div class="flex-between mb-1" style="flex-wrap: nowrap;">
                            <h4 style="margin: 0; font-size: 1.2em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${n.name}">${n.name} <span style="font-size:0.6em; color:var(--text-muted); font-family: var(--font-body); text-transform: uppercase;">(${n.raceAlignment || 'Desconocido'})</span></h4>
                            <button class="btn ${n.isVisible ? '' : 'btn-danger'}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: 10px;" onclick="event.stopPropagation(); window.toggleEntityVisibility('npc', '${n.id}')" title="${n.isVisible ? 'Visible por Jugadores' : 'Oculto a Jugadores'}">
                                <i class="fa-solid ${n.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                        </div>
                        
                        <div style="display:flex; gap:15px; font-size: 0.85em; margin-bottom: 0.8rem; color: var(--leather-dark); font-weight: bold;">
                            <span title="Clase de Armadura"><i class="fa-solid fa-shield"></i> CA: ${n.ac || '-'}</span>
                            <span title="Puntos de Golpe"><i class="fa-solid fa-heart" style="color: var(--red-ink);"></i> HP: ${n.hp || '-'}</span>
                        </div>

                        <p style="font-size: 0.9em; white-space: pre-wrap; margin-bottom: 0.5rem;"><i class="fa-solid fa-theater-masks"></i> <strong>Actitud/Voz:</strong> ${n.behavior || '...'}</p>
                        
                        <!-- Contenedor Secreto Expandible -->
                        <div style="background: rgba(0,0,0,0.03); border-left: 3px solid var(--red-ink); padding: 0.5rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0;">
                            <div class="flex-between" style="cursor: pointer;" onclick="event.stopPropagation(); window.toggleDmSecretVisibility('npc', '${n.id}')">
                                <strong style="color: var(--red-ink); font-size: 0.85em;"><i class="fa-solid fa-user-secret"></i> Secreto DM</strong>
                                <i class="fa-solid ${isSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.8em; color: var(--text-muted);"></i>
                            </div>
                            ${isSecretVisible ? `<p style="font-size: 0.85em; white-space: pre-wrap; margin-top: 0.5em; margin-bottom: 0;">${n.motivation || 'Sin notas secretas.'}</p>` : ''}
                        </div>

                        <!-- Acciones -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            <button class="btn" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.openEntityModal('npc', '${n.id}')" title="Editar este NPC"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.deleteEntity('npc', '${n.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';
    container.innerHTML = html;
}

window.renderBestiario = function (currentState) {
    const { bestiario } = currentState;
    const container = document.getElementById('tab-bestiario');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Bestiario Monstruoso</h3>
            <button class="btn" onclick="window.openEntityModal('monster')"><i class="fa-solid fa-dragon"></i> Nuevo Monstruo</button>
        </div>
        <div class="grid-2">
    `;

    if (!bestiario || bestiario.length === 0) html += '<p class="text-muted">No hay monstruos en el tomo central.</p>';
    else {
        const getMod = (val) => {
            const v = parseInt(val, 10) || 10;
            const mod = Math.floor((v - 10) / 2);
            return mod >= 0 ? '+' + mod : mod;
        };

        bestiario.forEach(m => {
            const isSecretVisible = m._uiSecretVisible || false;

            html += `
                <div class="card card-horizontal" ondblclick="window.openQuickLook('${m.id}', 'monster')" style="cursor: pointer; position: relative; ${m.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    ${m.url
                    ? `<img src="${m.url}" class="card-horizontal-img" style="width: 120px; height: 120px;" onclick="event.stopPropagation(); window.openLightbox('${m.url}')" title="Clic para ampliar">`
                    : `<div class="card-horizontal-img" style="width: 120px; height: 120px; background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark); box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-dragon fa-3x text-muted"></i></div>`
                }
                    
                    <!-- Content -->
                    <div class="card-horizontal-content" style="color: var(--leather-dark);">
                        
                        <!-- Header -->
                        <div class="flex-between mb-1" style="flex-wrap: nowrap;">
                            <h4 style="margin: 0; font-size: 1.6em; font-family: 'Times New Roman', serif; font-weight: bold; color: var(--red-ink); text-transform: uppercase;">${m.name}</h4>
                            <button class="btn ${m.isVisible ? '' : 'btn-danger'}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: 10px;" onclick="event.stopPropagation(); window.toggleEntityVisibility('monster', '${m.id}')" title="${m.isVisible ? 'Visible por Jugadores' : 'Oculto a Jugadores'}">
                                <i class="fa-solid ${m.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                        </div>
                        <div style="font-size: 0.85em; font-style: italic; color: #555; margin-top: -8px;">${m.subtitle || 'Tipo desconocido'}</div>
                        
                        <div style="border-bottom: 3px solid var(--red-ink); margin: 0.5rem 0;"></div>

                        <!-- Combat Stats -->
                        <div style="font-size: 0.9em; line-height: 1.4;">
                            <div><strong style="color: var(--red-ink);">Clase de Armadura</strong> ${m.ac || '-'}</div>
                            <div><strong style="color: var(--red-ink);">Puntos de Golpe</strong> ${m.hp || '-'}</div>
                            <div><strong style="color: var(--red-ink);">Velocidad</strong> ${m.speed || '30 pies'}</div>
                            ${m.init ? `<div><strong style="color: var(--red-ink);">Iniciativa</strong> ${m.init}</div>` : ''}
                        </div>

                        <div style="border-bottom: 2px solid var(--red-ink); margin: 0.5rem 0;"></div>

                        <!-- Attributes Grid -->
                         <div style="display:flex; gap:10px; font-size: 0.8em; justify-content: space-between; text-align: center; color: var(--red-ink);">
                             <div><strong>FUE</strong><br><span style="color:black;">${m.str || 10} (${getMod(m.str)})</span></div>
                             <div><strong>DES</strong><br><span style="color:black;">${m.dex || 10} (${getMod(m.dex)})</span></div>
                             <div><strong>CON</strong><br><span style="color:black;">${m.con || 10} (${getMod(m.con)})</span></div>
                             <div><strong>INT</strong><br><span style="color:black;">${m.int || 10} (${getMod(m.int)})</span></div>
                             <div><strong>SAB</strong><br><span style="color:black;">${m.wis || 10} (${getMod(m.wis)})</span></div>
                             <div><strong>CAR</strong><br><span style="color:black;">${m.cha || 10} (${getMod(m.cha)})</span></div>
                         </div>

                        <div style="border-bottom: 2px solid var(--red-ink); margin: 0.5rem 0;"></div>

                        <!-- Additional Details -->
                        <div style="font-size: 0.85em; line-height: 1.4;">
                            ${m.saves ? `<div><strong style="color: var(--red-ink);">Tiradas de Salvación</strong> ${m.saves}</div>` : ''}
                            ${m.skills ? `<div><strong style="color: var(--red-ink);">Habilidades</strong> ${m.skills}</div>` : ''}
                            ${m.immunities ? `<div><strong style="color: var(--red-ink);">Vulnerabilidades / Inmunidades</strong> ${m.immunities}</div>` : ''}
                            ${m.senses ? `<div><strong style="color: var(--red-ink);">Sentidos</strong> ${m.senses}</div>` : ''}
                            ${m.langs ? `<div><strong style="color: var(--red-ink);">Idiomas</strong> ${m.langs}</div>` : ''}
                            ${m.challenge ? `<div><strong style="color: var(--red-ink);">Desafío</strong> ${m.challenge}</div>` : ''}
                        </div>

                        <div style="border-bottom: 2px solid var(--red-ink); margin: 0.5rem 0;"></div>

                        <!-- Text Blocks (Collapsible) -->
                        <div style="background: rgba(0,0,0,0.02); padding: 0.5rem; margin-bottom: 1rem; border-radius: 4px;">
                            <div class="flex-between" style="cursor: pointer;" onclick="event.stopPropagation(); window.toggleDmSecretVisibility('monster', '${m.id}')">
                                <strong style="color: var(--red-ink); font-size: 0.9em;"><i class="fa-solid fa-book-skull"></i> Bloque de Combate y Rasgos</strong>
                                <i class="fa-solid ${isSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.8em; color: var(--text-muted);"></i>
                            </div>
                            
                            ${isSecretVisible ? `
                                <div style="font-size: 0.85em; margin-top: 1rem;">
                                    ${m.features ? `<div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.features}</div>` : ''}
                                    
                                    ${m.actions ? `<h5 style="color: var(--red-ink); border-bottom: 1px solid var(--red-ink); margin-bottom: 0.3rem;">Acciones</h5>
                                    <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.actions}</div>` : ''}
                                    
                                    ${m.bonus ? `<h5 style="color: var(--red-ink); border-bottom: 1px solid var(--red-ink); margin-bottom: 0.3rem;">Acciones Adicionales</h5>
                                    <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.bonus}</div>` : ''}
                                    
                                    ${m.reactions ? `<h5 style="color: var(--red-ink); border-bottom: 1px solid var(--red-ink); margin-bottom: 0.3rem;">Reacciones</h5>
                                    <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.reactions}</div>` : ''}
                                    
                                    ${m.equip ? `<h5 style="color: var(--red-ink); border-bottom: 1px solid var(--red-ink); margin-bottom: 0.3rem;">Equipo</h5>
                                    <div style="white-space: pre-wrap; margin-bottom: 0.5rem; line-height: 1.4;">${m.equip}</div>` : ''}
                                    
                                    ${(!m.features && !m.actions && !m.bonus && !m.reactions && !m.equip) ? '<p class="text-muted">El bloque de combate está vacío.</p>' : ''}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Acciones CRUD -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            <button class="btn" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.openEntityModal('monster', '${m.id}')" title="Editar este Monstruo"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.deleteEntity('monster', '${m.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

// ----------------------------------------------------
// GESTOR DE ENCUENTROS (COMBAT BUILDER)
// ----------------------------------------------------

window.editingEncounterId = null;
window.currentEncounterBuilder = [];

window.renderEncuentros = function (currentState) {
    const { encuentros, bestiario, maps } = currentState;
    const container = document.getElementById('tab-encuentros');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Gestor de Escenas de Combate</h3>
            <button class="btn" onclick="window.openEntityModal('encuentro')"><i class="fa-solid fa-swords"></i> Añadir Encuentro</button>
        </div>
        
        <!-- Lista de Encuentros Creados -->
        <div id="encounter-list-container">
            <div class="grid-2">
    `;

    if (!encuentros || encuentros.length === 0) {
        html += '<p class="text-muted" style="grid-column: 1/-1;">No hay encuentros preparados. Adelante, planea su perdición.</p>';
    } else {
        encuentros.forEach(enc => {
            const listHtml = (enc.monsters || []).map(m => `<li><strong>${m.qty}x</strong> ${m.name} <span style="color:var(--gold-dim); font-size:0.85em;">(Init: ${m.initiative || '?'})</span></li>`).join('');
            const combatActive = currentState.combatTracker && currentState.combatTracker.active;
            html += `
                <div class="card" style="position: relative; display: flex; flex-direction: column;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem 0; color:var(--red-ink);"><i class="fa-solid fa-swords"></i> ${enc.name}</h4>
                        <p style="font-size: 0.85em; margin-bottom: 0.8rem;"><i class="fa-solid fa-location-dot"></i> ${enc.location || 'Desconocida'}</p>
                        <div style="background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 4px; border: 1px solid var(--parchment-dark); margin-bottom: 0.5rem;">
                            <h5 style="margin:0 0 0.3rem 0; font-size: 0.8em; text-transform:uppercase;">Hostiles:</h5>
                            <ul style="margin:0; padding-left: 1rem; font-size: 0.85em;">
                                ${listHtml || '<li>Ninguno (Escena social o trampa)</li>'}
                            </ul>
                        </div>
                        ${enc.loot ? `<p style="font-size: 0.85em; margin: 0; color: var(--gold-dim);"><i class="fa-solid fa-sack-dollar"></i> <strong>Botín:</strong> ${enc.loot}</p>` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 1rem; margin-top: auto; flex-wrap: wrap;">
                        <button class="btn" style="padding: 0.4rem 0.8rem; font-size:0.85rem; background: var(--red-ink); color: #fff; border-color: var(--red-ink); ${combatActive ? 'opacity:0.4; pointer-events:none;' : ''}" onclick="window.startCombatFromEncounter('${enc.id}')" title="Iniciar combate con este encuentro">
                            <i class="fa-solid fa-khanda"></i> Iniciar Combate
                        </button>
                        <button class="btn" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="window.openEntityModal('encuentro', '${enc.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="window.deleteEntity('encuentro', '${enc.id}')" title="Borrar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

window.addMonsterToBuilder = function () {
    const select = document.getElementById('ef-monster-select');
    const qtyInput = document.getElementById('ef-monster-qty');
    const initInput = document.getElementById('ef-monster-init');
    const monsterId = select.value;
    const qty = parseInt(qtyInput.value, 10);
    const initiative = parseInt(initInput.value, 10);

    if (!monsterId || isNaN(qty) || qty <= 0) return;
    if (isNaN(initiative) || initiative <= 0) {
        alert('La Iniciativa es obligatoria para cada pack de monstruos.');
        initInput.focus();
        return;
    }

    const monsterData = state.get().bestiario.find(b => b.id === monsterId);
    if (!monsterData) return;

    // Verificar si ya está en la lista para sumar cantidades
    const existingIndex = window.currentEncounterBuilder.findIndex(m => m.id === monsterId);
    if (existingIndex > -1) {
        window.currentEncounterBuilder[existingIndex].qty += qty;
        window.currentEncounterBuilder[existingIndex].initiative = initiative; // Update initiative
    } else {
        window.currentEncounterBuilder.push({
            id: monsterData.id,
            name: monsterData.name,
            qty: qty,
            initiative: initiative
        });
    }

    // Resetear formcito
    qtyInput.value = 1;
    initInput.value = '';
    select.value = '';

    window.renderEncounterBuilderList();
};

window.removeMonsterFromBuilder = function (monsterId) {
    window.currentEncounterBuilder = window.currentEncounterBuilder.filter(m => m.id !== monsterId);
    window.renderEncounterBuilderList();
};

window.renderEncounterBuilderList = function () {
    const builderUl = document.getElementById('ef-builder-list');
    if (!builderUl) return;

    if (window.currentEncounterBuilder.length === 0) {
        builderUl.innerHTML = '<li class="text-muted">No hay monstruos añadidos aún.</li>';
        return;
    }

    builderUl.innerHTML = window.currentEncounterBuilder.map(m => `
        <li style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--parchment-dark); padding:0.2rem 0;">
            <span><strong>${m.qty}x</strong> ${m.name} <span style="color:var(--gold-dim); font-size:0.8em;">(Init: ${m.initiative || '?'})</span></span>
            <button class="btn btn-danger" style="padding:0.1rem 0.3rem; font-size:0.75rem;" onclick="window.removeMonsterFromBuilder('${m.id}')"><i class="fa-solid fa-xmark"></i></button>
        </li>
    `).join('');
};


window.resetPlayerPassword = function (playerId) {
    if (confirm("¿Seguro que deseas romper el Cerrojo Mágico de este jugador? Tendrá que configurar uno nuevo al entrar.")) {
        const currentPlayers = state.get().players.map(p =>
            p.id === playerId ? { ...p, passcode: null } : p
        );
        state.update({ players: currentPlayers });
        alert("Contraseña reseteada con éxito.");
    }
};

// ----------------------------------------------------
// INITIATIVE TRACKER (Combat System)
// ----------------------------------------------------

window.startCombatFromEncounter = function (encounterId) {
    const currentState = state.get();
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

    state.update({ combatTracker: tracker });
    // Switch to party tab to see the tracker
    if (window.switchTab) window.switchTab('tab-party');
};

window.setPlayerInitiative = function (playerId) {
    const val = prompt('Introduce la Iniciativa de este personaje:');
    if (val === null) return;
    const initiative = parseInt(val, 10);
    if (isNaN(initiative)) { alert('Valor inválido.'); return; }

    const tracker = JSON.parse(JSON.stringify(state.get().combatTracker));
    if (!tracker) return;

    const entry = tracker.entries.find(e => e.type === 'player' && e.id === playerId);
    if (entry) entry.initiative = initiative;

    state.update({ combatTracker: tracker });
};

window.beginCombat = function () {
    const tracker = JSON.parse(JSON.stringify(state.get().combatTracker));
    if (!tracker) return;

    // Check all PJs have initiative
    const unset = tracker.entries.filter(e => e.type === 'player' && (e.initiative === null || e.initiative === undefined));
    if (unset.length > 0) {
        alert('Todos los Personajes Jugadores deben tener una iniciativa asignada antes de comenzar.');
        return;
    }

    // Expand monster templates into individual instances
    const bestiario = state.get().bestiario || [];
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

    state.update({ combatTracker: tracker });
};

window.nextTurn = function () {
    const tracker = JSON.parse(JSON.stringify(state.get().combatTracker));
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

    state.update({ combatTracker: tracker });
};

window.prevTurn = function () {
    const tracker = JSON.parse(JSON.stringify(state.get().combatTracker));
    if (!tracker || tracker.phase !== 'combat') return;

    let idx = tracker.turnIndex;
    let attempts = 0;
    do {
        idx = (idx - 1 + tracker.entries.length) % tracker.entries.length;
        attempts++;
    } while (tracker.entries[idx].type === 'monster' && tracker.entries[idx].hpCurrent <= 0 && attempts < tracker.entries.length);

    tracker.turnIndex = idx;
    state.update({ combatTracker: tracker });
};

window.applyTrackerHP = function (instanceId, inputEl) {
    const expression = inputEl.value.trim();
    if (!expression) return;

    const tracker = JSON.parse(JSON.stringify(state.get().combatTracker));
    if (!tracker) return;

    const entry = tracker.entries.find(e =>
        (e.type === 'monster' && e.instanceId === instanceId) ||
        (e.type === 'player' && e.id === instanceId)
    );
    if (!entry) return;

    let delta = 0;
    if (expression.startsWith('+') || expression.startsWith('-')) {
        delta = parseInt(expression, 10);
    } else {
        // Absolute value: set HP directly
        const abs = parseInt(expression, 10);
        if (!isNaN(abs)) {
            if (entry.type === 'monster') {
                entry.hpCurrent = Math.max(0, abs);
            } else {
                // For players, update the actual player state too
                entry.initiative = entry.initiative; // keep
                const players = state.get().players.map(p =>
                    p.id === entry.id ? { ...p, hpCurrent: Math.max(0, abs) } : p
                );
                state.update({ players });
            }
            inputEl.value = '';
            state.update({ combatTracker: tracker });
            return;
        }
    }

    if (isNaN(delta) || delta === 0) { inputEl.value = ''; return; }

    if (entry.type === 'monster') {
        entry.hpCurrent = Math.max(0, entry.hpCurrent + delta);
    } else if (entry.type === 'player') {
        // Update player's actual HP in the game state
        const player = state.get().players.find(p => p.id === entry.id);
        if (player) {
            const newHP = Math.max(0, (player.hpCurrent || 0) + delta);
            const players = state.get().players.map(p =>
                p.id === entry.id ? { ...p, hpCurrent: newHP } : p
            );
            state.update({ players });
        }
    }

    inputEl.value = '';
    state.update({ combatTracker: tracker });
};

window.endCombat = function () {
    if (confirm('¿Finalizar el combate? El tracker de iniciativa se eliminará.')) {
        state.update({ combatTracker: null });
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
        <div class="initiative-tracker-wrapper" style="margin-top: 1.5rem; border: 2px solid var(--red-ink); border-radius: var(--border-radius-md); padding: 1rem; background: rgba(139,0,0,0.03);">
            <div class="flex-between mb-1" style="border-bottom: 2px solid var(--red-ink); padding-bottom: 0.5rem;">
                <h3 style="margin:0; color: var(--red-ink);"><i class="fa-solid fa-khanda"></i> Orden de Iniciativa</h3>
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
                <div class="init-token ${isActive ? 'init-token-active' : ''} ${isDead ? 'init-token-dead' : ''} ${!isActive && !isDead ? hpHaloClass : ''}" style="${hiddenDmStyle}">
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

window.renderDMMaps = function (currentState) {
    const { maps } = currentState;
    const container = document.getElementById('tab-maps');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Gestión de Localizaciones</h3>
            <button class="btn" onclick="window.openEntityModal('map')"><i class="fa-solid fa-map-location-dot"></i> Nuevo Mapa</button>
        </div>
        <div class="grid-2">
    `;

    if (!maps || maps.length === 0) html += '<p class="text-muted">No hay Mapas.</p>';
    else {
        maps.forEach(m => {
            const isSecretVisible = m._uiSecretVisible || false;

            html += `
                <div class="card card-horizontal" style="position: relative; ${m.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    ${m.url
                    ? `<img src="${m.url}" class="card-horizontal-img" onclick="event.stopPropagation(); window.openLightbox('${m.url}')" title="Clic para ampliar">`
                    : `<div class="card-horizontal-img" style="background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark);"><i class="fa-solid fa-map fa-2x text-muted"></i></div>`
                }
                    
                    <!-- Content -->
                    <div class="card-horizontal-content">
                        <div class="flex-between mb-1" style="flex-wrap: nowrap;">
                            <h4 style="margin: 0; font-size: 1.2em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.name}"><i class="fa-solid fa-map"></i> ${m.name}</h4>
                            <button class="btn ${m.isVisible ? '' : 'btn-danger'}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: 10px;" onclick="event.stopPropagation(); window.toggleEntityVisibility('map', '${m.id}')" title="${m.isVisible ? 'Visible por Jugadores' : 'Oculto a Jugadores'}">
                                <i class="fa-solid ${m.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                        </div>
                        
                        <p style="font-size: 0.8em; font-weight: bold; color: var(--gold-dim); margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">${m.environmentType || 'Ubicación Desconocida'}</p>
                        
                         <!-- Contenedor Secreto Expandible -->
                        <div style="background: rgba(0,0,0,0.03); border-left: 3px solid var(--red-ink); padding: 0.5rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0;">
                            <div class="flex-between" style="cursor: pointer;" onclick="event.stopPropagation(); window.toggleDmSecretVisibility('map', '${m.id}')">
                                <strong style="color: var(--red-ink); font-size: 0.85em;"><i class="fa-solid fa-mask"></i> Notas DM</strong>
                                <i class="fa-solid ${isSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.8em; color: var(--text-muted);"></i>
                            </div>
                            ${isSecretVisible ? `<div style="font-size: 0.85em; white-space: pre-wrap; margin-top: 0.5em; margin-bottom: 0;">${m.dmNotes || 'Sin notas del master.'}</div>` : ''}
                        </div>

                        <!-- Acciones -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            <button class="btn" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.openEntityModal('map', '${m.id}')" title="Editar este Mapa"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.9rem;" onclick="event.stopPropagation(); window.deleteEntity('map', '${m.id}')" title="Borrar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';

    container.innerHTML = html;
}

// ----------------------------------------------------
// ENTITY TOGGLES & HELPERS
// ----------------------------------------------------

window.toggleEntityVisibility = async function (type, id) {
    const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario', 'encuentro': 'encuentros' };
    const listKey = listKeyDict[type] || type + 's';
    const list = state.get()[listKey];
    const item = list.find(e => e.id === id);
    if (!item) return;

    const newValue = !item.isVisible;
    const updatedList = list.map(e => e.id === id ? { ...e, isVisible: newValue } : e);

    // Save state completely (this causes re-render via listener in init())
    await state.update({ [listKey]: updatedList });
};

window.toggleDmSecretVisibility = function (type, id) {
    const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario', 'encuentro': 'encuentros' };
    const listKey = listKeyDict[type] || type + 's';
    const list = state.get()[listKey];
    const item = list.find(e => e.id === id);
    if (!item) return;

    // UI Transient State - Doesn't need to be saved to Backend
    // We mutate the proxy state structure gently to avoid excessive backend trips
    // Note: If you want persistent UI states you'd have to save them, but for accordions local memory is usually best.
    const currentValue = item._uiSecretVisible || false;
    const updatedList = list.map(e => e.id === id ? { ...e, _uiSecretVisible: !currentValue } : e);
    // Use state.update WITH skipNotify = false to trigger UI refresh WITHOUT writing to DB (avoid bandwidth loop logic below)

    state.get()[listKey] = updatedList; // direct mutant edit in JS memory
    state.notify(); // force UI rerender
};

// ----------------------------------------------------
// ENTITY MODAL CRUD LOGIC (NPCs & Maps)
// ----------------------------------------------------

window.openEntityModal = function (type, id = null) {
    const isEdit = id !== null;
    const currentState = state.get();
    const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario', 'encuentro': 'encuentros' };
    const listKey = listKeyDict[type] || type + 's';
    const list = currentState[listKey] || [];

    let entity = isEdit ? list.find(e => e.id === id) : {};

    const titleEl = document.getElementById('entity-form-title');
    const contentEl = document.getElementById('entity-form-content');
    const overlay = document.getElementById('entity-form-modal');

    titleEl.innerHTML = `<i class="fa-solid ${type === 'npc' ? 'fa-user' : 'fa-map'}"></i> ${isEdit ? 'Editar' : 'Crear'} ${type === 'npc' ? 'Personaje' : 'Localización'}`;

    let html = '';

    if (type === 'npc') {
        html += `
            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
                <!-- Row 1: Nombre y Visibilidad -->
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="flex: 1;">
                        <label style="font-size:0.8rem; font-weight:bold;">Nombre del NPC <span style="color:red;">*</span></label>
                        <input type="text" id="ef-name" value="${entity.name || ''}" placeholder="Ej: Sildar Hallwinter">
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 10px;">
                        <label style="font-size:0.7rem; font-weight:bold;">¿Visible a Jugadores?</label>
                        <input type="checkbox" id="ef-visible" ${entity.isVisible ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--leather-dark);">
                    </div>
                </div>
                
                <!-- Row 2: Stats Grid -->
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="font-size:0.8rem; font-weight:bold;">Raza y Alineamiento</label>
                        <input type="text" id="ef-race" value="${entity.raceAlignment || ''}" placeholder="Ej: Humano Legal Bueno">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; font-weight:bold;">CA</label>
                        <input type="number" id="ef-ac" value="${entity.ac || ''}" placeholder="10">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; font-weight:bold;">HP</label>
                        <input type="number" id="ef-hp" value="${entity.hp || ''}" placeholder="8">
                    </div>
                </div>

                <!-- Row 3: Image -->
                 <div>
                    <label style="font-size:0.8rem; font-weight:bold;"><i class="fa-solid fa-image"></i> Retrato Oficial (Sustituye al actual)</label>
                    <input type="file" id="ef-image" accept="image/*" style="font-size:0.8rem; padding: 0.2rem;">
                    ${entity.url ? `<p style="font-size: 0.75rem; color: var(--gold-dim); margin-top:-0.5rem;">* Ya tiene imagen. Sube otra solo si quieres cambiarla.</p>` : ''}
                </div>

                <!-- Row 4: TextAreas -->
                <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Voz y Comportamiento Público</label>
                     <textarea id="ef-behavior" placeholder="Se frota las manos, habla rápido, cojea levemente..." style="min-height: 50px;">${entity.behavior || ''}</textarea>
                </div>
                 <div>
                     <label style="font-size:0.8rem; font-weight:bold; color:var(--red-ink);">Secreto / Motivación Privada (Solo DM)</label>
                     <textarea id="ef-motivation" placeholder="Sirve a los Magos Rojos, tiene terror a las arañas..." style="min-height: 70px;">${entity.motivation || ''}</textarea>
                </div>
            </div>
        `;
    } else if (type === 'monster') {
        // MONSTER FORM
        html += `
            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
                <h4 style="margin-bottom:0px; color:var(--red-ink);border-bottom:2px solid var(--red-ink);">Datos Principales</h4>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
                    <div>
                        <label style="font-size:0.8rem; font-weight:bold;">Nombre del Monstruo <span style="color:red;">*</span></label>
                        <input type="text" id="ef-name" value="${entity.name || ''}" placeholder="Ej: Goblin">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; font-weight:bold;">¿Visible a Jugadores?</label>
                        <input type="checkbox" id="ef-visible" ${entity.isVisible ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--leather-dark); display:block; margin: 0 auto;">
                    </div>
                </div>

                <div>
                    <label style="font-size:0.8rem; font-weight:bold;">Subtítulo (Tipo, Tamaño y Alineamiento)</label>
                    <input type="text" id="ef-subtitle" value="${entity.subtitle || ''}" placeholder="Ej: Humanoide Pequeño (Goblinoide), Neutral Malvado">
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                    <div><label style="font-size:0.75rem; font-weight:bold;">Clase Armadura</label><input type="text" id="ef-ac" value="${entity.ac || ''}" placeholder="15 (armadura de cuero)"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Puntos de Golpe</label><input type="text" id="ef-hp" value="${entity.hp || ''}" placeholder="7 (2d6)"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Velocidad</label><input type="text" id="ef-speed" value="${entity.speed || '30ft'}" placeholder="30 pies"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Iniciativa</label><input type="text" id="ef-init" value="${entity.init || ''}" placeholder="+2"></div>
                </div>

                <h4 style="margin-top:10px; margin-bottom:0px; color:var(--red-ink);border-bottom:2px solid var(--red-ink);">Características</h4>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; text-align: center;">
                    <div><label style="font-size:0.7rem; font-weight:bold;">FUE</label><input type="number" id="ef-str" value="${entity.str || 10}" style="padding: 0.2rem; text-align:center;"></div>
                    <div><label style="font-size:0.7rem; font-weight:bold;">DES</label><input type="number" id="ef-dex" value="${entity.dex || 10}" style="padding: 0.2rem; text-align:center;"></div>
                    <div><label style="font-size:0.7rem; font-weight:bold;">CON</label><input type="number" id="ef-con" value="${entity.con || 10}" style="padding: 0.2rem; text-align:center;"></div>
                    <div><label style="font-size:0.7rem; font-weight:bold;">INT</label><input type="number" id="ef-int" value="${entity.int || 10}" style="padding: 0.2rem; text-align:center;"></div>
                    <div><label style="font-size:0.7rem; font-weight:bold;">SAB</label><input type="number" id="ef-wis" value="${entity.wis || 10}" style="padding: 0.2rem; text-align:center;"></div>
                    <div><label style="font-size:0.7rem; font-weight:bold;">CAR</label><input type="number" id="ef-cha" value="${entity.cha || 10}" style="padding: 0.2rem; text-align:center;"></div>
                </div>

                <h4 style="margin-top:10px; margin-bottom:0px; color:var(--red-ink);border-bottom:2px solid var(--red-ink);">Detalles Adicionales</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <div><label style="font-size:0.75rem; font-weight:bold;">Tiradas de Salvación</label><input type="text" id="ef-saves" value="${entity.saves || ''}" placeholder="Ej: Des +4, Sab +1"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Habilidades</label><input type="text" id="ef-skills" value="${entity.skills || ''}" placeholder="Ej: Sigilo +6"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Sentidos</label><input type="text" id="ef-senses" value="${entity.senses || ''}" placeholder="Visión en la oscuridad 60', Percepción pasiva 9"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Idiomas</label><input type="text" id="ef-langs" value="${entity.langs || ''}" placeholder="Común, Goblin"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Desafío (VD/PX)</label><input type="text" id="ef-challenge" value="${entity.challenge || ''}" placeholder="1/4 (50 PX)"></div>
                    <div><label style="font-size:0.75rem; font-weight:bold;">Vulnerabilidades/Inmuni.</label><input type="text" id="ef-immunities" value="${entity.immunities || ''}" placeholder="Ej: Fuego"></div>
                </div>

                <h4 style="margin-top:10px; margin-bottom:0px; color:var(--red-ink);border-bottom:2px solid var(--red-ink);">Bloques de Texto</h4>
                 <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Rasgos (Features)</label>
                     <textarea id="ef-features" placeholder="Ej: Huida Ágil: el goblin puede destrabarse o esconderse..." style="min-height: 60px;">${entity.features || ''}</textarea>
                 </div>
                 <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Acciones Principales</label>
                     <textarea id="ef-actions" placeholder="Ej: Cimitarra: Ataque cuerpo a cuerpo..." style="min-height: 80px;">${entity.actions || ''}</textarea>
                 </div>
                  <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Acciones Adicionales (Opcional)</label>
                     <textarea id="ef-bonus" placeholder="" style="min-height: 60px;">${entity.bonus || ''}</textarea>
                 </div>
                 <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Reacciones (Opcional)</label>
                     <textarea id="ef-reactions" placeholder="" style="min-height: 60px;">${entity.reactions || ''}</textarea>
                 </div>
                 <div>
                     <label style="font-size:0.8rem; font-weight:bold;">Equipo (Opcional)</label>
                     <textarea id="ef-equip" placeholder="" style="min-height: 40px;">${entity.equip || ''}</textarea>
                 </div>

                <div>
                    <label style="font-size:0.8rem; font-weight:bold;"><i class="fa-solid fa-image"></i> Fotografía del Monstruo</label>
                    <input type="file" id="ef-image" accept="image/*" style="font-size:0.8rem; padding: 0.2rem;">
                    ${entity.url ? `<p style="font-size: 0.75rem; color: var(--gold-dim); margin-top:-0.5rem;">* Ya tiene foto. Selecciona solo si deseas sustituirla.</p>` : ''}
                </div>
            </div>
        `;
    } else if (type === 'map') {
        // MAP FORM
        html += `
            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="flex: 1;">
                        <label style="font-size:0.8rem; font-weight:bold;">Nombre del Mapa/Lugar <span style="color:red;">*</span></label>
                        <input type="text" id="ef-name" value="${entity.name || ''}" placeholder="Ej: Guarida Crackmaw">
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 10px;">
                        <label style="font-size:0.7rem; font-weight:bold;">¿Visible a Jugadores?</label>
                        <input type="checkbox" id="ef-visible" ${entity.isVisible ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--leather-dark);">
                    </div>
                </div>

                 <div>
                    <label style="font-size:0.8rem; font-weight:bold;">Entorno / Tipo</label>
                    <input type="text" id="ef-type" value="${entity.environmentType || ''}" placeholder="Ej: Ruinas Subterráneas, Taberna">
                </div>

                <!-- Image -->
                 <div>
                    <label style="font-size:0.8rem; font-weight:bold;"><i class="fa-solid fa-image"></i> Fotografía del Mapa</label>
                    <input type="file" id="ef-image" accept="image/*" style="font-size:0.8rem; padding: 0.2rem;">
                    ${entity.url ? `<p style="font-size: 0.75rem; color: var(--gold-dim); margin-top:-0.5rem;">* Ya tiene mapa. Subir uno nuevo lo reemplazará.</p>` : ''}
                </div>

                 <div>
                     <label style="font-size:0.8rem; font-weight:bold; color:var(--red-ink);">Notas Privadas del DM (Trampas, monstruos, DCs)</label>
                     <textarea id="ef-dmnotes" placeholder="Secreto nivel pasillo este: Trampa foso (DC 15 Dex)..." style="min-height: 120px;">${entity.dmNotes || ''}</textarea>
                </div>
            </div>
        `;
    } else if (type === 'encuentro') {
        // ENCUENTRO FORM
        const { bestiario, maps } = currentState;
        window.currentEncounterBuilder = isEdit ? JSON.parse(JSON.stringify(entity.monsters || [])) : [];

        html += `
            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
                <input type="text" id="ef-name" value="${entity.name || ''}" placeholder="Nombre de la Escena (Ej: Emboscada en el camino)">
                
                <div style="display: flex; gap: 1rem;">
                    <select id="ef-location" style="flex: 1; padding: 0.5rem;">
                        <option value="">-- Sin localización específica --</option>
                        ${maps.map(m => `<option value="${m.name}" ${entity.location === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>

                <div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 8px; border: 1px solid var(--parchment-dark);">
                    <h5>Añadir Enemigos</h5>
                    <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <select id="ef-monster-select" style="flex:3; padding: 0.5rem; min-width: 120px;">
                            <option value="">-- Selecciona Monstruo --</option>
                            ${bestiario.map(b => `<option value="${b.id}">${b.name} (CA ${b.ac}, HP ${b.hp})</option>`).join('')}
                        </select>
                        <input type="number" id="ef-monster-qty" value="1" min="1" style="flex:1; padding: 0.5rem; text-align:center; min-width: 50px;" placeholder="Cant.">
                        <input type="number" id="ef-monster-init" value="" min="1" max="30" style="flex:1; padding: 0.5rem; text-align:center; min-width: 50px;" placeholder="Inic.">
                        <button class="btn" onclick="window.addMonsterToBuilder()" title="Añadir monstruo"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <ul id="ef-builder-list" style="list-style:none; padding:0; font-size: 0.9em; margin-bottom:0;">
                    </ul>
                </div>

                <div>
                    <label style="font-size:0.8rem; font-weight:bold;"><i class="fa-solid fa-sack-dollar"></i> Botín del Encuentro</label>
                    <input type="text" id="ef-loot" value="${entity.loot || ''}" placeholder="Ej: 50 po, 2 Pociones de Curación y Espada Larga" style="padding: 0.5rem;">
                </div>
            </div>
        `;
    }

    // Modal Action Buttons
    html += `
         <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem; border-top: 2px solid var(--parchment-dark); padding-top: 1rem;">
            <button class="btn btn-danger" onclick="window.closeEntityModal()">Cancelar</button>
            <button class="btn" id="ef-save-btn" onclick="window.saveEntityForm(event, '${type}', ${isEdit ? `'${id}'` : `null`})">
                <i class="fa-solid fa-cloud-arrow-up"></i> Guardar
            </button>
        </div>
    `;

    contentEl.innerHTML = html;
    overlay.classList.remove('hidden');

    if (type === 'encuentro') window.renderEncounterBuilderList();
};

window.closeEntityModal = function () {
    document.getElementById('entity-form-modal').classList.add('hidden');
    document.getElementById('entity-form-content').innerHTML = ''; // Limpiar memoria
};

window.saveEntityForm = async function (event, type, id) {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;

    // Validar Requisitos Base
    const nameInput = document.getElementById('ef-name').value.trim();
    if (!nameInput) {
        alert("El Nombre es obligatorio.");
        return;
    }

    // Iniciar Feedback Visual
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Grabando...';
    btn.disabled = true;

    try {
        let listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario' };
        let listKey = listKeyDict[type] || type + 's';

        let imageUrl = id ? state.get()[listKey].find(e => e.id === id).url : ''; // Conservar vieja si existe

        // Comprobar Si se Adjuntó un Fichero
        const fileInput = document.getElementById('ef-image');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            imageUrl = await storageAdapter.uploadCampaignMedia(file);
        }

        // Recuperar y Empaquetar Datos
        let entityData = {
            name: nameInput,
            isVisible: document.getElementById('ef-visible') ? document.getElementById('ef-visible').checked : false,
            url: imageUrl
        };

        if (type === 'npc') {
            entityData.raceAlignment = document.getElementById('ef-race').value.trim();
            entityData.ac = document.getElementById('ef-ac').value.trim();
            entityData.hp = document.getElementById('ef-hp').value.trim();
            entityData.behavior = document.getElementById('ef-behavior').value.trim();
            entityData.motivation = document.getElementById('ef-motivation').value.trim();
            // Migrar `description` al form o abandonarlo. Como abandonamos description, dejamos lo vital nuevo.
            entityData.description = "";
        } else if (type === 'monster') {
            entityData.subtitle = document.getElementById('ef-subtitle').value.trim();
            entityData.ac = document.getElementById('ef-ac').value.trim();
            entityData.hp = document.getElementById('ef-hp').value.trim();
            entityData.speed = document.getElementById('ef-speed').value.trim();
            entityData.init = document.getElementById('ef-init').value.trim();

            // Características
            entityData.str = document.getElementById('ef-str').value.trim();
            entityData.dex = document.getElementById('ef-dex').value.trim();
            entityData.con = document.getElementById('ef-con').value.trim();
            entityData.int = document.getElementById('ef-int').value.trim();
            entityData.wis = document.getElementById('ef-wis').value.trim();
            entityData.cha = document.getElementById('ef-cha').value.trim();

            // Detalles Adicionales
            entityData.saves = document.getElementById('ef-saves').value.trim();
            entityData.skills = document.getElementById('ef-skills').value.trim();
            entityData.senses = document.getElementById('ef-senses').value.trim();
            entityData.langs = document.getElementById('ef-langs').value.trim();
            entityData.challenge = document.getElementById('ef-challenge').value.trim();
            entityData.immunities = document.getElementById('ef-immunities').value.trim();

            // Bloques de Texto
            entityData.features = document.getElementById('ef-features').value.trim();
            entityData.actions = document.getElementById('ef-actions').value.trim();
            entityData.bonus = document.getElementById('ef-bonus').value.trim();
            entityData.reactions = document.getElementById('ef-reactions').value.trim();
            entityData.equip = document.getElementById('ef-equip').value.trim();
        } else if (type === 'encuentro') {
            entityData.location = document.getElementById('ef-location').value;
            entityData.loot = document.getElementById('ef-loot').value.trim();
            entityData.monsters = window.currentEncounterBuilder || [];
            // Validar que todos los monstruos tengan iniciativa
            const missingInit = entityData.monsters.some(m => !m.initiative || isNaN(m.initiative));
            if (missingInit && entityData.monsters.length > 0) {
                alert('Todos los packs de monstruos deben tener un valor de Iniciativa.');
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }
        } else {
            entityData.environmentType = document.getElementById('ef-type').value.trim();
            entityData.dmNotes = document.getElementById('ef-dmnotes').value.trim();
        }

        // Fusionar al State
        const currentState = state.get();
        const list = currentState[listKey] || [];

        if (id) {
            // Edit
            const updatedList = list.map(e => e.id === id ? { ...e, ...entityData } : e);
            await state.update({ [listKey]: updatedList });
        } else {
            // Create
            const newEntity = {
                id: type + '_' + Date.now(),
                ...entityData,
                notes: [], // Importante: Array salvavidas para player private notes.
                secrets: [] // VITAL: Evitar crashes visuales al iterar en vistas de Jugador
            };
            await state.update({ [listKey]: [...list, newEntity] });
        }

        window.closeEntityModal();
    } catch (e) {
        console.error("Error al guardar la Entidad:", e);
        alert("Hubo un fallo al subir la fotografía o guardar los datos. Ver consola.");
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
};

window.deleteEntity = async function (type, id) {
    if (confirm(`¿Estás completamente seguro de borrar esta entidad para siempre? Los jugadores también perderán los apuntes que hayan hecho sobre ella.`)) {
        const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario', 'encuentro': 'encuentros' };
        const listKey = listKeyDict[type] || type + 's';
        const list = state.get()[listKey] || [];
        const updatedList = list.filter(e => e.id !== id);

        await state.update({ [listKey]: updatedList });
    }
};

// ----------------------------------------------------
// Library Features
// ----------------------------------------------------

window.renderLibrary = function (currentState) {
    const { recursos, session } = currentState;
    const isDM = session.role === 'DM';
    const container = document.getElementById('tab-library');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Biblioteca de Neverwinter</h3>
            ${isDM ? `<button class="btn" onclick="window.showAddRecursoForm()"><i class="fa-solid fa-plus"></i> Añadir Tomo/Recurso</button>` : ''}
        </div>
        
        ${isDM ? `
        <div id="formulario-recurso" class="card" style="display: none; margin-bottom: 1.5rem; background: rgba(255,255,255,0.4); border: 2px dashed var(--leather-light);">
            <h4 style="margin-top:0; color:var(--dark-crimson);">Nuevo Recurso Visual</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <input type="text" id="nuevo-recurso-nombre" placeholder="Nombre del Tomo (Ej: Manual del Jugador)" style="padding: 0.5rem;">
                <input type="url" id="nuevo-recurso-portada" placeholder="URL de la Imagen de Portada" style="padding: 0.5rem;">
                <input type="url" id="nuevo-recurso-enlace" placeholder="URL del Enlace de Descarga" style="padding: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn btn-primary" onclick="window.submitRecurso()">Guardar Tomo</button>
                    <button class="btn" onclick="window.hideAddRecursoForm()">Cancelar</button>
                </div>
            </div>
        </div>
        ` : ''}
    `;

    if (!recursos || recursos.length === 0) {
        html += '<p class="text-muted">La estantería está vacía en este momento.</p>';
        container.innerHTML = html;
        return;
    }

    html += '<div class="biblioteca-grid">';
    recursos.forEach(r => {
        html += `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 100%;">
                ${isDM ? `
                <div style="position: absolute; top: -10px; right: -10px; z-index: 10; display: flex; gap: 5px;">
                    <button onclick="window.showAddRecursoForm('${r.id}')" style="background: var(--leather-dark); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; justify-content: center; align-items: center;" title="Editar Recurso"><i class="fa-solid fa-pen" style="font-size: 0.7em;"></i></button>
                    <button onclick="window.deleteRecurso('${r.id}')" style="background: var(--red-ink); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; justify-content: center; align-items: center;" title="Borrar Recurso"><i class="fa-solid fa-times" style="font-size: 0.9em;"></i></button>
                </div>
                ` : ''}
                <a href="${r.enlaceUrl}" target="_blank" class="biblioteca-item">
                    <img src="${r.portadaUrl}" alt="${r.nombre}" onerror="this.src='https://via.placeholder.com/150x200?text=Manual'">
                    <span>${r.nombre}</span>
                </a>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
};

let editingRecursoId = null;

window.showAddRecursoForm = function (id = null) {
    editingRecursoId = id;
    const form = document.getElementById('formulario-recurso');

    if (id) {
        const recurso = state.get().recursos.find(r => r.id === id);
        if (recurso) {
            document.getElementById('nuevo-recurso-nombre').value = recurso.nombre;
            document.getElementById('nuevo-recurso-portada').value = recurso.portadaUrl;
            document.getElementById('nuevo-recurso-enlace').value = recurso.enlaceUrl;
        }
    } else {
        document.getElementById('nuevo-recurso-nombre').value = '';
        document.getElementById('nuevo-recurso-portada').value = '';
        document.getElementById('nuevo-recurso-enlace').value = '';
    }

    if (form) form.style.display = 'block';
};

window.hideAddRecursoForm = function () {
    const form = document.getElementById('formulario-recurso');
    if (form) {
        form.style.display = 'none';
        editingRecursoId = null;
    }
};

window.submitRecurso = async function () {
    const nombre = document.getElementById('nuevo-recurso-nombre').value.trim();
    const portadaUrl = document.getElementById('nuevo-recurso-portada').value.trim();
    const enlaceUrl = document.getElementById('nuevo-recurso-enlace').value.trim();

    if (!nombre || !portadaUrl || !enlaceUrl) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    const currentRecursos = state.get().recursos || [];

    if (editingRecursoId) {
        // Edit Mode
        const updatedRecursos = currentRecursos.map(r =>
            r.id === editingRecursoId ? { ...r, nombre, portadaUrl, enlaceUrl } : r
        );
        await state.update({ recursos: updatedRecursos });
    } else {
        // Create Mode
        const newRecurso = {
            id: 'rec_' + Date.now(),
            nombre,
            portadaUrl,
            enlaceUrl
        };
        await state.update({ recursos: [...currentRecursos, newRecurso] });
    }

    editingRecursoId = null;
    window.hideAddRecursoForm();
    // pero si hace falta podríamos llamar a hideAddRecursoForm()
};

window.deleteRecurso = function (id) {
    if (confirm("¿Seguro que deseas borrar este tomo de la biblioteca?")) {
        const currentRecursos = state.get().recursos || [];
        state.update({ recursos: currentRecursos.filter(r => r.id !== id) });
    }
};

window.toggleGrimorio = function () {
    const grimorio = document.getElementById('sheet-grimorio-container');
    if (grimorio) {
        if (grimorio.style.display === 'none') {
            grimorio.style.display = 'block';
            setTimeout(() => grimorio.scrollIntoView({ behavior: 'smooth' }), 100);
        } else {
            grimorio.style.display = 'none';
        }
    }
};

window.uploadPlayerAvatar = async function (input, playerId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const label = input.closest('label');
    const originalText = label.innerHTML;
    label.innerHTML = 'Subiendo... <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const publicUrl = await storageAdapter.uploadAvatar(file);

        // Update preview in UI immediately
        const avatarContainer = document.querySelector('.header-avatar');
        if (avatarContainer) {
            avatarContainer.innerHTML = `<img src="${publicUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }

        // Save silently to global states so it gets picked up on "Guardar Cambios"
        const currentPlayers = state.get().players;
        const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
        if (playerIndex > -1) {
            currentPlayers[playerIndex].avatarUrl = publicUrl;
        }

        label.innerHTML = '¡Subido! <i class="fa-solid fa-check"></i>';
        setTimeout(() => { label.innerHTML = originalText; }, 2000);

    } catch (error) {
        console.error("Error al subir avatar:", error);
        alert("Hubo un error al subir la imagen. Comprueba la consola.");
        label.innerHTML = originalText;
    }
};

// ----------------------------------------------------
// QUICK LOOK MODAL (Double Click / Double Tap Modal)
// ----------------------------------------------------
window.openQuickLook = function (id, type) {
    const overlay = document.getElementById('quick-look-modal-overlay');
    const container = document.getElementById('quick-look-container');
    const currentState = window.state.get();

    // Save current mode and enforce view-only mode for Quick Look to avoid accidental edits
    const oldEditMode = window.isSheetEditMode;
    const oldSheetPlayer = window.currentSheetPlayerId;
    window.isSheetEditMode = false;

    if (type === 'player') {
        // DRY: Reutilizamos la función nativa que pinta fichas pero inyectada en el modal.
        renderPlayerSheet(id, currentState.players, 'quick-look-container');
    } else if (type === 'npc') {
        const npc = currentState.npcs.find(n => n.id === id);
        if (npc) {
            let html = `
                 <div class="card view-mode" style="padding: 2rem; border: none; box-shadow: none;">
                     <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 1rem; color: var(--leather-dark);">${npc.name}</h2>
                     <p style="white-space: pre-wrap; font-size: 1.2rem; line-height: 1.6;">${npc.description}</p>
                 `;
            if (npc.secrets && npc.secrets.length > 0) {
                const visibleSecrets = npc.secrets.filter(s => currentState.session.role === 'DM' || s.isVisible);
                if (visibleSecrets.length > 0) {
                    html += visibleSecrets.map(s => `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 1.2rem; margin-top: 1rem;"><i class="fa-solid fa-eye"></i> <strong>Secreto:</strong> ${s.text}</p>`).join('');
                }
            }
            html += `</div>`;
            container.innerHTML = html;
        }
    }

    // Restore variables so the rest of the UI doesn't break when we close
    window.isSheetEditMode = oldEditMode;
    window.currentSheetPlayerId = oldSheetPlayer; // Fixes side-effect of renderPlayerSheet

    overlay.classList.remove('hidden');
};

window.closeQuickLook = function () {
    const overlay = document.getElementById('quick-look-modal-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
        document.getElementById('quick-look-container').innerHTML = ''; // Clear DOM memory
    }
};

// Escape Key Support for closing the Giant Modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeQuickLook();
        window.closeLightbox();
    }
});

// ----------------------------------------------------
// LIGHTBOX MODAL (Image Gallery for NPCs and Maps)
// ----------------------------------------------------
window.openLightbox = function (url) {
    if (!url) return;
    const overlay = document.getElementById('lightbox-modal-overlay');
    const image = document.getElementById('lightbox-image');

    // Asignar url y mostrar
    image.src = url;
    overlay.classList.remove('hidden');
};

window.closeLightbox = function () {
    const overlay = document.getElementById('lightbox-modal-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
        document.getElementById('lightbox-image').src = ""; // Liberar memoria
    }
};

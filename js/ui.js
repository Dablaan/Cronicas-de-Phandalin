import { state } from './state.js';

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
            players: [...currentPlayers, newPlayer],
            session: { role: 'Player', playerId: newPlayerId }
        });
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

    let html = '<div class="grid-2">';
    players.forEach(p => {
        html += `
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <button class="btn" onclick="window.loginAsPlayer('${p.id}')" style="flex: 1;">
                    ${p.name || 'Sin nombre'} (Lvl ${p.level})
                </button>
                <button class="btn btn-danger" onclick="window.deletePlayer('${p.id}', '${(p.name || 'Sin nombre').replace(/'/g, "\\'")}')" title="Borrar Personaje para siempre" style="padding: 0.2rem 0.6rem;">
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
    state.update({ session: { role: 'Player', playerId } });
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
    if (isDM) {
        tabSheetBtn.innerHTML = '<i class="fa-solid fa-dragon"></i> Dashboard';
    } else {
        tabSheetBtn.innerHTML = '<i class="fa-solid fa-scroll"></i> Ficha';
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
    }
}

// ----------------------------------------------------
// Player Features: Sheet
// ----------------------------------------------------

function renderPlayerSheet(playerId, players) {
    const container = document.getElementById('tab-sheet');
    const player = players.find(p => p.id === playerId);

    if (!player) {
        container.innerHTML = '<p>Error: Jugador no encontrado.</p>';
        return;
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
    html += `<div class="area-hp">${renderHPDeathComp(playerId, player)}</div>`;
    html += `<div class="area-defense">${renderDefenseComp(player)}</div>`;
    html += `<div class="area-saves">${renderSavesComp(player)}</div>`;
    html += `<div class="area-passive">${renderPassiveComp(player)}</div>`;
    html += `<div class="area-skills">${renderSkillsComp(player)}</div>`;
    html += `<div class="area-attacks">${renderAttacksComp(playerId, player)}</div>`;
    html += `<div class="area-inv">${renderInventoryComp(player)}</div>`;
    html += `<div class="area-traits">${renderTraitsComp(player)}</div>`;
    html += '</div>';

    html += renderActionBarComp(playerId);

    html += `<div id="sheet-grimorio-container" style="display: none;">${renderGrimorioComp(playerId, player)}</div>`;
    html += '</div>';

    container.innerHTML = html;
}

function renderSheetHeader(playerId, player) {
    return `
    <div class="sheet-header-box" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div class="sheet-header-name" style="flex: 1;">
            <input type="text" name="playerName" value="${player.playerName || ''}" placeholder="Nombre del Jugador" style="font-size: 0.8rem; border-bottom: none; color: var(--text-muted); margin-bottom: 0;">
            <input type="text" name="name" value="${player.name || ''}" placeholder="Nombre del Personaje" style="font-size: 1.5rem; margin-bottom: 0;">
        </div>
        <div style="flex: 0 0 auto; text-align: center; color: var(--gold-dim);">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--leather-dark); overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--parchment-dark);">
                <i class="fa-solid fa-dragon" style="font-size: 2.5rem; object-fit: cover;"></i>
            </div>
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
                    <input type="number" name="hpCurrent" value="${player.hpCurrent}" style="width:45px; text-align:center; font-size:1.5rem; border:none; border-bottom: 2px solid var(--leather-dark); background:transparent; padding:0; margin:0;">
                    <span style="font-size:0.9rem; color:var(--text-muted); margin:0 2px;">/</span>
                    <input type="number" name="hpMax" value="${player.hpMax}" style="width:35px; text-align:center; font-size:0.9rem; border:none; background:transparent; padding:0; margin:0;">
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
                    <input type="checkbox" name="inspiration" ${player.inspiration ? 'checked' : ''} style="width:18px; height:18px; accent-color: var(--gold-dim); cursor:pointer;">
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

    let html = '<div class="card" style="padding: 0.5rem 1rem;">';
    html += '<details class="sheet-accordion" open>';
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
    return `
    <div class="card">
        <details class="sheet-accordion" open>
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
    return `
    <div class="card">
        <details class="sheet-accordion" open>
            <summary style="font-size:1.17em; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--parchment-dark); cursor:pointer;"><i class="fa-solid fa-chevron-down accordion-icon"></i> <i class="fa-solid fa-scroll"></i> Dotes y Rasgos</summary>
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
    const p = currentState.players.find(p => p.id === playerId);
    if (!p) return;

    const max = p.hpMax || 0;
    let current = p.hpCurrent || 0;
    current += amount;
    if (current > max) current = max;
    if (current < 0) current = 0;

    p.hpCurrent = current;

    // Save explicitly without invoking state.update to prevent full re-render
    if (window.storageAdapter) {
        window.storageAdapter.save(currentState);
    }

    // Manually update the DOM for the HP input and bar in the individual sheet
    const hpInput = document.querySelector('input[name="hpCurrent"]');
    if (hpInput) hpInput.value = current;

    const hpBarPercent = Math.max(0, Math.min(100, (current / max) * 100));
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
            <div class="card">
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
    const { session, npcs, chronicles } = currentState;
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
        const playerNotesOnNpc = chronicles[`${session.playerId}_npc_${n.id} `] || '';
        html += `
            <div class="card">
                 <h4>${n.name}</h4>
                 <p style="white-space: pre-wrap;">${n.description}</p>
                 ${n.secrets.filter(s => s.isVisible).map(s => `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap;"><strong>Secreto Descubierto:</strong> ${s.text}</p>`).join('')}
        <div class="mt-1">
            <label style="font-size: 0.9em; color: var(--text-muted);"><i class="fa-solid fa-feather"></i> Tus apuntes sobre ${n.name}:</label>
            <textarea id="chronicle-npc-${n.id}" placeholder="Empieza a escribir..." style="min-height: 120px; font-family: 'Lora', serif; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; resize: vertical; margin-bottom: 0.5rem;" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'">${playerNotesOnNpc}</textarea>
            <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.saveChronicle(event, '${session.playerId}', 'npc_${n.id}')">Guardar</button>
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
    const { session, maps, chronicles } = currentState;
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
        const playerNotesOnMap = chronicles[`${session.playerId}_map_${m.id} `] || '';
        html += `
            <div class="card">
                <h4>${m.name}</h4>
                 ${m.url ? `<p><a href="${m.url}" target="_blank" style="color: var(--leather-dark); font-weight: bold;">[Ver Mapa Original]</a></p>` : ''}
                 ${m.secrets.filter(s => s.isVisible).map(s => `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap;"><strong>Descubrimiento:</strong> ${s.text}</p>`).join('')}
        <div class="mt-1">
            <label style="font-size: 0.9em; color: var(--text-muted);"><i class="fa-solid fa-feather"></i> Tus apuntes:</label>
            <textarea id="chronicle-map-${m.id}" placeholder="Empieza a escribir..." style="min-height: 120px; font-family: 'Lora', serif; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; resize: vertical; margin-bottom: 0.5rem;" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'">${playerNotesOnMap}</textarea>
            <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.saveChronicle(event, '${session.playerId}', 'map_${m.id}')">Guardar</button>
        </div>
             </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

window.saveChronicle = function (event, playerId, entityId) {
    const text = document.getElementById(`chronicle - ${entityId.replace('_', '-')} `).value;
    const key = `${playerId}_${entityId} `;
    const chronicles = { ...state.get().chronicles, [key]: text };
    state.update({ chronicles });

    // Quick aesthetic feedback
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => btn.innerHTML = oldText, 1000);
}

// Stubs for DM versions
window.renderDMMirrorNotes = function (currentState) {
    const { players, notes, chronicles, session } = currentState;
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
            <h4><i class="fa-solid fa-book-journal-whills"></i> Diario Privado de ${selectedPlayer.name}</h4>
            <div style="white-space: pre-wrap; margin-top: 1rem; padding: 1rem; border-left: 3px solid var(--leather-dark);">${personalNotes}</div>
        </div>
    `;

    // Filter chronicles belonging to this player
    const playerChroniclesKeys = Object.keys(chronicles).filter(k => k.startsWith(currentlySelected + '_') && chronicles[k].trim() !== '');

    html += `<h4><i class="fa-solid fa-feather"></i> Crónicas Guardadas(NPCs y Mapas)</h4>`;

    if (playerChroniclesKeys.length === 0) {
        html += '<p class="text-muted">No ha escrito apuntes sobre ningún NPC o Mapa aún.</p>';
    } else {
        html += '<div class="grid-2">';
        playerChroniclesKeys.forEach(k => {
            const entityId = k.replace(currentlySelected + '_', '');
            const isMap = entityId.startsWith('map_');
            const trueId = entityId; // It's already map_123 or npc_123

            // Find entity name
            let entityName = "Desconocido";
            if (isMap) {
                const map = currentState.maps.find(m => m.id === trueId);
                if (map) entityName = map.name;
            } else {
                const npc = currentState.npcs.find(n => n.id === trueId);
                if (npc) entityName = npc.name;
            }

            html += `
                <div class="card" style="background: rgba(255,255,255,0.3);">
                    <h5 style="color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.2rem;"><i class="fa-solid ${isMap ? 'fa-map' : 'fa-user'}"></i> ${entityName}</h5>
                    <div style="white-space: pre-wrap; font-size: 0.9em; margin-top: 0.5rem;">${chronicles[k]}</div>
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
            <button class="btn" onclick="window.createEntity('npc')"><i class="fa-solid fa-plus"></i> Nuevo NPC</button>
        </div>
    `;

    html += '<div class="grid-2">';
    if (npcs.length === 0) html += '<p class="text-muted">No hay NPCs.</p>';
    npcs.forEach(n => {
        html += `
            <div class="card" style="${n.isVisible ? '' : 'opacity: 0.7; border-style: dashed;'}">
                <div class="flex-between mb-1">
                    <input type="text" value="${n.name}" style="font-weight: bold; width: 60%; margin-bottom: 0;" onchange="window.updateEntity('npc', '${n.id}', 'name', this.value)">
                    <button class="btn ${n.isVisible ? '' : 'btn-danger'}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.updateEntity('npc', '${n.id}', 'isVisible', ${!n.isVisible})">
                        <i class="fa-solid ${n.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i> ${n.isVisible ? 'Visible' : 'Oculto'}
                    </button>
                </div>
                <textarea style="min-height: 60px;" placeholder="Descripción..." onchange="window.updateEntity('npc', '${n.id}', 'description', this.value)">${n.description}</textarea>
                
                <div class="mt-1">
                    <div class="flex-between mb-1">
                         <span style="font-size: 0.9em; font-weight: bold; color: var(--text-muted);">Secretos</span>
                         <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 0.7rem;" onclick="window.addSecret('npc', '${n.id}')"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    ${n.secrets.map(s => `
                        <div class="flex-row mb-1">
                            <button class="btn" style="padding: 0.2rem; font-size: 0.8rem; background: transparent; border: none; color: ${s.isVisible ? 'var(--leather-dark)' : 'var(--text-muted)'}; box-shadow: none;" onclick="window.toggleSecret('npc', '${n.id}', '${s.id}')">
                                <i class="fa-solid ${s.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                            <input type="text" value="${s.text}" style="margin-bottom: 0; font-size: 0.9em;" placeholder="Escribe el secreto..." onchange="window.updateSecretText('npc', '${n.id}', '${s.id}', this.value)">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

window.renderDMMaps = function (currentState) {
    const { maps } = currentState;
    const container = document.getElementById('tab-maps');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Gestión de Mapas</h3>
            <button class="btn" onclick="window.createEntity('map')"><i class="fa-solid fa-plus"></i> Nuevo Mapa</button>
        </div>
    `;

    html += '<div class="grid-2">';
    if (maps.length === 0) html += '<p class="text-muted">No hay Mapas.</p>';
    maps.forEach(m => {
        html += `
            <div class="card" style="${m.isVisible ? '' : 'opacity: 0.7; border-style: dashed;'}">
                <div class="flex-between mb-1">
                    <input type="text" value="${m.name}" style="font-weight: bold; width: 60%; margin-bottom: 0;" onchange="window.updateEntity('map', '${m.id}', 'name', this.value)">
                    <button class="btn ${m.isVisible ? '' : 'btn-danger'}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.updateEntity('map', '${m.id}', 'isVisible', ${!m.isVisible})">
                        <i class="fa-solid ${m.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i> ${m.isVisible ? 'Visible' : 'Oculto'}
                    </button>
                </div>
                <input type="text" placeholder="URL del mapa..." value="${m.url || ''}" onchange="window.updateEntity('map', '${m.id}', 'url', this.value)">
                
                <div class="mt-1">
                    <div class="flex-between mb-1">
                         <span style="font-size: 0.9em; font-weight: bold; color: var(--text-muted);">Secretos / Sitios Importantes</span>
                         <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 0.7rem;" onclick="window.addSecret('map', '${m.id}')"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    ${m.secrets.map(s => `
                        <div class="flex-row mb-1">
                            <button class="btn" style="padding: 0.2rem; font-size: 0.8rem; background: transparent; border: none; color: ${s.isVisible ? 'var(--leather-dark)' : 'var(--text-muted)'}; box-shadow: none;" onclick="window.toggleSecret('map', '${m.id}', '${s.id}')">
                                <i class="fa-solid ${s.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                            <input type="text" value="${s.text}" style="margin-bottom: 0; font-size: 0.9em;" placeholder="Sitio descubierto..." onchange="window.updateSecretText('map', '${m.id}', '${s.id}', this.value)">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

window.createEntity = function (type) {
    const list = state.get()[type + 's'];
    const newEntity = {
        id: type + '_' + Date.now(),
        name: 'Nuevo ' + (type === 'npc' ? 'NPC' : 'Mapa'),
        description: '',
        url: '',
        isVisible: false,
        secrets: []
    };
    state.update({ [type + 's']: [...list, newEntity] });
};

window.updateEntity = function (type, id, field, value) {
    const listKey = type + 's';
    const list = state.get()[listKey].map(e => e.id === id ? { ...e, [field]: value } : e);
    state.update({ [listKey]: list });
};

window.addSecret = function (type, id) {
    const listKey = type + 's';
    const list = state.get()[listKey].map(e => {
        if (e.id === id) {
            return { ...e, secrets: [...e.secrets, { id: 'sec_' + Date.now(), text: '', isVisible: false }] };
        }
        return e;
    });
    state.update({ [listKey]: list });
};

window.toggleSecret = function (type, id, secretId) {
    const listKey = type + 's';
    const list = state.get()[listKey].map(e => {
        if (e.id === id) {
            return {
                ...e,
                secrets: e.secrets.map(s => s.id === secretId ? { ...s, isVisible: !s.isVisible } : s)
            };
        }
        return e;
    });
    state.update({ [listKey]: list });
};

window.updateSecretText = function (type, id, secretId, text) {
    const listKey = type + 's';
    const list = state.get()[listKey].map(e => {
        if (e.id === id) {
            return {
                ...e,
                secrets: e.secrets.map(s => s.id === secretId ? { ...s, text } : s)
            };
        }
        return e;
    });
    state.update({ [listKey]: list });
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
                ${isDM ? `<button onclick="window.deleteRecurso('${r.id}')" style="position: absolute; top: -10px; right: -10px; background: var(--red-ink); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; z-index: 10;" title="Borrar Recurso"><i class="fa-solid fa-times"></i></button>` : ''}
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

window.showAddRecursoForm = function () {
    const form = document.getElementById('formulario-recurso');
    if (form) form.style.display = 'block';
};

window.hideAddRecursoForm = function () {
    const form = document.getElementById('formulario-recurso');
    if (form) {
        form.style.display = 'none';
        document.getElementById('nuevo-recurso-nombre').value = '';
        document.getElementById('nuevo-recurso-portada').value = '';
        document.getElementById('nuevo-recurso-enlace').value = '';
    }
};

window.submitRecurso = function () {
    const nombre = document.getElementById('nuevo-recurso-nombre').value.trim();
    const portadaUrl = document.getElementById('nuevo-recurso-portada').value.trim();
    const enlaceUrl = document.getElementById('nuevo-recurso-enlace').value.trim();

    if (!nombre || !portadaUrl || !enlaceUrl) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    const newRecurso = {
        id: 'rec_' + Date.now(),
        nombre,
        portadaUrl,
        enlaceUrl
    };

    const currentRecursos = state.get().recursos || [];
    state.update({ recursos: [...currentRecursos, newRecurso] });

    // El state.update disparará un re-render de la UI de todos modos
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

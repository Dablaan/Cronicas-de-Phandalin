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
            class: '',
            level: 1,
            hpCurrent: 10,
            hpMax: 10,
            ac: 10,
            stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
            deathSaves: { successes: 0, failures: 0 },
            attacks: [],
            equipment: { equipped: '', backpack: '' },
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
            <button class="btn" onclick="window.loginAsPlayer('${p.id}')">
                ${p.name || 'Sin nombre'} (Lvl ${p.level})
            </button>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Attach a global function for the inline onclick
window.loginAsPlayer = function (playerId) {
    state.update({ session: { role: 'Player', playerId } });
}

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

    // Attach listeners dynamically via event delegation later or directly here
    let html = `
        <div class="card">
            <h3><i class="fa-solid fa-user"></i> Datos Básicos</h3>
            <div class="grid-2 mt-1">
                <div>
                    <label>Nombre:</label>
                    <input type="text" id="sheet-name" value="${player.name || ''}" onchange="window.updateSheet('${playerId}', 'name', this.value)">
                </div>
                <div>
                     <label>Clase:</label>
                     <input type="text" id="sheet-class" value="${player.class || ''}" onchange="window.updateSheet('${playerId}', 'class', this.value)">
                </div>
                <div>
                    <label>Nivel:</label>
                    <input type="number" id="sheet-level" value="${player.level || 1}" onchange="window.updateSheet('${playerId}', 'level', Number(this.value))">
                </div>
            </div>
        </div>

        <div class="card">
             <h3><i class="fa-solid fa-heart"></i> Combate</h3>
             <div class="grid-2 mt-1">
                 <div>
                      <label>Puntos de Golpe (HP):</label>
                      <div class="flex-row">
                          <input type="number" value="${player.hpCurrent}" onchange="window.updateSheet('${playerId}', 'hpCurrent', Number(this.value))" style="width: 80px; text-align: center;"> 
                          <span> / </span>
                          <input type="number" value="${player.hpMax}" onchange="window.updateSheet('${playerId}', 'hpMax', Number(this.value))" style="width: 80px; text-align: center;">
                      </div>
                 </div>
                 <div>
                      <label>Clase de Armadura (CA):</label>
                      <input type="number" value="${player.ac}" onchange="window.updateSheet('${playerId}', 'ac', Number(this.value))" style="width: 100px;">
                 </div>
                 <div style="grid-column: span 2; margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                     <label><i class="fa-solid fa-skull"></i> Salvaciones de Muerte (Death Saves):</label>
                     <div class="flex-between mt-1">
                         <div>
                             <span style="font-size: 0.8rem; color: var(--leather-light); margin-right: 0.5rem;">Éxitos</span>
                             ${[1, 2, 3].map(i => `<input type="checkbox" ${player.deathSaves && player.deathSaves.successes >= i ? 'checked' : ''} onchange="window.updateDeathSave('${playerId}', 'successes', this.checked ? ${i} : ${i - 1})" style="width: 20px; height: 20px; accent-color: var(--leather-dark); margin-right: 5px; cursor: pointer;">`).join('')}
                         </div>
                         <div>
                             <span style="font-size: 0.8rem; color: var(--red-ink); margin-right: 0.5rem;">Fallos</span>
                             ${[1, 2, 3].map(i => `<input type="checkbox" ${player.deathSaves && player.deathSaves.failures >= i ? 'checked' : ''} onchange="window.updateDeathSave('${playerId}', 'failures', this.checked ? ${i} : ${i - 1})" style="width: 20px; height: 20px; accent-color: var(--red-ink); margin-right: 5px; cursor: pointer;">`).join('')}
                         </div>
                     </div>
                 </div>
             </div>
        </div>

        <div class="card">
             <h3><i class="fa-solid fa-dumbbell"></i> Atributos y Salvaciones</h3>
             <div class="grid-2 mt-1">
                 ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => `
                     <div class="flex-between">
                         <div class="flex-row">
                             <input type="checkbox" ${player.saves && player.saves[stat] ? 'checked' : ''} onchange="window.updateSave('${playerId}', '${stat}', this.checked)" title="Competencia en Salvación" style="width: 15px; height: 15px; margin-right: 5px; cursor: pointer; accent-color: var(--leather-dark);">
                             <label style="text-transform: uppercase; font-weight: bold;">${stat}</label>
                         </div>
                         <input type="number" value="${player.stats[stat]}" onchange="window.updateSheetStat('${playerId}', '${stat}', Number(this.value))" style="width: 80px; margin-bottom: 0;">
                     </div>
                 `).join('')}
             </div>
        </div>

        <div class="card">
            <div class="flex-between mb-1" style="border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem;">
                <h3><i class="fa-solid fa-khanda"></i> Ataques y Trucos</h3>
                <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.addAttack('${playerId}')">
                    <i class="fa-solid fa-plus"></i> Añadir Ataque
                </button>
            </div>
            <div id="attacks-container">
                ${renderAttacksList(playerId, player.attacks || [])}
            </div>
        </div>

        <div class="card">
            <h3><i class="fa-solid fa-sack-xmark"></i> Inventario y Equipo</h3>
            <div class="grid-2 mt-1">
                <div>
                    <h4 style="font-size: 0.9em; color: var(--leather-light);"><i class="fa-solid fa-shield-halved"></i> Equipado</h4>
                    <textarea placeholder="Armadura puesta, armas en mano, anillos..." onchange="window.updateEquipment('${playerId}', 'equipped', this.value)" style="min-height: 100px; font-size: 0.85em;">${player.equipment ? player.equipment.equipped : ''}</textarea>
                </div>
                <div>
                    <h4 style="font-size: 0.9em; color: var(--leather-light);"><i class="fa-solid fa-backpack"></i> Mochila</h4>
                    <textarea placeholder="Oro, raciones, antorchas, pociones..." onchange="window.updateEquipment('${playerId}', 'backpack', this.value)" style="min-height: 100px; font-size: 0.85em;">${player.equipment ? player.equipment.backpack : ''}</textarea>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex-between mb-1" style="border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem;">
                <h3><i class="fa-solid fa-wand-sparkles"></i> Libro de Hechizos</h3>
                <button class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="window.addSpell('${playerId}')">
                    <i class="fa-solid fa-plus"></i> Añadir Conjuro
                </button>
            </div>
            
            <!-- Spell Slots -->
            <div class="mb-1">
                <h4 style="font-size: 0.9em; color: var(--leather-light);">Espacios de Conjuro (Slots)</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: space-between;" class="mt-1">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => `
                        <div style="background: rgba(255,255,255,0.3); padding: 0.2rem; border-radius: 4px; border: 1px solid var(--parchment-dark); text-align: center; font-size: 0.8em; min-width: 45px;">
                            <strong>Nvl ${lvl}</strong><br>
                            <input type="number" value="${(player.spellSlots && player.spellSlots[lvl]) ? player.spellSlots[lvl].used : 0}" onchange="window.updateSpellSlot('${playerId}', ${lvl}, 'used', Number(this.value))" style="width: 30px; padding: 2px; margin: 0; text-align: center; background: transparent; border: none; border-bottom: 1px solid var(--leather-dark);"> / 
                            <input type="number" value="${(player.spellSlots && player.spellSlots[lvl]) ? player.spellSlots[lvl].max : 0}" onchange="window.updateSpellSlot('${playerId}', ${lvl}, 'max', Number(this.value))" style="width: 30px; padding: 2px; margin: 0; text-align: center; background: transparent; border: none; border-bottom: 1px solid var(--leather-dark);">
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
    container.innerHTML = html;
}

window.renderAttacksList = function (playerId, attacks) {
    if (!attacks || attacks.length === 0) return '<p class="text-muted text-center" style="font-size: 0.9em; margin-top: 0.5rem;">Ves desarmado por la vida.</p>';

    let html = '<div class="grid-2 mt-1">';
    attacks.forEach(atk => {
        html += `
            <div class="card" style="padding: 0.5rem; background: rgba(255,255,255,0.4);">
                <div class="flex-between mb-1">
                    <input type="text" value="${atk.name || ''}" placeholder="Arma o Truco" onchange="window.updateAttack('${playerId}', '${atk.id}', 'name', this.value)" style="font-weight: bold; padding: 0.2rem; margin-bottom: 0; width: 80%;">
                    <button class="btn btn-danger" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.deleteAttack('${playerId}', '${atk.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="flex-row">
                    <input type="text" value="${atk.bonus || ''}" placeholder="Bono (ej. +5)" onchange="window.updateAttack('${playerId}', '${atk.id}', 'bonus', this.value)" style="width: 40%; font-size: 0.85em; margin-bottom: 0; margin-right: 5px;">
                    <input type="text" value="${atk.damage || ''}" placeholder="Daño (ej. 1d8+3 Cortante)" onchange="window.updateAttack('${playerId}', '${atk.id}', 'damage', this.value)" style="width: 58%; font-size: 0.85em; margin-bottom: 0;">
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
};

window.addAttack = function (playerId) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const attacks = p.attacks || [];
            const newAttack = { id: 'atk_' + Date.now(), name: '', bonus: '', damage: '' };
            return { ...p, attacks: [...attacks, newAttack] };
        }
        return p;
    });
    state.update({ players });
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
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const attacks = p.attacks.filter(a => a.id !== atkId);
            return { ...p, attacks };
        }
        return p;
    });
    state.update({ players });
};

window.updateSave = function (playerId, stat, isChecked) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const saves = p.saves || { str: false, dex: false, con: false, int: false, wis: false, cha: false };
            return { ...p, saves: { ...saves, [stat]: isChecked } };
        }
        return p;
    });
    state.update({ players });
};

window.updateDeathSave = function (playerId, type, value) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const deathSaves = p.deathSaves || { successes: 0, failures: 0 };
            return { ...p, deathSaves: { ...deathSaves, [type]: value } };
        }
        return p;
    });
    state.update({ players });
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
                <div class="card" style="padding: 0.5rem; ${spell.prepared ? 'border-color: var(--gold-dim); box-shadow: 0 0 5px rgba(212,175,55,0.3); background: rgba(255,255,255,0.4);' : ''}">
                    <div class="flex-between mb-1">
                        <div class="flex-row" style="width: 70%;">
                            <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 0.8em; background: ${spell.prepared ? 'var(--gold-dim)' : 'transparent'}; color: ${spell.prepared ? '#fff' : 'var(--text-muted)'}; border: 1px solid var(--parchment-dark); box-shadow: none;" onclick="window.toggleSpellPrepared('${playerId}', '${spell.id}')" title="Preparar hechizo">
                                <i class="fa-solid fa-sun"></i>
                            </button>
                            <input type="text" value="${spell.name}" placeholder="Nombre del conjuro" onchange="window.updateSpell('${playerId}', '${spell.id}', 'name', this.value)" style="margin-bottom: 0; font-weight: bold; padding: 0.2rem;">
                        </div>
                        <button class="btn btn-danger" style="padding: 0.1rem 0.4rem; font-size: 0.8rem;" onclick="window.deleteSpell('${playerId}', '${spell.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="flex-row mb-1" style="gap: 0.2rem;">
                        <select onchange="window.updateSpell('${playerId}', '${spell.id}', 'level', Number(this.value))" style="margin-bottom: 0; padding: 0.1rem; font-size: 0.8em; width: 60px;">
                            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}" ${l == spell.level ? 'selected' : ''}>Nv ${l}</option>`).join('')}
                        </select>
                        <input type="text" value="${spell.castingTime || ''}" placeholder="Tiempo (ej. 1 Acción)" onchange="window.updateSpell('${playerId}', '${spell.id}', 'castingTime', this.value)" style="margin-bottom: 0; padding: 0.1rem; font-size: 0.8em;">
                    </div>
                    
                    <textarea placeholder="Descripción y efectos..." onchange="window.updateSpell('${playerId}', '${spell.id}', 'description', this.value)" style="min-height: 50px; margin-bottom: 0; font-size: 0.85em; padding: 0.3rem;">${spell.description || ''}</textarea>
                </div>
            `;
        });

        html += `</div>`;
    });

    return html;
};

window.addSpell = function (playerId) {
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
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
        }
        return p;
    });
    state.update({ players });
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
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const spells = p.spells.map(s => s.id === spellId ? { ...s, prepared: !s.prepared } : s);
            return { ...p, spells };
        }
        return p;
    });
    state.update({ players });
};

window.deleteSpell = function (playerId, spellId) {
    if (!confirm('¿Eliminar este conjuro del grimorio?')) return;
    const players = state.get().players.map(p => {
        if (p.id === playerId) {
            const spells = p.spells.filter(s => s.id !== spellId);
            return { ...p, spells };
        }
        return p;
    });
    state.update({ players });
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
        html += `
            <div class="card">
                <h3 style="border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                    ${p.name || 'Desconocido'} <span style="font-size:0.9rem; color:var(--text-muted)">Lvl ${p.level} ${p.class}</span>
                </h3>
                <div class="flex-between mb-1">
                    <span><strong>HP:</strong> ${p.hpCurrent} / ${p.hpMax}</span>
                    <span><strong>CA:</strong> ${p.ac}</span>
                </div>
                ${isDM ? `
                    <div style="text-align: right;">
                        <button class="btn" style="padding: 0.2rem 0.5rem;" onclick="window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent - 1})">-1 HP</button>
                        <button class="btn" style="padding: 0.2rem 0.5rem;" onclick="window.updateSheet('${p.id}', 'hpCurrent', ${p.hpCurrent + 1})">+1 HP</button>
                    </div>
                ` : ''}
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
        const playerNotesOnNpc = chronicles[`${session.playerId}_npc_${n.id}`] || '';
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
        const playerNotesOnMap = chronicles[`${session.playerId}_map_${m.id}`] || '';
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
    const text = document.getElementById(`chronicle-${entityId.replace('_', '-')}`).value;
    const key = `${playerId}_${entityId}`;
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

    html += `<h4><i class="fa-solid fa-feather"></i> Crónicas Guardadas (NPCs y Mapas)</h4>`;

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

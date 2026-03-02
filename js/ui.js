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
    } else if (session.role === 'PublicScreen') {
        // Show Public Screen (fullscreen, no chrome)
        document.getElementById('main-screen').classList.add('active');
        setupMainScreenForRole(session);
        renderPublicScreen(currentState);
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
            if (window.switchTab) window.switchTab('tab-sheet');
        });
        window.closeLoginModal();
    } else if (mode === 'login') {
        if (pass1 === player.passcode) {
            state.update({ session: { role: 'Player', playerId } }).then(() => {
                if (window.switchTab) window.switchTab('tab-sheet');
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
    const isPublicScreen = session.role === 'PublicScreen';
    const headerBar = document.querySelector('#main-screen > .flex-between');
    const tabsBar = document.getElementById('app-tabs');
    const headerTitle = document.getElementById('main-header-title');

    if (isPublicScreen) {
        // Hide all chrome for fullscreen projection
        if (headerBar) headerBar.style.display = 'none';
        if (tabsBar) tabsBar.style.display = 'none';
        return;
    }

    // Restore chrome for normal roles
    if (headerBar) headerBar.style.display = '';
    if (tabsBar) tabsBar.style.display = '';

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
// Player Features: Sheet (MOVED to js/tab_ficha.js)
// ----------------------------------------------------
// All renderSheet*, window.modifyHP, window.updateSkill, etc.
// have been extracted to maximize maintainability.

// ----------------------------------------------------
// Public Screen (Player Facing Display)
// ----------------------------------------------------

function renderPublicScreen(currentState) {
    const { players, publicDisplay, combatTracker } = currentState;
    const container = document.getElementById('tab-sheet');
    container.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => { if (c.id !== 'tab-sheet') c.classList.remove('active'); });

    const imageUrl = publicDisplay?.imageUrl || null;

    // BASE CONTENT (Inherits parchment background from .app-container)
    let html = '<div class="public-screen">';

    // REUSE LIGHTBOX SYSTEM FOR PROJECTION
    if (imageUrl) {
        html += `
            <div class="lightbox-overlay" style="position: absolute; z-index: 100;" onclick="window.stopProjection()">
                <div class="lightbox-container">
                    <img src="${imageUrl}" alt="Proyección">
                </div>
            </div>
        `;
    }

    html += '<h2 style="text-align:center; margin-bottom:1.5rem; color:var(--leather-dark); letter-spacing: 2px;"><i class="fa-solid fa-users"></i> El Grupo de Aventureros</h2>';
    html += '<div class="grid-2" style="max-width: 1200px; margin: 0 auto; gap: 1.5rem;">';

    players.forEach(p => {
        let hpPercent = Math.max(0, Math.min(100, (p.hpCurrent / p.hpMax) * 100));
        let hpColor = hpPercent > 50 ? 'darkolivegreen' : (hpPercent > 20 ? 'darkgoldenrod' : 'darkred');

        html += `
            <div class="card" style="padding: 1.2rem; box-shadow: var(--box-shadow-main);">
                <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.8rem;">
                    <h3 style="margin:0; font-size: 1.5rem;">${p.name || 'Desconocido'} <span style="font-size:0.8rem; color:var(--text-muted); font-family: var(--font-body); text-transform: uppercase;">Lvl ${p.level} ${p.class}</span></h3>
                </div>
                <div class="party-hp-bar-container" style="height: 25px; border-radius: 4px; overflow: hidden; border: 1px solid var(--leather-dark);">
                    <div class="party-hp-bar-fill" style="width: ${hpPercent}%; background-color: ${hpColor}; transition: width 0.4s ease;"></div>
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.9rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                        ${p.hpCurrent} / ${p.hpMax} HP
                    </div>
                </div>
                <div class="flex-between" style="font-size: 1rem; padding-top: 0.8rem; color: var(--leather-dark); font-weight: bold;">
                    <span><i class="fa-solid fa-shield" style="color:var(--gold-dim)"></i> CA: ${p.ac || 10}</span>
                    <span><i class="fa-solid fa-bolt" style="color:var(--gold-dim)"></i> INIC: ${p.initiative || 0}</span>
                    <span><i class="fa-solid fa-eye" style="color:var(--gold-dim)"></i> PAS: ${p.passivePerception || 10}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';

    if (combatTracker && combatTracker.active) {
        html += renderInitiativeTracker(combatTracker, false, players);
    }

    html += '</div>';
    container.innerHTML = html;
}

window.projectToScreen = function (imageUrl) {
    const currentUrl = (state.get().publicDisplay || {}).imageUrl;
    // Toggle: if same image is already projected, stop projecting
    if (currentUrl === imageUrl) {
        state.update({ publicDisplay: { imageUrl: null } });
    } else {
        state.update({ publicDisplay: { imageUrl: imageUrl } });
    }
};

window.stopProjection = function () {
    state.update({ publicDisplay: { imageUrl: null } });
};

// ----------------------------------------------------
// Player Features: Party (MOVED TO tab_grupo.js)
// ----------------------------------------------------



// ----------------------------------------------------
// Player Features: World & Notes (MOVED TO tab_notas.js)
// ----------------------------------------------------


// ----------------------------------------------------
// Player Features: NPCs (MOVED TO tab_npcs.js)
// ----------------------------------------------------



// ----------------------------------------------------
// Player Features: Maps (MOVED TO tab_mapas.js)
// ----------------------------------------------------



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

// DM Mirror Notes MOVED TO tab_notas.js

// Ensure state is globally accessible for the inline onchange handler
window.state = state;

// window.renderDMNpcs MOVED TO tab_npcs.js


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
                                <i class="fa-solid ${m._uiSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.8em; color: var(--text-muted);"></i>
                            </div>
                            
                            ${m._uiSecretVisible ? `
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
                            ${m.url ? `<button class="btn btn-project" style="padding: 0.3rem 0.6rem; font-size:0.9rem; ${(state.get().publicDisplay || {}).imageUrl === m.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${m.url}')" title="Proyectar imagen"><i class="fa-solid fa-display"></i></button>` : ''}
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
// GESTOR DE ENCUENTROS (COMBAT BUILDER) (MOVED TO tab_encuentros.js)
// ----------------------------------------------------




// resetPlayerPassword MOVED TO tab_notas.js

// ----------------------------------------------------
// INITIATIVE TRACKER (Combat System) (MOVED TO tab_grupo.js)
// ----------------------------------------------------




// window.renderDMMaps MOVED TO tab_mapas.js


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

window.toggleSecretVisibility = async function (type, id) {
    const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario' };
    const listKey = listKeyDict[type] || type + 's';
    const list = state.get()[listKey];
    const item = list.find(e => e.id === id);
    if (!item) return;

    const newValue = !item.secretVisible;
    const updatedList = list.map(e => e.id === id ? { ...e, secretVisible: newValue } : e);
    await state.update({ [listKey]: updatedList });
};

window.toggleDmSecretVisibility = function (type, id) {
    // Mantengo esta función para bloques que no se sincronizan con el jugador (ej: monstruos)
    const listKeyDict = { 'npc': 'npcs', 'map': 'maps', 'monster': 'bestiario', 'encuentro': 'encuentros' };
    const listKey = listKeyDict[type] || type + 's';
    const list = state.get()[listKey];
    const item = list.find(e => e.id === id);
    if (!item) return;

    const currentValue = item._uiSecretVisible || false;
    const updatedList = list.map(e => e.id === id ? { ...e, _uiSecretVisible: !currentValue } : e);
    state.get()[listKey] = updatedList;
    state.notify();
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

// ----------------------------------------------------
// Player Features: Library (MOVED TO tab_biblioteca.js)
// ----------------------------------------------------



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
                     <p style="font-size: 0.9em; color: var(--text-muted); text-align:center;">${npc.raceAlignment || ''}</p>
                     <p style="white-space: pre-wrap; font-size: 1.1rem; line-height: 1.6; margin-top: 1rem;"><i class="fa-solid fa-theater-masks"></i> <strong>Actitud/Voz:</strong> ${npc.behavior || '...'}</p>
                 `;
            if (currentState.session.role === 'DM' && npc.motivation) {
                html += `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 1.1rem; margin-top: 1rem; border-left: 3px solid var(--red-ink); padding-left: 0.8rem;"><i class="fa-solid fa-user-secret"></i> <strong>Secreto:</strong> ${npc.motivation}</p>`;
            } else if (npc.secretVisible && npc.motivation) {
                html += `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 1.1rem; margin-top: 1rem;"><i class="fa-solid fa-eye"></i> <strong>Secreto Descubierto:</strong> ${npc.motivation}</p>`;
            }
            html += `</div>`;
            container.innerHTML = html;
        }
    } else if (type === 'monster') {
        const monster = currentState.bestiario.find(m => m.id === id);
        if (monster) {
            const getMod = (val) => { const v = parseInt(val, 10) || 10; const mod = Math.floor((v - 10) / 2); return mod >= 0 ? '+' + mod : mod; };
            let html = `
                <div class="card view-mode" style="padding: 2rem; border: none; box-shadow: none;">
                    <h2 style="font-size: 2rem; text-align: center; margin-bottom: 0; color: var(--red-ink); text-transform: uppercase;">${monster.name}</h2>
                    <p style="font-style: italic; color: #555; text-align: center; margin-bottom: 1rem;">${monster.subtitle || ''}</p>
                    <div style="border-top: 3px solid var(--red-ink); border-bottom: 3px solid var(--red-ink); padding: 0.5rem 0; margin-bottom: 1rem; font-size: 0.95rem; line-height: 1.6;">
                        <div><strong style="color:var(--red-ink)">CA</strong> ${monster.ac || '-'}</div>
                        <div><strong style="color:var(--red-ink)">HP</strong> ${monster.hp || '-'}</div>
                        <div><strong style="color:var(--red-ink)">Velocidad</strong> ${monster.speed || '30 pies'}</div>
                    </div>
                    <div style="display:flex; justify-content:space-around; text-align:center; margin-bottom:1rem; font-size:0.85rem;">
                        <div><strong>FUE</strong><br>${monster.str || 10} (${getMod(monster.str)})</div>
                        <div><strong>DES</strong><br>${monster.dex || 10} (${getMod(monster.dex)})</div>
                        <div><strong>CON</strong><br>${monster.con || 10} (${getMod(monster.con)})</div>
                        <div><strong>INT</strong><br>${monster.int || 10} (${getMod(monster.int)})</div>
                        <div><strong>SAB</strong><br>${monster.wis || 10} (${getMod(monster.wis)})</div>
                        <div><strong>CAR</strong><br>${monster.cha || 10} (${getMod(monster.cha)})</div>
                    </div>
                    ${monster.features ? `<div style="margin-bottom:0.8rem;"><strong style="color:var(--red-ink)">Rasgos.</strong><div style="white-space:pre-wrap;">${monster.features}</div></div>` : ''}
                    ${monster.actions ? `<div style="margin-bottom:0.8rem;"><strong style="color:var(--red-ink)">Acciones.</strong><div style="white-space:pre-wrap;">${monster.actions}</div></div>` : ''}
                    ${monster.bonus ? `<div style="margin-bottom:0.8rem;"><strong style="color:var(--red-ink)">Acc. Adicionales.</strong><div style="white-space:pre-wrap;">${monster.bonus}</div></div>` : ''}
                    ${monster.reactions ? `<div style="margin-bottom:0.8rem;"><strong style="color:var(--red-ink)">Reacciones.</strong><div style="white-space:pre-wrap;">${monster.reactions}</div></div>` : ''}
                </div>
            `;
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

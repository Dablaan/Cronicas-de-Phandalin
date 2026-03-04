// ----------------------------------------------------
// GESTOR DE ENCUENTROS (COMBAT BUILDER) - Extracted
// ----------------------------------------------------

window.editingEncounterId = null;
window.currentEncounterBuilder = [];

window.renderEncuentros = function (currentState) {
    const { encuentros, bestiario, maps } = currentState;
    const container = document.getElementById('tab-encuentros');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3><i class="fa-solid fa-shield-halved"></i> Encuentros</h3>
            <button class="btn" onclick="window.openEntityModal('encuentro')"><i class="fa-solid fa-plus"></i> Añadir Encuentro</button>
        </div>
        
        <!-- Lista de Encuentros Creados -->
        <div id="encounter-list-container">
            <div class="grid-2">
    `;

    if (!encuentros || encuentros.length === 0) {
        html += '<p class="text-muted" style="grid-column: 1/-1;">No hay encuentros preparados. Adelante, planea su perdición.</p>';
    } else {
        encuentros.forEach(enc => {
            const allBestiario = currentState.bestiario || [];
            const listHtml = (enc.monsters || []).map(m => {
                const monsterData = allBestiario.find(b => b.id === m.id);
                const imgUrl = monsterData && monsterData.url ? monsterData.url : null;
                const projectBtn = imgUrl
                    ? `<button class="btn btn-project" style="padding: 0.1rem 0.3rem; font-size:0.7rem; margin-left: 0.3rem; vertical-align: middle;" onclick="event.stopPropagation(); window.projectToScreen('${imgUrl}')" title="Proyectar imagen"><i class="fa-solid fa-display"></i></button>`
                    : '';
                return `<li style="display: flex; align-items: center; gap: 0.3rem;"><span><strong>${m.qty}x</strong> ${m.name} <span style="color:var(--gold-dim); font-size:0.85em;">(Init: ${m.initiative || '?'})</span></span>${projectBtn}</li>`;
            }).join('');
            const combatTracker = currentState.combatTracker;
            const combatActive = combatTracker && combatTracker.active;
            const isCombatPhase = combatActive && combatTracker.phase === 'combat';

            let btnText = "Iniciar Combate";
            let btnStyle = "background: var(--red-ink); color: #fff; border-color: var(--red-ink);";

            if (isCombatPhase) {
                btnText = "Añadir refuerzos";
            } else if (combatActive) {
                btnStyle += " opacity:0.4; pointer-events:none;";
            }

            html += `
                <div class="card" style="position: relative; display: flex; flex-direction: column;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem 0; color:var(--red-ink);"><i class="fa-solid fa-shield-halved"></i> ${enc.name}</h4>
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
                        <button class="btn" style="padding: 0.4rem 0.8rem; font-size:0.85rem; ${btnStyle}" onclick="window.startCombatFromEncounter('${enc.id}')" title="${btnText}">
                            <i class="fa-solid fa-khanda"></i> ${btnText}
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
};

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

    const monsterData = window.state.get().bestiario.find(b => b.id === monsterId);
    if (!monsterData) return;

    // Always create a NEW independent pack (allows same monster with different init/qty)
    window.currentEncounterBuilder.push({
        id: monsterData.id,
        packId: 'pack_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        name: monsterData.name,
        qty: qty,
        initiative: initiative
    });

    // Resetear formcito
    qtyInput.value = 1;
    initInput.value = '';
    select.value = '';

    window.renderEncounterBuilderList();
};

window.removeMonsterFromBuilder = function (packId) {
    window.currentEncounterBuilder = window.currentEncounterBuilder.filter(m => (m.packId || m.id) !== packId);
    window.renderEncounterBuilderList();
};

window.renderEncounterBuilderList = function () {
    const builderUl = document.getElementById('ef-builder-list');
    if (!builderUl) return;

    if (window.currentEncounterBuilder.length === 0) {
        builderUl.innerHTML = '<li class="text-muted">No hay monstruos añadidos aún.</li>';
        return;
    }

    builderUl.innerHTML = window.currentEncounterBuilder.map(m => {
        const removeKey = m.packId || m.id;
        return `
        <li style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--parchment-dark); padding:0.2rem 0;">
            <span><strong>${m.qty}x</strong> ${m.name} <span style="color:var(--gold-dim); font-size:0.8em;">(Init: ${m.initiative || '?'})</span></span>
            <button class="btn btn-danger" style="padding:0.1rem 0.3rem; font-size:0.75rem;" onclick="window.removeMonsterFromBuilder('${removeKey}')"><i class="fa-solid fa-xmark"></i></button>
        </li>
    `;
    }).join('');
};

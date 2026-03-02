// ----------------------------------------------------
// Player Features: Sheet (Extracted)
// ----------------------------------------------------

function renderPlayerSheet(playerId, players, targetId = 'tab-sheet') {
    const container = document.getElementById(targetId);
    if (!container) return;
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

    let html = '<div class="card" style="padding: 0.5rem;"><div style="display: flex; flex-direction: column; gap: 0.8rem;">';
    statsList.forEach(s => {
        const val = player.stats[s.key];
        const mod = getMod(val);
        html += `
            <div class="stat-box-row" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.2); border: 1px solid var(--parchment-dark); border-radius: 4px; padding: 0.4rem 0.8rem;">
                <label style="font-size: 0.8rem; font-weight: bold; margin: 0; flex: 1;">${s.label}</label>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex: 0 0 auto;">
                    <input class="stat-val" type="number" name="stats.${s.key}" value="${val}" style="width: 45px; font-size: 1.1rem; font-weight: bold; text-align: center; border: none; background: transparent; padding: 0;">
                    <div class="stat-mod" style="font-size: 1.1rem; color: var(--leather-dark); font-weight: bold; background: var(--parchment-dark); min-width: 40px; text-align: center; border-radius: 4px; padding: 2px 4px;">${mod}</div>
                </div>
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
            ${window.renderAttacksList(playerId, player.attacks || [])}
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
            ${window.renderSpellsList(playerId, player.spells || [])}
        </div>
    </div>
    `;
}

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

function renderDMSheet() {
    const container = document.getElementById('tab-sheet');
    if (!container) return;
    const currentState = window.state.get();
    const notes = currentState.dmNotes || { missions: '', summary: '', session: '', reminders: '' };

    container.innerHTML = `
        <div class="dm-dashboard">
            <div class="flex-between mb-1">
                <h2 style="margin:0; color:var(--red-ink);"><i class="fa-solid fa-dragon"></i> Crónicas del Master</h2>
                <span id="dm-save-status" style="font-size:0.8rem; color:var(--leather-light); opacity:0.5;">Cambios guardados</span>
            </div>
            
            <div class="grid-2">
                <div class="card" style="display:flex; flex-direction:column; background: rgba(0,0,0,0.03);">
                    <h4 style="margin:0 0 0.5rem 0; color:var(--leather-dark); border-bottom: 2px solid var(--parchment-dark);"><i class="fa-solid fa-flag"></i> Misiones Activas</h4>
                    <textarea class="dm-note-area" oninput="window.updateDmNote('missions', this.value)" placeholder="Objetivos del grupo...">${notes.missions}</textarea>
                </div>
                <div class="card" style="display:flex; flex-direction:column; background: rgba(0,0,0,0.03);">
                    <h4 style="margin:0 0 0.5rem 0; color:var(--leather-dark); border-bottom: 2px solid var(--parchment-dark);"><i class="fa-solid fa-calendar-check"></i> Resumen Anterior</h4>
                    <textarea class="dm-note-area" oninput="window.updateDmNote('summary', this.value)" placeholder="Lo que sucedió el último día...">${notes.summary}</textarea>
                </div>
                <div class="card" style="display:flex; flex-direction:column; background: rgba(0,0,0,0.03);">
                    <h4 style="margin:0 0 0.5rem 0; color:var(--leather-dark); border-bottom: 2px solid var(--parchment-dark);"><i class="fa-solid fa-pen-fancy"></i> Notas de Sesión</h4>
                    <textarea class="dm-note-area" oninput="window.updateDmNote('session', this.value)" placeholder="Ideas constantes, PNJs nuevos, giros...">${notes.session}</textarea>
                </div>
                <div class="card" style="display:flex; flex-direction:column; background: rgba(0,0,0,0.03);">
                    <h4 style="margin:0 0 0.5rem 0; color:var(--leather-dark); border-bottom: 2px solid var(--parchment-dark);"><i class="fa-solid fa-treasure-chest"></i> Recordatorios y Botín</h4>
                    <textarea class="dm-note-area" oninput="window.updateDmNote('reminders', this.value)" placeholder="Checks de habilidad, tesoros pendientes...">${notes.reminders}</textarea>
                </div>
            </div>
        </div>
    `;
}

window.modifyHP = function (playerId, amount) {
    const currentState = window.state.get();

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

    window.state.update({ players }, true);

    const hpInput = document.querySelector('input[name="hpCurrent"]');
    if (hpInput) hpInput.value = updatedPlayer.hpCurrent;

    const hpBarPercent = Math.max(0, Math.min(100, (updatedPlayer.hpCurrent / updatedPlayer.hpMax) * 100));
    let hpColor = hpBarPercent > 50 ? '#556b2f' : (hpBarPercent > 20 ? '#b8860b' : '#8b0000');

    const hpBarFill = document.getElementById('hp-bar-fill-sheet');
    if (hpBarFill) {
        hpBarFill.style.width = hpBarPercent + '%';
        hpBarFill.style.backgroundColor = hpColor;
    }
};

window.updateHitDice = function (playerId, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const hitDice = p.hitDice || { total: '1d10', current: '1' };
            return { ...p, hitDice: { ...hitDice, [field]: value } };
        }
        return p;
    });
    window.state.update({ players });
};

window.updateDeathSave = function (playerId, type, value) {
    window.syncAndModifySheet(playerId, (p) => {
        const deathSaves = p.deathSaves || { successes: 0, failures: 0 };
        return { ...p, deathSaves: { ...deathSaves, [type]: value } };
    });
};

window.updateSkill = function (playerId, skillId, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const skills = p.skills || {};
            const skill = skills[skillId] || { prof: false, bonus: 0 };
            return { ...p, skills: { ...skills, [skillId]: { ...skill, [field]: value } } };
        }
        return p;
    });
    window.state.update({ players });
};

window.updateSave = function (playerId, stat, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const saves = p.saves || {};
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
    window.state.update({ players });
};

window.addAttack = function (playerId) {
    window.syncAndModifySheet(playerId, (p) => {
        const attacks = p.attacks || [];
        const newAttack = { id: 'atk_' + Date.now(), name: '', bonus: '', damage: '' };
        return { ...p, attacks: [...attacks, newAttack] };
    });
};

window.updateAttack = function (playerId, atkId, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const attacks = p.attacks.map(a => a.id === atkId ? { ...a, [field]: value } : a);
            return { ...p, attacks };
        }
        return p;
    });
    window.state.update({ players });
};

window.deleteAttack = function (playerId, atkId) {
    if (!confirm('¿Eliminar este ataque?')) return;
    window.syncAndModifySheet(playerId, (p) => {
        const attacks = p.attacks.filter(a => a.id !== atkId);
        return { ...p, attacks };
    });
};

window.updateEquipment = function (playerId, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const equipment = p.equipment || { equipped: '', backpack: '' };
            return { ...p, equipment: { ...equipment, [field]: value } };
        }
        return p;
    });
    window.state.update({ players });
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
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            const spells = p.spells.map(s => s.id === spellId ? { ...s, [field]: value } : s);
            return { ...p, spells };
        }
        return p;
    });
    window.state.update({ players });
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
    const players = window.state.get().players.map(p => {
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
    window.state.update({ players });
};

window.updateDmNote = function (field, value) {
    const currentNotes = window.state.get().dmNotes || {};
    const updatedNotes = { ...currentNotes, [field]: value };
    window.state.get().dmNotes = updatedNotes;

    const status = document.getElementById('dm-save-status');
    if (status) status.innerText = "Escribiendo...";

    clearTimeout(window.dmSaveTimeout);
    window.dmSaveTimeout = setTimeout(() => {
        const latestNotes = window.state.get().dmNotes;
        window.state.update({ dmNotes: latestNotes });
        const st = document.getElementById('dm-save-status');
        if (st) st.innerText = "Cambios guardados";
    }, 1000);
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

    const inputs = container.querySelectorAll('input[name], textarea[name], select[name]');
    inputs.forEach(input => {
        const name = input.getAttribute('name');
        if (!name) return;

        if (input.closest('.attack-item') || input.closest('.spell-item')) return;

        let value = input.type === 'checkbox' ? input.checked :
            input.type === 'number' ? Number(input.value) : input.value;

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

window.syncAndModifySheet = function (playerId, modifierFn) {
    const newData = window.isSheetEditMode ? window.gatherSheetData(playerId) : null;

    const players = window.state.get().players.map(p => {
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
    window.state.update({ players });
};

window.saveSheetChanges = function (playerId) {
    const newData = window.gatherSheetData(playerId);

    const players = window.state.get().players.map(p => {
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
    window.state.update({ players });
};

window.toggleSheetEditMode = function () {
    window.isSheetEditMode = !window.isSheetEditMode;
    const p = window.state.get().players.find(p => p.id === window.currentSheetPlayerId);
    if (p) {
        renderPlayerSheet(p.id, window.state.get().players);
    }
};

window.updateSheet = function (playerId, field, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            return { ...p, [field]: value };
        }
        return p;
    });
    window.state.update({ players });
};

window.updateSheetStat = function (playerId, stat, value) {
    const players = window.state.get().players.map(p => {
        if (p.id === playerId) {
            return { ...p, stats: { ...p.stats, [stat]: value } };
        }
        return p;
    });
    window.state.update({ players });
};

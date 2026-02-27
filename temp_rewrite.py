import sys

with open('js/ui.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

# We replace from function renderPlayerSheet to modifyHP.
for line in lines:
    if line.startswith('function renderPlayerSheet(playerId, players) {'):
        skip = True
        new_lines.append('''function renderPlayerSheet(playerId, players) {
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
    <div class="sheet-header-box">
        <div style="flex: 0 0 auto; text-align: center; color: var(--gold-dim);">
            <i class="fa-solid fa-dragon" style="font-size: 3rem;"></i>
        </div>
        <div class="sheet-header-name">
            <input type="text" name="playerName" value="${player.playerName || ''}" placeholder="Nombre del Jugador" style="font-size: 0.8rem; border-bottom: none; color: var(--text-muted); margin-bottom: 0;">
            <input type="text" name="name" value="${player.name || ''}" placeholder="Nombre del Personaje">
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

    let html = '<div class="card" style="padding: 0.5rem; height: 100%;"><div style="display: flex; flex-direction: column; gap: 0.5rem;">';
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
    <div class="card" style="padding: 0.5rem; height: 100%; display: flex; flex-direction: column; justify-content: center;">
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
    <div class="card" style="padding: 0.5rem; height: 100%; display: flex; align-items: center; justify-content: center;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; width: 100%;">
            <div class="defense-box">
                <label>CA</label>
                <input type="number" name="ac" value="${player.ac}" style="width: 100%;">
            </div>
            <div class="defense-box">
                <label>Iniciativa</label>
                <input type="number" name="initiative" value="${player.initiative || 0}" style="width: 100%;">
            </div>
            <div class="defense-box">
                <label>Velocidad</label>
                <input type="number" name="speed" value="${player.speed || 30}" style="width: 100%;">
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
    let html = '<div class="card" style="padding: 0.5rem; height: 100%;">';
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
    <div class="card" style="padding: 0.5rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 1rem; background: rgba(255, 255, 255, 0.4); height: 100%;">
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

    let html = '<div class="card" style="padding: 0.5rem 1rem; height: 100%;">';
    html += '<h4 style="font-size:0.8rem; text-transform:uppercase; color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); margin-bottom: 0.5rem; padding-bottom: 0.2rem;">Habilidades</h4>';
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
    html += '</div>';
    return html;
}

function renderAttacksComp(playerId, player) {
    return `
    <div class="card" style="height: 100%;">
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
    <div class="card" style="height: 100%;">
        <h3 style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--parchment-dark);"><i class="fa-solid fa-sack-xmark"></i> Inventario y Equipo</h3>
        <div class="mt-1">
            <h4 style="font-size: 0.8rem; text-transform:uppercase; color: var(--leather-light);"><i class="fa-solid fa-shield-halved"></i> Equipado</h4>
            <textarea name="equipment.equipped" placeholder="Armadura puesta, armas en mano, anillos..." style="min-height: 80px; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm); margin-bottom:0.5rem;">${player.equipment ? player.equipment.equipped : ''}</textarea>
        </div>
        <div class="mt-1">
            <h4 style="font-size: 0.8rem; text-transform:uppercase; color: var(--leather-light);"><i class="fa-solid fa-backpack"></i> Mochila y Riquezas</h4>
            <textarea name="equipment.backpack" placeholder="Oro, raciones, antorchas..." style="min-height: 120px; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm);">${player.equipment ? player.equipment.backpack : ''}</textarea>
        </div>
    </div>
    `;
}

function renderTraitsComp(player) {
    return `
    <div class="card" style="height: 100%;">
        <h3 style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--parchment-dark);"><i class="fa-solid fa-scroll"></i> Dotes y Rasgos</h3>
        <textarea name="traits" placeholder="Anota tus rasgos raciales, dotes, origen de clase, etc." style="min-height: 250px; height: 85%; font-size: 0.85em; padding:0.5rem; background: rgba(255,255,255,0.3); border:1px solid var(--parchment-dark); border-radius:var(--border-radius-sm);">${player.traits || ''}</textarea>
    </div>
    `;
}

function renderActionBarComp(playerId) {
    return `
    <div class="sheet-mode-controls view-only-hide sheet-action-bar">
        <button class="btn btn-edit-sheet view-only-btn" onclick="window.toggleSheetEditMode()" style="flex:1; background: var(--leather-dark); color: var(--gold); border:1px solid #111;"><i class="fa-solid fa-pencil"></i> Editar Ficha</button>
        <button class="btn btn-save-sheet edit-only-btn" onclick="window.saveSheetChanges('${playerId}')" style="flex:1; background: var(--gold-dim); color: var(--leather-dark); font-weight: bold; border:1px solid #111;"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
        <button class="btn" onclick="window.toggleGrimorio()" style="flex:1; background: var(--leather-light); color: #fff; border:1px solid #111;"><i class="fa-solid fa-book-journal-whills"></i> Grimorio</button>
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

'''
        continue
    
    if skip:
        if line.startswith('window.modifyHP = function'):
            skip = False
            new_lines.append(line)
    else:
        new_lines.append(line)

new_lines.append('''
window.toggleGrimorio = function() {
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
''')

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

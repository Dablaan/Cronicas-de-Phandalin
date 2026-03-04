// ----------------------------------------------------
// Player Features: NPCs (Extracted)
// ----------------------------------------------------
function renderNpcs(currentState) {
    const { session, npcs } = currentState;
    const container = document.getElementById('tab-npcs');

    if (session.role === 'DM') {
        window.renderDMNpcs(currentState);
        return;
    }

    const visibleNpcs = npcs.filter(n => n.isVisible);

    if (visibleNpcs.length === 0) {
        container.innerHTML = '<div class="card text-center"><p class="text-muted">Aún no has descubierto personajes importantes.</p></div>';
        return;
    }

    // Ordenar alfabéticamente
    const sorted = [...visibleNpcs].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));

    let html = '<h3><i class="fa-solid fa-users"></i> Personajes Conocidos</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">';
    sorted.forEach(n => {
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
                     
                      ${n.secretVisible && n.motivation ? `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 0.85em;"><strong>Secreto Descubierto:</strong> ${n.motivation}</p>` : ''}
                     
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

window.renderDMNpcs = function (currentState) {
    const { npcs } = currentState;
    const container = document.getElementById('tab-npcs');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Gestión de NPCs</h3>
            <button class="btn" onclick="window.openEntityModal('npc')"><i class="fa-solid fa-user-plus"></i> Nuevo NPC</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
    `;

    if (!npcs || npcs.length === 0) html += '<p class="text-muted">No hay NPCs.</p>';
    else {
        // Ordenar alfabéticamente
        const sorted = [...npcs].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
        sorted.forEach(n => {
            html += `
                <div class="card" ondblclick="window.openQuickLook('${n.id}', 'npc')" style="cursor: pointer; position: relative; padding: 0.6rem; display: flex; flex-direction: column; ${n.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    <div style="width: 100%; height: 100px; overflow: hidden; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
                        ${n.url
                    ? `<img src="${n.url}" style="width: 100%; height: 100%; object-fit: cover;" onclick="event.stopPropagation(); window.openLightbox('${n.url}')" title="Clic para ampliar">`
                    : `<div style="width: 100%; height: 100%; background-color: var(--leather-light); display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-user fa-2x text-muted"></i></div>`
                }
                    </div>
                    
                    <!-- Name + Visibility -->
                    <div class="flex-between" style="flex-wrap: nowrap; margin-bottom: 0.2rem;">
                        <h4 style="margin: 0; font-size: 1em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${n.name}">${n.name}</h4>
                        <button class="btn ${n.isVisible ? '' : 'btn-danger'}" style="padding: 0.1rem 0.3rem; font-size: 0.7rem; margin-left: 5px; flex-shrink: 0;" onclick="event.stopPropagation(); window.toggleEntityVisibility('npc', '${n.id}')" title="${n.isVisible ? 'Visible' : 'Oculto'}"><i class="fa-solid ${n.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                    </div>
                    <div style="font-size: 0.75em; font-style: italic; color: #555; margin-bottom: 0.3rem;">${n.raceAlignment || 'Desconocido'}</div>
                    <div style="font-size: 0.8em; color: var(--leather-dark); font-weight: bold;">
                        <span>CA: ${n.ac || '-'}</span> · <span style="color: var(--red-ink);">HP: ${n.hp || '-'}</span>
                    </div>

                    <!-- Collapsible Details -->
                    <div style="background: rgba(0,0,0,0.02); padding: 0.4rem; margin-top: 0.5rem; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05);">
                        <div class="flex-between" style="cursor: pointer;" onclick="event.stopPropagation(); window.toggleDmSecretVisibility('npc', '${n.id}')">
                            <strong style="color: var(--leather-dark); font-size: 0.8em;"><i class="fa-solid fa-list-ul"></i> Detalles</strong>
                            <i class="fa-solid ${n._uiSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.7em; color: var(--text-muted);"></i>
                        </div>
                        ${n._uiSecretVisible ? `
                            <div style="margin-top: 0.5rem; font-size: 0.85em; animation: fadeInSlideUp 0.3s ease-out forwards;">
                                <p style="white-space: pre-wrap; margin-bottom: 0.5rem;"><i class="fa-solid fa-theater-masks"></i> <strong>Actitud/Voz:</strong> ${n.behavior || '...'}</p>
                                
                                <!-- Secreto DM con toggle -->
                                <div style="background: rgba(0,0,0,0.03); border-left: 3px solid var(--red-ink); padding: 0.4rem; border-radius: 0 4px 4px 0;">
                                    <div class="flex-between">
                                        <strong style="color: var(--red-ink); font-size: 0.85em;"><i class="fa-solid fa-user-secret"></i> Secreto</strong>
                                        <button class="btn" style="padding: 0.1rem 0.3rem; font-size: 0.65rem; background: ${n.secretVisible ? 'var(--gold-dim)' : 'transparent'}; border: 1px solid var(--parchment-dark);" onclick="event.stopPropagation(); window.toggleSecretVisibility('npc', '${n.id}')" title="${n.secretVisible ? 'Visible para Jugadores' : 'Oculto para Jugadores'}">
                                            <i class="fa-solid ${n.secretVisible ? 'fa-unlock' : 'fa-lock'}"></i>
                                        </button>
                                    </div>
                                    <p style="white-space: pre-wrap; margin: 0.3em 0 0 0; font-size: 0.95em;">${n.motivation || 'Sin notas secretas.'}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- CRUD -->
                    <div style="display: flex; gap: 0.3rem; margin-top: auto; justify-content: flex-end; padding-top: 0.4rem; border-top: 1px solid var(--parchment-dark);">
                        ${n.url ? `<button class="btn btn-project" style="padding: 0.2rem 0.4rem; font-size:0.75rem; ${(window.state.get().publicDisplay || {}).imageUrl === n.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${n.url}')" title="Proyectar"><i class="fa-solid fa-display"></i></button>` : ''}
                        <button class="btn" style="padding: 0.2rem 0.4rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.openEntityModal('npc', '${n.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" style="padding: 0.2rem 0.4rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.deleteEntity('npc', '${n.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';
    container.innerHTML = html;
}

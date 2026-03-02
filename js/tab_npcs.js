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
        <div class="grid-2">
    `;

    if (!npcs || npcs.length === 0) html += '<p class="text-muted">No hay NPCs.</p>';
    else {
        npcs.forEach(n => {
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
                        
                        <!-- Contenedor Secreto (Visible para DM, toggle para Jugadores) -->
                        <div style="background: rgba(0,0,0,0.03); border-left: 3px solid var(--red-ink); padding: 0.5rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0;">
                            <div class="flex-between">
                                <strong style="color: var(--red-ink); font-size: 0.85em;"><i class="fa-solid fa-user-secret"></i> Secreto DM</strong>
                                <button class="btn" style="padding: 0.1rem 0.4rem; font-size: 0.7rem; background: ${n.secretVisible ? 'var(--gold-dim)' : 'transparent'}; border: 1px solid var(--parchment-dark);" onclick="event.stopPropagation(); window.toggleSecretVisibility('npc', '${n.id}')" title="${n.secretVisible ? 'Visible para Jugadores' : 'Oculto para Jugadores'}">
                                    <i class="fa-solid ${n.secretVisible ? 'fa-unlock' : 'fa-lock'}"></i>
                                </button>
                            </div>
                            <p style="font-size: 0.85em; white-space: pre-wrap; margin-top: 0.5em; margin-bottom: 0;">${n.motivation || 'Sin notas secretas.'}</p>
                        </div>

                        <!-- Acciones -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            ${n.url ? `<button class="btn btn-project" style="padding: 0.3rem 0.6rem; font-size:0.9rem; ${(window.state.get().publicDisplay || {}).imageUrl === n.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${n.url}')" title="Proyectar imagen"><i class="fa-solid fa-display"></i></button>` : ''}
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

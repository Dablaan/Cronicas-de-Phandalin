// ----------------------------------------------------
// Player Features: Maps (Extracted)
// ----------------------------------------------------
function renderMaps(currentState) {
    const { session, maps } = currentState;
    const container = document.getElementById('tab-maps');

    if (session.role === 'DM') {
        window.renderDMMaps(currentState);
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
                    ${m.secretVisible && m.dmNotes ? `<p style="color: var(--red-ink); font-style: italic; white-space: pre-wrap; font-size: 0.85em;"><strong>Descubrimiento:</strong> ${m.dmNotes}</p>` : ''}
                    
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
                        
                        <!-- Contenedor Secreto (Notas DM) -->
                        <div style="background: rgba(0,0,0,0.03); border-left: 3px solid var(--red-ink); padding: 0.5rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0;">
                            <div class="flex-between">
                                <strong style="color: var(--red-ink); font-size: 0.85em;"><i class="fa-solid fa-mask"></i> Notas DM</strong>
                                <button class="btn" style="padding: 0.1rem 0.4rem; font-size: 0.7rem; background: ${m.secretVisible ? 'var(--gold-dim)' : 'transparent'}; border: 1px solid var(--parchment-dark);" onclick="event.stopPropagation(); window.toggleSecretVisibility('map', '${m.id}')" title="${m.secretVisible ? 'Visible para Jugadores' : 'Oculto para Jugadores'}">
                                    <i class="fa-solid ${m.secretVisible ? 'fa-unlock' : 'fa-lock'}"></i>
                                </button>
                            </div>
                            <div style="font-size: 0.85em; white-space: pre-wrap; margin-top: 0.5em; margin-bottom: 0;">${m.dmNotes || 'Sin notas del master.'}</div>
                        </div>

                        <!-- Acciones -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            ${m.url ? `<button class="btn btn-project" style="padding: 0.3rem 0.6rem; font-size:0.9rem; ${(window.state.get().publicDisplay || {}).imageUrl === m.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${m.url}')" title="Proyectar imagen"><i class="fa-solid fa-display"></i></button>` : ''}
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

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

    // Ordenar alfabéticamente
    const sorted = [...visibleMaps].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));

    let html = '<h3><i class="fa-solid fa-map"></i> Mapas y Lugares</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">';
    sorted.forEach(m => {
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
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
    `;

    if (!maps || maps.length === 0) html += '<p class="text-muted">No hay Mapas.</p>';
    else {
        // Ordenar alfabéticamente
        const sorted = [...maps].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
        sorted.forEach(m => {
            html += `
                <div class="card" style="cursor: pointer; position: relative; padding: 0.6rem; display: flex; flex-direction: column; ${m.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    <div style="width: 100%; height: 100px; overflow: hidden; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
                        ${m.url
                    ? `<img src="${m.url}" style="width: 100%; height: 100%; object-fit: cover;" onclick="event.stopPropagation(); window.openLightbox('${m.url}')" title="Clic para ampliar">`
                    : `<div style="width: 100%; height: 100%; background-color: var(--leather-light); display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-map fa-2x text-muted"></i></div>`
                }
                    </div>
                    
                    <!-- Name + Visibility -->
                    <div class="flex-between" style="flex-wrap: nowrap; margin-bottom: 0.2rem;">
                        <h4 style="margin: 0; font-size: 1em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.name}"><i class="fa-solid fa-map" style="font-size: 0.8em;"></i> ${m.name}</h4>
                        <button class="btn ${m.isVisible ? '' : 'btn-danger'}" style="padding: 0.1rem 0.3rem; font-size: 0.7rem; margin-left: 5px; flex-shrink: 0;" onclick="event.stopPropagation(); window.toggleEntityVisibility('map', '${m.id}')" title="${m.isVisible ? 'Visible' : 'Oculto'}"><i class="fa-solid ${m.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                    </div>
                    <div style="font-size: 0.75em; color: var(--gold-dim); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${m.environmentType || 'Ubicación Desconocida'}</div>

                    <!-- CRUD -->
                    <div style="display: flex; gap: 0.3rem; margin-top: auto; justify-content: flex-end; padding-top: 0.4rem; border-top: 1px solid var(--parchment-dark);">
                        ${m.url ? `<button class="btn btn-project" style="padding: 0.2rem 0.4rem; font-size:0.75rem; ${(window.state.get().publicDisplay || {}).imageUrl === m.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${m.url}')" title="Proyectar"><i class="fa-solid fa-display"></i></button>` : ''}
                        <button class="btn" style="padding: 0.2rem 0.4rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.openEntityModal('map', '${m.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" style="padding: 0.2rem 0.4rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.deleteEntity('map', '${m.id}')" title="Borrar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';

    container.innerHTML = html;
}

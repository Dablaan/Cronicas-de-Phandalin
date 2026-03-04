// ----------------------------------------------------
// Player Features: Bestiario (Extracted)
// ----------------------------------------------------

window.renderBestiario = function (currentState) {
    const { bestiario } = currentState;
    const container = document.getElementById('tab-bestiario');
    if (!container) return;

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
                    <div class="card-horizontal-content" style="color: var(--leather-dark); display: flex; flex-direction: column; justify-content: space-between; padding: 1rem;">
                        
                        <!-- Header -->
                        <div>
                             <h4 style="margin: 0; font-size: 1.6em; font-family: 'Times New Roman', serif; font-weight: bold; color: var(--red-ink); text-transform: uppercase;">${m.name}</h4>
                             <div style="font-size: 0.85em; font-style: italic; color: #555;">${m.subtitle || 'Tipo desconocido'}</div>
                             
                             <div style="margin-top: 1rem; font-size: 1.1em;">
                                <strong style="color: var(--red-ink);">Desafío (CR):</strong> ${m.challenge || '-'}
                             </div>
                        </div>

                        <!-- Acciones CRUD -->
                        <div style="display: flex; gap: 0.5rem; margin-top: auto; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--parchment-dark);">
                            ${m.url ? `<button class="btn btn-project" style="padding: 0.3rem 0.6rem; font-size:0.9rem; ${(window.state.get().publicDisplay || {}).imageUrl === m.url ? 'background: var(--gold-dim); color: #fff;' : ''}" onclick="event.stopPropagation(); window.projectToScreen('${m.url}')" title="Proyectar imagen"><i class="fa-solid fa-display"></i></button>` : ''}
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

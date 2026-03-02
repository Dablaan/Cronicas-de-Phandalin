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

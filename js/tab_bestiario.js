// ----------------------------------------------------
// Player Features: Bestiario (Extracted)
// ----------------------------------------------------

// --- TEMPORAL: Función para poblar bestiario desde el cliente ---
window.poblarBestiario = async function () {
    const srdMonsters = [
        {
            id: 'm_srd_goblin',
            name: 'Goblin',
            subtitle: 'Humanoide pequeño (goblinoide), neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 15,
            hp: 7,
            hpCurrent: 7,
            hpMax: 7,
            speed: '30 pies',
            str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8,
            skills: 'Sigilo +6',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1/4 (50 XP)',
            description: 'Pequeños humanoides de piel verdosa que habitan en cuevas y ruinas. Son cobardes individualmente pero peligrosos en grupo.',
            features: '',
            actions: 'Cimitarra: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño cortante.\n\nArco Corto: Ataque a distancia: +4 a impactar, alcance 80/320 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: 'Escapar Ágil: El goblin realiza la acción de Esconderse o Retirarse como acción adicional.',
            reactions: '',
            equip: 'Armadura de cuero, escudo, cimitarra, arco corto',
            _uiSecretVisible: false
        },
        {
            id: 'm_srd_skeleton',
            name: 'Esqueleto',
            subtitle: 'No-muerto mediano, legal malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 13,
            hpCurrent: 13,
            hpMax: 13,
            speed: '30 pies',
            str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1/4 (50 XP)',
            description: 'Restos animados de un humanoide, impulsados por magia oscura. Obedecen ciegamente a su creador.',
            features: 'Vulnerabilidad al daño contundente.\n\nInmunidad al veneno y a la condición envenenado.',
            actions: 'Espada Corta: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño perforante.\n\nArco Corto: Ataque a distancia: +4 a impactar, alcance 80/320 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: '',
            reactions: '',
            equip: 'Armadura de fragmentos, espada corta, arco corto',
            _uiSecretVisible: false
        },
        {
            id: 'm_srd_wolf',
            name: 'Lobo',
            subtitle: 'Bestia mediana, sin alineamiento',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 11,
            hpCurrent: 11,
            hpMax: 11,
            speed: '40 pies',
            str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6,
            skills: 'Percepción +3, Sigilo +4',
            senses: 'Percepción pasiva 13',
            challenge: '1/4 (50 XP)',
            description: 'Depredador ágil que caza en manada. Su fuerza reside en la coordinación con otros lobos.',
            features: 'Oído y Olfato Agudos: Ventaja en pruebas de Sabiduría (Percepción) basadas en oído u olfato.\n\nTácticas de Manada: Ventaja en tiradas de ataque contra una criatura si un aliado del lobo está a 5 pies y no está incapacitado.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 7 (2d4 + 2) daño perforante. El objetivo debe superar una salvación de Fuerza DC 11 o caer derribado.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_srd_zombie',
            name: 'Zombie',
            subtitle: 'No-muerto mediano, neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 8,
            hp: 22,
            hpCurrent: 22,
            hpMax: 22,
            speed: '20 pies',
            str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 8',
            challenge: '1/4 (50 XP)',
            description: 'Cadáver reanimado por nigromancia. Lento pero resistente, avanza sin cesar hacia sus víctimas.',
            features: 'Fortaleza de No-Muerto: Si el daño reduce al zombie a 0 HP, realiza una tirada de salvación de Constitución (DC 5 + daño recibido). Si tiene éxito, queda a 1 HP en su lugar. No funciona con daño radiante ni golpes críticos.\n\nInmunidad al veneno y a la condición envenenado.',
            actions: 'Golpe: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 4 (1d6 + 1) daño contundente.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_srd_orc',
            name: 'Orco',
            subtitle: 'Humanoide mediano (orco), caótico malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 15,
            hpCurrent: 15,
            hpMax: 15,
            speed: '30 pies',
            str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10,
            skills: 'Intimidación +2',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1/2 (100 XP)',
            description: 'Guerreros brutales y agresivos que viven para la batalla. Sirven a jefes tribales o señores de la guerra.',
            features: 'Agresivo: Como acción adicional, el orco puede moverse hasta su velocidad hacia una criatura hostil visible.',
            actions: 'Gran Hacha: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 9 (1d12 + 3) daño cortante.\n\nJabalina: Ataque cuerpo a cuerpo o a distancia: +5 a impactar, alcance 5 pies o 30/120 pies. Impacto: 6 (1d6 + 3) daño perforante.',
            bonus: 'Agresivo: El orco se mueve hasta su velocidad hacia una criatura hostil que pueda ver.',
            reactions: '',
            equip: 'Pieles, gran hacha, jabalina',
            _uiSecretVisible: false
        }
    ];

    try {
        const currentState = window.state.get();
        const existingBestiario = currentState.bestiario || [];

        // Filtrar duplicados por ID
        const newMonsters = srdMonsters.filter(
            nm => !existingBestiario.find(em => em.id === nm.id)
        );

        if (newMonsters.length === 0) {
            console.log('⚠️ Poblar Bestiario: Todos los monstruos SRD ya existen. No se añadió nada.');
            alert('Todos los monstruos SRD ya están en el bestiario.');
            return;
        }

        const updatedBestiario = [...existingBestiario, ...newMonsters];
        await window.state.update({ bestiario: updatedBestiario });

        console.log(`✅ Poblar Bestiario: ${newMonsters.length} monstruos añadidos correctamente a Supabase.`);
        console.log('Monstruos añadidos:', newMonsters.map(m => m.name).join(', '));
        alert(`¡Éxito! ${newMonsters.length} monstruos añadidos: ${newMonsters.map(m => m.name).join(', ')}`);
    } catch (err) {
        console.error('❌ Error al poblar bestiario:', err);
        alert('Error al poblar bestiario. Revisa la consola.');
    }
};
// --- FIN TEMPORAL ---

window.renderBestiario = function (currentState) {
    const { bestiario } = currentState;
    const isDM = currentState.session && currentState.session.role === 'DM';
    const container = document.getElementById('tab-bestiario');
    if (!container) return;

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Bestiario Monstruoso</h3>
            <div style="display: flex; gap: 0.5rem;">
                ${isDM ? `<button class="btn" style="background: var(--gold-dim); color: #fff;" onclick="window.poblarBestiario()"><i class="fa-solid fa-wand-magic-sparkles"></i> Poblar Bestiario</button>` : ''}
                <button class="btn" onclick="window.openEntityModal('monster')"><i class="fa-solid fa-dragon"></i> Nuevo Monstruo</button>
            </div>
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

                        <!-- All Details (Collapsible) -->
                        <div style="background: rgba(0,0,0,0.02); padding: 0.5rem; margin-top: 1rem; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05);">
                            <div class="flex-between" style="cursor: pointer;" onclick="event.stopPropagation(); window.toggleDmSecretVisibility('monster', '${m.id}')">
                                <strong style="color: var(--red-ink); font-size: 0.9em;"><i class="fa-solid fa-list-ul"></i> Ver todos los detalles</strong>
                                <i class="fa-solid ${m._uiSecretVisible ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.8em; color: var(--text-muted);"></i>
                            </div>
                            
                            ${m._uiSecretVisible ? `
                                <div style="margin-top: 1rem; animation: fadeInSlideUp 0.3s ease-out forwards;">
                                    
                                    <!-- Combat Stats -->
                                    <div style="font-size: 0.9em; line-height: 1.4; border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                                        <div><strong style="color: var(--red-ink);">CA:</strong> ${m.ac || '-'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color: var(--red-ink);">HP:</strong> ${m.hp || '-'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color: var(--red-ink);">Velocidad:</strong> ${m.speed || '30 pies'} ${m.init ? `&nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color: var(--red-ink);">Iniciativa:</strong> ${m.init}` : ''}</div>
                                    </div>

                                    <!-- Attributes Grid -->
                                    <div style="display:flex; gap:10px; font-size: 0.8em; justify-content: space-between; text-align: center; color: var(--red-ink); border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                                         <div><strong>FUE</strong><br><span style="color:black;">${m.str || 10} (${getMod(m.str)})</span></div>
                                         <div><strong>DES</strong><br><span style="color:black;">${m.dex || 10} (${getMod(m.dex)})</span></div>
                                         <div><strong>CON</strong><br><span style="color:black;">${m.con || 10} (${getMod(m.con)})</span></div>
                                         <div><strong>INT</strong><br><span style="color:black;">${m.int || 10} (${getMod(m.int)})</span></div>
                                         <div><strong>SAB</strong><br><span style="color:black;">${m.wis || 10} (${getMod(m.wis)})</span></div>
                                         <div><strong>CAR</strong><br><span style="color:black;">${m.cha || 10} (${getMod(m.cha)})</span></div>
                                    </div>

                                    <!-- Additional Details -->
                                    <div style="font-size: 0.85em; line-height: 1.4; border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                                        ${m.saves ? `<div><strong style="color: var(--red-ink);">TS:</strong> ${m.saves}</div>` : ''}
                                        ${m.skills ? `<div><strong style="color: var(--red-ink);">Habilidades:</strong> ${m.skills}</div>` : ''}
                                        ${m.immunities ? `<div><strong style="color: var(--red-ink);">Vulnerabilidades / Inmunidades:</strong> ${m.immunities}</div>` : ''}
                                        ${m.senses ? `<div><strong style="color: var(--red-ink);">Sentidos:</strong> ${m.senses}</div>` : ''}
                                        ${m.langs ? `<div><strong style="color: var(--red-ink);">Idiomas:</strong> ${m.langs}</div>` : ''}
                                    </div>

                                    <!-- Text Blocks -->
                                    <div style="font-size: 0.85em; padding-top: 0.5rem;">
                                        ${m.description ? `<div style="font-style: italic; margin-bottom: 1rem; color: #444; border-left: 2px solid var(--red-ink); padding-left: 0.5rem;">${m.description}</div>` : ''}
                                        ${m.features ? `<div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.features}</div>` : ''}
                                        
                                        ${m.actions ? `<h5 style="color: var(--red-ink); border-bottom: 1px dotted var(--red-ink); margin-bottom: 0.3rem;">Acciones</h5>
                                        <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.actions}</div>` : ''}
                                        
                                        ${m.bonus ? `<h5 style="color: var(--red-ink); border-bottom: 1px dotted var(--red-ink); margin-bottom: 0.3rem;">Adicionales</h5>
                                        <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.bonus}</div>` : ''}
                                        
                                        ${m.reactions ? `<h5 style="color: var(--red-ink); border-bottom: 1px dotted var(--red-ink); margin-bottom: 0.3rem;">Reacciones</h5>
                                        <div style="white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.4;">${m.reactions}</div>` : ''}
                                        
                                        ${m.equip ? `<h5 style="color: var(--red-ink); border-bottom: 1px dotted var(--red-ink); margin-bottom: 0.3rem;">Equipo</h5>
                                        <div style="white-space: pre-wrap; margin-bottom: 0.5rem; line-height: 1.4;">${m.equip}</div>` : ''}
                                    </div>
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

// ----------------------------------------------------
// Player Features: World & Notes (Extracted)
// ----------------------------------------------------

function renderNotes(currentState) {
    const { session, notes, players } = currentState;
    const container = document.getElementById('tab-notes');

    if (session.role === 'DM') {
        window.renderDMMirrorNotes(currentState);
        return;
    }

    const playerId = session.playerId;
    const playerNotes = notes[playerId] || '';

    container.innerHTML = `
        <div class="card">
            <h3><i class="fa-solid fa-book-journal-whills"></i> Diario Personal</h3>
            <p class="text-muted mb-1">Estas notas son privadas (solo tú y el DM pueden verlas).</p>
            <textarea id="personal-notes" placeholder="Escribe aquí tus aventuras...">${playerNotes}</textarea>
            <button class="btn mt-1" onclick="window.savePersonalNotes('${playerId}')">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Notas
            </button>
            <span id="notes-saved-msg" style="color: var(--leather-light); display: none; margin-left: 1rem;"><i class="fa-solid fa-check"></i> Guardado</span>
        </div>
    `;
}

window.savePersonalNotes = function (playerId) {
    const text = document.getElementById('personal-notes').value;
    const notes = { ...window.state.get().notes, [playerId]: text };
    window.state.update({ notes });

    const msg = document.getElementById('notes-saved-msg');
    if (msg) {
        msg.style.display = 'inline-block';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2000);
    }
};

window.renderDMMirrorNotes = function (currentState) {
    const { players, notes, npcs, maps, session } = currentState;
    const container = document.getElementById('tab-notes');

    // UI State for selected player in mirror
    const currentlySelected = container.getAttribute('data-mirror-player') || (players.length > 0 ? players[0].id : null);

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>El Espejo del Master</h3>
            <p class="text-muted" style="font-size: 0.9em;">Observa las crónicas de tus jugadores</p>
        </div>
    `;

    if (players.length === 0) {
        html += '<p class="text-muted">Aún no hay jugadores en la mesa.</p>';
        container.innerHTML = html;
        return;
    }

    // Selector
    html += `
        <div class="mb-1">
            <label>Selecciona un jugador:</label>
            <select onchange="document.getElementById('tab-notes').setAttribute('data-mirror-player', this.value); window.renderDMMirrorNotes(window.state.get())">
                ${players.map(p => `<option value="${p.id}" ${p.id === currentlySelected ? 'selected' : ''}>${p.name} (Lvl ${p.level})</option>`).join('')}
            </select>
        </div>
    `;

    if (!currentlySelected) {
        container.innerHTML = html;
        return;
    }

    const selectedPlayer = players.find(p => p.id === currentlySelected);
    const personalNotes = notes[currentlySelected] || '<em class="text-muted">El jugador no ha escrito notas personales aún.</em>';

    // Personal notes
    html += `
        <div class="card mb-1" style="background: rgba(255,255,255,0.3);">
            <div class="flex-between">
                <h4><i class="fa-solid fa-book-journal-whills"></i> Diario Privado de ${selectedPlayer.name}</h4>
                <button class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="window.resetPlayerPassword('${selectedPlayer.id}')" title="Borrar Cerrojo Mágico de este jugador">
                    <i class="fa-solid fa-unlock-keyhole"></i> Resetear Contraseña
                </button>
            </div>
            <div style="white-space: pre-wrap; margin-top: 1rem; padding: 1rem; border-left: 3px solid var(--leather-dark);">${personalNotes}</div>
        </div>
    `;

    // Get all nested notes belonging to this player inside Maps and NPCs
    const playerEntityNotes = [];

    npcs.forEach(n => {
        const pNote = n.notes?.find(note => note.playerId === currentlySelected);
        if (pNote && pNote.text.trim() !== '') {
            playerEntityNotes.push({ type: 'npc', name: n.name, text: pNote.text });
        }
    });

    maps.forEach(m => {
        const pNote = m.notes?.find(note => note.playerId === currentlySelected);
        if (pNote && pNote.text.trim() !== '') {
            playerEntityNotes.push({ type: 'map', name: m.name, text: pNote.text });
        }
    });

    html += `<h4><i class="fa-solid fa-feather"></i> Crónicas Guardadas (NPCs y Mapas)</h4>`;

    if (playerEntityNotes.length === 0) {
        html += '<p class="text-muted">No ha escrito apuntes sobre ningún NPC o Mapa aún.</p>';
    } else {
        html += '<div class="grid-2">';
        playerEntityNotes.forEach(en => {
            html += `
                <div class="card" style="background: rgba(255,255,255,0.3);">
                    <h5 style="color: var(--leather-light); border-bottom: 1px solid var(--parchment-dark); padding-bottom: 0.2rem;"><i class="fa-solid ${en.type === 'map' ? 'fa-map' : 'fa-user'}"></i> ${en.name}</h5>
                    <div style="white-space: pre-wrap; font-size: 0.9em; margin-top: 0.5rem;">${en.text}</div>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
};

window.resetPlayerPassword = function (playerId) {
    if (confirm("¿Seguro que deseas romper el Cerrojo Mágico de este jugador? Tendrá que configurar uno nuevo al entrar.")) {
        const currentPlayers = window.state.get().players.map(p =>
            p.id === playerId ? { ...p, passcode: null } : p
        );
        window.state.update({ players: currentPlayers });
        alert("Contraseña reseteada con éxito.");
    }
};

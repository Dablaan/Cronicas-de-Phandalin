// ----------------------------------------------------
// Player Features: Library (Extracted)
// ----------------------------------------------------

window.renderLibrary = function (currentState) {
    const { recursos, session } = currentState;
    const isDM = session.role === 'DM';
    const container = document.getElementById('tab-library');

    let html = `
        <div class="flex-between mb-1" style="border-bottom: 2px solid var(--parchment-dark); padding-bottom: 0.5rem;">
            <h3>Biblioteca de Neverwinter</h3>
            ${isDM ? `<button class="btn" onclick="window.showAddRecursoForm()"><i class="fa-solid fa-plus"></i> Añadir Tomo/Recurso</button>` : ''}
        </div>
        
        ${isDM ? `
        <div id="formulario-recurso" class="card" style="display: none; margin-bottom: 1.5rem; background: rgba(255,255,255,0.4); border: 2px dashed var(--leather-light);">
            <h4 style="margin-top:0; color:var(--dark-crimson);">Nuevo Recurso Visual</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <input type="text" id="nuevo-recurso-nombre" placeholder="Nombre del Tomo (Ej: Manual del Jugador)" style="padding: 0.5rem;">
                <input type="url" id="nuevo-recurso-portada" placeholder="URL de la Imagen de Portada" style="padding: 0.5rem;">
                <input type="url" id="nuevo-recurso-enlace" placeholder="URL del Enlace de Descarga" style="padding: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn btn-primary" onclick="window.submitRecurso()">Guardar Tomo</button>
                    <button class="btn" onclick="window.hideAddRecursoForm()">Cancelar</button>
                </div>
            </div>
        </div>
        ` : ''}
    `;

    if (!recursos || recursos.length === 0) {
        html += '<p class="text-muted">La estantería está vacía en este momento.</p>';
        container.innerHTML = html;
        return;
    }

    html += '<div class="biblioteca-grid">';
    recursos.forEach(r => {
        html += `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 100%;">
                ${isDM ? `
                <div style="position: absolute; top: -10px; right: -10px; z-index: 10; display: flex; gap: 5px;">
                    <button onclick="window.showAddRecursoForm('${r.id}')" style="background: var(--leather-dark); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; justify-content: center; align-items: center;" title="Editar Recurso"><i class="fa-solid fa-pen" style="font-size: 0.7em;"></i></button>
                    <button onclick="window.deleteRecurso('${r.id}')" style="background: var(--red-ink); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; justify-content: center; align-items: center;" title="Borrar Recurso"><i class="fa-solid fa-times" style="font-size: 0.9em;"></i></button>
                </div>
                ` : ''}
                <a href="${r.enlaceUrl}" target="_blank" class="biblioteca-item">
                    <img src="${r.portadaUrl}" alt="${r.nombre}" onerror="this.src='https://via.placeholder.com/150x200?text=Manual'">
                    <span>${r.nombre}</span>
                </a>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
};

let editingRecursoId = null;

window.showAddRecursoForm = function (id = null) {
    editingRecursoId = id;
    const form = document.getElementById('formulario-recurso');

    if (id) {
        const recurso = window.state.get().recursos.find(r => r.id === id);
        if (recurso) {
            document.getElementById('nuevo-recurso-nombre').value = recurso.nombre;
            document.getElementById('nuevo-recurso-portada').value = recurso.portadaUrl;
            document.getElementById('nuevo-recurso-enlace').value = recurso.enlaceUrl;
        }
    } else {
        document.getElementById('nuevo-recurso-nombre').value = '';
        document.getElementById('nuevo-recurso-portada').value = '';
        document.getElementById('nuevo-recurso-enlace').value = '';
    }

    if (form) form.style.display = 'block';
};

window.hideAddRecursoForm = function () {
    const form = document.getElementById('formulario-recurso');
    if (form) {
        form.style.display = 'none';
        editingRecursoId = null;
    }
};

window.submitRecurso = async function () {
    const nombre = document.getElementById('nuevo-recurso-nombre').value.trim();
    const portadaUrl = document.getElementById('nuevo-recurso-portada').value.trim();
    const enlaceUrl = document.getElementById('nuevo-recurso-enlace').value.trim();

    if (!nombre || !portadaUrl || !enlaceUrl) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    const currentRecursos = window.state.get().recursos || [];

    if (editingRecursoId) {
        // Edit Mode
        const updatedRecursos = currentRecursos.map(r =>
            r.id === editingRecursoId ? { ...r, nombre, portadaUrl, enlaceUrl } : r
        );
        await window.state.update({ recursos: updatedRecursos });
    } else {
        // Create Mode
        const newRecurso = {
            id: 'rec_' + Date.now(),
            nombre,
            portadaUrl,
            enlaceUrl
        };
        await window.state.update({ recursos: [...currentRecursos, newRecurso] });
    }

    editingRecursoId = null;
    window.hideAddRecursoForm();
};

window.deleteRecurso = function (id) {
    if (confirm("¿Seguro que deseas borrar este tomo de la biblioteca?")) {
        const currentRecursos = window.state.get().recursos || [];
        window.state.update({ recursos: currentRecursos.filter(r => r.id !== id) });
    }
};

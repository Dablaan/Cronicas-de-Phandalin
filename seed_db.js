const supabaseUrl = 'https://gwryzkejvymurjnyfwpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cnl6a2VqdnltdXJqbnlmd3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjg1NDgsImV4cCI6MjA4NzcwNDU0OH0.x1PU7qnWJTLA5P6DO0Og6SlnSi0vIyTh98iu3GCk3fw';

async function fetchState() {
    const res = await fetch(`${supabaseUrl}/rest/v1/kv_store?key=eq.phandalin_data`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const data = await res.json();
    return data && data.length > 0 ? data[0].value : null;
}

async function saveState(value) {
    const res = await fetch(`${supabaseUrl}/rest/v1/kv_store`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key: 'phandalin_data', value })
    });
    if (!res.ok) {
        console.error(await res.text());
        throw new Error('Failed to save state');
    }
}

async function seed() {
    console.log("Fetching current state from Supabase...");
    let state = await fetchState();

    if (!state) {
        console.log("No state found, initializing empty state...");
        state = { players: [], notes: {}, npcs: [], maps: [], recursos: [] };
    }

    console.log(`Current State: ${state.players.length} players, ${state.npcs.length} npcs, ${state.maps.length} maps.`);

    const newPlayers = [
        {
            id: 'p_f1',
            name: 'Grom',
            playerName: 'Ana',
            race: 'Semiorco',
            class: 'Bárbaro',
            background: 'Forastero',
            alignment: 'Caótico Bueno',
            level: 3,
            xp: 900,
            hpCurrent: 35,
            hpMax: 35,
            hitDice: { total: '3d12', current: 3 },
            ac: 15,
            speed: 40,
            initiative: 2,
            passivePerception: 13,
            inspiration: false,
            stats: { str: 18, dex: 14, con: 16, int: 8, wis: 10, cha: 12 },
            saves: { str: { prof: true, bonus: 6 }, dex: false, con: { prof: true, bonus: 5 }, int: false, wis: false, cha: false },
            skills: { athletics: { prof: true, bonus: 6 }, intimidation: { prof: true, bonus: 3 }, survival: { prof: true, bonus: 2 } },
            deathSaves: { successes: 0, failures: 0 },
            traits: 'Furia de combate, defensa sin armadura',
            attacks: [
                { id: 'atk_1', name: 'Gran Hacha', bonus: '+6', damage: '1d12+4 Cortante' },
                { id: 'atk_2', name: 'Jabalina', bonus: '+4', damage: '1d6+4 Perforante' }
            ],
            spells: [],
            spellSlots: {},
            equipment: { equipped: 'Gran Hacha', backpack: 'Mochila de explorador, 10 po' }
        },
        {
            id: 'p_f2',
            name: 'Elara',
            playerName: 'Luis',
            race: 'Elfo (Alto)',
            class: 'Mago',
            background: 'Sabio',
            alignment: 'Neutral Bueno',
            level: 3,
            xp: 950,
            hpCurrent: 20,
            hpMax: 20,
            hitDice: { total: '3d6', current: 3 },
            ac: 12,
            speed: 30,
            initiative: 2,
            passivePerception: 14,
            inspiration: true,
            stats: { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 10 },
            saves: { str: false, dex: false, con: false, int: { prof: true, bonus: 6 }, wis: { prof: true, bonus: 4 }, cha: false },
            skills: { arcana: { prof: true, bonus: 6 }, history: { prof: true, bonus: 6 }, investigation: { prof: true, bonus: 6 } },
            deathSaves: { successes: 0, failures: 0 },
            traits: 'Visión en la oscuridad, Trance, Recuperación Arcana',
            attacks: [
                { id: 'atk_3', name: 'Rayo de Escarcha', bonus: '+6', damage: '1d8 Frío' }
            ],
            spells: [
                { id: 'sp_1', name: 'Proyectil Mágico', level: 1, castingTime: '1 Acción', range: '120 pies', components: 'V, S', duration: 'Instantáneo', description: 'Crea 3 dardos mágicos brillantes.' },
                { id: 'sp_2', name: 'Escudo', level: 1, castingTime: '1 Reacción', range: 'Personal', components: 'V, S', duration: '1 asalto', description: '+5 CA contra un ataque.' }
            ],
            spellSlots: { 1: { max: 4, used: 2 }, 2: { max: 2, used: 0 } },
            equipment: { equipped: 'Bata de mago, Bastón', backpack: 'Libro de conjuros, componentes, 25 po' }
        }
    ];

    const newNpcs = [
        {
            id: 'npc_1',
            name: 'Sildar Hallwinter',
            description: 'Un veterano guerrero de Neverwinter, miembro de la Alianza de los Lores. Tiene unos cincuenta años, pelo grisáceo y una actitud honorable.',
            isVisible: true,
            secrets: [
                { id: 'sec_1', text: 'Está buscando a un mago llamado Iarno Albrek.', isVisible: false }
            ],
            notes: []
        },
        {
            id: 'npc_2',
            name: 'Toblen Piedracolina',
            description: 'Propietario de la Posada del Poyo de Piedracolina en Phandalin. Un humano amable, bajo y regordete, siempre dispuesto a compartir chismes locales.',
            isVisible: true,
            secrets: [
                { id: 'sec_2', text: 'Los Capas Rojas han amenazado a su familia.', isVisible: true }
            ],
            notes: []
        },
        {
            id: 'npc_3',
            name: 'Halia Thornton',
            description: 'Directora del Intercambio de Mineros de Phandalin. Es una mujer calculadora, ambiciosa y con muchos recursos.',
            isVisible: true,
            secrets: [
                { id: 'sec_3', text: 'Es una agente encubierta de los Zhentarim y quiere apoderarse de la banda de los Capas Rojas.', isVisible: false }
            ],
            notes: []
        },
        {
            id: 'npc_4',
            name: 'Klarg',
            description: 'Líder de la banda de goblins en la Guarida de Cragmaw. Un osgo gigante, vanidoso y letal que se cree un rey tribal.',
            isVisible: false,
            secrets: [
                { id: 'sec_4', text: 'Tiene pánico a los lobos', isVisible: false }
            ],
            notes: []
        }
    ];

    const newMaps = [
        {
            id: 'map_1',
            name: 'Mapa Regional de Phandalin',
            url: 'https://dummyimage.com/800x600/363028/d4c18f&text=Mapa+Regional',
            isVisible: true,
            secrets: [],
            notes: []
        },
        {
            id: 'map_2',
            name: 'Guarida de Cragmaw (Cueva)',
            url: 'https://dummyimage.com/800x600/363028/d4c18f&text=Guarida+de+Cragmaw',
            isVisible: false,
            secrets: [
                { id: 'sec_m1', text: 'Trampa de la cascada en la sala principal.', isVisible: false }
            ],
            notes: []
        },
        {
            id: 'map_3',
            name: 'Mansión Tres Blasones',
            url: 'https://dummyimage.com/800x600/363028/d4c18f&text=Mansion+Tres+Blasones',
            isVisible: true,
            secrets: [
                { id: 'sec_m2', text: 'El pasadizo secreto de la bodega lleva al sótano de los Capas Rojas.', isVisible: true }
            ],
            notes: []
        }
    ];

    const newMonsters = [
        {
            id: 'm_owl_1',
            name: 'Oso lechuza',
            subtitle: 'Monstrosidad grande, sin alineamiento (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 59,
            hpCurrent: 59,
            hpMax: 59,
            speed: '40 pies',
            str: 20,
            dex: 12,
            con: 17,
            int: 3,
            wis: 12,
            cha: 7,
            skills: 'Percepción +3',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 13',
            challenge: '3 (700 XP)',
            description: 'Una criatura feroz que combina los rasgos de un oso gigante y un búho real. Conocido por su mal temperamento y su increíble fuerza física.',
            features: 'Vista y Oído Agudos: El oso lechuza tiene ventaja en las pruebas de Sabiduría (Percepción) que dependan de la vista o del olfato.\n\nFuria (5.5): Simplificado para mayor letalidad en combate cercano.',
            actions: 'Desgarrar: Ataque de arma cuerpo a cuerpo: +7 a impactar, alcance 5 pies, un objetivo. Impacto: 14 (2d8 + 5) daño cortante.\n\nMultiataque: El oso lechuza realiza dos ataques de Desgarrar.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_beh_1',
            name: 'Contemplador',
            subtitle: 'Aberración grande, legal malvada (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 18,
            hp: 190,
            hpCurrent: 190,
            hpMax: 190,
            speed: '40 pies (vuelo, levitar)',
            str: 10,
            dex: 14,
            con: 19,
            int: 17,
            wis: 15,
            cha: 18,
            skills: 'Percepción +12',
            senses: 'Visión en la oscuridad 120 pies, Percepción pasiva 22',
            challenge: '13 (10,000 XP)',
            description: 'Un orbe flotante de carne con un gran ojo central y diez tallos oculares. Son genios tiránicos y paranoicos que ven a todos como inferiores.',
            features: 'Cono de Antimateria (5.5): El ojo central del contemplador crea un área de antimagia en un cono de 150 pies.\n\nFlotación: El contemplador levita y es inmune a la condición de derribado.',
            actions: 'Multiataque (5.5): El contemplador usa sus Rayos Oculares tres veces.\n\nRayos Oculares: El contemplador dispara tres rayos al azar de entre 10 opciones.\n\nMordisco: +5 a impactar, alcance 5 pies. Daño: 14 (4d6) perforante.',
            bonus: 'Mirada Paranoica (5.5): Puede reposicionar su cono de antimagia.',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_gold_y_1',
            name: 'Dragón Dorado Joven',
            subtitle: 'Dragón grande, legal bueno (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 18,
            hp: 178,
            hpCurrent: 178,
            hpMax: 178,
            speed: '40 pies, vuelo 80 pies, natación 40 pies',
            str: 23,
            dex: 14,
            con: 21,
            int: 16,
            wis: 13,
            cha: 20,
            skills: 'Perspicacia +5, Percepción +9, Persuasión +9, Sigilo +6',
            senses: 'Visión ciega 30 pies, Visión en la oscuridad 120 pies, Percepción pasiva 19',
            challenge: '10 (5,900 XP)',
            description: 'El más noble de los dragones metálicos. Los dragones dorados son enemigos jurados del mal y buscadores de sabiduría.',
            features: 'Anfibio: Puede respirar aire y agua.\n\nInmunidad al Fuego: No recibe daño por fuego.',
            actions: 'Multiataque (5.5): El dragón realiza tres ataques de Desgarrar. Puede sustituir uno por Aliento de Debilitamiento.\n\nDesgarrar: +10 a impactar, alcance 10 pies. Daño: 17 (2d10 + 6) cortante.\n\nAliento de Fuego (Recarga 5-6): Cono de 30 pies, DC 17 Dex. Daño: 55 (10d10) fuego.\n\nAliento de Debilitamiento: Cono de 30 pies, DC 17 Strength. Penalizadores a daño y pruebas de Fuerza.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        }
    ];

    // Filter out if they already exist to avoid duplicates if run multiple times
    const playersToAdd = newPlayers.filter(np => !state.players.find(p => p.id === np.id));
    const npcsToAdd = newNpcs.filter(nn => !state.npcs.find(n => n.id === nn.id));
    const mapsToAdd = newMaps.filter(nm => !state.maps.find(m => m.id === nm.id));
    const monstersToAdd = newMonsters;

    state.bestiario = (state.bestiario || []).filter(m => !newMonsters.find(nm => nm.id === m.id));

    if (playersToAdd.length === 0 && npcsToAdd.length === 0 && mapsToAdd.length === 0 && monstersToAdd.length === 0) {
        console.log("Data is already seeded!");
        return;
    }

    state.players = [...state.players, ...playersToAdd];
    state.npcs = [...state.npcs, ...npcsToAdd];
    state.maps = [...state.maps, ...mapsToAdd];
    state.bestiario = [...(state.bestiario || []), ...monstersToAdd];

    console.log(`Injecting ${playersToAdd.length} players, ${npcsToAdd.length} npcs, ${mapsToAdd.length} maps, ${monstersToAdd.length} monsters...`);

    await saveState(state);

    console.log("Base de datos de Supabase poblada correctamente!");
}

seed().catch(console.error);

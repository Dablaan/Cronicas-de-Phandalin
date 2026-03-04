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
            id: 'm_gob_1',
            name: 'Trasgo',
            subtitle: 'Humanoide pequeño (goblinoide), neutral malvado (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 15,
            hp: 7,
            hpCurrent: 7,
            hpMax: 7,
            speed: '30 pies',
            str: 8,
            dex: 14,
            con: 10,
            int: 10,
            wis: 8,
            cha: 8,
            skills: 'Sigilo +6',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1/4 (50 XP)',
            description: 'Pequeños humanoides de piel verdosa o amarillenta que tienden a vivir en cuevas o ruinas. Son cobardes por naturaleza, pero astutos cuando atacan en manada.',
            features: '',
            actions: 'Cimitarra: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño cortante.\n\nArco Corto: Ataque a distancia: +4 a impactar, alcance 80/320 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: 'Escaparate Ágil (5.5): El trasgo realiza la acción de Esconderse o Retirarse.',
            reactions: '',
            equip: 'Armadura de cuero, escudo, cimitarra, arco corto',
            _uiSecretVisible: false
        },
        {
            id: 'm_gob_boss_1',
            name: 'Jefe Trasgo',
            subtitle: 'Humanoide pequeño (goblinoide), neutral malvado (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 17,
            hp: 21,
            hpCurrent: 21,
            hpMax: 21,
            speed: '30 pies',
            str: 10,
            dex: 14,
            con: 10,
            int: 10,
            wis: 8,
            cha: 10,
            skills: 'Sigilo +6',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1 (200 XP)',
            description: 'Un trasgo más grande y despiadado que manda en su tribu usando amenazas severas. Usa a sus subordinados como escudos humanos sin dudarlo.',
            features: '',
            actions: 'Multiataque (5.5): El jefe trasgo realiza dos ataques con su cimitarra. El segundo ataque tiene desventaja.\n\nCimitarra: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño cortante.\n\nJabalina: Ataque cuerpo a cuerpo o a distancia: +4 a impactar, alcance 5 pies o 30/120 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: 'Escaparate Ágil (5.5): El jefe trasgo realiza la acción de Esconderse o Retirarse.',
            reactions: 'Redirigir Ataque (5.5): Cuando el jefe va a ser impactado por un ataque, puede elegir a un trasgo aliado situado a 5 pies. Él y el trasgo intercambian lugares y el aliado recibe el impacto.',
            equip: 'Cota de mallas, cimitarra, 3 jabalinas',
            _uiSecretVisible: false
        },
        {
            id: 'm_bugbear_1',
            name: 'Osgo',
            subtitle: 'Humanoide mediano (goblinoide), caótico malvado (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 16,
            hp: 27,
            hpCurrent: 27,
            hpMax: 27,
            speed: '30 pies',
            str: 15,
            dex: 14,
            con: 13,
            int: 8,
            wis: 11,
            cha: 9,
            skills: 'Sigilo +6, Supervivencia +2',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1 (200 XP)',
            description: 'Parientes grandes, fornidos y peludos de los trasgos y hobgoblins. Los osgos son matones que disfrutan realizando emboscadas mediante sigilo.',
            features: 'Ataque Sorpresa (5.5): Si el osgo sorprende a una criatura y la impacta con un ataque durante la primera ronda de combate, el objetivo recibe 7 (2d6) daño adicional.\n\nCombatiente Brutal: Los ataques cuerpo a cuerpo del osgo se consideran con alcance de 10 pies.',
            actions: 'Lucero del Alba: Ataque cuerpo a cuerpo: +4 a impactar, alcance 10 pies. Impacto: 11 (2d8 + 2) daño perforante.\n\nJabalina: Ataque cuerpo a cuerpo o a distancia: +4 a impactar, alcance 10 pies o 30/120 pies. Impacto: 9 (2d6 + 2) cuerpo a cuerpo, o 5 (1d6+2) a distancia de daño perforante.',
            bonus: '',
            reactions: '',
            equip: 'Pieles, escudo, lucero del alba, jabalinas',
            _uiSecretVisible: false
        },
        {
            id: 'm_hobgoblin_1',
            name: 'Hobgoblin',
            subtitle: 'Humanoide mediano (goblinoide), legal malvado (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 18,
            hp: 11,
            hpCurrent: 11,
            hpMax: 11,
            speed: '30 pies',
            str: 13,
            dex: 12,
            con: 12,
            int: 10,
            wis: 10,
            cha: 9,
            skills: 'Atletismo +3',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1/2 (100 XP)',
            description: 'Guerreros goblinoides astutos de extremada disciplina marcial organizados en huestes. Conocen muy bien el arte y las tácticas de guerra conjuntas.',
            features: 'Ventaja Marcial (5.5): Una vez por turno, el hobgoblin causa 7 (2d6) de daño adicional a una criatura hacia la que haya impactado si esta se encuentra a 5 pies de un aliado del hobgoblin que no esté incapacitado.',
            actions: 'Espada Larga: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 5 (1d8 + 1) daño cortante, o 6 (1d10 + 1) daño cortante si se ataca con ambas manos.\n\nArco Largo: Ataque a distancia: +3 a impactar, alcance 150/600 pies. Impacto: 5 (1d8 + 1) daño perforante.',
            bonus: '',
            reactions: '',
            equip: 'Cota de malla, escudo, espada larga, arco largo',
            _uiSecretVisible: false
        },
        {
            id: 'm_wolf_1',
            name: 'Lobo',
            subtitle: 'Bestia mediana, sin alineamiento (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 11,
            hpCurrent: 11,
            hpMax: 11,
            speed: '40 pies',
            str: 12,
            dex: 15,
            con: 12,
            int: 3,
            wis: 12,
            cha: 6,
            skills: 'Percepción +3, Sigilo +4',
            senses: 'Percepción pasiva 13',
            challenge: '1/4 (50 XP)',
            description: 'Canino y predador ágil silvestre. Cazan en manadas bien organizadas persiguiendo incesantemente a sus vulnerables presas.',
            features: 'Oído y Olfato Agudos (5.5): El lobo tiene ventaja en las pruebas de Sabiduría (Percepción) basadas en el oído o en el olfato.\n\nTácticas de Manada: El lobo tiene ventaja en las tiradas de ataque contra una criatura si un aliado del lobo se encuentra a 5 pies y no está incapacitado.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 7 (2d4 + 2) daño perforante. Si el objetivo es una criatura, debe superar una tirada de salvación de Fuerza DC 11 o quedar derribado (Prone).',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_direwolf_1',
            name: 'Lobo Huargo',
            subtitle: 'Bestia grande, sin alineamiento (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 14,
            hp: 37,
            hpCurrent: 37,
            hpMax: 37,
            speed: '50 pies',
            str: 17,
            dex: 15,
            con: 15,
            int: 3,
            wis: 12,
            cha: 7,
            skills: 'Percepción +3, Sigilo +4',
            senses: 'Percepción pasiva 13',
            challenge: '1 (200 XP)',
            description: 'Un lobo bestial colosal con una inteligencia meramente feroz. Usualmente fungen de leales monturas para las razas de goblinoides u orcos de la región.',
            features: 'Oído y Olfato Agudos (5.5): El lobo tiene ventaja en las pruebas de Sabiduría (Percepción) basadas en el oído o en el olfato.\n\nTácticas de Manada: Tiene ventaja en las tiradas de ataque contra un objetivo si un aliado del lobo está a 5 pies.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 10 (2d6 + 3) daño perforante. Si es una criatura, requiere Salvación de Fuerza DC 13 o quedará derribado.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_worg_1',
            name: 'Huargo',
            subtitle: 'Monstruosidad grande, neutral malvado (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13,
            hp: 26,
            hpCurrent: 26,
            hpMax: 26,
            speed: '50 pies',
            str: 16,
            dex: 13,
            con: 13,
            int: 7,
            wis: 11,
            cha: 8,
            skills: 'Percepción +4',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 14',
            challenge: '1/2 (100 XP)',
            description: 'Lúgubre depredador canino, astutos y sádicos que incluso pueden entender idiomas goblin. Desprecian casi cualquier criatura salvo grandes líderes malignos a quienes pueden servir de escoltas.',
            features: 'Oído y Vista Agudos (5.5): El huargo tiene ventaja en las pruebas de Sabiduría (Percepción) orientadas por vista u olfato.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 10 (2d6 + 3) daño perforante. Salvación de Fuerza DC 13 o será derribado.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_giantowl_1',
            name: 'Lechuza Gigante',
            subtitle: 'Bestia grande, neutral (5.5 Edition)',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 12,
            hp: 19,
            hpCurrent: 19,
            hpMax: 19,
            speed: '5 pies, vuelo 60 pies',
            str: 13,
            dex: 15,
            con: 12,
            int: 8,
            wis: 13,
            cha: 10,
            skills: 'Percepción +5, Sigilo +4',
            senses: 'Visión en la oscuridad 120 pies, Percepción pasiva 15',
            challenge: '1/4 (50 XP)',
            description: 'Impresionante ave nocturna de enorme envergadura que protege con bravura los senderos de los bosques antiguos.',
            features: 'Vuelo Rastreante (5.5): La lechuza gigante no provoca ataques de oportunidad cuando sale volando del alcance de una criatura.\n\nOído y Vista Agudos: Posee ventaja en pruebas de Sabiduría (Percepción).',
            actions: 'Garras: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 8 (2d6 + 1) daño cortante.',
            bonus: '',
            reactions: '',
            equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_owlbear_1',
            name: 'Oso Lechuza',
            subtitle: 'Monstruosidad grande, sin alineamiento (5.5 Edition)',
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
            features: 'Vista y Oído Agudos (5.5): El oso lechuza tiene ventaja en las pruebas de Sabiduría (Percepción) que dependan de la vista o del oído.',
            actions: 'Multiataque (5.5): El oso lechuza realiza dos ataques: uno con Pico y otro con Garras.\n\nPico: Ataque cuerpo a cuerpo: +7 a impactar, alcance 5 pies. Impacto: 10 (1d10 + 5) daño perforante.\n\nGarras: Ataque cuerpo a cuerpo: +7 a impactar, alcance 5 pies. Impacto: 14 (2d8 + 5) daño cortante.',
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

// ----------------------------------------------------
// Player Features: Bestiario (Extracted)
// ----------------------------------------------------

// --- TEMPORAL: Función para poblar bestiario desde el cliente ---
window.poblarBestiario = async function () {
    const srdMonsters = [
        // ===== TRASGOIDES =====
        {
            id: 'm_trasgo',
            name: 'Trasgo',
            subtitle: 'Humanoide pequeño (goblinoide), neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 15, hp: 7, hpCurrent: 7, hpMax: 7,
            speed: '30 pies',
            str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8,
            skills: 'Sigilo +6',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1/4 (50 XP)',
            description: 'Pequeños humanoides de piel verdosa que habitan cuevas y ruinas. Cobardes solos, pero peligrosos en grupo.',
            features: '',
            actions: 'Cimitarra: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño cortante.\n\nArco Corto: Ataque a distancia: +4 a impactar, alcance 80/320 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: 'Escapar Ágil: El trasgo realiza la acción de Esconderse o Retirarse como acción adicional.',
            reactions: '', equip: 'Armadura de cuero, escudo, cimitarra, arco corto',
            _uiSecretVisible: false
        },
        {
            id: 'm_osgo',
            name: 'Osgo',
            subtitle: 'Humanoide mediano (goblinoide), caótico malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 16, hp: 27, hpCurrent: 27, hpMax: 27,
            speed: '30 pies',
            str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9,
            skills: 'Sigilo +6, Supervivencia +2',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1 (200 XP)',
            description: 'Parientes grandes y peludos de trasgos y hobgoblins. Son emboscadores natos que disfrutan la brutalidad.',
            features: 'Ataque Sorpresa: Si el osgo sorprende a una criatura y la impacta durante la 1ª ronda, el objetivo recibe 7 (2d6) de daño adicional.',
            actions: 'Lucero del Alba: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 11 (2d8 + 2) daño perforante.\n\nJabalina: Ataque cuerpo a cuerpo o a distancia: +4 a impactar, alcance 5 pies o 30/120 pies. Impacto: 9 (2d6 + 2) cuerpo a cuerpo, o 5 (1d6 + 2) a distancia, daño perforante.',
            bonus: '', reactions: '', equip: 'Pieles, escudo, lucero del alba, jabalinas',
            _uiSecretVisible: false
        },
        {
            id: 'm_hobgoblin',
            name: 'Hobgoblin',
            subtitle: 'Humanoide mediano (goblinoide), legal malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 18, hp: 11, hpCurrent: 11, hpMax: 11,
            speed: '30 pies',
            str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1/2 (100 XP)',
            description: 'Guerreros goblinoides disciplinados y organizados. Emplean tácticas militares sofisticadas.',
            features: 'Ventaja Marcial: Una vez por turno, +7 (2d6) daño adicional a una criatura que impacte, si un aliado no incapacitado está a 5 pies del objetivo.',
            actions: 'Espada Larga: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 5 (1d8 + 1) daño cortante, o 6 (1d10 + 1) a dos manos.\n\nArco Largo: Ataque a distancia: +3 a impactar, alcance 150/600 pies. Impacto: 5 (1d8 + 1) daño perforante.',
            bonus: '', reactions: '', equip: 'Cota de malla, escudo, espada larga, arco largo',
            _uiSecretVisible: false
        },
        // ===== BESTIAS =====
        {
            id: 'm_lobo',
            name: 'Lobo',
            subtitle: 'Bestia mediana, sin alineamiento',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 11, hpCurrent: 11, hpMax: 11,
            speed: '40 pies',
            str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6,
            skills: 'Percepción +3, Sigilo +4',
            senses: 'Percepción pasiva 13',
            challenge: '1/4 (50 XP)',
            description: 'Depredador ágil que caza en manada coordinada.',
            features: 'Oído y Olfato Agudos: Ventaja en pruebas de Sabiduría (Percepción) basadas en oído u olfato.\n\nTácticas de Manada: Ventaja en tiradas de ataque contra una criatura si un aliado no incapacitado está a 5 pies del objetivo.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 7 (2d4 + 2) daño perforante. Salvación de Fuerza DC 11 o el objetivo cae derribado.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_lobo_huargo',
            name: 'Lobo Huargo',
            subtitle: 'Monstruosidad grande, neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 26, hpCurrent: 26, hpMax: 26,
            speed: '50 pies',
            str: 16, dex: 13, con: 13, int: 7, wis: 11, cha: 8,
            skills: 'Percepción +4',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 14',
            challenge: '1/2 (100 XP)',
            description: 'Depredador canino grande, astuto y malvado. Comprende el idioma goblin y sirve como montura a goblinoides.',
            features: 'Oído y Vista Agudos: Ventaja en pruebas de Sabiduría (Percepción) basadas en vista u oído.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 10 (2d6 + 3) daño perforante. Salvación de Fuerza DC 13 o el objetivo cae derribado.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_lechuza_gigante',
            name: 'Lechuza Gigante',
            subtitle: 'Bestia grande, neutral',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 12, hp: 19, hpCurrent: 19, hpMax: 19,
            speed: '5 pies, vuelo 60 pies',
            str: 13, dex: 15, con: 12, int: 8, wis: 13, cha: 10,
            skills: 'Percepción +5, Sigilo +4',
            senses: 'Visión en la oscuridad 120 pies, Percepción pasiva 15',
            challenge: '1/4 (50 XP)',
            description: 'Ave nocturna de enorme envergadura que protege los senderos de los bosques más antiguos.',
            features: 'Vuelo Rastreante: No provoca ataques de oportunidad al salir volando del alcance de un enemigo.\n\nOído y Vista Agudos: Ventaja en pruebas de Sabiduría (Percepción).',
            actions: 'Garras: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 8 (2d6 + 1) daño cortante.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        // ===== MONSTRUOSIDADES =====
        {
            id: 'm_oso_lechuza',
            name: 'Oso Lechuza',
            subtitle: 'Monstruosidad grande, sin alineamiento',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 59, hpCurrent: 59, hpMax: 59,
            speed: '40 pies',
            str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7,
            skills: 'Percepción +3',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 13',
            challenge: '3 (700 XP)',
            description: 'Criatura feroz que combina los rasgos de un oso gigante y un búho real. Conocido por su mal temperamento.',
            features: 'Vista y Oído Agudos: Ventaja en pruebas de Sabiduría (Percepción) basadas en vista u oído.',
            actions: 'Multiataque: El oso lechuza realiza dos ataques: uno con Pico y otro con Garras.\n\nPico: Ataque cuerpo a cuerpo: +7 a impactar, alcance 5 pies. Impacto: 10 (1d10 + 5) daño perforante.\n\nGarras: Ataque cuerpo a cuerpo: +7 a impactar, alcance 5 pies. Impacto: 14 (2d8 + 5) daño cortante.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_grick',
            name: 'Grick',
            subtitle: 'Monstruosidad mediana, neutral',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 14, hp: 27, hpCurrent: 27, hpMax: 27,
            speed: '30 pies, trepar 30 pies',
            str: 14, dex: 14, con: 11, int: 3, wis: 14, cha: 5,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 12',
            challenge: '2 (450 XP)',
            description: 'Carnívoro subterráneo con cuerpo de gusano y tentáculos afilados. Acecha desde grietas en cavernas.',
            features: 'Camuflaje Rocoso: Ventaja en pruebas de Destreza (Sigilo) en terreno rocoso.\n\nResistencia al daño contundente, perforante y cortante de ataques no mágicos.',
            actions: 'Multiataque: El grick realiza un ataque con sus Tentáculos. Si impacta, puede realizar un ataque con su Pico.\n\nTentáculos: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 9 (2d6 + 2) daño cortante.\n\nPico: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_mimico',
            name: 'Mímico',
            subtitle: 'Monstruosidad mediana (cambiaformas), neutral',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 12, hp: 58, hpCurrent: 58, hpMax: 58,
            speed: '15 pies',
            str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8,
            skills: 'Sigilo +5',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 11',
            challenge: '2 (450 XP)',
            description: 'Cambiaformas que adopta la forma de objetos comunes (cofres, puertas) para emboscar a sus presas.',
            features: 'Cambiaformas: Puede usar su acción para transformarse en un objeto o volver a su forma amorfa.\n\nAdherente (Forma de Objeto): Se adhiere a todo lo que lo toca. Una criatura agarrada puede escapar con DC 13 Fuerza.\n\nForma Falsa (Forma de Objeto): Indistinguible de un objeto ordinario mientras esté inmóvil.\n\nInmunidad al ácido.',
            actions: 'Pseudópodo: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 7 (1d8 + 3) daño contundente. Si está en forma de objeto, el objetivo queda agarrado (DC 13 para escapar).\n\nMordisco: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 7 (1d8 + 3) daño perforante + 4 (1d8) daño ácido.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_arana_gigante',
            name: 'Araña Gigante',
            subtitle: 'Bestia grande, sin alineamiento',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 14, hp: 26, hpCurrent: 26, hpMax: 26,
            speed: '30 pies, trepar 30 pies',
            str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4,
            skills: 'Sigilo +7',
            senses: 'Visión ciega 10 pies, Visión en la oscuridad 60 pies, Percepción pasiva 10',
            challenge: '1 (200 XP)',
            description: 'Arácnido colosal que teje redes enormes en cuevas y bosques para atrapar a sus presas.',
            features: 'Trepar Arañas: Puede trepar superficies difíciles, incluso boca abajo, sin necesidad de tirada.\n\nPercepción de Telarañas: En contacto con una telaraña, conoce la ubicación exacta de cualquier criatura tocándola.\n\nAndar por Telarañas: Ignora las restricciones de movimiento causadas por telarañas.',
            actions: 'Mordisco: Ataque cuerpo a cuerpo: +5 a impactar, alcance 5 pies. Impacto: 7 (1d8 + 3) daño perforante + 9 (2d8) daño de veneno. Salvación de Constitución DC 11: mitad de daño de veneno en éxito.\n\nTelaraña (Recarga 5-6): Ataque a distancia: +5 a impactar, alcance 30/60 pies. El objetivo queda apresado (DC 12 Fuerza para escapar). La telaraña tiene CA 10, 5 HP, vulnerabilidad al fuego, inmunidad a contundente, veneno y psíquico.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        // ===== MUERTOS VIVIENTES =====
        {
            id: 'm_zombi',
            name: 'Zombi',
            subtitle: 'No-muerto mediano, neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 8, hp: 22, hpCurrent: 22, hpMax: 22,
            speed: '20 pies',
            str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 8',
            challenge: '1/4 (50 XP)',
            description: 'Cadáver reanimado por nigromancia. Lento pero resistente, avanza sin cesar hacia sus víctimas.',
            features: 'Fortaleza de No-Muerto: Si el daño reduce al zombi a 0 HP, realiza TS de Con (DC 5 + daño recibido). Si acierta, queda a 1 HP. No funciona con daño radiante ni golpes críticos.\n\nInmunidad al veneno y a la condición envenenado.',
            actions: 'Golpe: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 4 (1d6 + 1) daño contundente.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        {
            id: 'm_esqueleto',
            name: 'Esqueleto',
            subtitle: 'No-muerto mediano, legal malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 13, hpCurrent: 13, hpMax: 13,
            speed: '30 pies',
            str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 9',
            challenge: '1/4 (50 XP)',
            description: 'Restos óseos animados por magia oscura. Obedecen ciegamente a su creador.',
            features: 'Vulnerabilidad al daño contundente.\n\nInmunidad al veneno y a la condición envenenado.',
            actions: 'Espada Corta: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño perforante.\n\nArco Corto: Ataque a distancia: +4 a impactar, alcance 80/320 pies. Impacto: 5 (1d6 + 2) daño perforante.',
            bonus: '', reactions: '', equip: 'Armadura de fragmentos, espada corta, arco corto',
            _uiSecretVisible: false
        },
        {
            id: 'm_espectro',
            name: 'Espectro',
            subtitle: 'No-muerto mediano, neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 67, hpCurrent: 67, hpMax: 67,
            speed: '0 pies, vuelo 60 pies (levitar)',
            str: 6, dex: 16, con: 16, int: 12, wis: 14, cha: 15,
            skills: '',
            senses: 'Visión en la oscuridad 60 pies, Percepción pasiva 12',
            challenge: '5 (1.800 XP)',
            description: 'Un espíritu malévolo nacido de la violencia y la rabia. Busca consumir la fuerza vital de otros.',
            features: 'Incorpóreo: Puede atravesar criaturas y objetos como terreno difícil. Recibe 5 (1d10) de daño de fuerza si termina su turno dentro de un objeto.\n\nResistencia al ácido, frío, fuego, relámpago, trueno; contundente, perforante y cortante de ataques no mágicos.\n\nInmunidad al necrótico y veneno.\n\nSensibilidad a la Luz Solar: Desventaja en tiradas de ataque y Sabiduría (Percepción) basadas en la vista bajo luz solar directa.',
            actions: 'Toque Drenavida: Ataque cuerpo a cuerpo: +6 a impactar, alcance 5 pies. Impacto: 21 (4d8 + 3) daño necrótico. El objetivo debe superar TS de Con DC 14 o su máximo de HP se reduce en una cantidad igual al daño recibido. El objetivo muere si su HP máximo llega a 0.\n\nCrear Aparición: El espectro apunta a un humanoide muerto hace 1 minuto máximo, a 10 pies. El espíritu se levanta como Aparición bajo su control (máx. 7 apariciones).',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        // ===== DRAGÓN =====
        {
            id: 'm_dragon_verde_joven',
            name: 'Dragón Verde Joven',
            subtitle: 'Dragón grande, legal malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 18, hp: 136, hpCurrent: 136, hpMax: 136,
            speed: '40 pies, vuelo 80 pies, natación 40 pies',
            str: 19, dex: 12, con: 17, int: 16, wis: 13, cha: 15,
            skills: 'Engaño +5, Percepción +7, Sigilo +4',
            senses: 'Visión ciega 30 pies, Visión en la oscuridad 120 pies, Percepción pasiva 17',
            challenge: '8 (3.900 XP)',
            description: 'Conocido como "Venomfang". Dragón manipulador y venenoso que habita bosques densos. Disfruta corrompiendo y engañando.',
            features: 'Anfibio: Puede respirar aire y agua.\n\nInmunidad al daño de veneno y a la condición envenenado.',
            actions: 'Multiataque: El dragón realiza tres ataques: uno con Mordisco y dos con Garras.\n\nMordisco: Ataque cuerpo a cuerpo: +7 a impactar, alcance 10 pies. Impacto: 15 (2d10 + 4) daño perforante + 7 (2d6) daño de veneno.\n\nGarras: Ataque cuerpo a cuerpo: +7 a impactar, alcance 5 pies. Impacto: 11 (2d6 + 4) daño cortante.\n\nAliento Venenoso (Recarga 5-6): Cono de 30 pies, TS de Con DC 14. Daño: 42 (12d6) veneno en fallo, mitad en éxito.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        // ===== PLANTAS =====
        {
            id: 'm_azote_matorrales',
            name: 'Azote de Matorrales',
            subtitle: 'Planta pequeña, neutral malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 4, hpCurrent: 4, hpMax: 4,
            speed: '20 pies',
            str: 6, dex: 13, con: 12, int: 4, wis: 8, cha: 3,
            skills: 'Sigilo +3',
            senses: 'Visión ciega 60 pies (ciego más allá), Percepción pasiva 9',
            challenge: '1/8 (25 XP)',
            description: 'Pequeña planta animada con forma de arbusto retorcido. Ataca con espinas afiladas a los incautos.',
            features: 'Apariencia Falsa: Mientras permanece inmóvil, es indistinguible de un arbusto seco muerto.\n\nVulnerabilidad al daño de fuego.',
            actions: 'Garras: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 3 (1d4 + 1) daño perforante.',
            bonus: '', reactions: '', equip: '',
            _uiSecretVisible: false
        },
        // ===== HUMANOIDES =====
        {
            id: 'm_cultista',
            name: 'Cultista',
            subtitle: 'Humanoide mediano (cualquier raza), cualquier alineamiento no bueno',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 12, hp: 9, hpCurrent: 9, hpMax: 9,
            speed: '30 pies',
            str: 11, dex: 12, con: 10, int: 10, wis: 11, cha: 10,
            skills: 'Engaño +2, Religión +2',
            senses: 'Percepción pasiva 10',
            challenge: '1/8 (25 XP)',
            description: 'Fanático religioso que sirve a una deidad oscura o poder aberrante. Actúa en secreto y en manada.',
            features: 'Ventaja Oscura: El cultista tiene ventaja en TS contra ser encantado.',
            actions: 'Cimitarra: Ataque cuerpo a cuerpo: +3 a impactar, alcance 5 pies. Impacto: 4 (1d6 + 1) daño cortante.',
            bonus: '', reactions: '', equip: 'Armadura de cuero, cimitarra',
            _uiSecretVisible: false
        },
        {
            id: 'm_fanatico_culto',
            name: 'Fanático del Culto',
            subtitle: 'Humanoide mediano (cualquier raza), cualquier alineamiento no bueno',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 33, hpCurrent: 33, hpMax: 33,
            speed: '30 pies',
            str: 11, dex: 14, con: 12, int: 10, wis: 13, cha: 14,
            skills: 'Engaño +4, Persuasión +4, Religión +2',
            senses: 'Percepción pasiva 11',
            challenge: '2 (450 XP)',
            description: 'Líder carismático entre los cultistas. Domina magia divina oscura y es capaz de sacrificios terribles.',
            features: 'Ventaja Oscura: Ventaja en TS contra ser encantado.\n\nLanzamiento de Conjuros: Lanzador de conjuros de nivel 4 (Sabiduría, DC 11, +3). Conjuros preparados:\nTrucos: Luz, Llama Sagrada, Taumaturgia\n1º (4 espacios): Orden Imperiosa, Escudo de Fe, Herida Infligida\n2º (3 espacios): Inmovilizar Persona, Arma Espiritual',
            actions: 'Multiataque: El fanático realiza dos ataques cuerpo a cuerpo.\n\nDaga: Ataque cuerpo a cuerpo o a distancia: +4 a impactar, alcance 5 pies o 20/60 pies. Impacto: 4 (1d4 + 2) daño perforante.',
            bonus: '', reactions: '', equip: 'Armadura de cuero, daga',
            _uiSecretVisible: false
        },
        {
            id: 'm_mago_malvado',
            name: 'Mago Malvado',
            subtitle: 'Humanoide mediano (cualquier raza), cualquier alineamiento malvado',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 12, hp: 22, hpCurrent: 22, hpMax: 22,
            speed: '30 pies',
            str: 9, dex: 14, con: 11, int: 17, wis: 12, cha: 11,
            skills: 'Arcana +5, Historia +5',
            senses: 'Percepción pasiva 11',
            challenge: '1 (200 XP)',
            description: 'Practicante de las artes arcanas que ha caído en la corrupción. Usa su magia para fines egoístas y destructivos.',
            features: 'Lanzamiento de Conjuros: Lanzador de conjuros de nivel 2 (Inteligencia, DC 13, +5). Conjuros preparados:\nTrucos: Rayo de Escarcha, Mano de Mago, Descarga de Fuego\n1º (3 espacios): Proyectil Mágico, Escudo, Dormir',
            actions: 'Daga: Ataque cuerpo a cuerpo o a distancia: +4 a impactar, alcance 5 pies o 20/60 pies. Impacto: 4 (1d4 + 2) daño perforante.',
            bonus: '', reactions: '', equip: 'Bastón, daga, componentes de conjuro',
            _uiSecretVisible: false
        },
        {
            id: 'm_explorador',
            name: 'Explorador',
            subtitle: 'Humanoide mediano (cualquier raza), cualquier alineamiento',
            url: 'img/placeholder.png',
            isVisible: true,
            ac: 13, hp: 16, hpCurrent: 16, hpMax: 16,
            speed: '30 pies',
            str: 11, dex: 14, con: 12, int: 11, wis: 13, cha: 11,
            skills: 'Naturaleza +4, Percepción +5, Sigilo +6, Supervivencia +5',
            senses: 'Percepción pasiva 15',
            challenge: '1/2 (100 XP)',
            description: 'Batidor experto en reconocimiento y supervivencia. Recorre los caminos y avisa de peligros.',
            features: 'Oído y Vista Agudos: Ventaja en pruebas de Sabiduría (Percepción) basadas en oído o vista.',
            actions: 'Multiataque: El explorador realiza dos ataques cuerpo a cuerpo o dos ataques a distancia.\n\nEspada Corta: Ataque cuerpo a cuerpo: +4 a impactar, alcance 5 pies. Impacto: 5 (1d6 + 2) daño perforante.\n\nArco Largo: Ataque a distancia: +4 a impactar, alcance 150/600 pies. Impacto: 6 (1d8 + 2) daño perforante.',
            bonus: '', reactions: '', equip: 'Armadura de cuero, espada corta, arco largo',
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

        // Ordenar alfabéticamente por nombre
        const sorted = [...bestiario].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));

        sorted.forEach(m => {
            html += `
                <div class="card card-horizontal" ondblclick="window.openQuickLook('${m.id}', 'monster')" style="cursor: pointer; position: relative; ${m.isVisible ? '' : 'opacity: 0.8; border-style: dashed;'}">
                    
                    <!-- Image -->
                    ${m.url
                    ? `<img src="${m.url}" class="card-horizontal-img" style="width: 80px; height: 80px;" onclick="event.stopPropagation(); window.openLightbox('${m.url}')" title="Clic para ampliar">`
                    : `<div class="card-horizontal-img" style="width: 80px; height: 80px; background-color: var(--leather-light); display: flex; justify-content: center; align-items: center; border: 1px solid var(--leather-dark); box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-dragon fa-2x text-muted"></i></div>`
                }
                    
                    <!-- Content -->
                    <div class="card-horizontal-content" style="color: var(--leather-dark); display: flex; flex-direction: column; justify-content: space-between; padding: 1rem;">
                        
                        <!-- Header -->
                        <div>
                             <h4 style="margin: 0; font-size: 1.2em; font-family: 'Times New Roman', serif; font-weight: bold; color: var(--red-ink); text-transform: uppercase;">${m.name}</h4>
                             <div style="font-size: 0.8em; font-style: italic; color: #555;">${m.subtitle || 'Tipo desconocido'}</div>
                             
                             <div style="margin-top: 0.5rem; font-size: 0.95em;">
                                <strong style="color: var(--red-ink);">CR:</strong> ${m.challenge || '-'}
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

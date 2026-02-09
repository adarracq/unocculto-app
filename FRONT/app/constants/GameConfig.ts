import Colors from '@/app/constants/Colors';

// --- TYPES ---
export type GameLevel = 1 | 2 | 3 | 4;
export type GameMode = 'country' | 'flag' | 'capital';

export interface LevelConfig {
    id: number;
    title: string;       // Ex: "CHOISIR"
    subTitle: string;    // Ex: "QCM Rapide"
    description: string; // Pour le modal
    rules: {
        time?: number;   // En secondes (null = infini ou chrono simple)
        accuracy: number;// Pourcentage requis pour valider
    };
    // Couleur spécifique au niveau si besoin, sinon prend celle du mode
    color?: string;
}

export interface ModeConfig {
    id: GameMode;
    label: string;
    color: string;
    levels: LevelConfig[];
}

// --- CONFIGURATION JSON ---
export const GAME_CONFIG: Record<GameMode, ModeConfig> = {
    country: {
        id: 'country',
        label: 'PAYS',
        color: Colors.lightBlue,
        levels: [
            {
                id: 1,
                title: "CHOISIR",
                subTitle: "QCM",
                description: "Identifiez le bon pays parmi 4 propositions. La rapidité est la clé.",
                rules: { accuracy: 80, time: 600 }
            },
            {
                id: 2,
                title: "TROUVER",
                subTitle: "LOCALISATION",
                description: "Localisez précisément le pays demandé sur la carte vierge.",
                rules: { accuracy: 100 }
            },
            {
                id: 3,
                title: "SAISIR",
                subTitle: "ORTHOGRAPHE",
                description: "Tapez le nom du pays sans erreur d'orthographe.",
                rules: { accuracy: 100 }
            },
            {
                id: 4,
                title: "CONTOUR",
                subTitle: "FORME",
                description: "Reconnaissez le pays uniquement à partir de sa forme géographique.",
                rules: { accuracy: 100 },
                color: Colors.realBlack
            }
        ]
    },
    flag: {
        id: 'flag',
        label: 'DRAPEAUX',
        color: Colors.lightRed,
        levels: [
            {
                id: 1,
                title: "CHOISIR",
                subTitle: "QCM",
                description: "Associez le drapeau au bon pays.",
                rules: { accuracy: 100 }
            },
            {
                id: 2,
                title: "TROUVER",
                subTitle: "MÉMOIRE",
                description: "Trouvez le pays sur la carte à partir de son drapeau.",
                rules: { accuracy: 100 }
            },
            {
                id: 3,
                title: "SAISIR",
                subTitle: "EXPERTISE",
                description: "Nommez le pays correspondant au drapeau affiché.",
                rules: { accuracy: 100 }
            }
        ]
    },
    capital: {
        id: 'capital',
        label: 'CAPITALES',
        color: Colors.lightGreen,
        levels: [
            {
                id: 1,
                title: "CHOISIR",
                subTitle: "QCM",
                description: "Quelle est la capitale de ce pays ?",
                rules: { accuracy: 100 }
            },
            {
                id: 2,
                title: "TROUVER",
                subTitle: "PRÉCISION",
                description: "Placez le curseur sur l'emplacement de la capitale.",
                rules: { accuracy: 100 }
            },
            {
                id: 3,
                title: "SAISIR",
                subTitle: "CONNAISSANCE",
                description: "Écrivez le nom de la capitale sans faute.",
                rules: { accuracy: 100 }
            }
        ]
    }
};
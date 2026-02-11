// app/constants/Levels.ts

export interface Level {
    lvl: number;
    labelFR: string;
    labelEN: string;
    xpThreshold: number; // XP requis pour atteindre ce niveau
}

export const XP_LEVELS: Level[] = [
    // --- CLASSE 1 : LE DÉPART (Initiation) ---
    // Progression rapide pour accrocher le joueur
    { lvl: 1, labelFR: "Passager Curieux", labelEN: "Curious Passenger", xpThreshold: 0 },
    { lvl: 2, labelFR: "Touriste I", labelEN: "Tourist I", xpThreshold: 100 },
    { lvl: 3, labelFR: "Touriste II", labelEN: "Tourist II", xpThreshold: 300 },
    { lvl: 4, labelFR: "Touriste III", labelEN: "Tourist III", xpThreshold: 600 },

    // --- CLASSE 2 : L'AVENTURE (Le voyage commence vraiment) ---
    // On commence à connaître la géographie (thème Routard/Vagabond)
    { lvl: 5, labelFR: "Routard I", labelEN: "Backpacker I", xpThreshold: 1000 },
    { lvl: 6, labelFR: "Routard II", labelEN: "Backpacker II", xpThreshold: 1500 },
    { lvl: 7, labelFR: "Routard III", labelEN: "Backpacker III", xpThreshold: 2100 },
    { lvl: 8, labelFR: "Vagabond I", labelEN: "Wanderer I", xpThreshold: 2800 },
    { lvl: 9, labelFR: "Vagabond II", labelEN: "Wanderer II", xpThreshold: 3600 },
    { lvl: 10, labelFR: "Vagabond III", labelEN: "Wanderer III", xpThreshold: 4500 },

    // --- CLASSE 3 : L'EXPLORATION (Expertise géographique) ---
    // Thème orienté sur la connaissance du monde (Cartographe/Explorateur)
    { lvl: 11, labelFR: "Cartographe I", labelEN: "Map Reader I", xpThreshold: 5500 },
    { lvl: 12, labelFR: "Cartographe II", labelEN: "Map Reader II", xpThreshold: 6600 },
    { lvl: 13, labelFR: "Cartographe III", labelEN: "Map Reader III", xpThreshold: 7800 },
    { lvl: 14, labelFR: "Explorateur I", labelEN: "Explorer I", xpThreshold: 9100 },
    { lvl: 15, labelFR: "Explorateur II", labelEN: "Explorer II", xpThreshold: 10500 },
    { lvl: 16, labelFR: "Explorateur III", labelEN: "Explorer III", xpThreshold: 12000 },

    // --- CLASSE 4 : L'AVIATION (Frequent Flyer) ---
    // On passe au statut "Aérien" / VIP
    { lvl: 17, labelFR: "Grand Voyageur I", labelEN: "Frequent Flyer I", xpThreshold: 14000 },
    { lvl: 18, labelFR: "Grand Voyageur II", labelEN: "Frequent Flyer II", xpThreshold: 16500 },
    { lvl: 19, labelFR: "Grand Voyageur III", labelEN: "Frequent Flyer III", xpThreshold: 19500 },
    { lvl: 20, labelFR: "Jet-Setter I", labelEN: "Jet-Setter I", xpThreshold: 23000 },
    { lvl: 21, labelFR: "Jet-Setter II", labelEN: "Jet-Setter II", xpThreshold: 27000 },
    { lvl: 22, labelFR: "Jet-Setter III", labelEN: "Jet-Setter III", xpThreshold: 31500 },

    // --- CLASSE 5 : L'ÉQUIPAGE (Maîtrise totale) ---
    // Les rangs prestigieux de l'aviation
    { lvl: 23, labelFR: "Navigateur I", labelEN: "Navigator I", xpThreshold: 36500 },
    { lvl: 24, labelFR: "Navigateur II", labelEN: "Navigator II", xpThreshold: 42000 },
    { lvl: 25, labelFR: "Copilote I", labelEN: "Co-Pilot I", xpThreshold: 48000 },
    { lvl: 26, labelFR: "Copilote II", labelEN: "Co-Pilot II", xpThreshold: 55000 },
    { lvl: 27, labelFR: "Commandant I", labelEN: "Captain I", xpThreshold: 63000 },
    { lvl: 28, labelFR: "Commandant II", labelEN: "Captain II", xpThreshold: 72000 },
    { lvl: 29, labelFR: "Commandant III", labelEN: "Captain III", xpThreshold: 82000 },

    // --- CLASSE 6 : L'ÉLITE (Endgame) ---
    // Difficile à atteindre, pour les joueurs long terme
    { lvl: 30, labelFR: "As du Ciel", labelEN: "Sky Ace", xpThreshold: 95000 },
    { lvl: 31, labelFR: "Légende I", labelEN: "Legend I", xpThreshold: 110000 },
    { lvl: 32, labelFR: "Légende II", labelEN: "Legend II", xpThreshold: 130000 },
    { lvl: 33, labelFR: "Légende III", labelEN: "Legend III", xpThreshold: 155000 },
    { lvl: 34, labelFR: "Maître du Monde", labelEN: "World Master", xpThreshold: 185000 },
    { lvl: 35, labelFR: "Mythique", labelEN: "Mythic", xpThreshold: 220000 },
];

export default {
    levels: XP_LEVELS
};
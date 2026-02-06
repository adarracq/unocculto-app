// app/constants/Levels.ts

export interface Level {
    lvl: number;
    labelFR: string;
    xpThreshold: number; // XP requis pour atteindre ce niveau
}

export const XP_LEVELS: Level[] = [
    { lvl: 1, labelFR: "Touriste", xpThreshold: 0 },
    { lvl: 2, labelFR: "Routard", xpThreshold: 200 },
    { lvl: 3, labelFR: "Explorateur", xpThreshold: 500 },
    { lvl: 4, labelFR: "Voyageur", xpThreshold: 1000 },
    { lvl: 5, labelFR: "Guide Local", xpThreshold: 2000 },
    { lvl: 6, labelFR: "Aventurier", xpThreshold: 3500 },
    { lvl: 7, labelFR: "Capitaine", xpThreshold: 5000 },
    { lvl: 8, labelFR: "Commandant", xpThreshold: 7500 },
    { lvl: 9, labelFR: "Légende", xpThreshold: 10000 },
    { lvl: 10, labelFR: "Mythique", xpThreshold: 15000 },
];

export default {
    levels: XP_LEVELS
};
import { GAME_CONFIG, GameMode } from '@/app/constants/GameConfig';
import { ZONES } from '../models/Countries';

const MODES: GameMode[] = ['flag', 'country', 'capital'];

export const getDailyMission = () => {
    // 1. Obtenir un entier unique pour aujourd'hui (Nombre de jours depuis 1970)
    const now = new Date();
    // On divise par le nombre de ms dans un jour pour avoir un index jour
    // On utilise Math.floor pour que ça ne change qu'à minuit UTC (ou locale selon besoin)
    const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));

    // 2. Opération mathématique (Modulo) pour choisir Zone et Mode
    // Cela assure que tout le monde a la même chose le même jour
    const zoneIndex = dayIndex % ZONES.length;

    // Pour le mode, on ajoute le dayIndex pour varier aussi, 
    // ou on combine différemment pour ne pas être synchro avec les zones
    const modeIndex = (dayIndex + 2) % MODES.length;

    const targetZone = ZONES[zoneIndex];
    const targetModeId = MODES[modeIndex];
    const targetModeConfig = GAME_CONFIG[targetModeId];

    // 3. Construction de l'objet Mission
    return {
        title: `OPÉRATION : ${targetZone.name}`,
        typeLabel: targetModeConfig.label, // "DRAPEAUX"
        modeId: targetModeId,             // "flag"
        regionId: targetZone.id,          // "AFR"
        bonus: "XP X2",
        expiresAt: new Date().setHours(23, 59, 59, 999) // Minuit ce soir
    };
};
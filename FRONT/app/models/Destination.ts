import { Country } from './Countries';

export interface DestinationPreview extends Country {
    // Infos enrichies pour l'UI
    nextCityName: string;
    tripNumber: number;
    isLocked: boolean; // Pour plus tard (si besoin d'xp pour débloquer)
}
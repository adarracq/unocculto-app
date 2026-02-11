// app/models/Collectible.ts

import Colors from "../constants/Colors";


export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Collectible {
    id: string;
    name: string;
    description: string;
    imageUri: string;
    rarity: Rarity;
    category: string;
    subCategory: string;
    countryCode: string; // Important pour l'affichage du drapeau
    isOwned: boolean;
}

// Configuration des Départements (Groupement)
export const DEPARTMENTS = [
    {
        id: 'humanity',
        title: 'HUMANITÉS & ESPRIT',
        icon: 'lotus', // Symbole : Éveil et Intériorité
        color: Colors.lightBlue,
        subcategories: [
            { id: 'philo', title: 'Philosophie & Sagesse', icon: 'owl' },
            { id: 'psycho', title: 'Psychologie & Codes Sociaux', icon: 'puzzle' },
            { id: 'religion', title: 'Croyances & Spiritualité', icon: 'third-eye' },
            { id: 'emotion', title: 'Émotions & Sentiments', icon: 'heart-line' }
        ]
    },
    {
        id: 'power',
        title: 'POUVOIR & SOCIÉTÉ',
        icon: 'chess',
        color: Colors.lightRed,
        subcategories: [
            { id: 'history', title: 'Histoire & Conflits', icon: 'greek-helmet' },
            { id: 'geopolitics', title: 'Géopolitique & Frontières', icon: 'globe' },
            { id: 'economy', title: 'Économie & Ressources', icon: 'chart' },
            { id: 'politics', title: 'Politique & Droits', icon: 'gavel' }
        ]
    },
    {
        id: 'art',
        title: 'ARTS & CULTURE',
        icon: 'theatre', // Symbole : Comédie et Tragédie
        color: Colors.lightPurple, // J'ai ajouté Purple pour différencier les Arts
        subcategories: [
            { id: 'archi', title: 'Beaux-Arts & Architecture', icon: 'palette' },
            { id: 'music', title: 'Musique & Danse', icon: 'music-note' },
            { id: 'books', title: 'Littérature & Récits', icon: 'open-book' },
            { id: 'cinema', title: 'Cinéma & Pop Culture', icon: 'film-reel' },
            { id: 'sport', title: 'Sport & Art de Vivre', icon: 'sport' }
        ]
    },
    {
        id: 'knowledge',
        title: 'SAVOIR & MONDE',
        icon: 'atom', // Symbole : Science et Matière
        color: Colors.lightGreen,
        subcategories: [
            { id: 'tech', title: 'Inventions & Tech', icon: 'lightbulb' },
            { id: 'science', title: 'Sciences & Mathématiques', icon: 'flask' },
            { id: 'geography', title: 'Géographie Humaine', icon: 'compass' },
            { id: 'nature', title: 'Nature & Biodiversité', icon: 'leaf' }
        ]
    }
];
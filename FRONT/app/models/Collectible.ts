// app/models/Collectible.ts

export type CollectibleTheme =
    // Humanités
    | 'history' | 'philosophy' | 'literature' | 'religion' | 'politics' | 'geopolitics' | 'economy'
    // Arts & Culture
    | 'art' | 'music' | 'sport' | 'culture'
    // Sciences & Monde
    | 'science' | 'psychology' | 'geography' | 'tech' | 'nature';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Collectible {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: Rarity;
    type: CollectibleTheme;
    countryCode: string; // Important pour l'affichage du drapeau
    isOwned: boolean;
}

// Configuration des Départements (Groupement)
export const DEPARTMENTS = [
    {
        id: 'HUMANITIES',
        title: 'ARCHIVES HUMAINES',
        icon: 'book', // Assure-toi d'avoir une icone correspondante
        color: '#E0C097', // Beige Parchemin
        themes: ['history', 'philosophy', 'literature', 'religion', 'politics', 'geopolitics', 'economy']
    },
    {
        id: 'ARTS',
        title: 'GALERIE CULTURELLE',
        icon: 'palette',
        color: '#FF6B6B', // Rouge Pastel
        themes: ['art', 'music', 'sport', 'culture']
    },
    {
        id: 'SCIENCES',
        title: 'LABORATOIRE & MONDE',
        icon: 'flask',
        color: '#4ECDC4', // Turquoise
        themes: ['science', 'psychology', 'geography', 'tech', 'nature']
    }
];
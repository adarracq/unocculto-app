// app/models/Collectible.ts

import Colors from "../constants/Colors";

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
        color: Colors.lightBlue,
        themes: ['history', 'philosophy', 'literature', 'religion', 'politics', 'geopolitics', 'economy']
    },
    {
        id: 'ARTS',
        title: 'GALERIE CULTURELLE',
        icon: 'palette',
        color: Colors.lightRed,
        themes: ['art', 'music', 'sport', 'culture']
    },
    {
        id: 'SCIENCES',
        title: 'LABORATOIRE & MONDE',
        icon: 'flask',
        color: Colors.lightGreen,
        themes: ['science', 'psychology', 'geography', 'tech', 'nature']
    }
];
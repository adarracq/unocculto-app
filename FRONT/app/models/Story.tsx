export type StepType = 'dialogue' | 'quiz' | 'order' | 'reward' | 'location' | 'swipe';

export interface SwipeCard {
    id: string;
    imageUrl: string; // URI du drapeau
    text: string;     // Nom du pays (ou vide pour corser)
    isCorrect: boolean; // TRUE si c'est le pays visité, FALSE sinon
}

export interface StoryStep {
    id: string;
    type: StepType;
    // Contenu commun
    imageUrl?: string;
    duration?: number; // En ms
    title: string;
    content: string; // La consigne (ex: "Remettez ces événements dans l'ordre")

    // Spécifique QUIZ
    choices?: string[];
    correctAnswerIndex?: number;
    explanation?: string;
    answerType?: 'text' | 'image';

    // Spécifique ORDER
    // Liste des items dans le BON ordre. Le moteur les mélangera au démarrage.
    orderItems?: string[];

    // Specifique reward
    rewardImage?: string;

    // Spécifique SWIPE
    deck?: SwipeCard[];

    // Navigation
    nextStepId?: string;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Story {
    _id: string; // storyId coté back
    storyId: string;
    countryCode: string;

    // Info Ville
    city: string;
    isCapital: boolean;
    rarity: Rarity;

    title: string;
    steps: StoryStep[];

    // Récompense
    rewardCollectibleId?: string;
}
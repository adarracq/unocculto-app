// app/models/Story.ts

export type StepType =
    | 'dialogue'
    | 'quiz'
    | 'order'
    | 'reward'
    | 'location'
    | 'swipe'
    | 'estimation';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// --- SOUS-STRUCTURES ---

export interface SwipeCard {
    id: string;
    imageUrl: string;   // URI du drapeau
    text: string;       // Nom du pays (ou vide pour corser)
    isCorrect: boolean; // TRUE si c'est le pays visité
}

// --- BASE STEP (Champs communs) ---

interface StoryStepBase {
    id: string;
    title: string;
    content: string;    // La consigne ou le texte du dialogue
    duration?: number;  // En ms (pour l'autoplay ou le timer)
    imageUrl?: string;  // Image de fond ou d'illustration générique
    nextStepId?: string;
}

// --- VARIATIONS DE STEPS ---

export interface DialogueStep extends StoryStepBase {
    type: 'dialogue';
    // Pas de champs spécifiques obligatoires pour l'instant
}

export interface QuizStep extends StoryStepBase {
    type: 'quiz';
    choices: string[];
    correctAnswerIndex: number;
    answerType: 'text' | 'image';
    explanation?: string; // Affiché après la réponse
}

export interface OrderStep extends StoryStepBase {
    type: 'order';
    orderItems: string[]; // Liste des items dans le BON ordre
}

export interface LocationStep extends StoryStepBase {
    type: 'location';
    // Pour l'instant, Location utilise les données du 'Country' parent.
    // On pourra ajouter ici des coordonnées spécifiques (lat/lng) plus tard si besoin.
}

export interface SwipeStep extends StoryStepBase {
    type: 'swipe';
    deck: SwipeCard[];
}

export interface RewardStep extends StoryStepBase {
    type: 'reward';
    rewardImage?: string; // Image spécifique du collectible
}

export interface EstimationStep extends StoryStepBase {
    type: 'estimation';
    targetValue: number;      // La vraie réponse (ex: 1200)
    currency: string;         // Le symbole (ex: "¥" ou "€")
    min: number;              // Borne min du slider
    max: number;              // Borne max du slider
    imageUri: string;         // L'image de l'objet à estimer (Attention: imageUri vs imageUrl)
    tolerance?: number;       // Marge d'erreur acceptée
    step?: number;            // Incrément du slider
}

// --- L'UNION TYPE (Le coeur du polymorphisme) ---

export type StoryStep =
    | DialogueStep
    | QuizStep
    | OrderStep
    | LocationStep
    | SwipeStep
    | RewardStep
    | EstimationStep;

// --- OBJET PRINCIPAL STORY ---

export interface Story {
    _id: string; // ID technique (Mongo/Firebase)
    storyId: string; // ID métier (ex: "fr-paris-1")
    countryCode: string;

    // Metadonnées
    city: string;
    isCapital: boolean;
    rarity: Rarity;
    title: string;

    // Contenu
    steps: StoryStep[];

    // Récompense finale
    rewardCollectibleId?: string;
}
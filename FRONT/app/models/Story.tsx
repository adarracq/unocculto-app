// app/models/Story.ts
import { Anecdote } from './Anecdote';
import { Collectible } from './Collectible';

// --- TYPES DE JEUX ---
export type StepType =
    | 'dialogue'
    | 'quiz'
    | 'order'
    | 'reward'
    | 'location'
    | 'swipe'
    | 'true_false'
    | 'estimation';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// --- SOUS-STRUCTURES JEUX ---

export interface SwipeCard {
    id: string;
    imageUrl?: string;
    text: string;
    isText: boolean;
    isCorrect: boolean;
    lesson?: string;
}


// --- STRUCTURE TIMELINE (Venant du Backend) ---
// C'est ce qui remplace la liste statique de steps dans la DB
export interface TimelineItem {
    type: 'dialogue' | 'anecdote';

    // Si type = 'dialogue'
    content?: string;
    characterId?: string;

    // Si type = 'anecdote'
    data?: Anecdote;
}

// --- BASE STEP (Champs communs pour l'affichage) ---

interface StoryStepBase {
    id: string;
    title: string;
    content: string;
    duration?: number;
    imageUrl?: string;
    nextStepId?: string;
}

// --- VARIATIONS DE STEPS (Jouables) ---

export interface DialogueStep extends StoryStepBase {
    type: 'dialogue';
}

export interface QuizStep extends StoryStepBase {
    type: 'quiz';
    choices: string[];
    correctAnswerIndex: number;
    answerType: 'text' | 'image';
    explanation?: string;
}

export interface OrderStep extends StoryStepBase {
    type: 'order';
    orderItems: string[];
}

export interface LocationStep extends StoryStepBase {
    type: 'location';
}

export interface SwipeStep extends StoryStepBase {
    type: 'swipe';
    deck: SwipeCard[];
}

export interface TrueFalseStep extends StoryStepBase {
    type: 'true_false';
    statement: string;    // L'affirmation
    isTrue: boolean;      // La vérité
    imageUri?: string;    // L'image d'illustration
    explanation?: string; // L'explication post-jeu
}

export interface RewardStep extends StoryStepBase {
    type: 'reward';
    rewardImage?: string;
}

export interface EstimationStep extends StoryStepBase {
    type: 'estimation';
    label: string;
    targetValue: number;
    currency: string;
    min: number;
    max: number;
    imageUri: string;
    tolerance?: number;
    step?: number;
}

// L'Union des Steps Jouables
export type StoryStep =
    | DialogueStep
    | QuizStep
    | OrderStep
    | LocationStep
    | SwipeStep
    | TrueFalseStep
    | RewardStep
    | EstimationStep;

// --- OBJET PRINCIPAL STORY ---

export interface Story {
    _id: string;
    storyId: string;
    countryCode: string;
    category: string;
    subCategory: string;
    // Metadonnées
    city: string;
    isCapital: boolean;
    rarity: Rarity;
    title: string;

    // DATA BACKEND (Source)
    // Optionnel car une story générée localement (tuto) pourrait ne pas en avoir
    timeline?: TimelineItem[];

    // DATA FRONTEND (Résultat jouable)
    // C'est ce que le GameScreen consomme
    steps: StoryStep[];

    // Récompense
    rewardCollectibleId?: string;
    collectible?: Collectible;
    xpReward?: number;
}
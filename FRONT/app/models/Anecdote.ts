// app/models/Anecdote.ts

export type AnecdoteType = 'numeric' | 'true_false' | 'order' | 'choice';

// Interface de base
export interface BaseAnecdote {
    id: string;
    lesson: string; // Le texte explicatif / pédagogique
    imageUri?: string;
}

// 1. ANECDOTE CHIFFRÉE (Pour les jeux Estimation ou Quiz)
export interface NumericAnecdote extends BaseAnecdote {
    type: 'numeric';
    numericValue: number;
    unit: string;
    label: string; // ex: "Hauteur de la Tour Eiffel"
}

// 2. ANECDOTE VRAI/FAUX (Pour le jeu Swipe)
export interface TrueFalseAnecdote extends BaseAnecdote {
    type: 'true_false';
    statement: string; // ex: "La Tour Eiffel a été construite en 1900"
    isTrue: boolean;
    isText: boolean;
}

// 3. ANECDOTE D'ORDRE (Pour le jeu Order)
export interface OrderAnecdote extends BaseAnecdote {
    type: 'order';
    items: string[]; // Liste dans le bon ordre
    task: string;    // ex: "Rangez les étapes de la recette"
}

// 4. ANECDOTE QCM (Pour le jeu Quiz classique)
export interface ChoiceAnecdote extends BaseAnecdote {
    type: 'choice';
    question: string;
    correctAnswer: string;
    distractors: string[];
}

// Union Type
export type Anecdote = NumericAnecdote | TrueFalseAnecdote | OrderAnecdote | ChoiceAnecdote;
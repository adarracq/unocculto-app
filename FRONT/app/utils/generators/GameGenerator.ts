// app/utils/GameGenerator.ts
import { Anecdote, ChoiceAnecdote, NumericAnecdote, OrderAnecdote, TrueFalseAnecdote } from '@/app/models/Anecdote';
import { EstimationStep, OrderStep, QuizStep, StoryStep, TrueFalseStep } from '@/app/models/Story';

/**
 * Génère un Step de jeu à partir d'une anecdote brute.
 * @param anecdote La donnée brute
 * @param mode 'story' (avec dialogue d'intro) ou 'review' (direct au but)
 */
export const generateGameFromAnecdote = (anecdote: Anecdote, mode: 'story' | 'review' = 'story'): StoryStep => {

    // --- TYPE NUMERIQUE (Hauteur, Date, Population...) ---
    if (anecdote.type === 'numeric') {
        return generateNumericGame(anecdote, mode);
    }

    // --- TYPE VRAI/FAUX ---
    if (anecdote.type === 'true_false') {
        return generateTrueFalseGame(anecdote);
    }

    // --- TYPE ORDRE ---
    if (anecdote.type === 'order') {
        return generateOrderGame(anecdote);
    }

    // --- TYPE CHOIX MULTIPLE ---
    if (anecdote.type === 'choice') {
        return generateChoiceGame(anecdote);
    }

    throw new Error(`Type d'anecdote non supporté: ${(anecdote as any).type}`);
};

// --- GÉNÉRATEURS SPÉCIFIQUES ---

function generateNumericGame(data: NumericAnecdote, mode: 'story' | 'review'): StoryStep {
    // 70% de chance d'Estimation, 30% de chance de Quiz
    const isEstimation = Math.random() > 0.3;

    if (isEstimation) {
        // Calcul automatique des bornes min/max si non fournies
        const val = data.numericValue;
        const min = Math.floor(val * 0.5);
        const max = Math.ceil(val * 1.5);
        const step = val > 1000 ? 50 : 1;

        return {
            id: `game_${data.id}`,
            type: 'estimation',
            title: "Estimation",
            content: mode === 'story' ? `À votre avis : ${data.label} ?` : data.label,
            targetValue: val,
            currency: data.unit,
            min, max, step,
            imageUri: data.imageUri || '',
            tolerance: val * 0.1 // 10% de marge
        } as EstimationStep;
    } else {
        // Variante Quiz pour une valeur numérique
        const wrong1 = Math.round(data.numericValue * 0.7);
        const wrong2 = Math.round(data.numericValue * 1.3);
        const wrong3 = Math.round(data.numericValue * 0.9);

        const choices = [data.numericValue, wrong1, wrong2, wrong3]
            .sort(() => 0.5 - Math.random())
            .map(n => `${n} ${data.unit}`);

        return {
            id: `game_${data.id}`,
            type: 'quiz',
            title: "Précision",
            content: `Quelle est la valeur exacte pour : ${data.label} ?`,
            answerType: 'text',
            choices: choices,
            correctAnswerIndex: choices.indexOf(`${data.numericValue} ${data.unit}`),
            explanation: data.lesson
        } as QuizStep;
    }
}

function generateTrueFalseGame(data: TrueFalseAnecdote): TrueFalseStep {
    return {
        id: `game_${data.id}`,
        type: 'true_false', // On utilise le nouveau type
        title: "Vrai ou Faux ?",
        content: "Analysez cette affirmation :",
        statement: data.statement,
        isTrue: data.isTrue,
        imageUri: data.imageUri, // Image de l'anecdote
        explanation: data.lesson // Leçon affichée en cas de succès
    };
}

function generateOrderGame(data: OrderAnecdote): OrderStep {
    return {
        id: `game_${data.id}`,
        type: 'order',
        title: "Remettre en ordre",
        content: data.task,
        orderItems: data.items
    };
}

function generateChoiceGame(data: ChoiceAnecdote): QuizStep {
    const allChoices = [data.correctAnswer, ...data.distractors].sort(() => 0.5 - Math.random());

    return {
        id: `game_${data.id}`,
        type: 'quiz',
        title: "Culture",
        content: data.question,
        answerType: 'text',
        choices: allChoices,
        correctAnswerIndex: allChoices.indexOf(data.correctAnswer),
        explanation: data.lesson
    };
}
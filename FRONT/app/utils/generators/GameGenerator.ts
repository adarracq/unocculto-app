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

    let unit = data.unit.toLowerCase().includes('an') ? "" : data.unit;


    if (isEstimation) {
        // Calcul automatique des bornes min/max si non fournies
        let val = data.numericValue;
        let min = Math.floor(val * 0.5);
        let max = Math.ceil(val * 1.5);
        let step = val > 1000 ? 50 : 1;
        let tolerance = val * 0.1;
        // hardcode if currency is année step de 1 an et min max de -300/+300 ans
        if (data.unit.toLowerCase().includes('an')) {
            step = 1;
            min = val - 50;
            max = val + 50;
            unit = "";
            tolerance = 10; // 10 ans de marge
        }

        return {
            id: `game_${data.id}`,
            type: 'estimation',
            title: "Estimation",
            content: mode === 'story' ? `À votre avis : ${data.label} ?` : data.label,
            targetValue: val,
            currency: unit,
            min, max, step,
            imageUri: data.imageUri || '',
            tolerance: tolerance
        } as EstimationStep;
    } else {
        // Variante Quiz pour une valeur numérique 10 à 30% de variation aléatoire
        let wrong1 = Math.round(data.numericValue * (Math.random() > 0.5 ? 0.8 : 1.1));
        let wrong2 = Math.round(data.numericValue * (Math.random() > 0.5 ? 0.7 : 1.2));
        let wrong3 = Math.round(data.numericValue * (Math.random() > 0.5 ? 0.6 : 1.3));

        if (data.unit.toLowerCase().includes('an')) {// -50 à +50 ans
            wrong1 = data.numericValue + Math.floor(Math.random() * 100 - 50);
            wrong2 = data.numericValue + Math.floor(Math.random() * 100 - 50);
            wrong3 = data.numericValue + Math.floor(Math.random() * 100 - 50);
        }

        const choices = [data.numericValue, wrong1, wrong2, wrong3]
            .sort(() => 0.5 - Math.random())
            .map(n => `${n} ${unit}`);

        return {
            id: `game_${data.id}`,
            type: 'quiz',
            title: "Précision",
            content: `Quelle est la valeur exacte pour : ${data.label} ?`,
            answerType: 'text',
            choices: choices,
            correctAnswerIndex: choices.indexOf(`${data.numericValue} ${unit}`),
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
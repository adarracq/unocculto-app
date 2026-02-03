import { ALL_COUNTRIES, Country, getFlagImage } from '@/app/models/Countries';
import { LocationStep, OrderStep, QuizStep, StoryStep, SwipeStep } from '@/app/models/Story';
import { Image } from 'react-native';

// Interface venant de l'API
export interface MemoryItem {
    _id: string;
    countryCode: string;
    factType: 'flag' | 'capital' | 'location' | 'anecdote';
}

function getRandomDistractors(correct: Country, count: number): Country[] {
    return ALL_COUNTRIES
        .filter(c => c.code !== correct.code)
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

export const generateReviewStep = (memory: MemoryItem): StoryStep => {
    const country = ALL_COUNTRIES.find(c => c.code === memory.countryCode);
    if (!country) throw new Error("Pays introuvable : " + memory.countryCode);

    // ID unique pour React key
    const stepId = memory._id;

    // --- LOGIQUE DRAPEAU ---
    if (memory.factType === 'flag') {
        // 50% Quiz classique / 50% Swipe rapide
        const isQuiz = Math.random() > 0.5;

        if (isQuiz) {
            const distractors = getRandomDistractors(country, 3);
            const choices = [country, ...distractors].sort(() => 0.5 - Math.random());

            return {
                id: stepId,
                title: "Drapeau",
                content: `Identifiez le drapeau : ${country.name_fr}`,
                type: 'quiz',
                answerType: 'image',
                choices: choices.map(c => Image.resolveAssetSource(getFlagImage(c.code)).uri),
                correctAnswerIndex: choices.indexOf(country),
            } as QuizStep;
        } else {
            // Swipe (Vrai/Faux)
            const showCorrect = Math.random() > 0.5;
            const displayed = showCorrect ? country : getRandomDistractors(country, 1)[0];

            return {
                id: stepId,
                title: "Contrôle Rapide",
                content: `Est-ce le drapeau de : ${country.name_fr} ?`,
                type: 'swipe',
                deck: [{
                    id: 'card_1',
                    imageUrl: Image.resolveAssetSource(getFlagImage(displayed.code)).uri,
                    text: '',
                    isCorrect: showCorrect
                }]
            } as SwipeStep;
        }
    }

    // --- LOGIQUE CAPITALE (50% Order / 50% Quiz) ---
    if (memory.factType === 'capital') {
        const isOrderGame = Math.random() > 0.1;

        if (isOrderGame) {
            // JEU D'ORDRE (Lettres)
            // On nettoie le nom (pas d'espaces, majuscules)
            const letters = country.capital.toUpperCase().split('').filter(char => char !== ' ');

            return {
                id: stepId,
                title: "Orthographe",
                content: `Reconstituez le nom de la capitale :`,
                type: 'order',
                orderItems: letters,
            } as OrderStep;

        } else {
            // QUIZ CLASSIQUE
            const distractors = getRandomDistractors(country, 3);
            const choices = [country, ...distractors].sort(() => 0.5 - Math.random());

            return {
                id: stepId,
                title: "Capitale",
                content: `Capitale de ${country.name_fr} ?`,
                type: 'quiz',
                answerType: 'text', // Spécifié explicitement
                choices: choices.map(c => c.capital),
                correctAnswerIndex: choices.indexOf(country),
            } as QuizStep;
        }
    }

    // --- LOGIQUE LOCALISATION ---
    if (memory.factType === 'location') {
        return {
            id: stepId,
            title: "Radar Géographique",
            content: `Localisez ${country.name_fr}.`,
            type: 'location',
        } as LocationStep;
    }

    // --- LOGIQUE ANECDOTE / CULTURE ---
    if (memory.factType === 'anecdote') {
        const distractors = getRandomDistractors(country, 3);
        const choices = [country, ...distractors].sort(() => 0.5 - Math.random());

        return {
            id: stepId,
            title: "Culture & Savoir",
            content: `À quel pays associez-vous la ville de ${country.capital} et ses traditions ?`,
            type: 'quiz',
            answerType: 'text',
            choices: choices.map(c => c.name_fr),
            correctAnswerIndex: choices.indexOf(country),
            explanation: `C'est bien ${country.name_fr} !`
        } as QuizStep;
    }

    throw new Error("Type inconnu");
};
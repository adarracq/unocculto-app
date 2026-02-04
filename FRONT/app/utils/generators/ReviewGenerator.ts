import { ALL_COUNTRIES, Country, getFlagImage } from '@/app/models/Countries';
import { LocationStep, OrderStep, QuizStep, StoryStep, SwipeCard, SwipeStep } from '@/app/models/Story';
import { Image } from 'react-native';
import { generateGameFromAnecdote } from './GameGenerator';

// Interface venant de l'API
export interface UserMemory {
    _id: string;
    countryCode: string;
    factType: 'flag' | 'capital' | 'location' | 'anecdote';
    specificData?: any;
}

function getRandomDistractors(correct: Country, count: number): Country[] {
    return ALL_COUNTRIES
        .filter(c => c.code !== correct.code)
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

export const generateReviewStep = (memory: UserMemory): StoryStep => {
    const country = ALL_COUNTRIES.find(c => c.code === memory.countryCode);
    if (!country) throw new Error("Pays introuvable : " + memory.countryCode);

    // ID unique pour React key
    const stepId = memory._id;

    // --- LOGIQUE DRAPEAU ---
    if (memory.factType === 'flag') {
        // 50% Quiz classique / 50% Swipe rapide
        const isQuiz = Math.random() > 0.5;
        const distractors = getRandomDistractors(country, 3);

        if (isQuiz) {

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
            // MODE SWIPE (Chercher le bon dans un paquet)

            // 1. On prend 4 ou 5 distracteurs (intrus)
            const distractors = getRandomDistractors(country, 5);

            // 2. On crée une liste brute contenant le BON et les MAUVAIS
            const rawList = [country, ...distractors];

            // 3. On mélange le tout pour que le bon ne soit pas toujours au même endroit
            const shuffledList = rawList.sort(() => 0.5 - Math.random());

            // 4. On transforme en cartes de jeu (SwipeCard)
            const deck: SwipeCard[] = shuffledList.map(c => {
                const isTarget = c.code === country.code;

                return {
                    id: c.code,
                    imageUrl: Image.resolveAssetSource(getFlagImage(c.code)).uri,
                    text: '', // Pas de texte, c'est visuel
                    isText: false,
                    isCorrect: isTarget, // SEUL le pays cible est "Correct" (à swiper à droite)
                    lesson: isTarget
                        ? `C'est bien le drapeau de ${country.name_fr} !`
                        : `Non, c'est le drapeau de ${c.name_fr}.`
                };
            });

            return {
                id: stepId,
                title: "Recherche Visuelle",
                // La consigne change : on ne demande pas Vrai/Faux, on demande de TROUVER
                content: `Trouve le drapeau de : ${country.name_fr}`,
                type: 'swipe',
                deck: deck
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
                content: `Reconstituez le nom de la capitale de : ${country.name_fr}`,
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
    if (memory.factType === 'anecdote') {
        console.log(memory);
    }

    // --- LOGIQUE ANECDOTE / CULTURE ---
    if (memory.factType === 'anecdote' && memory.specificData) {
        // On délègue la création du jeu au générateur intelligent
        // On passe 'review' pour éviter les dialogues d'intro trop longs
        return generateGameFromAnecdote(memory.specificData, 'review');
    }

    throw new Error("Type inconnu");
};
import { ALL_COUNTRIES, Country, getFlagImage } from '@/app/models/Countries';
import { Image } from 'react-native';
import { StoryStep } from '../models/Story';

/**
 * Pioche N éléments aléatoires dans un tableau (excluant un élément précis)
 */
function getRandomDistractors(array: Country[], count: number, exclude: Country): Country[] {
    const shuffled = array
        .filter(item => item.code !== exclude.code)
        .sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Helper pour mélanger
function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => 0.5 - Math.random());
}

/**
 * Génère les étapes d'intro (Carte, Drapeau, Capitale)
 */
export const generateGenericSteps = (country: Country): StoryStep[] => {
    const steps: StoryStep[] = [];

    // --- ETAPE 1 : LOCALISATION (Nouveau type 'location') ---
    steps.push({
        id: 'gen_loc',
        type: 'location', // Nouveau type à gérer dans GameScreen
        title: 'Où sommes-nous ?',
        content: `Avant de commencer, savez-vous situer ${country.name_fr} sur la carte ?`,
        // On passera les coordonnées via l'objet country dans le composant
        duration: 0 // Pas de timer auto
    });

    // --- ETAPE 2 : DRAPEAU (Random entre Quiz 4 choix ou Vrai/Faux) ---
    const isTrueFalseFlag = Math.random() > 0.99;

    if (isTrueFalseFlag) {
        const correctCountry = country;
        const distractors = getRandomDistractors(ALL_COUNTRIES, 4, correctCountry);
        const rawDeck = [correctCountry, ...distractors];
        const shuffledDeck = shuffleArray(rawDeck);

        const swipeDeck = shuffledDeck.map(c => {
            // La logique reste : Si c'est le pays cible => VRAI
            const isTarget = c.code === correctCountry.code;

            return {
                id: c.code,
                imageUrl: Image.resolveAssetSource(getFlagImage(c.code)).uri,
                text: "???",
                isCorrect: isTarget
            };
        });

        steps.push({
            id: 'gen_flag_swipe',
            type: 'swipe',
            title: 'Contrôle Visuel',
            content: `Mission : Identifiez le drapeau de : ${country.name_fr}.\n\n👉 Swipe DROITE si c'est lui.\n👈 Swipe GAUCHE si c'est un intrus.`,
            deck: swipeDeck
        });
    } else {
        // 4 CHOIX
        const distractors = getRandomDistractors(ALL_COUNTRIES, 3, country);
        const options = [country, ...distractors].sort(() => 0.5 - Math.random());
        const correctIndex = options.indexOf(country);

        // On récupère les IMAGES pour les choix
        // Note : getFlagImage retourne un ID numérique (require), c'est compatible avec <Image source={...} />
        const imageChoices = options.map(c => Image.resolveAssetSource(getFlagImage(c.code)).uri);
        // ATTENTION : Pour que le composant Image de React Native accepte le 'require' directement via URI dans certains cas,
        // le plus simple pour ton composant QuizGameView modifié est de passer directement le 'require result' si tu as adapté le type,
        // MAIS ton QuizGameView attend des strings (uri).

        // SOLUTION ROBUSTE : 
        // Modifions légèrement GenericStoryGenerator pour passer les 'assets' IDs si possible, 
        // ou alors on utilise Image.resolveAssetSource(require(...)).uri pour avoir une string.

        steps.push({
            id: 'gen_flag_multi',
            type: 'quiz',
            title: 'Le bon Drapeau',
            content: `Lequel de ces drapeaux est celui de ${country.name_fr} ?`,

            // NOUVEAU : On active le mode Image
            answerType: 'image',

            // On passe les URIs résolues
            choices: options.map(c => {
                const asset = getFlagImage(c.code);
                // Astuce Expo pour convertir un require local en URI string exploitable
                return Image.resolveAssetSource(asset).uri;
            }),

            correctAnswerIndex: correctIndex
        });
    }

    // --- ETAPE 3 : CAPITALE (Random entre Quiz ou Order) ---
    const isOrderGame = Math.random() > 0.99;

    if (isOrderGame) {
        // JEU D'ORDRE (Lettres)
        // On nettoie le nom (pas d'espaces, majuscules)
        const letters = country.capital.toUpperCase().split('').filter(char => char !== ' ');

        steps.push({
            id: 'gen_cap_order',
            type: 'order',
            title: 'La Capitale',
            content: `Reconstituez le nom de la capitale :`,
            orderItems: letters, // L'utilisateur doit les remettre dans l'ordre
        });
    } else {
        // QUIZ CLASSIQUE
        const distractors = getRandomDistractors(ALL_COUNTRIES, 3, country);
        const options = [country, ...distractors].sort(() => 0.5 - Math.random());
        const correctIndex = options.indexOf(country);

        steps.push({
            id: 'gen_cap_quiz',
            type: 'quiz',
            title: 'Capitale',
            content: `Quelle est la capitale de ${country.name_fr} ?`,
            choices: options.map(c => c.capital),
            correctAnswerIndex: correctIndex
        });
    }

    // --- TRANSITION ---
    steps.push({
        id: 'gen_transition',
        type: 'dialogue',
        title: 'Excellent !',
        content: "Vous avez les bases. Maintenant, explorons ce que ce pays a d'unique...",
        duration: 4000
    });

    return steps;
};
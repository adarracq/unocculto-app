import { Collectible } from '@/app/models/Collectible';
import { ALL_COUNTRIES, Country, getFlagImage } from '@/app/models/Countries';
import { RewardStep, StoryStep } from '@/app/models/Story';
import { Image } from 'react-native';

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

    // --- ETAPE 1 : LOCALISATION ---
    steps.push({
        id: 'gen_loc',
        type: 'location',
        title: 'Où sommes-nous ?',
        content: `Avant de commencer, savez-vous situer ${country.name_fr} sur la carte ?`,
        duration: 0
    });

    // --- ETAPE 2 : DRAPEAU (Random Quiz vs Swipe) ---
    const isTrueFalseFlag = Math.random() > 0.5;

    if (isTrueFalseFlag) {
        const correctCountry = country;
        const distractors = getRandomDistractors(ALL_COUNTRIES, 4, correctCountry);
        const rawDeck = [correctCountry, ...distractors];
        const shuffledDeck = shuffleArray(rawDeck);

        const swipeDeck = shuffledDeck.map(c => {
            const isTarget = c.code === correctCountry.code;
            return {
                id: c.code,
                imageUrl: Image.resolveAssetSource(getFlagImage(c.code)).uri,
                text: "???",
                isCorrect: isTarget,
                isText: false
            };
        });

        steps.push({
            id: 'gen_flag_swipe',
            type: 'swipe',
            title: 'Contrôle Visuel',
            content: `Mission : Identifiez le drapeau de : ${country.name_fr}`,
            deck: swipeDeck
        });
    } else {
        // 4 CHOIX
        const distractors = getRandomDistractors(ALL_COUNTRIES, 3, country);
        const options = [country, ...distractors].sort(() => 0.5 - Math.random());
        const correctIndex = options.indexOf(country);

        steps.push({
            id: 'gen_flag_multi',
            type: 'quiz',
            title: 'Le bon Drapeau',
            content: `Lequel de ces drapeaux est celui de ${country.name_fr} ?`,
            answerType: 'image',
            choices: options.map(c => {
                const asset = getFlagImage(c.code);
                return Image.resolveAssetSource(asset).uri;
            }),
            correctAnswerIndex: correctIndex
        });
    }

    // --- ETAPE 3 : CAPITALE (Random Quiz vs Order) ---
    const isOrderGame = Math.random() > 0.5;

    if (isOrderGame) {
        // JEU D'ORDRE (Lettres)
        // On retire les espaces, les virgules et les points
        const letters = country.capital.toUpperCase().replace(/[\s,.'-]/g, '').split('');

        steps.push({
            id: 'gen_cap_order',
            type: 'order',
            title: 'La Capitale',
            content: `Reconstituez le nom de la capitale :`,
            orderItems: letters,
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
            answerType: 'text', // AJOUT IMPORTANT POUR LE MODELE
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
        duration: 8000
    });

    return steps;
};

/* Génère les étapes de FIN (Outro).
 * Ajoute un reward "Drapeau" si l'utilisateur ne l'a pas encore.
 */
export const generateOutroSteps = (country: Country, userHasFlag: boolean): StoryStep[] => {
    const steps: StoryStep[] = [];

    // Si l'utilisateur n'a pas le drapeau, on ajoute l'étape de récompense
    if (!userHasFlag) {

        // On récupère l'URI de l'image du drapeau local
        const flagAsset = getFlagImage(country.code);
        const flagUri = Image.resolveAssetSource(flagAsset).uri;

        steps.push({
            id: 'gen_reward_flag',
            type: 'reward',
            title: 'Nouveau Visa !',
            content: `Félicitations ! Vous avez débloqué le drapeau de : ${country.name_fr}.`,
            rewardImage: flagUri, // On passe l'URI ici
            duration: 0
        } as RewardStep);
    }

    return steps;
};

export const generateRewardStep = (collectible: Collectible): RewardStep => {
    return {
        id: `reward_${Date.now()}`,
        type: 'reward',
        title: collectible.name + ' débloqué' || "Récompense Débloquée",
        content: collectible.description || "Vous avez obtenu une nouvelle récompense.",
        rewardImage: collectible.imageUrl
    };
}
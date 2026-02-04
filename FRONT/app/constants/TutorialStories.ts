import { Story } from '@/app/models/Story';

function setTutorialStory(id: string, storyId: string, countryCode: string, city: string): Story {
    return {
        _id: id,
        storyId: storyId,
        countryCode: countryCode,
        city: city,
        isCapital: true, // Les tutos sont toujours les capitales
        rarity: 'common',
        rewardCollectibleId: 'passport_starter', // Un ID fictif pour le moment
        // ------------------------------------

        title: `Départ pour ${city}`,
        steps: [
            {
                id: 'intro',
                type: 'dialogue',
                title: 'Bienvenue !',
                content: `Salut ! Je suis ton guide. Nous allons partir pour ${city}. Mais avant de décoller, il faut préparer le voyage !`,
                nextStepId: 'game_order_1',
                duration: 8000
            },
            {
                id: 'game_order_1',
                type: 'order',
                title: 'Préparatifs',
                content: "Remettez les étapes du voyage dans le bon ordre chronologique :",
                // L'ordre correct qu'il faut trouver
                orderItems: [
                    "Faire sa valise",
                    "Aller à l'aéroport",
                    "Décoller",
                    `Arriver à ${city}`
                ],
                nextStepId: 'reward_1'
            },
            {
                id: 'reward_1',
                type: 'reward',
                title: 'Passeport Débloqué !',
                content: `Vous êtes maintenant prêt à embarquer pour ${city}. Voici votre passeport, bon voyage !`,
                nextStepId: undefined, // Fin
                rewardImage: 'passport', // On n'utilise plus rewardImage mais le système de collectibles, mais tu peux le garder pour l'UI temporaire
            }
        ]
    };
}

export const TUTORIAL_STORIES: Record<string, Story> = {
    'FR': setTutorialStory('tutorial_fr', 'FR00', 'FR', 'Paris'),
    'PE': setTutorialStory('tutorial_pe', 'PE00', 'PE', 'Lima'),
    'JP': setTutorialStory('tutorial_jp', 'JP00', 'JP', 'Tokyo'),
    'EG': setTutorialStory('tutorial_eg', 'EG00', 'EG', 'Le Caire'),
};
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { userService } from '@/app/services/user.service';
import { generateGenericSteps } from '@/app/utils/GenericStoryGenerator'; // Ton générateur
import React, { useContext, useMemo } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import GameScreen from '../games/GameScreen';

type Props = NativeStackScreenProps<HomeNavParams, 'StoryGame'>;

export default function StoryGameScreen({ navigation, route }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);

    // Récupération des params de navigation
    const { country, story: dbStory } = route.params;

    // --- 1. GÉNÉRATION HYBRIDE ---
    // On fusionne les étapes génériques (Map, Flag, Capital) avec l'histoire spécifique (BDD)
    // useMemo évite de re-générer (et donc changer les questions random) à chaque re-render
    const fullStory = useMemo(() => {
        // A. Générer les étapes d'intro éducatives
        const introSteps = generateGenericSteps(country);

        // B. Cloner la story BDD pour ne pas modifier l'objet d'origine
        const mergedStory = { ...dbStory };

        // C. Fusionner : Intro d'abord, puis contenu BDD
        mergedStory.steps = [...introSteps, ...dbStory.steps];

        return mergedStory;
    }, [country.code, dbStory.storyId]); // Dépendances uniques


    // --- 2. API SAVE ---
    const { execute: completeStory, loading } = useApi(
        (data: any) => userService.completeStory(data),
        'StoryGame - Complete'
    );

    // --- 3. FIN DE JEU ---
    const handleGameFinish = async () => {
        // On sauvegarde la progression via le Service User
        const result = await completeStory({
            storyId: dbStory.storyId, // On utilise l'ID original (pas besoin de tracker les steps génériques)
            countryCode: country.code,
            score: 100 // Tu pourras calculer un vrai score plus tard
        });

        if (result && result.success) {
            // Mise à jour du contexte local (User)
            setUserContext({
                ...userContext,
                ...result.updatedUser
            });

            // Préparation du message de fin
            let title = "Voyage terminé ! ✈️";
            let message = `Atterrissage réussi. Vous gagnez ${result.earned.xp} XP.`;

            // Hiérarchie des récompenses
            if (result.countryCompleted) {
                title = "PAYS CONQUIS ! 👑";
                message = `Incroyable ! ${country.name_fr} n'a plus de secret pour vous. Badge Or débloqué !`;
            }
            else if (result.flagUnlocked) {
                title = "NOUVEAU DRAPEAU ! 🚩";
                message = `Bienvenue en ${country.name_fr} ! Le drapeau a été ajouté à votre collection.`;
            }
            else if (result.earned.collectible) {
                title = "TRÉSOR DÉCOUVERT ! 💎";
                message = "Vous avez trouvé un nouvel objet rare pour votre musée.";
            }

            // Popup de fin
            Alert.alert(
                title,
                message,
                [{
                    text: "Choisir ma prochaine destination",
                    onPress: () => navigation.replace('SelectDestination')
                }]
            );
        } else {
            // Fallback en cas d'erreur réseau
            Alert.alert("Erreur", "Sauvegarde impossible. Vérifiez votre connexion.");
            navigation.replace('Home');
        }
    };

    return (
        <GameScreen
            story={fullStory}      // On passe l'histoire complète (Générique + BDD)
            country={country}      // On passe le pays pour la Map
            onFinish={handleGameFinish}
            headerTitle={`${country.flag} • ${fullStory.title}`}
        />
    );
}
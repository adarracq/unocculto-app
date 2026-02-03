import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { userService } from '@/app/services/user.service';
import { generateGenericSteps } from '@/app/utils/GenericStoryGenerator'; // Ton générateur
import React, { useContext, useMemo, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import GameScreen from '../games/GameScreen';

type Props = NativeStackScreenProps<HomeNavParams, 'StoryGame'>;

export default function StoryGameScreen({ navigation, route }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);

    const [endModalConfig, setEndModalConfig] = useState<{
        visible: boolean;
        title: string;
        variant: 'default' | 'gold';
        content: React.ReactNode;
    }>({ visible: false, title: '', variant: 'default', content: null });

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

            // On prépare le contenu selon le résultat
            let title = "VOYAGE TERMINÉ";
            let variant: 'default' | 'gold' = 'default';
            let content;

            if (result.countryCompleted) {
                title = "PAYS CONQUIS !";
                variant = 'gold';
                content = (
                    <View style={{ gap: 10 }}>
                        <Title1 title="Badge Or Débloqué 👑" color="#FFD700" />
                        <BodyText text={`Vous avez complété toutes les histoires de ${country.name_fr}.`} />
                        <BodyText text={`+ ${result.earned.xp} XP`} style={{ color: Colors.lightGrey }} />
                    </View>
                );
            } else if (result.flagUnlocked) {
                title = "NOUVEAU VISA";
                content = (
                    <View style={{ gap: 10 }}>
                        <Title1 title="Drapeau Ajouté 🚩" color={Colors.white} />
                        <BodyText text={`Bienvenue en ${country.name_fr}.`} />
                        <BodyText text={`+ ${result.earned.xp} XP`} style={{ color: Colors.lightGrey }} />
                    </View>
                );
            } else {
                // Cas standard
                content = (
                    <View style={{ gap: 10 }}>
                        <Title1 title="Atterrissage Réussi" color={Colors.white} />
                        <BodyText text={`Vous avez terminé l'aventure "${dbStory.title}".`} />
                        <BodyText text={`+ ${result.earned.xp} XP`} style={{ color: Colors.lightGrey }} />
                    </View>
                );
            }

            setEndModalConfig({ visible: true, title, variant, content });

        } else {
            // Fallback
            navigation.replace('Home');
        }
    };

    return (


        <>
            <GameScreen
                story={fullStory}      // On passe l'histoire complète (Générique + BDD)
                country={country}      // On passe le pays pour la Map
                onFinish={handleGameFinish}
                headerTitle={`${country.flag} • ${fullStory.title}`}
            />

            <CustomModal
                visible={endModalConfig.visible}
                title={endModalConfig.title}
                variant={endModalConfig.variant}
                onConfirm={() => {
                    setEndModalConfig({ ...endModalConfig, visible: false });
                    navigation.replace('SelectDestination');
                }}
                confirmText="CONTINUER"
            // Pas de bouton annuler ici
            >
                {endModalConfig.content}
            </CustomModal>
        </>
    );
}
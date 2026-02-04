import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { DialogueStep, Story, StoryStep } from '@/app/models/Story'; //
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { collectibleService } from '@/app/services/collectible.service';
import { userService } from '@/app/services/user.service';
import { functions } from '@/app/utils/Functions';
import { generateGameFromAnecdote } from '@/app/utils/generators/GameGenerator'; // Assure-toi que le chemin est bon
import { generateGenericSteps, generateOutroSteps, generateRewardStep } from '@/app/utils/generators/GenericStoryGenerator'; //
import React, { useContext, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
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

    // Récupération des params. 
    // Note: dbStory ici est l'objet "Raw" venant du back avec la 'timeline'
    const { country, story: dbStory } = route.params;

    const apiCollectible = useApi(
        (id: string) => collectibleService.getById(id),
        'StoryGame - Get Collectible'
    );

    // --- 1. GÉNÉRATION HYBRIDE & DYNAMIQUE ---
    const fullStory: Story = useMemo(() => {
        // A. Générer les étapes d'intro éducatives (Map, Flag...)
        const introSteps = generateGenericSteps(country);

        // B. Transformer la "Timeline" backend en "StorySteps" frontend
        // On suppose que dbStory.timeline existe (selon le nouveau modèle backend)
        const contentSteps: StoryStep[] = [];

        if (dbStory.timeline && Array.isArray(dbStory.timeline)) {
            dbStory.timeline.forEach((item: any, index: number) => {
                const stepId = `story_${dbStory.storyId}_${index}`;

                if (item.type === 'dialogue') {
                    // Transformation manuelle pour le Dialogue
                    contentSteps.push({
                        id: stepId,
                        type: 'dialogue',
                        title: dbStory.title, // Ou un titre spécifique si dispo
                        content: item.content || "...",
                        duration: 8000, // Temps de lecture par défaut
                        // imageUrl: item.characterImage ... (si dispo)
                    } as DialogueStep);
                }
                else if (item.type === 'anecdote' && item.data) {
                    // Transformation via le Moteur de Jeu pour l'Anecdote
                    try {
                        // On passe 'story' pour avoir le contexte narratif si besoin
                        const gameStep = generateGameFromAnecdote(item.data, 'story');
                        console.log("Généré le jeu pour l'anecdote:", item.data);
                        // On écrase l'ID généré pour garder une cohérence de séquence si besoin, 
                        // ou on garde celui du générateur. Ici on force l'ID unique de step.
                        gameStep.id = stepId;
                        contentSteps.push(gameStep);
                    } catch (e) {
                        console.warn("Impossible de générer le jeu pour l'anecdote", item);
                    }
                }
            });
        }

        const hasFlag = userContext.passport[country.code]?.hasFlag || false;
        const rewardSteps = generateOutroSteps(country, hasFlag);
        // Si une récompense collectible est définie, on l'ajoute aussi
        if (dbStory.collectible) {
            const rewardStep = generateRewardStep(dbStory.collectible);
            rewardSteps.push(rewardStep);
        }
        return {
            ...dbStory, // Garde les métadonnées (id, title, rewards...)
            steps: [...introSteps, ...contentSteps, ...rewardSteps],
        };

    }, [country.code, dbStory.storyId, dbStory.collectible?.imageUrl]);


    // --- 2. API SAVE ---
    const { execute: completeStory } = useApi(
        (data: any) => userService.completeStory(data),
        'StoryGame - Complete'
    );

    // --- 3. FIN DE JEU ---
    const handleGameFinish = async () => {
        const result = await completeStory({
            storyId: dbStory.storyId,
            countryCode: country.code,
            score: 100
        });

        if (result && result.success) {
            setUserContext({ ...userContext, ...result.updatedUser });

            let title = "VOYAGE TERMINÉ";
            let variant: 'default' | 'gold' = 'default';
            let content;

            if (result.countryCompleted) {
                title = "PAYS CONQUIS !";
                variant = 'gold';
                content = (
                    <View style={{ gap: 10 }}>
                        <Title1 title="Passeport Diplomatique Débloqué" color={Colors.gold} />
                        <BodyText text={`Vous avez complété toutes les histoires de ${country.name_fr}.`} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <BodyText text={`+ ${result.earned.xp}`} style={{ color: Colors.lightGrey }} />
                            <Image source={functions.getIconSource('lightning')} style={{ width: 12, height: 12 }} />
                        </View>
                    </View>
                );
            } else if (result.flagUnlocked) {
                title = "NOUVEAU VISA";
                content = (
                    <View style={{ gap: 10 }}>
                        <Title1 title="Drapeau Ajouté" color={Colors.white} />
                        <BodyText text={`Bienvenue en ${country.name_fr}.`} />
                        <BodyText text={`+ ${result.earned.xp} XP`} style={{ color: Colors.lightGrey }} />
                    </View>
                );
            } else {
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
            navigation.replace('Home');
        }
    };

    return (
        <>
            <GameScreen
                story={fullStory}
                country={country}
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
            >
                {endModalConfig.content}
            </CustomModal>
        </>
    );
}
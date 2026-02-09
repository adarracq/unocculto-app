import BodyText from '@/app/components/atoms/BodyText';
import CustomModal from '@/app/components/molecules/CustomModal'; //
import StoryProgressBar from '@/app/components/molecules/StoryProgressBar';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES } from '@/app/models/Countries';
import { StoryStep } from '@/app/models/Story';
import { userService } from '@/app/services/user.service';
import { generateReviewStep, UserMemory } from '@/app/utils/generators/ReviewGenerator';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native'; // Alert supprimé des imports
import EstimationGameView from '../games/EstimationGameView';
import LocationGameView from '../games/LocationGameView';
import OrderGameView from '../games/OrderGameView';
import QuizGameView from '../games/QuizGameView';
import SwipeGameView from '../games/SwipeGameView';
import TrueFalseGameView from '../games/TrueFalseGameView';

export default function ReviewSessionScreen({ route, navigation }: any) {
    const { filters } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [memories, setMemories] = useState<UserMemory[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const steps = useMemo<StoryStep[]>(() => {
        return memories.map(m => generateReviewStep(m));
    }, [memories]);

    // --- NOUVEAU : État pour la Modale ---
    const [modalConfig, setModalConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        variant?: 'default' | 'gold';
        onConfirm: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
        variant: 'default',
        onConfirm: () => { }
    });

    // --- 1. CHARGEMENT ---
    useEffect(() => {
        userService.getDueMemories(filters)
            .then((data: UserMemory[]) => {
                if (data.length === 0) {
                    setModalConfig({
                        visible: true,
                        title: "Terminé",
                        message: "Rien à réviser avec ces filtres !",
                        onConfirm: () => navigation.goBack()
                    });
                    setLoading(false);
                    return;
                }
                setMemories(data);
                setCurrentIndex(0);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setModalConfig({
                    visible: true,
                    title: "Erreur",
                    message: "Impossible de charger la mission.",
                    onConfirm: () => navigation.goBack()
                });
            });
    }, []);

    // --- 2. VALIDATION (Passer au suivant) ---
    const handleNext = (isSuccess: boolean) => {
        const currentMemory = memories[currentIndex];

        // Sauvegarde asynchrone (on n'attend pas la réponse pour fluidifier)
        userService.reviewMemory(currentMemory._id, isSuccess);

        if (currentIndex < steps.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // FIN DE SESSION : Remplacement Alert -> CustomModal (Version Gold)
            setModalConfig({
                visible: true,
                title: "Mission Accomplie",
                message: "Retour à la base.",
                variant: 'gold', // Utilisation de la variante Gold pour la victoire
                onConfirm: () => navigation.goBack()
            });
        }
    };


    const currentStep = steps[currentIndex];
    const currentMemory = memories[currentIndex];
    const currentCountry = ALL_COUNTRIES.find(c => c.code === currentMemory?.countryCode); // Ajout du ? de sécurité

    // --- 3. RENDU DU JEU ---
    const renderGame = () => {
        if (!currentCountry) return null;

        switch (currentStep.type) {
            case 'quiz':
                return <QuizGameView step={currentStep} onValid={() => handleNext(true)} />;
            case 'swipe':
                return <SwipeGameView step={currentStep} onValid={() => handleNext(true)} />;
            case 'order':
                return <OrderGameView step={currentStep} onValid={() => handleNext(true)} />;
            case 'estimation':
                return <EstimationGameView step={currentStep} onValid={() => handleNext(true)} />;
            case 'true_false':
                return <TrueFalseGameView step={currentStep} onValid={() => handleNext(true)} />;
            case 'location':
                return <LocationGameView step={currentStep} country={currentCountry} onValid={() => handleNext(true)} />;
            default:
                return <View />;
        }
    };

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            {(loading && !modalConfig.visible) ?
                <></>
                :
                <>
                    {/* Barre de progression simple en haut */}
                    <View style={styles.progressContainer}>
                        <StoryProgressBar
                            steps={steps}
                            currentIndex={currentIndex}
                            animValue={new Animated.Value(1)}
                        />
                    </View>

                    <View style={styles.gameContainer}>
                        {renderGame()}
                    </View>

                    {/* --- NOUVEAU : Intégration de la Modale --- */}
                    <CustomModal
                        visible={modalConfig.visible}
                        title={modalConfig.title}
                        onConfirm={() => {
                            setModalConfig({ ...modalConfig, visible: false }); // Fermer d'abord
                            modalConfig.onConfirm(); // Exécuter l'action (goBack)
                        }}
                        confirmText="Continuer"
                        variant={modalConfig.variant}
                    >
                        <BodyText text={modalConfig.message} color={Colors.white} />
                    </CustomModal>
                </>}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
    progressContainer: {
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 12,
        zIndex: 20, // Toujours au-dessus
        height: 40,
    },
    gameContainer: { flex: 1 }
});
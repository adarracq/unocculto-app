import SmallText from '@/app/components/atoms/SmallText';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import StoryProgressBar from '@/app/components/molecules/StoryProgressBar';
import Colors from '@/app/constants/Colors';
import { Country } from '@/app/models/Countries';
import { Story } from '@/app/models/Story';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';
import StoryDialogue from '../stories/StoryDialogue';
import StoryReward from '../stories/StoryReward';
import LocationGameView from './location/LocationGameView';
import OrderGameView from './order/OrderGameView';
import QuizGameView from './quiz/QuizGameView';
import SwipeGameView from './swipe/SwipeGameView';

const { width } = Dimensions.get('window');

interface Props {
    story: Story;
    country: Country;
    onFinish: () => void;
    headerTitle?: string;
}

export default function GameScreen({ story, country, onFinish, headerTitle }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentStep = story.steps[currentIndex];

    // --- DETECTION DU TYPE D'ÉTAPE ---
    // Si c'est un jeu, on désactive la navigation tactile globale "Instagram style"
    // pour laisser le joueur interagir avec la Map ou les éléments.
    const isGameStep = ['quiz', 'order', 'location', 'swipe', 'reward'].includes(currentStep.type);

    // AutoPlay seulement pour les dialogues
    const isAutoPlay = currentStep.type === 'dialogue';

    // --- ANIMATION REFS ---
    const animValue = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const currentProgress = useRef(0);
    const pressStartTime = useRef(0);
    const isPaused = useRef(false);

    // --- 1. INITIALISATION SLIDE ---
    useEffect(() => {
        animValue.setValue(0);
        scaleAnim.setValue(1);
        currentProgress.current = 0;
        isPaused.current = false;

        if (isAutoPlay) {
            startTimerAnimation(0);
        }

        return () => animValue.stopAnimation();
    }, [currentIndex, currentStep]);

    // --- 2. GESTION TIMER ---
    const startTimerAnimation = (fromValue: number) => {
        if (!isAutoPlay) return;

        const duration = currentStep.duration || 5000;
        const remainingTime = duration * (1 - fromValue);

        Animated.timing(animValue, {
            toValue: 1,
            duration: remainingTime,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished && !isPaused.current) {
                handleNext();
            }
        });
    };

    // --- 3. NAVIGATION ---
    const handleNext = () => {
        if (currentIndex < story.steps.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            animValue.setValue(0);
            startTimerAnimation(0);
        }
    };

    // --- 4. GESTION TOUCHES (Mode Story uniquement) ---
    const zoomTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPressed = useRef(false);

    const handlePressIn = () => {
        // On ne fait rien si c'est un jeu (le jeu gère ses touches)
        if (isGameStep) return;

        pressStartTime.current = Date.now();
        isPressed.current = true;
        isPaused.current = true;

        if (isAutoPlay) {
            animValue.stopAnimation(value => {
                currentProgress.current = value;
            });
        }

        zoomTimeoutId.current = setTimeout(() => {
            if (isPressed.current) {
                Animated.timing(scaleAnim, {
                    toValue: 1.02,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }).start();
            }
        }, 200);
    };

    const handlePressOut = (evt: any) => {
        if (isGameStep) return;

        isPressed.current = false;
        isPaused.current = false;

        if (zoomTimeoutId.current) {
            clearTimeout(zoomTimeoutId.current);
            zoomTimeoutId.current = null;
        }

        const pressDuration = Date.now() - pressStartTime.current;
        const touchX = evt.nativeEvent.locationX;

        // Reset Zoom
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        if (pressDuration < 200) {
            // CLIC RAPIDE
            if (touchX < width * 0.3) {
                handlePrevious();
            } else {
                handleNext();
            }
        } else {
            // APPUI LONG RELACHÉ -> Reprise
            if (isAutoPlay) {
                startTimerAnimation(currentProgress.current);
            }
        }
    };

    // --- RENDU CONTENU ---
    const renderContent = () => {
        switch (currentStep.type) {
            case 'dialogue':
                return <StoryDialogue step={currentStep} />;
            case 'quiz':
                return <QuizGameView step={currentStep} onValid={handleNext} />
            case 'order':
                return <OrderGameView step={currentStep} onValid={handleNext} />;
            case 'swipe':
                return <SwipeGameView step={currentStep} onValid={handleNext} />;
            case 'reward':
                return <StoryReward step={currentStep} onNext={handleNext} />;
            case 'location':
                return (
                    <LocationGameView
                        step={currentStep}
                        country={country}
                        onValid={handleNext}
                    />
                );
            default:
                return <SmallText text={`Type inconnu: ${currentStep.type}`} />;
        }
    };

    return (
        <LinearGradient
            colors={[Colors.darkGrey, Colors.black]}
            style={styles.container}
        >
            <GlowTopGradient color={country.mainColor} />

            {/* ARCHITECTURAL CHANGE : 
               On ne wrappe PAS tout l'écran dans un Pressable unique.
               On sépare le Header (toujours en haut) du Contenu interactif.
            */}

            {/* 1. LE HEADER (Barre de progression) */}
            <View style={styles.headerContainer}>
                <StoryProgressBar
                    steps={story.steps}
                    currentIndex={currentIndex}
                    animValue={animValue}
                />
                {headerTitle && (
                    <View style={styles.titleRow}>
                        <SmallText text={headerTitle} style={{ fontWeight: 'bold' }} />
                    </View>
                )}
            </View>

            {/* 2. LE CONTENU */}
            <View style={{ flex: 1 }}>
                {isGameStep ? (
                    // --- CAS JEU : Pas d'interception, interaction directe ---
                    <View style={styles.contentContainer}>
                        {renderContent()}
                    </View>
                ) : (
                    // --- CAS STORY/DIALOGUE : On wrappe pour gérer le Tap/Hold ---
                    <Pressable
                        style={styles.touchLayer}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        delayLongPress={200}
                    >
                        <Animated.View style={[
                            styles.contentContainer,
                            { transform: [{ scale: scaleAnim }] }
                        ]}>
                            {renderContent()}
                        </Animated.View>
                    </Pressable>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
        paddingTop: 50, // Safe Area manuelle
    },
    touchLayer: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 12,
        zIndex: 20, // Toujours au-dessus
        height: 40,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
});
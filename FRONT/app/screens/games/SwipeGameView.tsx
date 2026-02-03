import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { SwipeCard, SwipeStep } from '@/app/models/Story';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Vibration,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

interface Props {
    step: SwipeStep;
    onValid: () => void;
}

export default function SwipeGameView({ step, onValid }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const deck = step.deck || [];
    const currentCard = deck[currentIndex];
    const nextCard = deck[currentIndex + 1];

    // Animation Values
    const position = useRef(new Animated.ValueXY()).current;

    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [0, SCREEN_WIDTH / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 4, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    // --- LOGIQUE SWIPE ---
    const forceSwipe = (direction: 'right' | 'left') => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction: 'right' | 'left') => {
        const card = deck[currentIndex];
        const userSaidYes = direction === 'right';

        // Logique stricte : User doit avoir raison
        const isActionCorrect = (userSaidYes === card.isCorrect);

        if (isActionCorrect) {
            // Si c'était le bon pays ET qu'on a swipé à Droite -> VICTOIRE
            if (userSaidYes && card.isCorrect) {
                setIsSuccess(true);
                Vibration.vibrate([0, 50, 50, 50]);
            } else {
                // Sinon c'était un intrus correctement rejeté, on passe au suivant
                goToNextCard();
            }
        } else {
            // ERREUR (Mauvais choix)
            handleError();
        }
    };

    const goToNextCard = () => {
        position.setValue({ x: 0, y: 0 });
        if (currentIndex < deck.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Fin du deck sans trouver le bon (Cas rare si généré correctement)
            handleError();
        }
    };

    const handleError = () => {
        Vibration.vibrate([0, 100, 50, 100]);
        setIsGameOver(true);
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false
        }).start();
    };

    // --- CORRECTION MAJEURE : USEMEMO ---
    // On recrée le PanResponder quand currentIndex change pour éviter 
    // d'utiliser l'index "0" en mémoire cache (Stale Closure).
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            if (isGameOver || isSuccess) return;
            position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
            if (isGameOver || isSuccess) return;

            if (gesture.dx > SWIPE_THRESHOLD) {
                forceSwipe('right');
            } else if (gesture.dx < -SWIPE_THRESHOLD) {
                forceSwipe('left');
            } else {
                resetPosition();
            }
        }
    }), [currentIndex, isGameOver, isSuccess]); // Dépendances critiques

    const handleRetry = () => {
        setIsGameOver(false);
        setIsSuccess(false);
        setCurrentIndex(0);
        position.setValue({ x: 0, y: 0 });
    };

    // RENDERERS
    const renderCard = (card: SwipeCard, isTop: boolean) => {
        if (!card) return null;

        const animatedStyle = isTop ? {
            transform: [...position.getTranslateTransform(), { rotate }]
        } : {
            transform: [{ scale: 0.95 }],
            opacity: 0.5
        };

        return (
            <Animated.View
                style={[styles.card, animatedStyle, isTop && { zIndex: 10 }]}
                {...(isTop ? panResponder.panHandlers : {})}
            >
                <Image
                    source={{ uri: card.imageUrl }}
                    style={styles.flagImage}
                    resizeMode="cover"
                />

                {isTop && (
                    <>
                        <Animated.View style={[styles.choiceLabel, styles.nopeLabel, { opacity: nopeOpacity }]}>
                            <Ionicons name="close" size={50} color={Colors.red} />
                        </Animated.View>
                        <Animated.View style={[styles.choiceLabel, styles.likeLabel, { opacity: likeOpacity }]}>
                            <Ionicons name="checkmark" size={50} color={Colors.green} />
                        </Animated.View>
                    </>
                )}
            </Animated.View>
        );
    };

    // --- VUE VICTOIRE ---
    if (isSuccess) {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                    <Title1 title="Identifié !" color={Colors.green} />

                    {/* Carte statique du vainqueur */}
                    <View style={[styles.card, { transform: [{ rotate: '0deg' }], position: 'relative' }]}>
                        <Image
                            source={{ uri: deck[currentIndex].imageUrl }}
                            style={styles.flagImage}
                            resizeMode="cover"
                        />
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-circle" size={40} color={Colors.green} />
                        </View>
                    </View>

                    <BodyText text={`C'est bien le drapeau recherché.`} style={{ textAlign: 'center' }} />
                </View>

                <View style={{ paddingHorizontal: 20 }}>
                    <MyButton
                        title="Continuer"
                        onPress={onValid}
                        variant="glass"
                        rightIcon="arrow-right"
                        bump
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title0 title={step.title} color={Colors.white} isLeft />
                <BodyText
                    text={step.content}
                    size="M"
                    color={Colors.white}
                    style={{ textAlign: 'center', opacity: 0.8 }}
                />
            </View>

            <View style={styles.deckContainer}>
                {isGameOver ? (
                    <View style={styles.gameOverContainer}>
                        <Ionicons name="alert-circle-outline" size={80} color={Colors.red} />
                        <Title1 title="Perdu !" color={Colors.white} />
                        <BodyText
                            text="Mauvaise réponse. Recommencez la série."
                            style={{ textAlign: 'center', marginBottom: 20 }}
                        />
                        <MyButton title="Réessayer" onPress={handleRetry} variant="glass" />
                    </View>
                ) : (
                    <>
                        {nextCard && renderCard(nextCard, false)}
                        {currentCard ? renderCard(currentCard, true) : null}
                    </>
                )}
            </View>

            {!isGameOver && (
                <BodyText
                    text="Recherche en cours..."
                    size="S"
                    style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 40,
        justifyContent: 'space-between'
    },
    header: { alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 20 },
    deckContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // CORRECTION TAILLE : Ratio 3:2 (Drapeau)
    card: {
        width: SCREEN_WIDTH * 0.85,
        height: (SCREEN_WIDTH * 0.85) * 0.66,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        position: 'absolute',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    flagImage: { width: '100%', height: '100%' },
    choiceLabel: {
        position: 'absolute',
        top: 20,
        padding: 10,
        borderRadius: 50,
        borderWidth: 4,
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    likeLabel: {
        left: 20,
        borderColor: Colors.green,
        transform: [{ rotate: '-30deg' }]
    },
    nopeLabel: {
        right: 20,
        borderColor: Colors.red,
        transform: [{ rotate: '30deg' }]
    },
    gameOverContainer: {
        width: '90%',
        alignItems: 'center',
        gap: 10,
        padding: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.red
    },
    successBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: Colors.white,
        borderRadius: 30
    }
});
import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { SwipeCard, SwipeStep } from '@/app/models/Story';
import { functions } from '@/app/utils/Functions';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
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

    // Sécurité : si deck est vide
    const deck = step.deck || [];
    const currentCard = deck[currentIndex];
    const nextCard = deck[currentIndex + 1];

    const position = useRef(new Animated.ValueXY()).current;

    // Interpolation pour la rotation pendant le swipe
    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
    });

    // Opacité des labels (CHECK / TRASH)
    const keepOpacity = position.x.interpolate({ inputRange: [0, SCREEN_WIDTH / 4], outputRange: [0, 1] });
    const discardOpacity = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 4, 0], outputRange: [1, 0] });

    // --- MOTEUR DE JEU ---

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

        if (direction === 'right') {
            // ACTION : "JE LE GARDE / C'EST LUI"
            if (card.isCorrect) {
                // C'est le bon drapeau -> VICTOIRE
                setIsSuccess(true);
                functions.vibrate('success');
            } else {
                // C'était un intrus -> ERREUR (Mauvais choix)
                handleError();
            }
        } else {
            // ACTION : "POUBELLE / SUIVANT"
            if (card.isCorrect) {
                // C'était le bon drapeau et je l'ai jeté -> ERREUR
                handleError();
            } else {
                // C'était un intrus et je l'ai jeté -> CORRECT, AU SUIVANT
                goToNextCard();
            }
        }
    };

    const goToNextCard = () => {
        // Reset visuel instantané
        position.setValue({ x: 0, y: 0 });

        if (currentIndex < deck.length - 1) {
            // On passe à la carte suivante
            setCurrentIndex(prev => prev + 1);
        } else {
            // Fin du deck : On a jeté toutes les cartes sans sélectionner la bonne
            // (Théoriquement impossible si le générateur inclut toujours la bonne réponse, 
            // mais on gère le cas comme une défaite)
            handleError();
        }
    };

    const handleError = () => {
        functions.vibrate('error');
        setIsGameOver(true);
    };

    const handleRetry = () => {
        setIsGameOver(false);
        setIsSuccess(false);
        setCurrentIndex(0);
        position.setValue({ x: 0, y: 0 });
    };

    // IMPORTANT : On recrée le PanResponder si currentIndex change pour pointer sur la bonne carte
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
                // Retour au centre si swipe pas assez fort
                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    friction: 4,
                    useNativeDriver: false
                }).start();
            }
        }
    }), [currentIndex, isGameOver, isSuccess]);

    // --- RENDER ---

    const renderCard = (card: SwipeCard, isTop: boolean) => {
        if (!card) return null;

        // Style animé seulement pour la carte du dessus
        const animatedStyle = isTop ? {
            transform: [...position.getTranslateTransform(), { rotate }]
        } : {
            transform: [{ scale: 0.95 }], // Effet de profondeur pour la carte suivante
            opacity: 0.5
        };

        return (
            <Animated.View
                style={[styles.card, animatedStyle, isTop && { zIndex: 10 }]}
                {...(isTop ? panResponder.panHandlers : {})}
            >
                {/* On suppose ici que SwipeGameView ne sert QUE pour les images (Drapeaux) */}
                <Image source={{ uri: card.imageUri }} style={styles.cardImage} resizeMode="cover" />

                {isTop && (
                    <>
                        <Animated.View style={[styles.choiceLabel, styles.discardLabel, { opacity: discardOpacity }]}>
                            <Ionicons name="trash-outline" size={40} color={Colors.red} />
                        </Animated.View>
                        <Animated.View style={[styles.choiceLabel, styles.keepLabel, { opacity: keepOpacity }]}>
                            <Ionicons name="checkmark-circle-outline" size={40} color={Colors.green} />
                        </Animated.View>
                    </>
                )}
            </Animated.View>
        );
    };

    if (isSuccess) {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                    <Ionicons name="trophy" size={80} color={Colors.gold} />
                    <Title1 title="Trouvé !" color={Colors.white} />

                    {/* Carte gagnante statique */}
                    <View style={[styles.card, { position: 'relative', transform: [{ rotate: '0deg' }], height: 200 }]}>
                        <Image source={{ uri: deck[currentIndex].imageUri }} style={styles.cardImage} resizeMode="cover" />
                    </View>

                    <BodyText text={"C'était bien le drapeau recherché."} style={{ textAlign: 'center' }} />
                </View>
                <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    <MyButton title="Continuer" onPress={onValid} variant="glass" rightIcon="arrow-right" bump />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title0 title={step.title} color={Colors.white} isLeft />
                <BodyText text={step.content} size="M" color={Colors.white} style={{ opacity: 0.8 }} />
            </View>

            <View style={styles.deckContainer}>
                {isGameOver ? (
                    <View style={styles.gameOverContainer}>
                        <Ionicons name="close-circle-outline" size={80} color={Colors.red} />
                        <Title1 title="Perdu" color={Colors.white} />
                        <BodyText text="Mauvaise carte choisie ou bonne carte jetée." style={{ textAlign: 'center', marginBottom: 20 }} />
                        <MyButton title="Réessayer" onPress={handleRetry} variant="glass" />
                    </View>
                ) : (
                    <>
                        {/* On rend d'abord la carte suivante (en dessous) */}
                        {nextCard && renderCard(nextCard, false)}
                        {/* Puis la carte actuelle (au dessus) */}
                        {currentCard ? renderCard(currentCard, true) : null}
                    </>
                )}
            </View>
            {/* Guide visuel */}
            {!isGameOver && (
                <View style={styles.controlsHint}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name="arrow-back" color={Colors.red} size={20} />
                        <BodyText text="FAUX" size="S" color={Colors.red} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <BodyText text="VRAI" size="S" color={Colors.green} />
                        <Ionicons name="arrow-forward" color={Colors.green} size={20} />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, justifyContent: 'space-between' },
    header: { paddingHorizontal: 20, marginBottom: 10 },
    deckContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        width: SCREEN_WIDTH * 0.85,
        aspectRatio: 1.5, // Ratio Drapeau standard
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 5,
        position: 'absolute'
    },
    cardImage: { width: '100%', height: '100%' },
    choiceLabel: {
        position: 'absolute', top: 20, padding: 15, borderRadius: 50, borderWidth: 4, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)'
    },
    keepLabel: { right: 20, borderColor: Colors.green, transform: [{ rotate: '-15deg' }] },
    discardLabel: { left: 20, borderColor: Colors.red, transform: [{ rotate: '15deg' }] },
    gameOverContainer: {
        width: '90%', alignItems: 'center', padding: 30, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: Colors.red
    },
    controlsHint: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 50, opacity: 0.6 }
});
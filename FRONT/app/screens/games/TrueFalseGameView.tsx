import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { TrueFalseStep } from '@/app/models/Story';
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
    step: TrueFalseStep;
    onValid: () => void;
}

export default function TrueFalseGameView({ step, onValid }: Props) {
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Animation Values
    const position = useRef(new Animated.ValueXY()).current;

    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
    });

    const trueOpacity = position.x.interpolate({
        inputRange: [0, SCREEN_WIDTH / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const falseOpacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 4, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    // --- LOGIQUE ---
    const forceSwipe = (direction: 'right' | 'left') => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction: 'right' | 'left') => {
        const userSaidTrue = direction === 'right';
        const isCorrect = (userSaidTrue === step.isTrue);

        if (isCorrect) {
            setIsSuccess(true);
            Vibration.vibrate([0, 50, 50, 50]);
        } else {
            handleError();
        }
    };

    const handleError = () => {
        Vibration.vibrate([0, 100, 50, 100]);
        setIsGameOver(true);
    };

    const handleRetry = () => {
        setIsGameOver(false);
        setIsSuccess(false);
        position.setValue({ x: 0, y: 0 });
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false
        }).start();
    };

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
    }), [isGameOver, isSuccess]);

    // --- RENDU CARTE ---
    const renderCard = () => {
        const animatedStyle = {
            transform: [...position.getTranslateTransform(), { rotate }]
        };

        return (
            <Animated.View
                style={[styles.card, animatedStyle]}
                {...panResponder.panHandlers}
            >
                {/* Image Illustration */}
                {step.imageUri && (
                    <Image source={{ uri: step.imageUri }} style={styles.cardImage} resizeMode="cover" />
                )}

                {/* Texte Affirmation */}
                <View style={styles.cardTextContainer}>
                    <Title2
                        title={step.statement}
                        color={Colors.white}
                        style={{ textAlign: 'center', fontSize: 22, lineHeight: 30 }}
                    />
                </View>

                {/* Labels Swipe */}
                <Animated.View style={[styles.choiceLabel, styles.falseLabel, { opacity: falseOpacity }]}>
                    <Title1 title="FAUX" color={Colors.red} style={{ fontSize: 24, transform: [{ rotate: '15deg' }] }} />
                </Animated.View>

                <Animated.View style={[styles.choiceLabel, styles.trueLabel, { opacity: trueOpacity }]}>
                    <Title1 title="VRAI" color={Colors.green} style={{ fontSize: 24, transform: [{ rotate: '-15deg' }] }} />
                </Animated.View>
            </Animated.View>
        );
    };

    // --- VUE SUCCÈS ---
    if (isSuccess) {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 20 }}>
                    <Ionicons name="checkmark-circle" size={80} color={Colors.green} />
                    <Title1 title="Exact !" color={Colors.green} />
                    <BodyText text={step.explanation || "Bonne réponse."} style={{ textAlign: 'center' }} />
                </View>
                <View style={{ paddingBottom: 40, paddingHorizontal: 20 }}>
                    <MyButton title="Continuer" onPress={onValid} variant="glass" rightIcon="arrow-right" bump />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title0 title="Vrai ou Faux ?" color={Colors.white} isLeft />
                <BodyText text="Glissez la carte pour répondre." size="S" color={Colors.white} style={{ opacity: 0.7 }} />
            </View>

            <View style={styles.deckContainer}>
                {isGameOver ? (
                    <View style={styles.gameOverContainer}>
                        <Ionicons name="alert-circle-outline" size={80} color={Colors.red} />
                        <Title1 title="Oups..." color={Colors.white} />
                        <BodyText text="Ce n'était pas la bonne réponse." style={{ textAlign: 'center', marginBottom: 20 }} />
                        <MyButton title="Réessayer" onPress={handleRetry} variant="glass" />
                    </View>
                ) : (
                    renderCard()
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
        aspectRatio: 0.75, // Format portrait
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 5,
    },
    cardImage: { width: '100%', height: '55%' },
    cardTextContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    choiceLabel: {
        position: 'absolute', top: 40, paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 12, borderWidth: 4, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.8)'
    },
    trueLabel: { right: 40, borderColor: Colors.green, transform: [{ rotate: '-15deg' }] },
    falseLabel: { left: 40, borderColor: Colors.red, transform: [{ rotate: '15deg' }] },
    gameOverContainer: {
        width: '90%', alignItems: 'center', padding: 30,
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: Colors.red
    },
    controlsHint: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 50, opacity: 0.6 }
});
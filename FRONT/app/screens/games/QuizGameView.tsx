import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import Colors from '@/app/constants/Colors';
import { QuizStep } from '@/app/models/Story';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';

interface Props {
    step: QuizStep;
    onValid: () => void;
}

export default function QuizGameView({ step, onValid }: Props) {
    const [selectedindex, setSelectedIndex] = useState<number | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    // Mode Image ou Texte ? (Par défaut Texte)
    const isImageMode = step.answerType === 'image';

    const handleChoicePress = (index: number) => {
        // Si on a déjà gagné, on bloque les clics
        if (isSuccess) return;
        // Si une sélection est en cours (animation erreur), on bloque
        if (selectedindex !== null) return;

        setSelectedIndex(index);

        if (index === step.correctAnswerIndex) {
            // SUCCÈS : On fige l'état, pas de transition auto
            setIsSuccess(true);
            Vibration.vibrate(50);
            // On a retiré le setTimeout(() => onValid(), 1000);
        } else {
            // ERREUR : On laisse le rouge 1s puis on reset
            setIsSuccess(false);
            Vibration.vibrate([0, 100, 50, 100]);
            setTimeout(() => {
                setSelectedIndex(null);
                setIsSuccess(null);
            }, 1000);
        }
    };

    const getStatusColor = (index: number) => {
        if (selectedindex !== index) return 'transparent'; // Pas sélectionné
        if (isSuccess === true) return Colors.green;
        if (isSuccess === false) return Colors.red;
        return Colors.main; // Sélectionné, en attente
    };

    useEffect(() => {
        setSelectedIndex(null);
        setIsSuccess(null);
    }, [step]);

    // --- RENDERER : MODE TEXTE (Classique) ---
    const renderTextChoice = (choice: string, index: number) => {
        let variant: 'glass' | 'solid' | 'outline' = 'glass';
        let bgColor = undefined;

        if (selectedindex === index) {
            // On passe en solid pour bien voir la couleur du résultat
            variant = 'outline';
            const color = getStatusColor(index);
            bgColor = color;
        }

        return (
            <View key={index} style={{ width: '100%' }}>
                <MyButton
                    title={choice}
                    onPress={() => handleChoicePress(index)}
                    variant={variant}
                    backgroundColor={bgColor}
                />
            </View>
        );
    };

    // --- RENDERER : MODE IMAGE (Drapeaux) ---
    const renderImageChoice = (choiceUri: string, index: number) => {
        const isSelected = selectedindex === index;
        const statusColor = getStatusColor(index);

        return (
            <TouchableOpacity
                key={index}
                style={[
                    styles.imageChoice,
                    isSelected && { borderColor: statusColor, borderWidth: 3 },
                    // Si une réponse est choisie mais pas celle-ci, on opacifie
                    (selectedindex !== null && !isSelected) && { opacity: 0.5 }
                ]}
                onPress={() => handleChoicePress(index)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: choiceUri }}
                    style={styles.imageContent}
                    resizeMode="cover"
                />

                {/* Overlay de couleur en cas de succès/échec */}
                {isSelected && (
                    <View style={[styles.overlay, { backgroundColor: statusColor }]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Contenu Principal (Scrollable si besoin, ou centré) */}
            <View style={{ width: '100%' }}>
                {/* Header Question */}
                <View style={{ gap: 20, marginBottom: 40 }}>
                    <Title0 title={step.title} color={Colors.white} isLeft />
                    <BodyText text={step.content} size='XL' color={Colors.white} style={{ marginBottom: 20 }} />
                </View>

                {/* Container des Choix */}
                <View style={[
                    styles.choicesContainer,
                    isImageMode ? styles.gridContainer : styles.listContainer
                ]}>
                    {step.choices?.map((choice, index) =>
                        isImageMode
                            ? renderImageChoice(choice, index)
                            : renderTextChoice(choice, index)
                    )}
                </View>
            </View>

            {/* Footer : Bouton Continuer (Visible seulement si Succès) */}
            <View style={styles.footer}>
                {isSuccess && (
                    <MyButton
                        title="Continuer"
                        onPress={onValid}
                        variant="glass"
                        rightIcon="arrow-right"
                        bump
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between', // Centre verticalement le contenu
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 60
    },
    choicesContainer: {
        width: '100%',
    },
    // Styles Liste (Texte)
    listContainer: {
        gap: 15,
    },
    // Styles Grille (Images)
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    imageChoice: {
        width: '47%',
        aspectRatio: 1.5,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    imageContent: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    footer: {
        width: '100%',
        minHeight: 60, // Réserve l'espace pour éviter les sauts de layout trop violents
        justifyContent: 'flex-end',
        marginTop: 20
    }
});
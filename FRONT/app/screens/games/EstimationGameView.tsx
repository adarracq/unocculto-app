import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import Colors from '@/app/constants/Colors';
import { EstimationStep } from '@/app/models/Story';
import { functions } from '@/app/utils/Functions';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Image, StyleSheet, Vibration, View } from 'react-native';

interface Props {
    step: EstimationStep;
    onValid: () => void;
}

export default function EstimationGameView({ step, onValid }: Props) {
    // Valeur initiale au milieu ou à 0
    const [currentValue, setCurrentValue] = useState<number>(step.min);
    const [status, setStatus] = useState<'playing' | 'success' | 'fail'>('playing');

    // Marge d'erreur (par défaut 10% de la valeur cible si non définie)
    const tolerance = step.tolerance ?? (step.targetValue * 0.1);

    const handleValidate = () => {
        const diff = Math.abs(currentValue - step.targetValue);

        if (diff <= tolerance) {
            // GAGNÉ
            setStatus('success');
            Vibration.vibrate([0, 50, 50, 50]);
        } else {
            // PERDU
            setStatus('fail');
            Vibration.vibrate([0, 100, 50, 100]);
        }
    };

    const getPriceColor = () => {
        if (status === 'playing') return Colors.white;
        if (status === 'success') return Colors.green;
        return Colors.red;
    };

    return (
        <View style={styles.container}>
            {/* 1. HEADER (Titre + Question) */}
            <View style={{ gap: 10 }}>
                <Title0 title={step.title} color={Colors.white} isLeft />
                <BodyText text={step.content} size="L" color="#CCC" />
            </View>

            {/* 2. IMAGE OBJET */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: step.imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* 3. ZONE D'ESTIMATION */}
            <View style={styles.controlsContainer}>

                {/* A. Affichage du Prix */}
                <View style={styles.priceDisplay}>
                    {status === 'fail' ? (
                        // Mode Correction : On montre l'erreur barrée et la bonne réponse
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <BodyText
                                text={`${functions.addSpacesInNumber(currentValue)} ${step.currency}`}
                                size="XL"
                                color={Colors.red}
                                style={{ textDecorationLine: 'line-through', opacity: 0.7 }}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 }}>
                                <Ionicons name="arrow-down" size={24} color={Colors.white} />
                                <BodyText
                                    text={`${functions.addSpacesInNumber(step.targetValue)} ${step.currency}`}
                                    size="XXL"
                                    color={Colors.green}
                                    style={{ fontWeight: 'bold' }}
                                />
                            </View>
                        </View>
                    ) : (
                        // Mode Jeu ou Succès
                        <BodyText
                            text={`${functions.addSpacesInNumber(currentValue)} ${step.currency}`}
                            size="XXL"
                            color={getPriceColor()}
                            style={{ fontWeight: 'bold' }}
                        />
                    )}
                </View>

                {/* B. Slider */}
                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={step.min}
                    maximumValue={step.max}
                    step={step.step || 1}
                    value={currentValue}
                    onValueChange={setCurrentValue}
                    disabled={status !== 'playing'} // On bloque le slider à la fin

                    // Couleurs
                    minimumTrackTintColor={status === 'playing' ? Colors.main : (status === 'success' ? Colors.green : Colors.red)}
                    maximumTrackTintColor="#333333"
                    thumbTintColor={Colors.white}
                />

                <View style={styles.minMaxRow}>
                    <BodyText text={`${functions.addSpacesInNumber(step.min)} ${step.currency}`} size="S" color="#666" />
                    <BodyText text={`${functions.addSpacesInNumber(step.max)} ${step.currency}`} size="S" color="#666" />
                </View>
            </View>

            {/* 4. FOOTER BUTTON */}
            <View style={styles.footer}>
                {status === 'playing' ? (
                    <MyButton
                        title="Estimer"
                        onPress={handleValidate}
                        variant="solid"
                    />
                ) : (
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
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        maxHeight: 250,
    },
    controlsContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        gap: 10,
    },
    priceDisplay: {
        alignItems: 'center',
        marginBottom: 10,
        minHeight: 60,
        justifyContent: 'center',
    },
    minMaxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    footer: {
        marginTop: 20,
        minHeight: 60,
        justifyContent: 'flex-end',
    }
});
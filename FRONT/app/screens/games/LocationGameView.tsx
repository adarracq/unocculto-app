import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import InteractiveMap from '@/app/components/organisms/InteractiveMap';
import Colors from '@/app/constants/Colors';
import { Country } from '@/app/models/Countries';
import { LocationStep } from '@/app/models/Story';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

interface Props {
    step: LocationStep;
    country: Country;
    onValid: () => void;
}

export default function LocationGameView({ step, country, onValid }: Props) {
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'playing' | 'success' | 'error'>('playing');
    const [cameraTarget, setCameraTarget] = useState<[number, number] | null>(null);

    const handleCountryPress = (code: string) => {
        if (status === 'success') return;
        if (status === 'error') setStatus('playing');

        // On normalise le code reçu pour éviter les bugs "fr" vs "FR"
        setSelectedCode(code.toUpperCase());
    };

    const handleValidate = () => {
        if (!selectedCode) return;

        // Comparaison sécurisée
        const targetCode = country.code.toUpperCase().trim();
        const userCode = selectedCode.toUpperCase().trim();

        console.log(`Validation: Cible=${targetCode} | Joueur=${userCode}`);

        if (userCode === targetCode) {
            setStatus('success');
            Vibration.vibrate([0, 50, 50, 50]);
        } else {
            setStatus('error');
            Vibration.vibrate([0, 100, 50, 100]);
            if (country.longitude && country.latitude) {
                setCameraTarget([country.longitude, country.latitude]);
            }
        }
    };

    const getMapColors = () => {
        const colors: Record<string, string> = {};
        const targetCode = country.code.toUpperCase();

        if (status === 'success') {
            colors[targetCode] = Colors.green;
        }
        else if (status === 'error') {
            if (selectedCode) colors[selectedCode] = Colors.red;
            // On montre la bonne réponse
            colors[targetCode] = Colors.green;
        }
        return colors;
    };

    return (
        <View style={styles.container}>
            <View style={{ gap: 20 }}>
                <Title0 title={step.title} color={Colors.white} isLeft />
                <BodyText text={step.content} size='L' color={Colors.white} />
            </View>

            <View style={styles.mapWrapper}>
                <InteractiveMap
                    selectedCountry={selectedCode}
                    onCountryPress={handleCountryPress}
                    countryColors={getMapColors()}
                    focusCoordinates={cameraTarget}
                />

                <View style={styles.feedbackBar}>
                    {status === 'error' && (
                        <View style={styles.row}>
                            <Ionicons name="close-circle" size={20} color={Colors.red} />
                            <BodyText text="Ce n'est pas le bon pays." size="S" color={Colors.red} />
                        </View>
                    )}
                    {status === 'success' && (
                        <View style={styles.row}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                            <BodyText text="Exactement !" size="S" color={Colors.green} />
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                {status === 'success' ? (
                    <MyButton
                        title="Continuer"
                        onPress={onValid}
                        variant="glass"
                        rightIcon="arrow-right"
                        bump
                    />
                ) : (
                    <MyButton
                        title="Valider"
                        onPress={handleValidate}
                        variant={selectedCode ? "glass" : "outline"}
                        disabled={!selectedCode}
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
    mapWrapper: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10
    },
    feedbackBar: {
        marginTop: 15,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20
    },
    footer: { minHeight: 60, justifyContent: 'flex-end' }
});
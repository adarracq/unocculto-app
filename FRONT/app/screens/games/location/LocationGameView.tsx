import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import InteractiveMap from '@/app/components/organisms/InteractiveMap'; // Ton nouveau composant
import Colors from '@/app/constants/Colors';
import { Country } from '@/app/models/Countries';
import { StoryStep } from '@/app/models/Story';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

interface Props {
    step: StoryStep;
    country: Country; // Le pays cible (ex: France)
    onValid: () => void;
}

export default function LocationGameView({ step, country, onValid }: Props) {
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'playing' | 'success' | 'error'>('playing');

    const handleCountryPress = (code: string) => {
        if (status === 'success') return; // Jeu fini
        if (status === 'error') {
            // Si on est en erreur, cliquer relance la tentative (optionnel)
            setStatus('playing');
        }
        setSelectedCode(code);
    };

    const handleValidate = () => {
        if (!selectedCode) return;

        if (selectedCode === country.code) {
            // GAGNÉ
            setStatus('success');
            Vibration.vibrate([0, 50, 50, 50]);
        } else {
            // PERDU
            setStatus('error');
            Vibration.vibrate([0, 100, 50, 100]);
        }
    };

    // --- LOGIQUE DE COLORATION DYNAMIQUE ---
    const getMapColors = () => {
        const colors: Record<string, string> = {};

        if (status === 'success') {
            // En succès, le bon pays devient VERT
            colors[country.code] = Colors.green;
        }
        else if (status === 'error') {
            // En erreur :
            // 1. Le pays cliqué (faux) devient ROUGE
            if (selectedCode) colors[selectedCode] = Colors.red;
            // 2. On révèle le bon pays en VERT (Pédagogie)
            colors[country.code] = Colors.green;
        }

        return colors;
    };

    return (
        <View style={styles.container}>
            <View style={{ gap: 20 }}>
                <Title0 title={step.title} color={Colors.white} isLeft />
                <BodyText text={step.content} size='XL' color={Colors.white} />
            </View>

            {/* ZONE CARTE INTERACTIVE */}
            <View style={styles.mapWrapper}>
                <InteractiveMap
                    selectedCountry={selectedCode}
                    onCountryPress={handleCountryPress}
                    countryColors={getMapColors()}
                />

                {/* Overlay Instruction ou Feedback */}
                <View style={styles.feedbackBar}>
                    {status === 'playing' && !selectedCode && (
                        <BodyText text="Touchez le pays sur la carte" size="S" color="#aaa" />
                    )}
                    {status === 'playing' && selectedCode && (
                        <BodyText text="Pays sélectionné" size="S" color={Colors.main} />
                    )}
                    {status === 'error' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name="close-circle" size={20} color={Colors.red} />
                            <BodyText text="Ce n'est pas le bon pays." size="S" color={Colors.red} />
                        </View>
                    )}
                    {status === 'success' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                            <BodyText text="Localisation confirmée !" size="S" color={Colors.green} />
                        </View>
                    )}
                </View>
            </View>

            {/* BARRE D'ACTION */}
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
                        variant={selectedCode ? "solid" : "outline"}
                        disabled={!selectedCode} // Désactivé si rien n'est sélectionné
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
        paddingVertical: 40
    },

    mapWrapper: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10
    },
    feedbackBar: {
        marginTop: 10,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer: {
        minHeight: 60,
        justifyContent: 'flex-end'
    }
});
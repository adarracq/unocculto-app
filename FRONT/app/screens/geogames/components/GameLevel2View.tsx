import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import InteractiveMap from '@/app/components/organisms/InteractiveMap';
import Colors from '@/app/constants/Colors';
import { getFlagImage, REGION_CAMERAS } from '@/app/models/Countries';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { GameViewProps } from '../GeoGameScreen';

export default function GameLevel2View({ engine, mode, regionCode }: GameViewProps) {
    const { currentQuestion, validateAnswer, mapFeedback, status } = engine;
    const [userSelection, setUserSelection] = useState<string | null>(null);

    // Reset selection quand la question change
    useEffect(() => {
        setUserSelection(null);
    }, [currentQuestion]);

    // --- LOGIQUE MAP ---
    const handleMapPress = (code: string) => {
        if (status !== 'playing') return;

        if (userSelection === code) {
            // Double tap pour valider
            validateAnswer(code);
        } else {
            // Simple tap pour sélectionner
            setUserSelection(code);
        }
    };

    const getMapColors = () => {
        const colors: Record<string, string> = {};

        // Sélection Joueur
        if (status === 'playing' && userSelection) {
            colors[userSelection] = Colors.cyan;
        }

        // Feedback (Vert/Rouge prend le dessus)
        Object.keys(mapFeedback).forEach(code => {
            if (mapFeedback[code] === 'correct') colors[code] = Colors.green;
            if (mapFeedback[code] === 'wrong') colors[code] = Colors.red;
        });

        return colors;
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.visualArea}>
                <View style={styles.overlay}>
                    {mode === 'flag' && currentQuestion ? (
                        <Image source={getFlagImage(currentQuestion.target.code)} style={styles.flagMedium} />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <Title0
                                title={mode === 'capital' ? currentQuestion?.target.capital || '' : currentQuestion?.target.name_fr || ''}
                                color={Colors.white}
                            />
                            <BodyText text="Trouvez sur la carte" color={Colors.lightGrey} size="S" />
                        </View>
                    )}
                </View>

                <InteractiveMap
                    countryColors={getMapColors()}
                    selectedCountry={userSelection}
                    onCountryPress={handleMapPress}
                    isFullHeight
                    defaultCenter={REGION_CAMERAS[regionCode]?.center}
                    defaultZoom={REGION_CAMERAS[regionCode]?.zoom}
                />
            </View>

            <View style={styles.bottomArea}>
                {userSelection ? (
                    <MyButton
                        title="Valider"
                        onPress={() => validateAnswer(userSelection)}
                        variant="glass"
                        rightIcon="arrow-right"
                        bump
                    />
                ) : (
                    <MyButton
                        title="Touchez la zone sur la carte"
                        onPress={() => { }}
                        variant="outline"
                        rightIcon="fingerprint"
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    visualArea: { flex: 1, position: 'relative', justifyContent: 'center' },
    overlay: { position: 'absolute', top: 20, width: '100%', alignItems: 'center', zIndex: 5, pointerEvents: 'none' },
    flagMedium: {
        width: 150,
        height: undefined,
        aspectRatio: 1.5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.white,
        marginBottom: 5
    },
    bottomArea: {
        minHeight: 180,
        justifyContent: 'center',
        paddingHorizontal: 20, paddingVertical: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20
    },
});
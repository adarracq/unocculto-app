import InteractiveMap from '@/app/components/organisms/InteractiveMap';
import Colors from '@/app/constants/Colors';
import { getFlagImage, MICRO_STATES } from '@/app/models/Countries';
import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ArcadeSaisieControls from '../components/ArcadeSaisieControls';
import { GameViewProps } from '../GeoGameScreen';

export default function GameLevel3View({ engine, mode }: GameViewProps) {
    const { currentQuestion, validateAnswer, mapFeedback } = engine;

    // --- LOGIQUE CAMERA ---
    const cameraTarget = useMemo(() => {
        if (!currentQuestion) return null;
        const isMicro = MICRO_STATES.includes(currentQuestion.target.code);
        return {
            center: [currentQuestion.target.longitude, currentQuestion.target.latitude] as [number, number],
            zoom: isMicro ? 5 : 3
        };
    }, [currentQuestion]);

    // --- LOGIQUE IMAGE DRAPEAU ---
    const dynamicRatio = useMemo(() => {
        if (!currentQuestion || mode !== 'flag') return 1.5;
        const source = getFlagImage(currentQuestion.target.code);
        const { width, height } = Image.resolveAssetSource(source);
        return (width && height) ? width / height : 1.5;
    }, [currentQuestion, mode]);

    // --- COLORS ---
    const getMapColors = () => {
        const colors: Record<string, string> = {};

        // Highlight Cible (Sauf si mode flag, car on ne veut pas spoiler)
        if (currentQuestion && mode !== 'flag') {
            colors[currentQuestion.target.code] = Colors.main;
        }

        // Feedback
        Object.keys(mapFeedback).forEach(code => {
            if (mapFeedback[code] === 'correct') colors[code] = Colors.green;
            if (mapFeedback[code] === 'wrong') colors[code] = Colors.red;
        });
        return colors;
    };

    if (!currentQuestion) return null;

    return (
        <View style={{ flex: 1 }}>

            {/* INPUT FLOTTANT (Z-Index Elevé) */}
            <View style={styles.topInputContainer}>
                <ArcadeSaisieControls
                    mode={mode}
                    targetName={currentQuestion.target.name_fr}
                    targetCapital={currentQuestion.target.capital}
                    targetCode={currentQuestion.target.code}
                    onValidate={validateAnswer}
                />
            </View>

            <View style={styles.visualArea}>
                {mode === 'flag' ? (
                    // MODE DRAPEAU : Pas de carte, gros drapeau
                    <View style={styles.bigFlagContainer}>
                        <Image
                            source={getFlagImage(currentQuestion.target.code)}
                            style={[styles.flagLarge, { aspectRatio: dynamicRatio }]}
                            resizeMode="contain"
                        />
                    </View>
                ) : (
                    // AUTRES MODES : Carte avec consigne
                    <>
                        <View style={{ paddingBottom: 200 }}>
                            <InteractiveMap
                                countryColors={getMapColors()}
                                isFullHeight
                                focusCoordinates={cameraTarget?.center}
                                zoomLevel={cameraTarget?.zoom}
                            />
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    visualArea: { flex: 1, position: 'relative', justifyContent: 'center' },
    topInputContainer: {
        position: 'absolute',
        width: '100%',
        marginTop: 10,
        zIndex: 20,
    },
    bigFlagContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100 // Remonte un peu le drapeau
    },
    flagLarge: {
        width: 250,
        height: undefined,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.white,
    },
});

import Title0 from '@/app/components/atoms/Title0';
import InteractiveMap from '@/app/components/organisms/InteractiveMap';
import Colors from '@/app/constants/Colors';
import { MICRO_STATES } from '@/app/models/Countries';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ArcadeControls from '../components/ArcadeControls';
import { GameViewProps } from '../GeoGameScreen';

export default function GameLevel1View({ engine, mode }: GameViewProps) {
    const { currentQuestion, validateAnswer, mapFeedback } = engine;

    // --- LOGIQUE CAMERA (Focus Auto) ---
    const cameraTarget = useMemo(() => {
        if (!currentQuestion) return null;
        const isMicro = MICRO_STATES.includes(currentQuestion.target.code);
        return {
            center: [currentQuestion.target.longitude, currentQuestion.target.latitude] as [number, number],
            zoom: isMicro ? 5 : 3
        };
    }, [currentQuestion]);

    // --- LOGIQUE COULEURS (Juste feedback) ---
    const getMapColors = () => {
        const colors: Record<string, string> = {};

        // Highlight Cible
        if (currentQuestion) {
            colors[currentQuestion.target.code] = Colors.main;
        }

        // Feedback (Vert/Rouge)
        Object.keys(mapFeedback).forEach(code => {
            if (mapFeedback[code] === 'correct') colors[code] = Colors.green;
            if (mapFeedback[code] === 'wrong') colors[code] = Colors.red;
        });

        return colors;
    };

    const getInstructionText = () => {
        return mode === 'capital' ? "Quelle est la capitale de ce pays ?" : "Quel est ce pays ?";
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.visualArea}>
                <View style={styles.overlay}>
                    <Title0 title={getInstructionText()} color={Colors.white} isLeft style={{ textAlign: 'center' }} />
                </View>

                <InteractiveMap
                    countryColors={getMapColors()}
                    isFullHeight
                    focusCoordinates={cameraTarget?.center}
                    zoomLevel={cameraTarget?.zoom}
                />
            </View>

            <View style={styles.bottomArea}>
                {currentQuestion && (
                    <ArcadeControls
                        mode={mode}
                        options={currentQuestion.options}
                        onValidate={validateAnswer}
                        targetCode={currentQuestion.target.code}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    visualArea: { flex: 1, position: 'relative', justifyContent: 'center' },
    overlay: { position: 'absolute', top: 20, width: '100%', alignItems: 'center', zIndex: 5, pointerEvents: 'none' },
    bottomArea: {
        minHeight: 180,
        justifyContent: 'center',
        paddingHorizontal: 20, paddingVertical: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20
    },
});
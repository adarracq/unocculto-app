import Colors from '@/app/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ArcadeSaisieControls from '../components/ArcadeSaisieControls';
import SingleCountryMap from '../components/SingleCountryMap';
import { GameViewProps } from '../GeoGameScreen';

export default function GameLevel4View({ engine, mode }: GameViewProps) {
    const { currentQuestion, validateAnswer, mapFeedback } = engine;

    if (!currentQuestion) return null;

    const getContourColor = () => {
        const status = mapFeedback[currentQuestion.target.code];
        if (status === 'correct') return Colors.green;
        if (status === 'wrong') return Colors.red;
        return Colors.white;
    };

    return (
        <View style={styles.container}>

            {/* 1. INPUT : En haut, dans le flux normal (plus d'absolute) */}
            <View style={styles.inputWrapper}>
                <ArcadeSaisieControls
                    mode={mode}
                    targetName={currentQuestion.target.name_fr}
                    targetCapital={currentQuestion.target.capital}
                    targetCode={currentQuestion.target.code}
                    onValidate={validateAnswer}
                />
            </View>

            {/* 2. MAP : Flex 1 pour prendre tout l'espace RESTANT */}
            <View style={styles.mapArea}>
                <SingleCountryMap
                    countryCode={currentQuestion.target.code}
                    color={getContourColor()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // On aligne verticalement : Input en haut, Carte en bas
        flexDirection: 'column',
    },
    inputWrapper: {
        width: '100%',
        zIndex: 20,
        paddingTop: 10, // Un peu d'air sous le header
        paddingBottom: 10,
        backgroundColor: 'transparent' // Ou une couleur si on veut détacher l'input
    },
    mapArea: {
        flex: 1, // C'est LA clé : la carte prendra toute la hauteur disponible restante
        position: 'relative',
        width: '100%',
        overflow: 'hidden', // Important pour les bords arrondis si besoin
        height: '50%',
    },
    overlay: {
        position: 'absolute',
        top: 20,
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
    }
});
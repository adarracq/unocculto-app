import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import InteractiveMap from '@/app/components/organisms/InteractiveMap';
import Colors from '@/app/constants/Colors';
import { GameLevel, GameMode } from '@/app/constants/GameConfig';
import { useApi } from '@/app/hooks/useApi';
import { useArcadeGame } from '@/app/hooks/useArcadeGame';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { ArenaNavParams } from '@/app/navigations/ArenaNav';
import { gameResultService } from '@/app/services/gameResult';
import { functions } from '@/app/utils/Functions'; // Assure-toi d'avoir formatTime ici
import ArcadeControls from './components/ArcadeControls';
import ArcadeHeader from './components/ArcadeHeader';

type Props = NativeStackScreenProps<ArenaNavParams, 'GeoGame'>;

// Structure pour le détail du score (pour l'affichage)
interface ScoreDetails {
    accuracy: number;
    timeTaken: number;
    basePoints: number; // Points liés à la précision
    timeBonus: number;  // Points liés au temps
    isDaily: boolean;
    totalScore: number;
}

// Logique de calcul extraite (Pure Function)
const calculateDetailedScore = (accuracy: number, timeTaken: number, isDaily: boolean): ScoreDetails => {
    // 1. Base : 100 pts max selon précision
    const basePoints = Math.round((accuracy / 100) * 100);

    // 2. Bonus Temps
    let timeBonus = 0;
    if (timeTaken <= 120) timeBonus = 50;      // < 2 min
    else if (timeTaken <= 300) timeBonus = 20; // < 5 min
    else if (timeTaken <= 600) timeBonus = 10; // < 10 min

    // 3. Calcul intermédiaire
    let total = basePoints + timeBonus;

    // 4. Multiplicateur Daily
    if (isDaily) {
        total *= 2;
    }

    return {
        accuracy,
        timeTaken,
        basePoints,
        timeBonus,
        isDaily,
        totalScore: total
    };
};

export default function GeoGameScreen({ navigation, route }: Props) {
    const lvl = (route.params?.level || 1) as GameLevel;
    const mode = (route.params?.mode || 'country') as GameMode;
    const regionCode = route.params?.regionId || 'AFR';
    const isDailyBonus = route.params?.isDailyBonus || false;

    // --- DATA ---
    const regionCountries = useMemo(() => {
        return ALL_COUNTRIES.filter(c => c.continentId === regionCode);
    }, [regionCode]);

    // --- STATE ---
    const [isResultModalVisible, setResultModalVisible] = useState(false);
    const [resultDetails, setResultDetails] = useState<ScoreDetails | null>(null);

    // --- API ---
    const finishGameApi = useApi(
        (params: ScoreDetails) =>
            gameResultService.finishGame(
                mode,
                regionCode,
                lvl,
                params.timeTaken,
                params.accuracy,
                params.totalScore
            ),
        'GeoGameScreen - FinishGame'
    );

    // --- GAME ENGINE ---
    const {
        currentQuestion,
        currentIndex,
        total,
        errors,
        status,
        mapFeedback,
        elapsedTime,
        validateAnswer
    } = useArcadeGame(
        regionCountries,
        lvl,
        mode,
        (stats) => handleGameFinish(stats)
    );

    // --- HANDLERS ---
    const handleGameFinish = (stats: { timeTaken: number, accuracy: number }) => {
        // 1. Calcul immédiat du détail
        const details = calculateDetailedScore(stats.accuracy, stats.timeTaken, isDailyBonus);

        // 2. Mise à jour UI
        setResultDetails(details);
        setResultModalVisible(true);

        // 3. Sauvegarde API
        finishGameApi.execute(details);
    };

    // Validation Input (Niv 3)
    const handleInputValidation = (textOrCode: string) => {
        if (!currentQuestion) return;
        if (textOrCode.length === 2 && textOrCode === textOrCode.toUpperCase()) {
            validateAnswer(textOrCode);
            return;
        }
        const target = currentQuestion.target;
        const answer = mode === 'capital' ? target.capital : target.name_fr;
        if (textOrCode.toLowerCase().trim() === answer.toLowerCase()) {
            validateAnswer(target.code);
        } else {
            validateAnswer('WRONG_INPUT');
        }
    };

    // --- HELPER UI ---
    const getInstructionText = () => {
        if (lvl === 1) return mode === 'flag' ? "Quel est ce drapeau ?" : mode === 'capital' ? "Quelle est la capitale de ce pays ?" : "Quel est ce pays ?";
        if (lvl === 2 && currentQuestion) return mode === 'flag' ? "" : (mode === 'capital' ? currentQuestion.target.capital : currentQuestion.target.name_fr);
        if (lvl === 3) return mode === 'capital' ? "Quelle est cette capitale ?" : "Quel est ce pays ?";
        return "";
    };

    const getMapColors = () => {
        const colors: Record<string, string> = {};
        Object.keys(mapFeedback).forEach(code => {
            if (mapFeedback[code] === 'correct') colors[code] = Colors.green;
            if (mapFeedback[code] === 'wrong') colors[code] = Colors.red;
        });
        if (status === 'playing' && currentQuestion) {
            if (lvl === 1 || (lvl === 3 && mode !== 'flag')) {
                colors[currentQuestion.target.code] = Colors.main;
            }
        }
        return colors;
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
                <GlowTopGradient color={Colors.main} />

                <ArcadeHeader
                    currentStep={currentIndex + 1}
                    totalSteps={total}
                    errors={errors}
                    elapsedTime={elapsedTime}
                />

                {/* VISUAL AREA */}
                <View style={styles.visualArea}>
                    {lvl === 3 && mode === 'flag' && currentQuestion ? (
                        <View style={styles.bigFlagContainer}>
                            <Image source={getFlagImage(currentQuestion.target.code)} style={styles.flagLarge} />
                        </View>
                    ) : (
                        <>
                            <View style={styles.overlay}>
                                {lvl === 2 && mode === 'flag' && currentQuestion ? (
                                    <Image source={getFlagImage(currentQuestion.target.code)} style={styles.flagMedium} />
                                ) : (
                                    <Title1 title={getInstructionText()} color={Colors.white} isLeft />
                                )}
                                {lvl === 2 && mode !== 'flag' && (
                                    <BodyText text="Trouvez sur la carte :" color={Colors.lightGrey} size="S" />
                                )}
                            </View>

                            <InteractiveMap
                                countryColors={getMapColors()}
                                selectedCountry={null}
                                onCountryPress={(code) => lvl === 2 && validateAnswer(code)}
                                isFullHeight
                                focusCoordinates={
                                    (lvl !== 2 && currentQuestion)
                                        ? [currentQuestion.target.longitude, currentQuestion.target.latitude]
                                        : null
                                }
                            />
                        </>
                    )}
                </View>

                {/* CONTROLS */}
                <View style={styles.bottomArea}>
                    {currentQuestion && (
                        <ArcadeControls
                            level={lvl}
                            mode={mode}
                            options={currentQuestion.options}
                            onValidate={handleInputValidation}
                            targetName={currentQuestion.target.name_fr}
                            targetCapital={currentQuestion.target.capital}
                        />
                    )}
                </View>

                {/* --- MODAL RESULTAT DETAILLÉ --- */}
                <CustomModal
                    visible={isResultModalVisible}
                    onConfirm={() => navigation.goBack()}
                    onCancel={() => navigation.goBack()}
                    confirmText="CONTINUER"
                    title="Mission Terminée"
                    variant={resultDetails && resultDetails.totalScore > 100 ? 'gold' : 'default'}
                >
                    {resultDetails && (
                        <View style={styles.resultContainer}>

                            {/* Ligne Précision */}
                            <View style={styles.statRow}>
                                <View style={styles.statLabel}>
                                    <Image source={functions.getIconSource('target')} style={styles.icon} />
                                    <BodyText text="Précision" color={Colors.lightGrey} />
                                </View>
                                <View style={styles.statValue}>
                                    <BodyText text={`${resultDetails.accuracy}%`} color={Colors.white} isBold />
                                    <BodyText text={`+${resultDetails.basePoints}`} color={Colors.main} style={styles.pointsText} />
                                </View>
                            </View>

                            {/* Ligne Temps */}
                            <View style={styles.statRow}>
                                <View style={styles.statLabel}>
                                    <Image source={functions.getIconSource('clock')} style={styles.icon} />
                                    <BodyText text="Temps" color={Colors.lightGrey} />
                                </View>
                                <View style={styles.statValue}>
                                    <BodyText text={functions.formatTime(resultDetails.timeTaken)} color={Colors.white} isBold />
                                    <BodyText text={`+${resultDetails.timeBonus}`} color={Colors.main} style={styles.pointsText} />
                                </View>
                            </View>

                            {/* Ligne Daily Bonus (Conditionnelle) */}
                            {resultDetails.isDaily && (
                                <View style={[styles.statRow, styles.bonusRow]}>
                                    <View style={styles.statLabel}>
                                        <Image source={functions.getIconSource('lightning')} style={[styles.icon, { tintColor: Colors.black }]} />
                                        <BodyText text="Bonus Quotidien" color={Colors.black} isBold />
                                    </View>
                                    <BodyText text="x2" color={Colors.black} isBold style={{ fontSize: 16 }} />
                                </View>
                            )}

                            {/* Séparateur */}
                            <View style={styles.divider} />

                            {/* Total */}
                            <View style={styles.totalRow}>
                                <BodyText text="TOTAL XP" color={Colors.lightGrey} style={{ letterSpacing: 2 }} />
                                <Title0 title={`${resultDetails.totalScore}`} color={Colors.gold} />
                            </View>

                        </View>
                    )}
                </CustomModal>

            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    visualArea: { flex: 1, position: 'relative', justifyContent: 'center' },
    overlay: { position: 'absolute', top: 20, width: '100%', alignItems: 'center', zIndex: 5, pointerEvents: 'none' },
    bottomArea: {
        minHeight: 180,
        justifyContent: 'center',
        paddingHorizontal: 20, paddingVertical: 30, backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: 20, borderTopRightRadius: 20
    },
    bigFlagContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    flagLarge: { width: 250, height: 160, borderRadius: 12 },
    flagMedium: { width: 100, height: 70, borderRadius: 8, borderWidth: 1, borderColor: Colors.white, marginBottom: 5 },

    // Styles du Modal Résultat
    resultContainer: { width: '100%', gap: 12, paddingTop: 10 },
    statRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12
    },
    statLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statValue: { alignItems: 'flex-end' },
    icon: { width: 18, height: 18, tintColor: Colors.lightGrey },
    pointsText: { fontSize: 12, fontWeight: 'bold' },

    bonusRow: { backgroundColor: Colors.gold }, // Fond doré pour le bonus

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 5 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }
});
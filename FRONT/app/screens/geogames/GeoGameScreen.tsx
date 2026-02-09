import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { GameLevel, GameMode } from '@/app/constants/GameConfig';
import { useApi } from '@/app/hooks/useApi';
import { useArcadeGame } from '@/app/hooks/useArcadeGame';
import { ALL_COUNTRIES } from '@/app/models/Countries';
import { ArenaNavParams } from '@/app/navigations/ArenaNav';
import { gameResultService } from '@/app/services/gameResult';
import { functions } from '@/app/utils/Functions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Components
import ArcadeHeader from './components/ArcadeHeader';
import GameLevel1View from './components/GameLevel1View';
import GameLevel2View from './components/GameLevel2View';
import GameLevel3View from './components/GameLevel3View';
import GameLevel4View from './components/GameLevel4View';

type Props = NativeStackScreenProps<ArenaNavParams, 'GeoGame'>;

// Interface partagée pour les Vues
export interface GameViewProps {
    engine: ReturnType<typeof useArcadeGame>;
    mode: GameMode;
    regionCode: string;
}

// --- LOGIQUE SCORE ---
interface ScoreDetails {
    accuracy: number;
    timeTaken: number;
    basePoints: number;
    timeBonus: number;
    isDaily: boolean;
    totalScore: number;
    alreadyDone: boolean;
    timeBonusEligible: boolean;
}

const calculateDetailedScore = (accuracy: number, timeTaken: number, isDaily: boolean, alreadyDone: boolean): ScoreDetails => {
    const basePoints = Math.round((accuracy / 100) * 100);

    let potentialTimeBonus = 0;
    if (timeTaken <= 60) potentialTimeBonus = 50;
    else if (timeTaken <= 120) potentialTimeBonus = 30;
    else if (timeTaken <= 300) potentialTimeBonus = 10;

    const isEligibleForTimeBonus = accuracy >= 80;
    const timeBonus = isEligibleForTimeBonus ? potentialTimeBonus : 0;

    let total = basePoints + timeBonus;

    if (alreadyDone) total = Math.round(total * 0.2); // 20% des points si déjà fait

    if (isDaily) total *= 2;

    return {
        accuracy,
        timeTaken,
        basePoints,
        timeBonus,
        isDaily,
        totalScore: total,
        alreadyDone,
        timeBonusEligible: isEligibleForTimeBonus
    };
};

export default function GeoGameScreen({ navigation, route }: Props) {
    const lvl = (route.params?.level || 1) as GameLevel;
    const mode = (route.params?.mode || 'country') as GameMode;
    const regionCode = route.params?.regionId || 'AFR';
    const isDailyBonus = route.params?.isDailyBonus || false;
    const alreadyDone = route.params?.alreadyDone || false;
    // --- DATA ---
    const regionCountries = useMemo(() => {
        if (regionCode === 'WLD') return ALL_COUNTRIES;
        return ALL_COUNTRIES.filter(c => c.continentId === regionCode);
    }, [regionCode]);

    // --- STATE & API ---
    const [isResultModalVisible, setResultModalVisible] = useState(false);
    const [resultDetails, setResultDetails] = useState<ScoreDetails | null>(null);

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

    const handleGameFinish = (stats: { timeTaken: number, accuracy: number }) => {
        const details = calculateDetailedScore(
            stats.accuracy,
            stats.timeTaken,
            isDailyBonus,
            alreadyDone
        );
        setResultDetails(details);
        setResultModalVisible(true);
        finishGameApi.execute(details);
    };

    // --- GAME ENGINE ---
    const gameEngine = useArcadeGame(
        regionCountries,
        lvl,
        mode,
        handleGameFinish
    );

    // --- RENDER VIEW SELECTION ---
    const renderGameView = () => {
        const commonProps: GameViewProps = {
            engine: gameEngine,
            mode,
            regionCode
        };

        switch (lvl) {
            case 1: return <GameLevel1View {...commonProps} />;
            case 2: return <GameLevel2View {...commonProps} />;
            case 3: return <GameLevel3View {...commonProps} />;
            case 4: return <GameLevel4View {...commonProps} />;
            default: return null;
        }
    };

    return (
        <View style={styles.container}>

            <ArcadeHeader
                currentStep={gameEngine.currentIndex + 1}
                totalSteps={gameEngine.total}
                errors={gameEngine.errors}
                elapsedTime={gameEngine.elapsedTime}
            />

            <View style={{ flex: 1 }}>
                {renderGameView()}
            </View>

            {/* MODAL RESULTATS */}
            <CustomModal
                visible={isResultModalVisible}
                onConfirm={() => navigation.goBack()}
                title="Mission Terminée"
                color={Colors.gold}
            >
                {resultDetails && (
                    <View style={styles.resultContainer}>
                        <View style={styles.statRow}>
                            <View style={styles.statLabel}>
                                <Image source={functions.getIconSource('target')} style={styles.icon} />
                                <BodyText text="Précision" color={Colors.lightGrey} />
                            </View>
                            <View style={styles.statValue}>
                                <BodyText text={`${resultDetails.accuracy}%`} color={Colors.white} isBold />
                                <BodyText text={`+${resultDetails.basePoints}`} color={Colors.gold} style={styles.pointsText} />
                            </View>
                        </View>

                        <View style={[styles.statRow, !resultDetails.timeBonusEligible && { opacity: 0.5 }]}>
                            <View style={styles.statLabel}>
                                <Image source={functions.getIconSource('clock')} style={styles.icon} />
                                <View>
                                    <BodyText text="Temps" color={Colors.lightGrey} />
                                    {!resultDetails.timeBonusEligible && (
                                        <BodyText text="(Précision faible)" color={Colors.red} size="XS" />
                                    )}
                                </View>
                            </View>
                            <View style={styles.statValue}>
                                <BodyText text={functions.formatTime(resultDetails.timeTaken)} color={Colors.white} isBold />
                                {resultDetails.timeBonus > 0 ? (
                                    <BodyText text={`+${resultDetails.timeBonus}`} color={Colors.gold} style={styles.pointsText} />
                                ) : (
                                    <BodyText text="--" color={Colors.disabled} style={styles.pointsText} />
                                )}
                            </View>
                        </View>

                        {resultDetails.isDaily && (
                            <View style={[styles.statRow, styles.bonusRow]}>
                                <View style={styles.statLabel}>
                                    <Image source={functions.getIconSource('lightning')} style={[styles.icon, { tintColor: Colors.black }]} />
                                    <BodyText text="Bonus Quotidien" color={Colors.black} isBold />
                                </View>
                                <BodyText text="x2" color={Colors.black} isBold />
                            </View>
                        )}

                        {/* ---  DÉJÀ FAIT --- */}
                        {resultDetails.alreadyDone && (
                            <View style={styles.statRow}>
                                <View style={styles.statLabel}>
                                    <Image
                                        source={functions.getIconSource('repeat')}
                                        style={styles.icon}
                                    />
                                    <BodyText text="Déjà complété" color={Colors.lightGrey} />
                                </View>
                                <View style={styles.statValue}>
                                    {/* Affichage de la division en rouge ou orange pour marquer la pénalité */}
                                    <BodyText text="÷ 5" color={Colors.red} isBold />
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <BodyText text="TOTAL XP" color={Colors.lightGrey} style={{ letterSpacing: 2 }} />
                            <Title0 title={`${resultDetails.totalScore}`} color={Colors.gold} />
                        </View>
                    </View>
                )}
            </CustomModal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: Colors.black
    },
    resultContainer: { width: '100%', gap: 12, paddingTop: 10 },
    statRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12
    },
    statLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statValue: { alignItems: 'flex-end' },
    icon: { width: 18, height: 18, tintColor: Colors.lightGrey, resizeMode: 'contain' },
    pointsText: { fontSize: 12, fontWeight: 'bold' },
    bonusRow: { backgroundColor: Colors.gold },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 5 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }
});
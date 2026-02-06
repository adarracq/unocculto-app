import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import Colors from '@/app/constants/Colors';
import { GAME_CONFIG, LevelConfig } from '@/app/constants/GameConfig';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { ArenaNavParams } from '@/app/navigations/ArenaNav';
import { gameResultService } from '@/app/services/gameResult';
import { userService } from '@/app/services/user.service';
import { getDailyMission } from '@/app/utils/DailyGameManager';
import { functions } from '@/app/utils/Functions';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import LeaderboardCard, { LeaderboardEntry } from './components/LeaderboardCard';
import LevelCard from './components/LevelCard';

type Props = NativeStackScreenProps<ArenaNavParams, 'RegionLevels'>;

export default function RegionLevelsScreen({ navigation, route }: Props) {
    const { regionId: regionCode, mode } = route.params;

    const [userContext] = useContext(UserContext);
    const isFocused = useIsFocused();

    const modeConfig = GAME_CONFIG[mode];

    const userApi = useApi(
        () => userService.getByEmail(userContext.email),
        'HomeScreen - GetUser'
    );

    // Données locales pour vérifier les records personnels
    const regionProgress = userApi.data?.progression?.[regionCode]?.[mode]?.levels || {};

    const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

    // --- STATE LEADERBOARD ---
    // Par défaut niveau 1
    const [leaderboardLevel, setLeaderboardLevel] = useState<number>(1);

    // --- API LEADERBOARD ---
    const { data: rawLeaderboard, execute: fetchLeaderboard } = useApi(
        () => gameResultService.getGameLeaderBoard(mode, regionCode, leaderboardLevel),
        'GetGameLeaderboard'
    );


    // Recharger quand on change de niveau ou de région
    useEffect(() => {
        if (userContext?.email) userApi.execute();
        fetchLeaderboard();
    }, [regionCode, mode, leaderboardLevel, isFocused]);

    // Transformation UI
    const leaderboardData: LeaderboardEntry[] = rawLeaderboard?.map((item: any, index: number) => ({
        rank: index + 1,
        pseudo: item.pseudo || "Anonyme",
        time: functions.formatTime(item.timeTaken), // "00:30"
        accuracy: item.accuracy,                    // 100
        isUser: item.pseudo === userApi.data?.pseudo,
    })) || [];

    // --- HELPERS ---
    const isLevelLocked = (levelId: number) => {
        if (levelId === 1) return false;
        const prevLevel = regionProgress[levelId - 1];
        return !prevLevel?.completed;
    };

    const handleStartGame = () => {
        if (!selectedLevel) return;
        setSelectedLevel(null);

        let isDailyBonus = false;

        const dailyMission = getDailyMission();
        if (dailyMission.regionId === regionCode && dailyMission.modeId === mode) {
            isDailyBonus = true;
        }

        navigation.navigate('GeoGame', {
            regionId: regionCode,
            mode,
            level: selectedLevel.id,
            isDailyBonus
        });
    };

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <BackArrow onPress={() => navigation.goBack()} />
            <GlowTopGradient color={modeConfig.color} />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Title0 title={modeConfig.label} color={Colors.white} isLeft />
                    <BodyText text={`SECTEUR ${regionCode}`} size="S" color={Colors.main} style={{ letterSpacing: 2 }} />
                </View>

                {/* Section Niveaux (Jouables) */}
                <View style={styles.section}>
                    {modeConfig.levels.map((level) => {
                        const isLocked = isLevelLocked(level.id);
                        const data = regionProgress[level.id];
                        return (
                            <LevelCard
                                key={level.id}
                                level={level.id}
                                title={level.title}
                                subTitle={level.subTitle}
                                color={level.color || modeConfig.color}
                                isLocked={isLocked}
                                bestTime={data?.completed ? functions.formatTime(data.bestTime) : undefined}
                                bestAccuracy={data?.completed ? data.bestAccuracy : undefined}
                                onPress={() => setSelectedLevel(level)}
                            />
                        );
                    })}
                </View>

                {/* --- SECTION LEADERBOARD --- */}
                <View style={{ marginTop: 20 }}>


                    <LeaderboardCard
                        title="CLASSEMENT"
                        data={leaderboardData}
                        limit={10} // Top 10 demandé
                        // On injecte les onglets dans le header du composant
                        headerRightComponent={
                            <View style={styles.tabsContainer}>
                                {[1, 2, 3].map((lvl) => (
                                    <TouchableOpacity
                                        key={lvl}
                                        onPress={() => setLeaderboardLevel(lvl)}
                                        style={[
                                            styles.tab,
                                            leaderboardLevel === lvl && { borderColor: Colors.main, backgroundColor: Colors.main + '20' }
                                        ]}
                                    >
                                        <BodyText
                                            text={lvl === 1 ? 'I' : lvl === 2 ? 'II' : 'III'}
                                            color={leaderboardLevel === lvl ? Colors.main : Colors.darkGrey}
                                            isBold
                                            style={{ fontSize: 10 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        }
                    />
                </View>

            </ScrollView>

            {/* Modal de Lancement (Inchangé) */}
            {selectedLevel && (
                <CustomModal
                    visible={!!selectedLevel}
                    title={`MISSION : ${selectedLevel.title}`}
                    onCancel={() => setSelectedLevel(null)}
                    onConfirm={handleStartGame}
                    confirmText="LANCER"
                    color={selectedLevel.color || modeConfig.color}
                    variant={selectedLevel.id === 4 ? 'gold' : 'default'}
                >
                    <View>
                        <BodyText text="Briefing de mission :" color={Colors.lightGrey} style={{ marginBottom: 8 }} />
                        <BodyText text={selectedLevel.description} color={Colors.white} style={{ fontSize: 16, lineHeight: 24 }} />
                        <View style={styles.infoRow}>
                            {selectedLevel.rules.time && (
                                <InfoTag icon="clock" text={`Max: ${functions.formatTime(selectedLevel.rules.time)}`} />
                            )}
                            <InfoTag icon="target" text={`Précision: ${selectedLevel.rules.accuracy}%`} />
                        </View>
                    </View>
                </CustomModal>
            )}

        </LinearGradient>
    );
}

const InfoTag = ({ icon, text }: any) => (
    <View style={styles.tag}>
        <Image source={functions.getIconSource(icon)} style={{ width: 12, height: 12, tintColor: Colors.lightGrey, marginRight: 6 }} />
        <BodyText text={text} color={Colors.lightGrey} style={{ fontSize: 12 }} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
    header: { marginBottom: 20, gap: 10, justifyContent: 'flex-end', alignItems: 'flex-end' },
    section: { marginBottom: 20 },
    infoRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    tag: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8
    },

    // Style pour les Tabs de niveau
    tabsContainer: { flexDirection: 'row', gap: 8 },
    tab: {
        width: 32, height: 32,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },

    // Style pour la carte "Mon Record"
    myScoreCard: {
        marginBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderWidth: 1,
        borderColor: Colors.gold + '40',
        borderRadius: 12,
        padding: 12,
    },
    myScoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4
    }
});
import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import SubscriptionModal from '@/app/components/organisms/SubscriptionModal';
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
import ProfileHeader from '../home/components/ProfileHeader';
import LeaderboardCard, { LeaderboardEntry } from './components/LeaderboardCard';
import LevelCard from './components/LevelCard';

type Props = NativeStackScreenProps<ArenaNavParams, 'RegionLevels'>;

const CONTINENTS = ['EUR', 'ASI', 'AFR', 'AME', 'OCE'];

export default function RegionLevelsScreen({ navigation, route }: Props) {
    const { regionId: regionCode, mode } = route.params;
    const isFocused = useIsFocused();
    const modeConfig = GAME_CONFIG[mode];
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // 1. Context & User Data
    const [userContext, setUserContext] = useContext(UserContext);

    // API pour rafraîchir le user (Progression à jour)
    const userApi = useApi(
        () => userService.getByEmail(userContext.email),
        'RegionLevels - GetUser'
    );

    // Données locales pour l'affichage (Priorité à la data fraîche, sinon contexte)
    const userData = userApi.data || userContext;
    const regionProgress = userData?.progression?.[regionCode]?.[mode]?.levels || {};

    // 2. Leaderboard Data
    const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
    const [leaderboardLevel, setLeaderboardLevel] = useState<number>(1);

    const { data: rawLeaderboard, execute: fetchLeaderboard } = useApi(
        () => gameResultService.getGameLeaderBoard(mode, regionCode, leaderboardLevel),
        'GetGameLeaderboard'
    );

    // 3. Effets de Chargement & Synchro
    useEffect(() => {
        if (isFocused) {
            // On recharge le user pour vérifier les déblocages récents
            if (userContext?.email) userApi.execute();
            fetchLeaderboard();
        }
    }, [isFocused, leaderboardLevel]);

    // IMPORTANT : Synchronisation du Context global quand on reçoit des données fraîches
    // Cela permet à l'écran précédent (LicenseMap) d'être à jour au retour sans refaire d'appel
    useEffect(() => {
        if (userApi.data) {
            setUserContext(userApi.data);
        }
    }, [userApi.data]);

    // 4. Transformation Leaderboard
    const leaderboardData: LeaderboardEntry[] = rawLeaderboard?.map((item: any, index: number) => ({
        rank: index + 1,
        pseudo: item.pseudo || "Anonyme",
        time: functions.formatTime(item.timeTaken),
        accuracy: item.accuracy,
        isUser: item.pseudo === userData?.pseudo,
        flag: item.flag,
    })) || [];

    // 5. Helpers
    const isLevelLocked = (levelId: number) => {
        // A. Logique Spéciale MONDE (WLD)
        if (regionCode === 'WLD') {
            // Règle 1: Progression linéaire interne (Finir WLD Niv X-1)
            if (levelId > 1) {
                const prevLevel = regionProgress[levelId - 1];
                if (!prevLevel?.completed) return true;
            }
            // Règle 2: "Boss Check" (Finir ce niveau sur TOUS les continents)
            const allContinentsCompleted = CONTINENTS.every(cont => {
                return userData?.progression?.[cont]?.[mode]?.levels?.[levelId]?.completed;
            });
            return !allContinentsCompleted;
        }

        // B. Logique Standard
        if (levelId === 1) return false;
        const prevLevel = regionProgress[levelId - 1];
        return !prevLevel?.completed;
    };

    // function that return Colors.gold, Colors.silver or Colors.bronze based on level id
    const getMedalColor = (levelId: number) => {
        switch (levelId) {
            case 1:
                return Colors.bronze;
            case 2:
                return Colors.silver;
            case 3:
                return Colors.gold;
            case 4:
                return Colors.realBlack;
            default:
                return Colors.white;
        }
    };

    const handleStartGame = () => {
        if (!selectedLevel) return;
        setSelectedLevel(null);

        const dailyMission = getDailyMission();
        const isDailyBonus = dailyMission.regionId === regionCode && dailyMission.modeId === mode;
        const alreadyDone = userData.progression?.[regionCode]?.[mode]?.levels?.[selectedLevel.id]?.completed;

        navigation.navigate('GeoGame', {
            regionId: regionCode,
            mode,
            level: selectedLevel.id,
            isDailyBonus,
            alreadyDone
        });
    };

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <ProfileHeader
                user={userApi.data || userContext}
                onChangeFlag={() => { }} // Pas besoin de changer le flag ici
                hidePassport
            />
            <BackArrow onPress={() => navigation.goBack()} top={190} left={20} />
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Title0 title={modeConfig.label} color={Colors.white} isLeft />
                    <BodyText text={`SECTEUR ${regionCode}`} size="S" color={Colors.lightGrey} style={{ letterSpacing: 2 }} />
                </View>

                {/* Liste des Niveaux */}
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
                                onPress={() => {
                                    if (userData.isPremium || userData.fuel > 0) {
                                        setSelectedLevel(level);
                                    } else {
                                        setShowPremiumModal(true);
                                    }
                                }}
                            />
                        );
                    })}
                </View>

                {/* Leaderboard */}
                <View style={{ marginTop: 20 }}>
                    <LeaderboardCard
                        title="CLASSEMENT"
                        data={leaderboardData}
                        limit={10}
                        headerRightComponent={
                            <View style={styles.tabsContainer}>
                                {[1, 2, 3].map((lvl) => (
                                    <TouchableOpacity
                                        key={lvl}
                                        onPress={() => setLeaderboardLevel(lvl)}
                                        style={[
                                            styles.tab,
                                            leaderboardLevel === lvl && { borderColor: getMedalColor(lvl), backgroundColor: getMedalColor(lvl) + '20' }
                                        ]}
                                    >
                                        <BodyText
                                            text={lvl === 1 ? 'I' : lvl === 2 ? 'II' : 'III'}
                                            color={leaderboardLevel === lvl ? getMedalColor(lvl) : Colors.darkGrey}
                                            isBold
                                            style={{ fontSize: 10 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                                {/* on rajoute lvl 4 pour le mode PAYS */}
                                {modeConfig.id === 'country' && (
                                    <TouchableOpacity
                                        onPress={() => setLeaderboardLevel(4)}
                                        style={[
                                            styles.tab,
                                            leaderboardLevel === 4 && { borderColor: getMedalColor(4), backgroundColor: getMedalColor(4) + '20' }
                                        ]}
                                    >
                                        <BodyText
                                            text="IV"
                                            color={leaderboardLevel === 4 ? getMedalColor(4) : Colors.darkGrey}
                                            isBold
                                            style={{ fontSize: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                </View>
            </ScrollView>

            {/* Modal Lancement */}
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
                        {regionCode === 'WLD' && (
                            <BodyText text="⚠️ DIFFICULTÉ MONDIALE : Inclut tous les pays." color={Colors.gold} style={{ fontSize: 12, marginTop: 15 }} />
                        )}
                    </View>
                </CustomModal>
            )}
            <SubscriptionModal
                visible={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                reason='fuel'
            />
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
    container: { flex: 1, },
    header: { marginBottom: 20, justifyContent: 'flex-end', alignItems: 'flex-end' },
    section: { marginBottom: 20 },
    infoRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    tag: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8
    },
    tabsContainer: { flexDirection: 'row', gap: 8 },
    tab: {
        width: 32, height: 32,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
});
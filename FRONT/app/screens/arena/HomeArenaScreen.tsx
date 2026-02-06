import Title2 from '@/app/components/atoms/Title2';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { gameResultService } from '@/app/services/gameResult';
import { userService } from '@/app/services/user.service';
import { getDailyMission } from '@/app/utils/DailyGameManager';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ProfileHeader from '../home/components/ProfileHeader';
import DailyMissionCard from './components/DailyMissionCard';
import LeaderboardCard, { LeaderboardEntry } from './components/LeaderboardCard';
import TrainingSelector from './components/TrainingSelector';

export default function HomeArenaScreen({ navigation }: any) {
    const [userContext, setUserContext] = useContext(UserContext);
    const isFocused = useIsFocused();

    // Récupération des données utilisateur à jour (Fuel, XP...)
    const { data: user, execute: refreshUser } = useApi(
        () => userService.getByEmail(userContext.email),
        'HomeArenaScreen - GetUser'
    );

    // 2. Weekly Leaderboard Data
    const { data: weeklyLbData, execute: refreshLeaderboard, loading: lbLoading } = useApi(
        () => gameResultService.getHebdoLeaderBoard(),
        'HomeArenaScreen - GetWeeklyLB'
    );

    useEffect(() => {
        refreshUser();
        refreshLeaderboard();
    }, [isFocused]);


    const handleSelectMode = (mode: 'country' | 'flag' | 'capital') => {
        navigation.navigate('LicenseMap', { mode });
    };

    // 1. Calcul de la mission du jour (C'est instantané, pas besoin de useEffect lourd)
    const dailyMission = getDailyMission();

    // 2. Handler Intelligent
    const handleDailyMission = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // On navigue directement vers l'écran de Niveaux de la région cible
        // En précisant qu'on vient du Daily (pour appliquer le bonus X2 potentiellement)
        navigation.navigate('RegionLevels', {
            regionId: dailyMission.regionId,
            mode: dailyMission.modeId,
            isDailyBonus: true // Tu pourras gérer ce flag dans RegionLevelsScreen ou GameScreen
        });
    };

    // --- FORMATTAGE DATA LEADERBOARD ---
    // On transforme la réponse API en format compatible pour LeaderboardCard
    const leaderboardEntries: LeaderboardEntry[] = weeklyLbData?.leaderboard?.map((item: any) => ({
        rank: item.rank,
        pseudo: item.pseudo,
        score: `${item.score} XP`, // Affichage avec suffixe XP
        isUser: item.isUser,
        flag: item.flag
    })) || [];

    // Nom de la ligue (simulé pour l'instant, ou basé sur le rang user plus tard)
    const leagueName = "LIGUE BRONZE";


    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>

            {user ?
                <>

                    {/* 1. RAPPEL INFOS (Header) */}
                    <ProfileHeader
                        user={user}
                        onChangeFlag={() => { }} // Pas besoin de changer le flag ici
                        hidePassport
                    />
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Title2 title="MISSION DU JOUR" isLeft style={{ marginBottom: 15, marginLeft: 20 }} color={Colors.lightGrey} />
                        {/* 2. MISSION DU JOUR (Boost) */}
                        <DailyMissionCard
                            onPress={handleDailyMission}
                            bonus={dailyMission.bonus}
                            regionId={dailyMission.regionId}
                            title={dailyMission.title} // ex: "OPÉRATION : AFRIQUE"
                            type={dailyMission.typeLabel} // ex: "DRAPEAUX"
                        />

                        {/* 3. SÉLECTEUR DE MODE (Entraînement) */}
                        <TrainingSelector onSelect={handleSelectMode} />

                        {/* 4. CLASSEMENT (Aperçu) */}
                        <View style={{ paddingHorizontal: 20 }}>
                            <LeaderboardCard
                                title="CLASSEMENT HEBDO"
                                subTitle={leagueName} // ex: LIGUE BRONZE
                                data={leaderboardEntries}
                                limit={10} // On peut afficher plus que 5 si on veut
                            />
                        </View>

                    </ScrollView>
                </>
                :
                <LoadingScreen />
            }
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingVertical: 20,
    },
});
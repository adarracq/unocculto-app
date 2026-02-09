import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { ArenaNavParams } from '@/app/navigations/ArenaNav';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ProfileHeader from '../home/components/ProfileHeader';
import RegionBadge from './components/RegionBadge';

type Props = NativeStackScreenProps<ArenaNavParams, 'LicenseMap'>;

export default function LicenseMapScreen({ navigation, route }: Props) {
    const { mode } = route.params;

    const [userContext] = useContext(UserContext);
    const user = userContext;

    // Helper pour calculer le niveau (0, 1, 2, 3)
    const getRegionLevel = (regionCode: string): 0 | 1 | 2 | 3 => {
        if (!user || !user.progression) return 0;

        const regionData = user.progression[regionCode];
        if (!regionData) return 0;

        const modeData = regionData[mode];
        if (!modeData || !modeData.levels) return 0;

        if (modeData.levels[3]?.completed) return 3;
        if (modeData.levels[2]?.completed) return 2;
        if (modeData.levels[1]?.completed) return 1;

        return 0;
    };

    // Calcul des niveaux pour chaque zone
    const levelEUR = getRegionLevel('EUR');
    const levelASI = getRegionLevel('ASI');
    const levelAFR = getRegionLevel('AFR');
    const levelAME = getRegionLevel('AME');
    const levelOCE = getRegionLevel('OCE');
    const levelWLD = getRegionLevel('WLD');

    // Logique de déverrouillage du HUB Monde (Accès à la région)
    // Il faut avoir au moins le niveau 1 (Bronze) partout
    const unlockedRegionsCount = [levelEUR, levelASI, levelAFR, levelAME, levelOCE].filter(l => l >= 1).length;
    const isWorldUnlocked = unlockedRegionsCount >= 5;

    const getModeInfo = () => {
        switch (mode) {
            case 'flag': return { title: 'DRAPEAUX', color: Colors.bronze };
            case 'capital': return { title: 'CAPITALES', color: Colors.silver };
            default: return { title: 'PAYS', color: Colors.gold };
        }
    };
    const info = getModeInfo();

    const navigateToRegion = (regionId: string) => {
        navigation.navigate('RegionLevels', { regionId, mode });
    }

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <ProfileHeader
                user={user}
                onChangeFlag={() => { }} // Pas besoin de changer le flag ici
                hidePassport
            />
            <BackArrow onPress={() => navigation.goBack()} top={190} left={20} />
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Title0 title={info.title} color={Colors.white} isLeft />
                    <BodyText text="SÉLECTION DE ZONE" size="S" color={Colors.lightGrey} style={{ letterSpacing: 2 }} />
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.row}>
                        <RegionBadge name="EUROPE" code="EUR" level={levelEUR} onPress={() => navigateToRegion('EUR')} />
                        <RegionBadge name="ASIE" code="ASI" level={levelASI} onPress={() => navigateToRegion('ASI')} />
                    </View>

                    <View style={styles.row}>
                        <RegionBadge name="AFRIQUE" code="AFR" level={levelAFR} onPress={() => navigateToRegion('AFR')} />
                        <RegionBadge name="AMÉRIQUES" code="AME" level={levelAME} onPress={() => navigateToRegion('AME')} />
                    </View>

                    <View style={styles.row}>
                        <RegionBadge name="OCÉANIE" code="OCE" level={levelOCE} onPress={() => navigateToRegion('OCE')} />
                        <View style={{ flex: 1 }} />
                    </View>

                    {/* ✅ MISE A JOUR : Badge Monde dynamique */}
                    <View style={{ marginTop: 'auto' }}>
                        <RegionBadge
                            name="MONDE ENTIER"
                            code="WLD"
                            level={levelWLD} // Affiche la vraie progression
                            onPress={() => navigateToRegion('WLD')}
                            isLarge
                            isLocked={!isWorldUnlocked}
                        />
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, },
    header: { marginBottom: 20, gap: 0, justifyContent: 'flex-end', alignItems: 'flex-end' },
    gridContainer: { flex: 1, paddingBottom: 20, justifyContent: 'flex-start' },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 }
});
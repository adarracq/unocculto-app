import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { ArenaNavParams } from '@/app/navigations/ArenaNav';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RegionBadge from './components/RegionBadge';

type Props = NativeStackScreenProps<ArenaNavParams, 'LicenseMap'>;

export default function LicenseMapScreen({ navigation, route }: Props) {
    const { mode } = route.params;
    const insets = useSafeAreaInsets();

    // 1. Connexion au UserContext
    const [userContext] = useContext(UserContext);
    const user = userContext;

    // 2. Helper pour calculer le niveau (0, 1, 2, 3) d'une région selon le mode
    const getRegionLevel = (regionCode: string): 0 | 1 | 2 | 3 => {
        if (!user || !user.progression) return 0;

        // Accès safe aux données : progression -> Region -> Mode -> Levels
        const regionData = user.progression[regionCode];
        if (!regionData) return 0;

        const modeData = regionData[mode]; // mode = 'country' | 'flag' | 'capital'
        if (!modeData || !modeData.levels) return 0;

        // On vérifie les niveaux complétés (du plus haut au plus bas)
        // Note: On suppose que Level 1 = Bronze, Level 2 = Silver, Level 3 = Gold
        if (modeData.levels[3]?.completed) return 3;
        if (modeData.levels[2]?.completed) return 2;
        if (modeData.levels[1]?.completed) return 1;

        return 0;
    };

    // 3. Calcul des niveaux pour chaque zone
    const levelEUR = getRegionLevel('EUR');
    const levelASI = getRegionLevel('ASI');
    const levelAFR = getRegionLevel('AFR');
    const levelAME = getRegionLevel('AME');
    const levelOCE = getRegionLevel('OCE');

    // 4. Logique Boss Final (WLD)
    // Condition : Avoir au moins le niveau 1 (Bronze) partout
    const unlockedRegionsCount = [levelEUR, levelASI, levelAFR, levelAME, levelOCE].filter(l => l >= 1).length;
    const isWorldUnlocked = unlockedRegionsCount >= 5;

    // Infos d'affichage selon le mode
    const getModeInfo = () => {
        switch (mode) {
            case 'flag': return { title: 'DRAPEAUX', color: '#4A90E2' };
            case 'capital': return { title: 'CAPITALES', color: '#50E3C2' };
            default: return { title: 'PAYS', color: Colors.main };
        }
    };
    const info = getModeInfo();

    const navigateToRegion = (regionId: string) => {
        navigation.navigate('RegionLevels', {
            regionId: regionId,
            mode: mode
        });
    }

    return (
        <LinearGradient
            colors={[Colors.darkGrey, Colors.black]}
            style={styles.container}
        >
            <BackArrow onPress={() => navigation.goBack()} />

            <GlowTopGradient color={info.color} />

            {/* Header */}
            <View style={styles.header}>
                <Title0 title={info.title} color={Colors.white} isLeft />
                <BodyText text="SÉLECTION DE ZONE" size="S" color={Colors.main} style={{ letterSpacing: 2 }} />
            </View>

            {/* --- GRILLE --- */}
            <View style={styles.gridContainer}>

                <View style={styles.row}>
                    <RegionBadge
                        name="EUROPE"
                        code="EUR"
                        level={levelEUR}
                        onPress={() => navigateToRegion('EUR')}
                    />
                    <RegionBadge
                        name="ASIE"
                        code="ASI"
                        level={levelASI}
                        onPress={() => navigateToRegion('ASI')}
                    />
                </View>

                <View style={styles.row}>
                    <RegionBadge
                        name="AFRIQUE"
                        code="AFR"
                        level={levelAFR}
                        onPress={() => navigateToRegion('AFR')}
                    />
                    <RegionBadge
                        name="AMÉRIQUES"
                        code="AME"
                        level={levelAME}
                        onPress={() => navigateToRegion('AME')}
                    />
                </View>

                <View style={styles.row}>
                    <RegionBadge
                        name="OCÉANIE"
                        code="OCE"
                        level={levelOCE}
                        onPress={() => navigateToRegion('OCE')}
                    />
                    {/* Placeholder invisible */}
                    <View style={{ flex: 1 }} />
                </View>

                {/* Boss Final */}
                <View style={{ marginTop: 'auto' }}>
                    <RegionBadge
                        name="MONDE ENTIER"
                        code="WLD"
                        level={0} // Le monde a sa propre logique (à définir plus tard si progression spéciale)
                        onPress={() => navigateToRegion('WLD')}
                        isLarge
                        isLocked={!isWorldUnlocked}
                    />
                </View>

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50
    },
    header: {
        marginBottom: 20,
        gap: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    gridContainer: {
        flex: 1,
        paddingBottom: 20,
        justifyContent: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    }
}); 
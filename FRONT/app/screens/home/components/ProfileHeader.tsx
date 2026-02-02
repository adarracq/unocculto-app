import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import ProgressBarStats from '@/app/components/molecules/ProgressBarStats';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import User from '@/app/models/User';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import DropDownFlag from './DropDownFlag';

type Props = {
    user: User;
    onChangeFlag: (code: string) => void;
}

export default function ProfileHeader(props: Props) {
    const [selectedFlagCode, setSelectedFlagCode] = useState<string | null>(props.user.selectedFlag);
    const [selectedFlagColor, setSelectedFlagColor] = useState<string>(ALL_COUNTRIES.find(c => c.code === selectedFlagCode)?.mainColor || Colors.main);

    // Stats
    const unlockedFlagsCount = Object.keys(props.user.passport).length;
    const completedCount = Object.values(props.user.passport).filter(p => p.isCompleted).length;
    const totalCountries = ALL_COUNTRIES.length;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[selectedFlagColor + '60', 'transparent']}
                style={styles.glowBackground}
            />

            {/* --- STATS ROW --- */}
            <View style={styles.statsRow}>
                {/* Streak */}
                <View style={styles.statPill}>
                    <Image source={functions.getIconSource('fire')} style={styles.iconSmall} />
                    <BodyText text={props.user.dayStreak + ''} isBold style={{ color: Colors.main }} />
                </View>

                {/* INDICATEUR SECONDAIRE : PAYS 100% (Badge Or) */}
                {completedCount > 0 &&
                    <View style={[styles.statPill, { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                        <Title1 title="👑" style={{ fontSize: 14 }} />
                        <BodyText text={`${completedCount}`} isBold style={{ color: '#FFD700' }} />
                    </View>}

                {/* Energie */}
                <View style={styles.statPill}>
                    <Image source={functions.getIconSource('lightning')} style={styles.iconSmall} />
                    <BodyText text={props.user.energy?.toString() || '0'} isBold style={{ color: Colors.main }} />
                </View>
            </View>

            {/* --- CENTRE --- */}
            <View style={styles.centerSection}>
                <View style={[styles.flagWrapper, { borderColor: selectedFlagColor + '33' }]}>

                    <Image
                        source={getFlagImage(selectedFlagCode || 'XX')}
                        style={{ width: 80, height: 50, borderRadius: 4 }}
                        resizeMode="cover"
                    />
                    <View style={styles.editFlagBtn}>
                        <DropDownFlag
                            unlockedFlags={Object.keys(props.user.passport)}
                            //unlockedFlags={["US", "FR", "JP", "BR"]}
                            selectedFlag={selectedFlagCode}
                            color={selectedFlagColor}
                            onChangeFlag={(code) => {
                                setSelectedFlagCode(code);
                                setSelectedFlagColor(ALL_COUNTRIES.find(c => c.code === code)?.mainColor || Colors.main);
                                props.onChangeFlag(code);
                            }}
                        />
                    </View>
                </View>

                <View style={{ alignItems: 'center', gap: 4 }}>
                    <Title1 title={props.user.pseudo || 'Explorateur'} color={Colors.white} />
                    {/* Le rang dépend maintenant du nombre de drapeaux */}
                    <BodyText
                        text={unlockedFlagsCount < 5 ? "Touriste" : unlockedFlagsCount < 20 ? "Voyageur" : "Globe-Trotter"}
                        style={{ color: Colors.darkGrey, fontSize: 12 }}
                    />
                </View>
            </View>

            {/* --- PROGRESSION PRINCIPALE (DRAPEAUX) --- */}
            <View style={styles.progressContainer}>
                {/* On tracke les Drapeaux (Visités) car c'est plus gratifiant */}
                <ProgressBarStats
                    current={unlockedFlagsCount}
                    total={totalCountries}
                    label="Pays visités"
                    width={Dimensions.get('window').width - 40}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: Colors.black,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 10,
    },
    glowBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 200, opacity: 0.8
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconSmall: { width: 18, height: 18 },
    centerSection: {
        alignItems: 'center',
        gap: 16,
        marginVertical: 10,
    },
    flagWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        position: 'relative',
    },
    editFlagBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    progressContainer: {
        marginTop: 15,
        alignItems: 'center',
    }
})
import BodyText from '@/app/components/atoms/BodyText';
import SmallText from '@/app/components/atoms/SmallText';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
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
    const [selectedFlagColor, setSelectedFlagColor] = useState<string>(
        ALL_COUNTRIES.find(c => c.code === selectedFlagCode)?.mainColor || Colors.main
    );

    // Stats
    const unlockedFlagsCount = Object.keys(props.user.passport).length;
    const completedCount = Object.values(props.user.passport).filter(p => p.isCompleted).length;
    const totalCountries = ALL_COUNTRIES.length;

    // Calcul du Rang (Logique simple pour l'exemple)
    const getRankTitle = () => {
        if (unlockedFlagsCount < 5) return "TOURISTE";
        if (unlockedFlagsCount < 20) return "VOYAGEUR";
        return "GLOBE-TROTTER";
    };

    return (
        <View style={styles.container}>
            {/* Background Glow subtil */}
            <LinearGradient
                colors={[selectedFlagColor + '40', 'transparent']}
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
                {/*completedCount > 0 &&
                    <View style={[styles.statPill, { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                        <Title1 title="👑" style={{ fontSize: 14 }} />
                        <BodyText text={`${completedCount}`} isBold style={{ color: '#FFD700' }} />
                    </View>*/}

                {/* Energie */}
                <View style={styles.statPill}>
                    <Image source={functions.getIconSource('lightning')} style={styles.iconSmall} />
                    <BodyText text={props.user.energy?.toString() || '0'} isBold style={{ color: Colors.main }} />
                </View>
            </View>

            {/* --- CARTE PASSEPORT --- */}
            <View style={[styles.passportCard, { borderColor: selectedFlagColor + '30' }]}>

                {/* 1. SECTION GAUCHE : PHOTO/DRAPEAU */}
                <View style={styles.photoSection}>
                    <View style={[styles.flagFrame, { borderColor: selectedFlagColor }]}>
                        <Image
                            source={getFlagImage(selectedFlagCode || 'XX')}
                            style={styles.flagImage}
                            resizeMode="cover"
                        />
                        {/* Overlay sombre léger pour l'effet photo */}
                        <View style={styles.photoOverlay} />
                    </View>

                    {/* Bouton Edit (Petit crayon discret en bas de la photo) */}
                    <View style={styles.editBtnPosition}>
                        <DropDownFlag
                            unlockedFlags={Object.keys(props.user.passport)}
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

                {/* 2. SECTION DROITE : INFO IDENTITÉ */}
                <View style={styles.infoSection}>
                    <View style={styles.headerRow}>
                        <Image
                            source={require('@/app/assets/images/logo_white.png')}
                            style={{ width: 20, height: 20, opacity: 0.5, tintColor: Colors.white }}
                            resizeMode='contain'
                        />
                        <SmallText text='PASSEPORT UNOCCULTO' color={Colors.lightGrey} />
                    </View>

                    {/* Nom */}
                    <View style={styles.fieldGroup}>
                        <SmallText text="NOM / SURNAME" style={styles.fieldLabel} isLeft />
                        <Title1 title={props.user.pseudo?.toUpperCase() || 'EXPLORATEUR'} color={Colors.white} isLeft style={{ marginLeft: 20 }} />
                    </View>

                    {/* Rang */}
                    <View style={styles.fieldGroup}>
                        <SmallText text="RANG / RANK" style={styles.fieldLabel} isLeft />
                        <Title2 title={getRankTitle()} color={selectedFlagColor} isLeft style={{ marginLeft: 20 }} />
                    </View>
                </View>
            </View>

            {/* --- PROGRESSION --- */}
            <View style={styles.progressContainer}>
                <ProgressBarStats
                    current={unlockedFlagsCount}
                    total={totalCountries}
                    label="VISAS DÉBLOQUÉS" // Terme plus "Passeport"
                    width={Dimensions.get('window').width - 40}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 40, // Plus d'espace pour la status bar
        paddingBottom: 25,
        paddingHorizontal: 20,
        backgroundColor: Colors.black,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 10,
    },
    glowBackground: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 250, opacity: 0.6
    },

    // --- PASSPORT CARD ---
    passportCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Effet carte plastique sombre
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },

    // Section Photo
    photoSection: {
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flagFrame: {
        width: 120,
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        overflow: 'hidden',
        backgroundColor: Colors.black,
    },
    flagImage: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // Légère teinte pour uniformiser
    },
    editBtnPosition: {
        position: 'absolute',
        bottom: 15,
        right: 0,
    },

    // Section Infos
    infoSection: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        opacity: 0.7,
        marginBottom: 20,
    },
    fieldGroup: {
        marginBottom: 6,
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Progress
    progressContainer: {
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconSmall: { width: 18, height: 18 },
});


import BodyText from '@/app/components/atoms/BodyText';
import SmallText from '@/app/components/atoms/SmallText';
import Title1 from '@/app/components/atoms/Title1';
import ProgressBarLvl from '@/app/components/molecules/ProgressBarLvl';
import Colors from '@/app/constants/Colors';
import { ThemeContext } from '@/app/contexts/ThemeContext';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import User from '@/app/models/User';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import DropDownFlag from './DropDownFlag';

type Props = {
    user: User;
    onChangeFlag: (code: string) => void;
    hidePassport?: boolean;
    onClickStreak?: () => void;
    onClickFuel?: () => void;
}

export default function ProfileHeader(props: Props) {
    const [selectedFlagCode, setSelectedFlagCode] = useState<string | null>(props.user.selectedFlag);
    const [themeContext, setThemeContext] = useContext(ThemeContext);

    const isSelectedFlagCompleted = selectedFlagCode && props.user.passport[selectedFlagCode]?.isCompleted;
    const currentCountryName = ALL_COUNTRIES.find(c => c.code === selectedFlagCode)?.name_fr || "INCONNU";

    // Stats
    const unlockedFlagsCount = Object.keys(props.user.passport).length;
    const totalCountries = ALL_COUNTRIES.length;

    return (

        <LinearGradient
            colors={[themeContext.mainColor + '60', Colors.realBlack + '60']} // Dégradé avec transparence pour effet "glass"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            //colors={[themeContext.mainColor + '80', Colors.realBlack]}
            style={styles.container}
        >

            {/* --- LIGNE DU HAUT : RESSOURCES --- */}
            < View style={styles.statsRow} >
                {/* STREAK */}
                < TouchableOpacity style={styles.statPill} onPress={props.onClickStreak}>
                    <Image source={functions.getIconSource('fire')} style={styles.iconSmall} />
                    <BodyText text={props.user.dayStreak.toString()} isBold style={{ color: Colors.gold }} />
                </TouchableOpacity >

                {/* FUEL (Affiché en rouge si vide, bleu/blanc sinon) */}
                < TouchableOpacity onPress={props.onClickFuel}
                    style={[styles.statPill, { borderColor: props.user.fuel === 0 ? Colors.red : 'rgba(255,255,255,0.05)' }]} >
                    <Image
                        source={functions.getIconSource('fuel')}
                        style={[styles.iconSmall, { tintColor: props.user.fuel === 0 ? Colors.red : undefined }]}
                    />
                    <BodyText
                        text={props.user.fuel.toString() || '0'}
                        isBold
                        style={{ color: props.user.fuel > 0 ? Colors.fuel : Colors.red }}
                    />
                </TouchableOpacity >
            </View >

            {/* --- CARTE PASSEPORT --- */}
            {
                props.hidePassport ? null : (
                    <View style={[
                        styles.passportCard,
                        {
                            borderColor: themeContext.mainColor + '30',
                            backgroundColor: isSelectedFlagCompleted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                        }
                    ]}>

                        {/* 1. PHOTO/DRAPEAU (Ratio corrigé) */}
                        <View style={styles.photoSection}>
                            <DropDownFlag
                                unlockedFlags={Object.keys(props.user.passport)}
                                selectedFlag={selectedFlagCode}
                                passport={props.user.passport}
                                onChangeFlag={(code) => { setSelectedFlagCode(code); props.onChangeFlag(code); }}
                            >
                                <View style={[styles.flagFrame, { borderColor: themeContext.mainColor }]}>
                                    <Image
                                        source={getFlagImage(selectedFlagCode || 'XX')}
                                        style={styles.flagImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.plasticShine} />
                                </View>
                            </DropDownFlag>
                        </View>

                        {/* 2. INFO IDENTITÉ */}
                        <View style={styles.infoSection}>
                            {/* Header Type */}
                            <View style={styles.headerRow}>
                                <Image source={require('@/app/assets/images/logo_white.png')} style={[styles.logoWatermark, { tintColor: Colors.white }]} />
                                <SmallText
                                    text={isSelectedFlagCompleted ? 'PASSEPORT DIPLOMATIQUE' : 'PASSEPORT STANDARD'}
                                    color={Colors.white}
                                />
                            </View>

                            {/* Nom */}
                            <View style={styles.fieldGroup}>
                                <SmallText text="NOM / SURNAME" style={styles.fieldLabel} isLeft />
                                <Title1 title={props.user.pseudo?.toUpperCase() || 'PILOTE'} color={Colors.white} isLeft style={{ fontSize: 18 }} />
                            </View>

                            {/* Visas Débloqués (Remonté ici) */}
                            <View style={styles.fieldGroup}>
                                <SmallText text="VISAS" style={styles.fieldLabel} isLeft />
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                                    <BodyText text={unlockedFlagsCount.toString()} isBold color={Colors.white} />
                                    <SmallText text={'/ ' + totalCountries} color={Colors.lightGrey} style={{ marginBottom: 2 }} />
                                </View>
                            </View>

                            {/* Pays Actuel (Interactif) */}
                            <View style={[styles.fieldGroup, { marginTop: 4 }]}>
                                <SmallText text="PAYS / COUNTRY" style={styles.fieldLabel} isLeft />
                                <DropDownFlag
                                    unlockedFlags={Object.keys(props.user.passport)}
                                    selectedFlag={selectedFlagCode}
                                    passport={props.user.passport}
                                    onChangeFlag={(code) => { setSelectedFlagCode(code); props.onChangeFlag(code); }}
                                >
                                    <View style={styles.interactiveField}>
                                        <BodyText
                                            text={`${selectedFlagCode} - ${currentCountryName.toUpperCase()}`}
                                            color={themeContext.mainColor}
                                            isBold
                                            style={{ letterSpacing: 1, fontSize: 14 }}
                                        />
                                        <Image
                                            source={functions.getIconSource('chevron-down')}
                                            style={{ width: 14, height: 14, tintColor: themeContext.mainColor, opacity: 0.7, marginLeft: 6 }}
                                        />
                                    </View>
                                    <View style={[styles.dottedLine, { backgroundColor: themeContext.mainColor }]} />
                                </DropDownFlag>
                            </View>
                        </View>
                    </View>
                )
            }

            {/* --- PROGRESSION XP (En bas) --- */}
            < View style={styles.progressContainer} >
                <ProgressBarLvl
                    xp={props.user.xp || 0} // On passe l'XP ici
                    width={Dimensions.get('window').width - 40}
                    color={themeContext.mainColor}
                />
            </View >
        </LinearGradient >
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', // Bordure subtile "Glass"
        marginHorizontal: -1,
        marginTop: -1,
    },

    // Stats Row
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    statPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, gap: 6,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    iconSmall: { width: 18, height: 18 },

    // Passport Card
    passportCard: {
        flexDirection: 'row',
        borderRadius: 16, padding: 16,
        borderWidth: 1, marginBottom: 20,
    },
    photoSection: { marginRight: 16, justifyContent: 'center', alignItems: 'center' },

    // DRAPEAU : Ratio 1.5 (ex: 90x60) pour format rectangulaire standard
    flagFrame: {
        width: 90, height: 60,
        borderRadius: 4, borderWidth: 2,
        overflow: 'hidden', backgroundColor: Colors.black,
    },
    flagImage: { width: '100%', height: '100%' },
    plasticShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    },

    infoSection: { flex: 1, paddingLeft: 10, justifyContent: 'space-around' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, opacity: 0.7 },
    logoWatermark: { width: 14, height: 14, marginRight: 6, tintColor: Colors.lightGrey },

    fieldGroup: { marginBottom: 6 },
    fieldLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 'bold', marginBottom: 1 },

    interactiveField: { flexDirection: 'row', alignItems: 'center' },
    dottedLine: { height: 1, width: '100%', marginTop: 2, opacity: 0.3 },

    progressContainer: { alignItems: 'center' },
});
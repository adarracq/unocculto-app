import BodyText from '@/app/components/atoms/BodyText';
import SmallText from '@/app/components/atoms/SmallText';
import Title1 from '@/app/components/atoms/Title1';
import ProgressBarStats from '@/app/components/molecules/ProgressBarStats';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import User from '@/app/models/User';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import DropDownFlag from './DropDownFlag';

type Props = {
    user: User;
    onChangeFlag: (code: string) => void;
}

export default function ProfileHeader(props: Props) {
    const [selectedFlagCode, setSelectedFlagCode] = useState<string | null>(props.user.selectedFlag);

    // On calcule si le pays sélectionné est COMPLÉTÉ (100%)
    const isSelectedFlagCompleted = selectedFlagCode && props.user.passport[selectedFlagCode]?.isCompleted;

    // Couleur principale (Or si complété, sinon couleur du pays, sinon Main)
    const [selectedFlagColor, setSelectedFlagColor] = useState<string>(Colors.main);

    const currentCountryName = ALL_COUNTRIES.find(c => c.code === selectedFlagCode)?.name_fr || "INCONNU";

    useEffect(() => {
        if (isSelectedFlagCompleted) {
            setSelectedFlagColor(Colors.gold); // GOLD
        } else {
            const countryColor = ALL_COUNTRIES.find(c => c.code === selectedFlagCode)?.mainColor;
            setSelectedFlagColor(countryColor || Colors.main);
        }
    }, [selectedFlagCode, isSelectedFlagCompleted]);

    // Stats
    const unlockedFlagsCount = Object.keys(props.user.passport).length;
    const totalCountries = ALL_COUNTRIES.length;

    const getRankTitle = () => {
        if (unlockedFlagsCount < 5) return "TOURISTE";
        if (unlockedFlagsCount < 20) return "VOYAGEUR";
        return "GLOBE-TROTTER";
    };

    return (
        <View style={styles.container}>
            {/* Background Glow */}
            <LinearGradient
                colors={[selectedFlagColor + '40', 'transparent']}
                style={styles.glowBackground}
            />

            {/* --- STATS ROW --- */}
            <View style={styles.statsRow}>
                <View style={styles.statPill}>
                    <Image source={functions.getIconSource('fire')} style={styles.iconSmall} />
                    <BodyText text={props.user.dayStreak + ''} isBold style={{ color: Colors.main }} />
                </View>

                <View style={styles.statPill}>
                    <Image source={functions.getIconSource('lightning')} style={styles.iconSmall} />
                    <BodyText text={props.user.energy?.toString() || '0'} isBold style={{ color: Colors.main }} />
                </View>
            </View>

            {/* --- CARTE PASSEPORT --- */}
            {/* --- CARTE PASSEPORT --- */}
            <View style={[
                styles.passportCard,
                {
                    borderColor: isSelectedFlagCompleted ? Colors.gold : selectedFlagColor + '30',
                    backgroundColor: isSelectedFlagCompleted ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                }
            ]}>

                {/* 1. PHOTO/DRAPEAU (Visuellement pur) */}
                <View style={styles.photoSection}>
                    {/* On rend le drapeau cliquable aussi, car c'est intuitif, mais SANS icône par dessus */}
                    <DropDownFlag
                        unlockedFlags={Object.keys(props.user.passport)}
                        selectedFlag={selectedFlagCode}
                        passport={props.user.passport}
                        onChangeFlag={(code) => { setSelectedFlagCode(code); props.onChangeFlag(code); }}
                    >
                        <View style={[styles.flagFrame, { borderColor: selectedFlagColor }]}>
                            <Image
                                source={getFlagImage(selectedFlagCode || 'XX')}
                                style={styles.flagImage}
                                resizeMode="cover"
                            />
                            {/* Optionnel : Un léger effet brillant par dessus pour faire "plastifié" */}
                            <View style={styles.plasticShine} />
                        </View>
                    </DropDownFlag>
                </View>

                {/* 2. INFO IDENTITÉ (Avec le nouveau champ modifiable) */}
                <View style={styles.infoSection}>

                    {/* Header : Type de passeport */}
                    <View style={styles.headerRow}>
                        <Image source={require('@/app/assets/images/logo_white.png')} style={styles.logoWatermark} />
                        <SmallText
                            text={isSelectedFlagCompleted ? 'PASSEPORT DIPLOMATIQUE' : 'PASSEPORT STANDARD'}
                            color={isSelectedFlagCompleted ? Colors.gold : 'rgba(255,255,255,0.3)'}
                        />
                    </View>

                    {/* Champ 1 : Nom */}
                    <View style={styles.fieldGroup}>
                        <SmallText text="NOM / SURNAME" style={styles.fieldLabel} isLeft />
                        <Title1 title={props.user.pseudo?.toUpperCase() || 'INCONNU'} color={Colors.white} isLeft style={{ fontSize: 18 }} />
                    </View>

                    {/* Champ 2 : Rang */}
                    <View style={styles.fieldGroup}>
                        <SmallText text="RANG / RANK" style={styles.fieldLabel} isLeft />
                        <BodyText text={getRankTitle()} color={Colors.lightGrey} />
                    </View>

                    {/* --- NOUVEAU CHAMP "INTERACTIF" --- */}
                    {/* C'est ici que se trouve le bouton subtil */}
                    <View style={[styles.fieldGroup, { marginTop: 4 }]}>
                        <SmallText text="VISA / ISSUED AT" style={styles.fieldLabel} isLeft />

                        <DropDownFlag
                            unlockedFlags={Object.keys(props.user.passport)}
                            selectedFlag={selectedFlagCode}
                            passport={props.user.passport}
                            onChangeFlag={(code) => { setSelectedFlagCode(code); props.onChangeFlag(code); }}
                        >
                            <View style={styles.interactiveField}>
                                {/* Code Pays (Style Machine à écrire) */}
                                <BodyText
                                    text={`${selectedFlagCode} - ${currentCountryName.toUpperCase()}`}
                                    color={selectedFlagColor}
                                    isBold
                                    style={{ letterSpacing: 1 }}
                                />

                                {/* Petite icône discrète "Modifier" ou Chevron */}
                                <Image
                                    source={functions.getIconSource('chevron-down')} // ou 'edit'
                                    style={{ width: 16, height: 16, tintColor: selectedFlagColor, opacity: 0.7, marginLeft: 6, marginTop: 2 }}
                                />
                            </View>
                            {/* Ligne pointillée décorative sous le champ */}
                            <View style={[styles.dottedLine, { backgroundColor: selectedFlagColor }]} />
                        </DropDownFlag>
                    </View>

                </View>
            </View>

            {/* --- PROGRESSION --- */}
            <View style={styles.progressContainer}>
                <ProgressBarStats
                    current={unlockedFlagsCount}
                    total={totalCountries}
                    label="VISAS DÉBLOQUÉS"
                    width={Dimensions.get('window').width - 40}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        backgroundColor: Colors.black,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
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
    passportCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    photoSection: {
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    flagImage: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    editBtnPosition: {
        position: 'absolute',
        bottom: 15,
        right: 0,
    },
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

    // --- Styles du tampon "100%" (Ajoutés) ---
    inkStampContainer: {
        ...StyleSheet.absoluteFillObject, // Prend toute la place du flagFrame
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
        zIndex: 10,
    },
    inkStampBorder: {
        borderWidth: 2, // Un peu plus épais pour le header
        borderColor: 'rgba(255, 215, 0, 0.8)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        transform: [{ rotate: '-15deg' }],
        backgroundColor: 'rgba(0,0,0,0.3)', // Fond sombre pour lisibilité
    },
    flagFrame: {
        width: 100, // Un peu plus petit pour laisser place au texte
        aspectRatio: 1.5, // Format photo identité (4:5)
        borderRadius: 4,
        borderWidth: 2,
        overflow: 'hidden',
        backgroundColor: Colors.black,
    },
    plasticShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    // Styles pour les champs textes
    infoSection: {
        flex: 1,
        paddingLeft: 16,
        paddingVertical: 4,
        justifyContent: 'space-around'
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 10, opacity: 0.7
    },
    logoWatermark: {
        width: 12, height: 12, marginRight: 6, tintColor: Colors.lightGrey
    },
    fieldGroup: {
        marginBottom: 8,
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 1,
    },

    // NOUVEAUX STYLES INTERACTIFS
    interactiveField: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dottedLine: {
        height: 1,
        width: '100%',
        marginTop: 2,
        opacity: 0.3,
        // Astuce pour faire des pointillés CSS simple :
        // Sur mobile, une ligne continue semi-transparente est souvent plus propre qu'un vrai 'dotted' qui bave
        // Si tu veux vraiment des pointillés, utilise borderStyle: 'dotted', borderWidth: 1, borderColor... sur une View vide
    }
});
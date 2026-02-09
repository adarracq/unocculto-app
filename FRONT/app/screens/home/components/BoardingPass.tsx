import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient'; // Indispensable pour la DA demandée
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';


type Props = {
    pseudo: string;
    color: string;
    countryCode: string;
    city: string;
    originCity?: string;
    originCountryCode?: string;
    onPress: () => void;
    onPremiumPress: () => void;
    lockedUntil?: Date | null;
}

export default function BoardingPass({
    pseudo,
    countryCode,
    color,
    city,
    originCity,
    originCountryCode,
    onPress,
    onPremiumPress,
    lockedUntil,
}: Props) {

    const displayOriginCode = originCountryCode || 'HOME';
    const displayOriginCity = originCity || 'Maison';

    // --- LOGIQUE COMPTEUR (INCHANGÉE) ---
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!lockedUntil) {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const unlockTime = new Date(lockedUntil).getTime();
            const distance = unlockTime - now;

            if (distance < 0) {
                setTimeLeft(null);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                const h = hours < 10 ? '0' + hours : hours;
                const m = minutes < 10 ? '0' + minutes : minutes;
                const s = seconds < 10 ? '0' + seconds : seconds;

                setTimeLeft(`${h}:${m}:${s}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lockedUntil]);

    const isLocked = !!lockedUntil && !!timeLeft;

    const activeColor = isLocked ? Colors.lightGrey : color; // Orange si actif, gris si locké

    return (
        <TouchableOpacity
            style={styles.containerShadow}
            onPress={isLocked ? () => { } : onPress}
            activeOpacity={isLocked ? 1 : 0.9}
        >
            {/* Fond Gradient Glassmorphism */}
            <LinearGradient
                colors={[color + '40', Colors.black + '40', Colors.realBlack + '40']} // Dégradé avec transparence pour effet "glass"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
            >
                {/* --- EN-TÊTE DU TICKET --- */}
                {/* On utilise un background semi-transparent pour séparer le header */}
                <View style={[styles.header, { borderBottomColor: isLocked ? 'rgba(255,255,255,0.05)' : color + '40' }]}>
                    <View style={styles.airlineRow}>
                        <Image
                            source={require('../../../assets/images/logo_white.png')}
                            style={{ width: 20, height: 20, opacity: 0.9 }}
                        />
                        <Title2 title="UNOCCULTO AIRLINES" color={Colors.white} style={{ fontSize: 12, opacity: 0.9, letterSpacing: 1 }} />
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                        <BodyText text="BOARDING PASS" style={{ color: Colors.lightGrey, fontSize: 8, fontWeight: 'bold' }} />
                    </View>
                </View>

                {/* --- CORPS DU TICKET --- */}
                <View style={styles.body}>

                    {/* Contenu principal (Opacité réduite si locked) */}
                    <View style={{ opacity: isLocked ? 0.2 : 1 }}>

                        {/* Infos Passager */}
                        <View style={styles.flightInfo}>
                            <View>
                                <BodyText text="PASSAGER" style={styles.label} />
                                <BodyText text={pseudo?.toUpperCase() || 'EXPLORATEUR'} style={styles.value} isBold />
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <BodyText text="CLASSE" style={styles.label} />
                                <BodyText text="PREMIÈRE" style={{ color: activeColor }} isBold />
                            </View>
                        </View>

                        {/* Destination & Trajet */}
                        <View style={styles.destinationContainer}>
                            {/* Départ */}
                            <View style={{ alignItems: 'center', minWidth: 60 }}>
                                <Title1 title={displayOriginCode} color={Colors.white} style={{ fontSize: 28 }} />
                                <BodyText text={displayOriginCity} style={{ fontSize: 10, color: Colors.lightGrey, textAlign: 'center' }} />
                            </View>

                            {/* Ligne Avion */}
                            <View style={styles.planeLine}>
                                <View style={styles.line} />
                                <Image
                                    source={functions.getIconSource('airplane-takeoff')}
                                    style={{ width: 24, height: 24, tintColor: activeColor, marginHorizontal: 10 }}
                                />
                                <View style={styles.line} />
                            </View>

                            {/* Arrivée */}
                            <View style={{ alignItems: 'center', minWidth: 60 }}>
                                <Title1 title={countryCode} color={Colors.white} style={{ fontSize: 28 }} />
                                <BodyText text={city} style={{ fontSize: 10, color: Colors.lightGrey, textAlign: 'center' }} isBold />
                            </View>
                        </View>

                        {/* Footer Infos (Gate, Heure, Drapeau) */}
                        <View style={styles.footerRow}>
                            <View >
                                <BodyText text="PORTE" style={styles.label} />
                                <BodyText text="A21" style={styles.value} isBold />
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <BodyText text="EMBARQUEMENT" style={styles.label} />
                                <BodyText text="IMMÉDIAT" style={{ ...styles.value, color: Colors.white }} isBold />
                            </View>
                            <View style={styles.flagContainer}>
                                <Image
                                    source={getFlagImage(countryCode)}
                                    style={{ width: 30, height: 20, borderRadius: 2 }}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                    </View>

                    {/* --- OVERLAY DE VERROUILLAGE (Style Refait) --- */}
                    {isLocked && (
                        <View style={styles.lockOverlay}>
                            <LinearGradient
                                colors={['rgba(20,20,20,0.95)', 'rgba(0,0,0,0.98)']}
                                style={styles.lockBadge}
                            >
                                <View style={styles.lockIconContainer}>
                                    <Image
                                        source={functions.getIconSource('lock')}
                                        style={{ width: 20, height: 20, tintColor: Colors.lightGrey }}
                                    />
                                </View>
                                <BodyText text="DÉCOLLAGE DANS" style={{ fontSize: 10, color: Colors.lightGrey, marginTop: 10 }} isBold />

                                {/* Timer en gros style digital */}
                                <Title1 title={timeLeft || "00:00:00"} color={Colors.lightGrey} style={{ fontSize: 32, letterSpacing: 3, marginVertical: 5, textShadowColor: color, textShadowRadius: 10 }} />

                                <TouchableOpacity style={styles.premiumBtn}>
                                    <MyButton
                                        title={'Décoller maintenant'}
                                        onPress={onPremiumPress}
                                        variant="outline"
                                        rightIcon='arrow-right'
                                        bump
                                    />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )}

                </View>

                {/* --- ZONE DE DÉCOUPE & CODE BARRE --- */}
                <View style={styles.cutoutRow}>
                    {/* Les cercles sont noirs pour se fondre dans le fond de l'app */}
                    <View style={styles.circleLeft} />
                    <View style={styles.dashedLine} />
                    <View style={styles.circleRight} />
                </View>

                <View style={styles.stub}>
                    {/* Barcode Lines en Blanc pour le Dark Mode */}
                    <View style={styles.barcodeLines}>
                        {[...Array(24)].map((_, i) => (
                            <View key={i} style={{
                                width: Math.random() > 0.6 ? 4 : 2,
                                height: 35,
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                marginHorizontal: 1
                            }} />
                        ))}
                    </View>
                    <BodyText text="SCANNER POUR DÉCOLLER" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 8, letterSpacing: 2 }} />
                </View>

            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    containerShadow: {
        width: '100%',
        marginVertical: 12,
    },
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', // Bordure subtile "Glass"
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.02)' // Très légère teinte
    },
    airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    // Body
    body: { padding: 20, gap: 24, position: 'relative', minHeight: 160 },
    label: { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 4, letterSpacing: 0.5 },
    value: { fontSize: 15, color: Colors.white },

    flightInfo: { flexDirection: 'row', justifyContent: 'space-between' },

    destinationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
    planeLine: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 15 },
    line: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', flex: 1, marginHorizontal: 8 },

    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    flagContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        padding: 2
    },

    // Cutout Section
    cutoutRow: {
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        marginTop: -10,
        zIndex: 5
    },
    circleLeft: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.black, // Le fond de l'app est noir
        marginLeft: -12,
    },
    circleRight: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.black, // Le fond de l'app est noir
        marginRight: -12,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)', // Gris sombre pointillé
        borderStyle: 'dashed',
        marginHorizontal: 10
    },

    // Stub / Bas du ticket
    stub: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)' // Fond légèrement plus sombre
    },
    barcodeLines: { flexDirection: 'row', gap: 2, alignItems: 'center', opacity: 0.8 },

    // Lock System
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    lockBadge: {
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.main + '40', // Glow orange subtil
        width: '95%',
    },
    lockIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 50,
        marginBottom: 5
    },
    premiumBtn: {
        marginTop: 15,
        shadowColor: Colors.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
});
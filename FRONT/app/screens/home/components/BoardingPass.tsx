import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
    pseudo: string;
    color: string;
    countryCode: string;
    city: string;
    originCity?: string;
    originCountryCode?: string;

    onPress: () => void;

    // NOUVEAU PROP
    lockedUntil?: Date | null; // Si null = débloqué, sinon date de déblocage
}

export default function BoardingPass({
    pseudo,
    countryCode,
    color,
    city,
    originCity,
    originCountryCode,
    onPress,
    lockedUntil // Nouveau
}: Props) {

    const displayOriginCode = originCountryCode || 'HOME';
    const displayOriginCity = originCity || 'Maison';

    // --- LOGIQUE COMPTEUR ---
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
                setTimeLeft(null); // Terminé !
            } else {
                // Calcul HH:MM:SS
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Formatage 00:00:00
                const h = hours < 10 ? '0' + hours : hours;
                const m = minutes < 10 ? '0' + minutes : minutes;
                const s = seconds < 10 ? '0' + seconds : seconds;

                setTimeLeft(`${h}:${m}:${s}`);
            }
        };

        updateTimer(); // Appel immédiat
        const interval = setInterval(updateTimer, 1000); // Mise à jour chaque seconde

        return () => clearInterval(interval);
    }, [lockedUntil]);

    // Est-ce verrouillé ? (Date présente ET temps restant)
    const isLocked = !!lockedUntil && !!timeLeft;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={isLocked ? () => { } : onPress} // Désactive le clic si verrouillé
            activeOpacity={isLocked ? 1 : 0.9}
        >
            {/* --- EN-TÊTE DU TICKET --- */}
            <View style={[styles.header, { backgroundColor: isLocked ? Colors.darkGrey : color }]}>
                <View style={styles.airlineRow}>
                    <Image
                        source={require('../../../assets/images/logo_white.png')}
                        style={{ width: 24, height: 24, opacity: isLocked ? 0.5 : 1 }}
                    />
                    <Title2 title="UNOCCULTO AIRLINES" color={Colors.white} style={{ fontSize: 14, opacity: isLocked ? 0.5 : 1 }} />
                </View>
                <BodyText text="BOARDING PASS" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' }} />
            </View>

            {/* --- CORPS DU TICKET --- */}
            <View style={styles.body}>

                {/* Contenu Normal (Flouté ou assombri si locked ?) */}
                <View style={{ opacity: isLocked ? 0.3 : 1 }}>
                    <View style={styles.flightInfo}>
                        <View>
                            <BodyText text="PASSAGER" style={styles.label} />
                            <BodyText text={pseudo?.toUpperCase() || 'EXPLORATEUR'} style={styles.value} isBold />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <BodyText text="CLASSE" style={styles.label} />
                            <BodyText text="PREMIÈRE" style={styles.value} isBold />
                        </View>
                    </View>

                    <View style={styles.destinationContainer}>
                        <View style={{ alignItems: 'center', minWidth: 60 }}>
                            <Title1 title={displayOriginCode} color={Colors.darkGrey} />
                            <BodyText text={displayOriginCity} style={{ fontSize: 10, color: Colors.darkGrey, textAlign: 'center' }} />
                        </View>
                        <View style={styles.planeLine}>
                            <View style={styles.line} />
                            <Image
                                source={functions.getIconSource('airplane-takeoff')}
                                style={{ width: 24, height: 24, tintColor: isLocked ? Colors.lightGrey : color, marginHorizontal: 10 }}
                            />
                            <View style={styles.line} />
                        </View>
                        <View style={{ alignItems: 'center', minWidth: 60 }}>
                            <Title1 title={countryCode} color={Colors.black} />
                            <BodyText text={city} style={{ fontSize: 10, color: Colors.black, textAlign: 'center' }} isBold />
                        </View>
                    </View>

                    <View style={styles.footerRow}>
                        <View >
                            <BodyText text="PORTE" style={styles.label} />
                            <BodyText text="A21" style={styles.value} isBold />
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <BodyText text="EMBARQUEMENT" style={styles.label} />
                            <BodyText text="IMMÉDIAT" style={{ ...styles.value, color: isLocked ? Colors.lightGrey : color }} isBold />
                        </View>
                        <View style={styles.flagContainer}>
                            <Image
                                source={getFlagImage(countryCode)}
                                style={{ width: 40, height: 25, borderRadius: 4 }}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </View>

                {/* --- OVERLAY DE VERROUILLAGE --- */}
                {isLocked && (
                    <View style={styles.lockOverlay}>
                        <View style={styles.lockBadge}>
                            <Image
                                source={functions.getIconSource('lock')} // Assure-toi d'avoir cette icône
                                style={{ width: 24, height: 24, tintColor: Colors.white, marginBottom: 4 }}
                            />
                            <BodyText text="PROCHAIN VOL" style={{ fontSize: 10, color: Colors.lightGrey }} isBold />
                            <Title1 title={timeLeft || "00:00:00"} color={Colors.gold} style={{ fontSize: 24, letterSpacing: 2 }} />

                            <TouchableOpacity style={styles.premiumBtn}>
                                <BodyText text="DÉBLOQUER MAINTENANT" size="S" color={Colors.white} isBold />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </View>

            {/* --- LE RESTE (Cutout + Barcode) --- */}
            <View style={styles.cutoutRow}>
                <View style={styles.circleLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.circleRight} />
            </View>
            <View style={styles.stub}>
                {/* ... (Barcode inchangé) */}
                <View style={styles.barcodeLines}>
                    {[...Array(20)].map((_, i) => (
                        <View key={i} style={{ width: Math.random() > 0.5 ? 4 : 2, height: 30, backgroundColor: Colors.black, opacity: 0.8 }} />
                    ))}
                </View>
                <BodyText text="Scanner pour décoller" style={{ fontSize: 10, color: Colors.darkGrey, marginTop: 4 }} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginVertical: 10,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject, // Recouvre tout le corps du ticket
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', // Très léger voile
        zIndex: 10,
    },
    lockBadge: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '90%',
    },
    premiumBtn: {
        marginTop: 10,
        backgroundColor: Colors.main,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8
    },

    // Styles existants nécessaires
    header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    body: { padding: 20, gap: 20, position: 'relative' }, // Important: position relative pour l'overlay
    label: { fontSize: 10, color: Colors.darkGrey, marginBottom: 2 },
    value: { fontSize: 14, color: Colors.black },
    flightInfo: { flexDirection: 'row', justifyContent: 'space-between' },
    destinationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
    planeLine: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    line: { height: 1, backgroundColor: Colors.lightGrey, flex: 1, marginHorizontal: 5 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    flagContainer: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 5 },
    cutoutRow: { height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, position: 'relative', marginTop: -10 },
    circleLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.black, marginLeft: -10 },
    circleRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.black, marginRight: -10 },
    dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: Colors.lightGrey, borderStyle: 'dashed', marginHorizontal: 10 },
    stub: { backgroundColor: Colors.white, padding: 15, alignItems: 'center', justifyContent: 'center' },
    barcodeLines: { flexDirection: 'row', gap: 3, alignItems: 'center' }
});
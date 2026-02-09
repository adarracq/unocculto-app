import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, View } from 'react-native';

interface Props {
    visible: boolean;
    color: string;
    originCity?: string;      // ex: "Paris"
    destinationCity?: string; // ex: "Tokyo"
    destinationCode?: string; // ex: "JP" or "HND"
    onAnimationFinish?: () => void;
}

const { width, height } = Dimensions.get('window');

const LOADING_TIPS = [
    "Pressurisation de la cabine...",
    "Vérification des volets...",
    "Alignement sur la piste...",
    "Communication avec la tour...",
    "Calcul de l'itinéraire optimal...",
];

export default function FlightLoader({
    visible,
    originCity = "PARIS",
    color = Colors.main,
    destinationCity = "TOKYO",
    destinationCode = "HND",
    onAnimationFinish
}: Props) {
    const animation = useRef<LottieView>(null);
    const [tipIndex, setTipIndex] = useState(0);
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        let interval: any;
        if (visible) {
            animation.current?.play();
            setTipIndex(Math.floor(Math.random() * LOADING_TIPS.length));

            // Simulation de barre de chargement
            setProgressWidth(0);
            const duration = 2000;
            const step = 20;
            interval = setInterval(() => {
                setProgressWidth(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + (100 / (duration / step));
                });
            }, step);

        } else {
            animation.current?.reset();
            setProgressWidth(0);
        }
        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={styles.container}>
                {/* --- BACKGROUND --- */}
                <LinearGradient
                    colors={[Colors.black, color]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Grille décorative (Radar Effect) */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineHorizontal} />
                    <View style={[styles.gridCircle, { width: width * 0.85, height: width * 0.85 }]} />
                </View>

                {/* --- 1. HEADER (L'ancienne version) --- */}
                <View style={styles.headerContainer}>
                    <BodyText text="INITIALISATION DU VOL" style={{ color: Colors.darkGrey, fontSize: 10, letterSpacing: 2, marginBottom: 5 }} />
                    <View style={styles.destinationRow}>
                        {/* Code Aéroport énorme */}
                        <Title0 title={destinationCode} color={Colors.white} style={{ fontSize: 64, lineHeight: 70 }} />
                        <View style={[styles.dotBadge, { backgroundColor: color }]} />
                    </View>
                    <Title2 title={destinationCity.toUpperCase()} color={Colors.lightGrey} style={{ letterSpacing: 3, fontSize: 16 }} />
                </View>

                {/* --- 2. RADAR & ANIMATION --- */}
                <View style={styles.scopeContainer}>
                    {/* Cercles concentriques */}
                    <View style={[styles.scopeRing, { borderColor: 'rgba(255,255,255,0.03)', width: width * 0.55, height: width * 0.55 }]} />
                    <View style={[styles.scopeRing, { borderColor: 'rgba(255,255,255,0.08)', width: width * 0.4, height: width * 0.4, borderStyle: 'dashed' }]} />

                    <LottieView
                        ref={animation}
                        source={require('@/app/assets/lotties/takeoff3.json')}
                        style={{ width: width * 0.5, height: width * 0.5 }}
                        autoPlay
                        loop={false}
                        speed={1}
                        onAnimationFinish={onAnimationFinish}
                    />
                </View>

                {/* --- 3. LOADING SECTION (Entre Lottie et Telemetry) --- */}
                <View style={styles.loadingWrapper}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressWidth}%`, backgroundColor: Colors.white }]} />
                    </View>
                    <BodyText
                        text={LOADING_TIPS[tipIndex]}
                        isItalic
                        style={{ color: Colors.lightGrey, marginTop: 8, textAlign: 'center' }}
                    />
                </View>

                {/* --- 4. TÉLÉMÉTRIE (Cockpit Data) --- */}
                <View style={styles.telemetryWrapper}>
                    <View style={styles.telemetryContainer}>
                        <TelemetryItem label="ALTITUDE" value="32,000 FT" />
                        <View style={styles.separator} />
                        <TelemetryItem label="VITESSE" value="850 KM/H" />
                        <View style={styles.separator} />
                        <TelemetryItem label="EXT" value="-52°C" />
                    </View>
                </View>

                {/* --- 5. TICKET CARD (Bas de l'écran) --- */}
                <View style={styles.bottomSection}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                        style={styles.ticketCard}
                    >
                        <View style={styles.routeContainer}>
                            {/* Origine */}
                            <View style={styles.cityBlock}>
                                <BodyText text="DÉPART" style={{ color: Colors.darkGrey, fontSize: 9, marginBottom: 2 }} />
                                <Title0 title={originCity.substring(0, 3).toUpperCase()} color={Colors.lightGrey} />
                            </View>

                            {/* Visuel Trajet */}
                            <View style={styles.flightPath}>
                                <View style={styles.dot} />
                                <View style={styles.dashedLine} />
                                <Image
                                    source={functions.getIconSource('logo_white')}
                                    style={{ width: 40, height: 40, tintColor: Colors.white }}
                                />
                                <View style={styles.dashedLine} />
                                <View style={[styles.dot, { backgroundColor: Colors.white }]} />
                            </View>

                            {/* Destination */}
                            <View style={styles.cityBlock}>
                                <BodyText text="ARRIVÉE" style={{ color: Colors.darkGrey, fontSize: 9, marginBottom: 2 }} />
                                <Title0 title={destinationCode} color={Colors.white} />
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}

// Sous-composant Télémétrie
const TelemetryItem = ({ label, value }: any) => (
    <View style={{ alignItems: 'center', minWidth: 70 }}>
        <BodyText text={label} style={{ fontSize: 9, color: Colors.darkGrey, marginBottom: 4 }} />
        <BodyText text={value} isBold style={{ fontSize: 13, color: Colors.white, }} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
        alignItems: 'center',
        justifyContent: 'space-between', // Distribue l'espace verticalement
        paddingVertical: 100,
    },

    // --- BACKGROUND GRID ---
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center', zIndex: -1,
    },
    gridLineVertical: {
        position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.03)',
    },
    gridLineHorizontal: {
        position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.03)',
    },
    gridCircle: {
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', borderRadius: 999,
    },

    // --- 1. HEADER ---
    headerContainer: {
        alignItems: 'center',
        marginTop: 10,
        zIndex: 10,
    },
    destinationRow: {
        flexDirection: 'row', alignItems: 'flex-start',
    },
    dotBadge: {
        width: 8, height: 8, borderRadius: 4, marginTop: 15, marginLeft: 5,
        shadowColor: Colors.white, shadowOpacity: 0.5, shadowRadius: 5,
    },

    // --- 2. RADAR ---
    scopeContainer: {
        justifyContent: 'center', alignItems: 'center',
        // flex: 1 permet au Lottie de prendre de la place mais sans pousser le reste trop loin
        flex: 1,
    },
    scopeRing: {
        position: 'absolute', borderWidth: 1, borderRadius: 999,
    },

    // --- 3. LOADING ---
    loadingWrapper: {
        width: '60%',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBarBg: {
        width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', borderRadius: 2,
    },

    // --- 4. TELEMETRY ---
    telemetryWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    telemetryContainer: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    separator: {
        width: 1, height: '70%', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center', marginHorizontal: 10
    },

    // --- 5. TICKET (BOTTOM) ---
    bottomSection: {
        width: '100%',
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    ticketCard: {
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    routeContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    cityBlock: {
        alignItems: 'center', minWidth: 50,
    },
    flightPath: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
    },
    dashedLine: {
        flex: 1, height: 1, backgroundColor: Colors.darkGrey, marginHorizontal: 5,
    },
    dot: {
        width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.darkGrey,
    },
});
import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, View } from 'react-native';
import Title0 from '../atoms/Title0';
import GlowTopGradient from '../molecules/GlowTopGradient';

interface Props {
    visible: boolean;
    // Infos de vol
    color: string;
    originCity?: string;      // ex: "Paris"
    destinationCity?: string; // ex: "Tokyo"
    destinationCode?: string; // ex: "JP"

    onAnimationFinish?: () => void;
}

// Petites phrases d'ambiance aléatoires
const LOADING_TIPS = [
    "Vérification de la pression des pneus...",
    "Chargement des plateaux repas...",
    "N'oubliez pas d'attacher votre ceinture.",
    "Calcul de la trajectoire optimale...",
    "Remplissage du kérosène...",
    "Les issues de secours sont situées... quelque part.",
    "Synchronisation avec les satellites...",
    "Nettoyage du pare-brise..."
];

export default function FlightLoader({
    visible,
    originCity = "HOME",
    color,
    destinationCity = "Inconnu",
    destinationCode = "??",
    onAnimationFinish
}: Props) {
    const animation = useRef<LottieView>(null);
    const [tipIndex, setTipIndex] = useState(0);

    // Changer le message d'ambiance à chaque ouverture
    useEffect(() => {
        if (visible) {
            animation.current?.play();
            setTipIndex(Math.floor(Math.random() * LOADING_TIPS.length));
        } else {
            animation.current?.reset();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <LinearGradient
                colors={[Colors.darkGrey, Colors.black]}
                style={styles.container}
            >
                {/* Glow d'ambiance en haut */}
                <GlowTopGradient color={color} />

                {/* --- 1. ZONE CENTRALE : ANIMATION --- */}
                <View style={styles.centerContent}>
                    <LottieView
                        ref={animation}
                        source={require('@/app/assets/lotties/takeoff.json')} // Vérifie ton chemin
                        style={{ width: Dimensions.get('window').width * 1.2, height: Dimensions.get('window').width }}
                        autoPlay
                        loop={false}
                        speed={1} // Tu peux accélérer un peu si l'anim est lente
                        onAnimationFinish={onAnimationFinish}
                    />
                </View>

                {/* --- 3. FOOTER : TIP / LOADING TEXT --- */}
                <View style={styles.footer}>
                    <View style={styles.loadingBarContainer}>
                        {/* Tu pourrais mettre une vraie barre de progression ici si tu avais le % */}
                        <BodyText
                            text={LOADING_TIPS[tipIndex]}
                            isItalic
                        />
                    </View>
                </View>

                {/* --- 2. INFORMATION DE VOL (HUD) --- */}
                <View style={styles.flightInfoContainer}>

                    {/* Ligne Trajet */}
                    <View style={styles.routeRow}>
                        {/* Origine (Plus petit, grisé) */}
                        <View style={{ alignItems: 'center' }}>
                            <BodyText text="DE" style={{ color: Colors.lightGrey, fontSize: 10 }} />
                            <Title0 title={originCity.toUpperCase().substring(0, 3)} color={Colors.lightGrey} />
                        </View>

                        {/* Ligne pointillée + Avion */}
                        <View style={styles.flightPath}>
                            <View style={styles.dot} />
                            <View style={styles.dashedLine} />
                            <Image
                                source={functions.getIconSource('logo_white')}
                                style={{ width: 32, height: 32 }}
                                resizeMode="contain"
                            />
                            <View style={styles.dashedLine} />
                            <View style={[styles.dot, { backgroundColor: Colors.main }]} />
                        </View>

                        {/* Destination (Gros, Coloré) */}
                        <View style={{ alignItems: 'center' }}>
                            <BodyText text="VERS" style={{ color: Colors.lightGrey, fontSize: 10 }} />
                            <Title0 title={destinationCode} color={Colors.main} />
                        </View>
                    </View>

                    {/* Nom complet de la ville */}
                    <Title2
                        title={`CAP SUR ${destinationCity.toUpperCase()}`}
                        color={Colors.main}
                        style={{ marginTop: 10, letterSpacing: 2 }}
                    />

                </View>

            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Répartit le contenu Haut/Milieu/Bas
        alignItems: 'center',
        gap: 50,
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Zone Infos Vol
    flightInfoContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)', // Très léger fond
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 10,
    },
    flightPath: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        gap: 5
    },
    dashedLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.darkGrey,
        // Pour faire des pointillés simples, on peut utiliser borderStyle si c'était une vue avec bordure
        // Ici on fait simple ligne continue grise pour le style HUD
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.darkGrey,
    },

    // Footer
    footer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingBarContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    }
});
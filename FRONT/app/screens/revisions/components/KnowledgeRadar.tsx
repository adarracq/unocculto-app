import Colors from '@/app/constants/Colors';
import { getFlagImage } from '@/app/models/Countries';
import { RadarItem } from '@/app/services/user.service';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RADAR_SIZE = SCREEN_WIDTH - 80;
const CENTER = RADAR_SIZE / 2;
const BLIP_SIZE = 32;

interface Props {
    items: RadarItem[];
    isLoading?: boolean;
    mainColor: string;
}

// --- SOUS-COMPOSANT : BLIP (Drapeau) ---
const RadarBlip = ({ item, x, y }: { item: RadarItem, x: number, y: number }) => {
    // Animation de "Battement" (Pulse) si à réviser
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (item.isDue) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(scaleAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
                        Animated.timing(opacityAnim, { toValue: 0.8, duration: 600, useNativeDriver: true })
                    ]),
                    Animated.parallel([
                        Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true })
                    ])
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            scaleAnim.setValue(1);
            opacityAnim.setValue(1);
        }
    }, [item.isDue]);

    return (
        <Animated.View
            style={[
                styles.blipWrapper,
                {
                    left: x - (BLIP_SIZE / 2),
                    top: y - (BLIP_SIZE / 2),
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                    zIndex: item.isDue ? 50 : 10
                }
            ]}
        >
            <View style={[
                styles.flagContainer,
                item.isDue && styles.flagContainerDue
            ]}>
                <Image
                    source={getFlagImage(item.countryCode)}
                    style={styles.flagImage}
                    resizeMode="cover"
                />
            </View>
            {/* Dot de Notification */}
            {item.isDue && (
                <View style={styles.notificationDot} />
            )}
        </Animated.View>
    );
};

export default function KnowledgeRadar({ items, mainColor }: Props) {
    const scanAnim = useRef(new Animated.Value(0)).current;

    // Rotation infinie
    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(scanAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const spin = scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const calculatePosition = (item: RadarItem, index: number) => {
        const PAD = BLIP_SIZE / 2 + 5;
        const maxRadius = (RADAR_SIZE / 2) - PAD;
        const mastery = Math.max(0, Math.min(100, item.masteryLevel));
        const distance = ((100 - mastery) / 100) * maxRadius;

        // -90deg pour commencer à midi
        const angleDeg = (index * (360 / Math.max(1, items.length))) - 90;
        const angleRad = angleDeg * (Math.PI / 180);

        const x = CENTER + distance * Math.cos(angleRad);
        const y = CENTER + distance * Math.sin(angleRad);

        return { x, y };
    };

    return (
        <View style={styles.container}>
            {/* CERCLE PRINCIPAL */}
            <View style={styles.radarFrame}>

                {/* 1. Fond "Sonar" (Cercles concentriques) */}
                <View style={styles.gridContainer}>
                    <View style={[styles.ring, { width: '33%', height: '33%' }]} />
                    <View style={[styles.ring, { width: '66%', height: '66%' }]} />
                    <View style={[styles.ring, { width: '100%', height: '100%', borderColor: mainColor + '40' }]} />

                    <View style={styles.axisVertical} />
                    <View style={styles.axisHorizontal} />
                </View>

                {/* 2. Le Scanner Rotatif */}
                <Animated.View style={[styles.scannerLayer, { transform: [{ rotate: spin }] }]}>

                    {/* SECTEUR ANGULAIRE DE TRAÎNÉE
                        CORRECTION : On le place en HAUT À GAUCHE (left:0, top:0) 
                        pour qu'il soit "derrière" la ligne qui est au centre (aiguille de midi).
                        Rotation horaire => La gauche est le passé.
                    */}
                    <View style={styles.sweepSector}>
                        <LinearGradient
                            // Dégradé Horizontal : Transparent (Gauche) -> Vert (Droite/Centre)
                            colors={['transparent', mainColor + '50']}
                            start={{ x: 0, y: 1 }} // Coin Bas-Gauche (Loin)
                            end={{ x: 1, y: 1 }}   // Coin Bas-Droit (Près de la ligne)
                            style={styles.sweepGradient}
                        />
                    </View>

                    {/* La Ligne Brillante (Bord d'attaque) */}
                    <View style={[styles.laserLine, { backgroundColor: mainColor, shadowColor: mainColor }]} />
                </Animated.View>

                {/* 3. Point Central */}
                <View style={styles.centerDot} />

                {/* 4. Les Drapeaux */}
                {items.map((item, index) => {
                    const pos = calculatePosition(item, index);
                    return (
                        <RadarBlip
                            key={item.countryCode}
                            item={item}
                            x={pos.x}
                            y={pos.y}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },

    radarFrame: {
        width: RADAR_SIZE,
        height: RADAR_SIZE,
        borderRadius: RADAR_SIZE / 2,
        // CORRECTION COULEUR : Plus clair/transparent (Vert nuit militaire)
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },

    // Grille de fond
    gridContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    ring: {
        position: 'absolute',
        borderRadius: RADAR_SIZE,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    axisVertical: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' },
    axisHorizontal: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

    // Scanner
    scannerLayer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 5,
    },
    sweepSector: {
        position: 'absolute',
        top: 0,
        left: 0, // CORRECTION : Gauche (quart arrière)
        width: '50%',
        height: '50%',
        overflow: 'hidden',
        borderTopLeftRadius: RADAR_SIZE / 2, // CORRECTION : Arrondi coin haut-gauche
    },
    sweepGradient: { flex: 1 },
    laserLine: {
        position: 'absolute',
        top: 0,
        left: '50%', // Au centre horizontal
        width: 2,
        height: '50%', // Demi-hauteur
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
        // Petit décalage pour aligner parfaitement avec le dégradé
        transform: [{ translateX: -1 }]
    },

    centerDot: {
        position: 'absolute',
        top: '50%', left: '50%',
        width: 8, height: 8,
        marginLeft: -4, marginTop: -4,
        borderRadius: 4,
        backgroundColor: Colors.white,
        zIndex: 20,
    },

    blipWrapper: {
        position: 'absolute',
        width: BLIP_SIZE,
        height: BLIP_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flagContainer: {
        width: '100%',
        height: '75%',
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    flagContainerDue: {
        borderColor: Colors.red,
        borderWidth: 1.5,
        shadowColor: Colors.red,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    flagImage: { width: '100%', height: '100%' },

    notificationDot: {
        position: 'absolute',
        top: -2, right: -2,
        width: 10, height: 10,
        borderRadius: 5,
        backgroundColor: Colors.red,
        borderWidth: 1,
        borderColor: Colors.black,
        zIndex: 60,
    },

    legend: { marginTop: 15 }
});
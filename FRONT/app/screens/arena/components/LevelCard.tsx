import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';

interface Props {
    level: number;
    title: string;
    subTitle: string;
    color: string;
    isLocked: boolean;
    bestTime?: string;     // Ex: "00:15"
    bestAccuracy?: number; // Ex: 100
    onPress: () => void;
}

const LEVEL_COLORS: Record<number, string> = {
    1: Colors.bronze,
    2: Colors.silver,
    3: Colors.gold
};

export default function LevelCard({ level, title, subTitle, color, isLocked, bestTime, bestAccuracy, onPress }: Props) {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const activeColor = LEVEL_COLORS[level] || color;
    const roman = ['I', 'II', 'III', 'IV', 'V'][level - 1] || `${level}`;

    const handlePressIn = () => {
        isLocked ? functions.vibrate('small-error') : functions.vibrate('small-success');
        Animated.spring(scaleValue, { toValue: 0.98, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }], width: '100%', marginBottom: 12 }}>
            <Pressable
                onPress={isLocked ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLocked}
                style={styles.container}
            >
                <LinearGradient
                    colors={isLocked
                        ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                        : [activeColor + '20', 'rgba(0,0,0,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradient,
                        { borderColor: isLocked ? 'rgba(255,255,255,0.1)' : activeColor }
                    ]}
                >
                    {/* --- ICONE (Numéro ou Cadenas) --- */}
                    <View style={[styles.iconBox, { backgroundColor: isLocked ? '#222' : activeColor + '20' }]}>
                        {isLocked ? (
                            <Image
                                source={functions.getIconSource('lock')}
                                style={{ width: 16, height: 16, tintColor: Colors.darkGrey }}
                            />
                        ) : (
                            <BodyText text={roman} isBold color={activeColor} />
                        )}
                    </View>

                    {/* --- TEXTES & STATS --- */}
                    <View style={{ flex: 1 }}>
                        <View style={styles.headerRow}>
                            <Title2
                                title={title}
                                color={isLocked ? Colors.darkGrey : Colors.white}
                                style={{ fontSize: 18 }}
                            />
                            {!isLocked && (
                                <View style={[styles.badge, { backgroundColor: activeColor }]}>
                                    <BodyText
                                        text={subTitle}
                                        style={{ fontSize: 9, color: Colors.white, fontWeight: '900' }}
                                    />
                                </View>
                            )}
                        </View>

                        {/* --- LIGNE DE STATUT / RECORD --- */}
                        <View style={{ marginTop: 4 }}>
                            {isLocked ? (
                                <BodyText text="VERROUILLÉ" color={Colors.darkGrey} style={styles.statusText} />
                            ) : !bestTime ? (
                                <BodyText text="NON COMPLÉTÉ" color={Colors.lightGrey} style={styles.statusText} />
                            ) : (
                                // AFFICHE LES STATS AVEC ICONES
                                <View style={styles.statsRow}>
                                    <BodyText text='RECORD' color={Colors.lightGrey} style={styles.statText} />
                                    {/* Précision (Target) */}
                                    {bestAccuracy !== undefined && (
                                        <View style={styles.statTag}>
                                            <Image
                                                source={functions.getIconSource('target')}
                                                style={[styles.statIcon, { tintColor: Colors.lightGrey }]}
                                            />
                                            <BodyText text={`${bestAccuracy}%`} color={Colors.lightGrey} style={styles.statText} />
                                        </View>
                                    )}

                                    {/* Temps (Clock) */}
                                    <View style={styles.statTag}>
                                        <Image
                                            source={functions.getIconSource('clock')}
                                            style={[styles.statIcon, { tintColor: Colors.lightGrey }]}
                                        />
                                        <BodyText text={bestTime} color={Colors.lightGrey} style={styles.statText} />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* --- FLÈCHE --- */}
                    {!isLocked && (
                        <Image
                            source={functions.getIconSource('arrow-right')}
                            style={{ width: 14, height: 14, tintColor: activeColor }}
                        />
                    )}

                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },

    // Nouveaux Styles Stats
    statusText: {
        fontSize: 10,
        letterSpacing: 1,
        opacity: 0.7
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    statTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    statIcon: {
        width: 12,
        height: 12,
        opacity: 0.8
    },
    statText: {
        fontSize: 12,
        fontFamily: 'monospace' // Pour aligner les chiffres proprement
    }
});
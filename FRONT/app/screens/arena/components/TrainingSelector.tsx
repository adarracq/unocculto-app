import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';

interface SelectorProps {
    onSelect: (mode: 'country' | 'flag' | 'capital') => void;
}

export default function TrainingSelector({ onSelect }: SelectorProps) {
    return (
        <View style={styles.container}>
            <Title2 title="CENTRE D'ENTRAÎNEMENT" isLeft style={{ marginBottom: 15, marginLeft: 20 }} color={Colors.lightGrey} />

            <View style={styles.grid}>
                <TrainingCard
                    title="PAYS"
                    subtitle="Localisation"
                    icon="globe"
                    color={Colors.lightBlue}
                    onPress={() => onSelect('country')}
                />
                <TrainingCard
                    title="DRAPEAUX"
                    subtitle="Identification"
                    icon="flag"
                    color={Colors.lightRed}
                    onPress={() => onSelect('flag')}
                />
                <TrainingCard
                    title="CAPITALES"
                    subtitle="Connaissances"
                    icon="capital"
                    color={Colors.lightGreen}
                    onPress={() => onSelect('capital')}
                />
            </View>
        </View>
    );
}

// --- Sous-Composant Carte (Animé) ---
const TrainingCard = ({ title, subtitle, icon, color, onPress }: any) => {
    // --- Animation Logic ---
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        functions.vibrate('small-success');
        Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }], width: '100%' }}>
            <Pressable
                style={styles.card}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {/* Fond vitré */}
                <View style={[styles.glassBg, { borderColor: color + '40' }]} />

                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Image source={functions.getIconSource(icon)} style={[styles.icon, { tintColor: color }]} />
                </View>

                <View style={styles.textGroup}>
                    <BodyText text={title} isBold color={Colors.white} />
                    <BodyText text={subtitle} color={Colors.lightGrey} style={{ fontSize: 12 }} />
                </View>

                {/* Flèche subtile */}
                <Image source={functions.getIconSource('arrow-right')} style={{ width: 12, height: 12, tintColor: color }} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 30 },
    grid: { gap: 12, paddingHorizontal: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        paddingHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden', // Important pour que le glassBg ne dépasse pas
    },
    glassBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    icon: { width: 20, height: 20 },
    textGroup: { flex: 1, gap: 2 }
});
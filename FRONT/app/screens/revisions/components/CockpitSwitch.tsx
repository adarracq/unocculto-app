// app/components/atoms/CockpitSwitch.tsx
import SmallText from '@/app/components/atoms/SmallText';
import Colors from '@/app/constants/Colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface Props {
    label: string;
    value: boolean;
    onToggle: (val: boolean) => void;
}

export default function CockpitSwitch({ label, value, onToggle }: Props) {
    const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [value]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // CLAC mécanique
        onToggle(!value);
    };

    // Interpolations
    const translateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, -2] // Léger mouvement vertical du levier
    });

    const ledOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1]
    });

    return (
        <View style={styles.container}>
            {/* LED Status */}
            <Animated.View style={[styles.led, { opacity: ledOpacity, backgroundColor: value ? Colors.green : '#333' }]} />

            <SmallText text={label} style={{ marginBottom: 8, fontSize: 10, opacity: 0.7 }} />

            <Pressable onPress={handlePress} style={styles.switchHousing}>
                <View style={styles.groove} />

                {/* Le Levier Physique */}
                <Animated.View style={[
                    styles.lever,
                    {
                        transform: [{ translateY }],
                        backgroundColor: value ? '#E0E0E0' : '#888'
                    }
                ]}>
                    <LinearGradient
                        colors={value ? ['#FFF', '#CCC'] : ['#999', '#666']}
                        style={{ flex: 1, borderRadius: 4 }}
                    />
                </Animated.View>
            </Pressable>

            <SmallText text={value ? "ON" : "OFF"} style={{ marginTop: 5, fontSize: 8, color: value ? Colors.main : '#555' }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginHorizontal: 10 },
    led: { width: 8, height: 8, borderRadius: 4, marginBottom: 5, shadowColor: Colors.green, shadowOpacity: 0.8, shadowRadius: 5 },
    switchHousing: {
        width: 40, height: 70,
        backgroundColor: '#1a1a1a',
        borderRadius: 4,
        borderWidth: 1, borderColor: '#333',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2
    },
    groove: {
        position: 'absolute', width: 6, height: 50,
        backgroundColor: '#000', borderRadius: 3
    },
    lever: {
        width: 30, height: 30,
        borderRadius: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5
    }
});
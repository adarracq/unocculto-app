import SmallText from '@/app/components/atoms/SmallText';
import Colors from '@/app/constants/Colors';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface Props {
    label: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    mainColor: string;
}

export default function CockpitSwitch({ label, value, onToggle, mainColor }: Props) {
    const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }, [value]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle(!value);
    };

    // --- INTERPOLATIONS ---
    const backgroundColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.02)', mainColor + '15'] // Très subtil
    });

    const borderColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.05)', mainColor + '60']
    });

    const diodeOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 1]
    });

    const diodeColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.darkGrey, mainColor]
    });

    return (
        <Pressable onPress={handlePress} style={styles.touchable}>
            <Animated.View style={[
                styles.container,
                { backgroundColor, borderColor }
            ]}>

                {/* LABEL (Gauche) */}
                <View style={styles.labelContainer}>
                    <SmallText
                        text={label}
                        style={{
                            color: value ? Colors.white : Colors.darkGrey,
                            fontSize: 10,
                            fontWeight: value ? 'bold' : 'normal',
                            letterSpacing: 0.5
                        }}
                    />
                </View>

                {/* INDICATEUR (Droite) */}
                <Animated.View style={[
                    styles.indicatorLine,
                    {
                        backgroundColor: diodeColor,
                        opacity: diodeOpacity,
                        shadowColor: mainColor,
                        shadowOpacity: value ? 0.8 : 0,
                        shadowRadius: 4
                    }
                ]} />

            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    touchable: {
        width: '100%',
        marginBottom: 6, // Espace vertical réduit
    },
    container: {
        height: 32, // Hauteur réduite (Compact)
        borderRadius: 4,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    labelContainer: {
        flex: 1,
    },
    indicatorLine: {
        width: 20,
        height: 3,
        borderRadius: 1.5,
    }
});
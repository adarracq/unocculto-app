import SmallText from '@/app/components/atoms/SmallText';
import Colors from '@/app/constants/Colors';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface Props {
    label: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    compact?: boolean;
}

export default function CockpitSwitch({ label, value, onToggle }: Props) {
    // 0 = OFF, 1 = ON
    const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: value ? 1 : 0,
            duration: 200, // Un peu plus lent pour sentir le glissement
            useNativeDriver: false // 'false' car on anime des couleurs parfois
        }).start();
    }, [value]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onToggle(!value);
    };

    // --- INTERPOLATIONS ---

    // 1. Mouvement du curseur (Carré)
    const translateX = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 18] // Déplacement de gauche (2px) à droite (18px)
    });

    // 2. Couleur du curseur (Gris sombre -> Blanc/Orange)
    const thumbColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.darkGrey, Colors.white]
    });

    // 3. Couleur de la piste (Track) (Transparent -> Orange sombre)
    const trackBorderColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.1)', Colors.main]
    });

    // 4. Lueur de fond globale
    const containerBorderColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.05)', Colors.main + '55']
    });

    return (
        <Pressable onPress={handlePress} style={styles.touchable}>
            <Animated.View style={[
                styles.container,
                { borderColor: containerBorderColor }
            ]}>

                {/* PARTIE GAUCHE : LABEL */}
                <View style={styles.labelContainer}>
                    <SmallText
                        text={label}
                        style={{
                            color: value ? Colors.white : Colors.darkGrey,
                            fontSize: 9,
                            fontWeight: '700',
                            letterSpacing: 0.5
                        }}
                    />
                </View>

                {/* PARTIE DROITE : LE SWITCH PHYSIQUE */}
                <Animated.View style={[
                    styles.switchTrack,
                    { borderColor: trackBorderColor, backgroundColor: value ? Colors.main + '40' : 'rgba(0,0,0,0.3)' }
                ]}>
                    <Animated.View style={[
                        styles.switchThumb,
                        {
                            transform: [{ translateX }],
                            backgroundColor: thumbColor,
                            // Petite ombre pour le relief
                            shadowColor: value ? Colors.white : '#000',
                            shadowOpacity: value ? 0.5 : 0,
                            shadowRadius: 4
                        }
                    ]} />
                </Animated.View>

            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    touchable: {
        flex: 1,
        minWidth: '45%',
    },
    container: {
        height: 38,
        backgroundColor: 'rgba(255,255,255,0.02)', // Fond très subtil
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },

    labelContainer: {
        flex: 1,
        marginRight: 8,
    },

    // La "Piste" du switch
    switchTrack: {
        width: 36,
        height: 20,
        borderRadius: 4, // Coins légèrement arrondis mais tech
        borderWidth: 1,
        justifyContent: 'center', // Centrer verticalement le thumb
    },

    // Le "Bouton" qui bouge
    switchThumb: {
        width: 14,
        height: 14,
        borderRadius: 2, // Carré arrondi
    }
});
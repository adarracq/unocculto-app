import SmallText from '@/app/components/atoms/SmallText';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type TabBarElementProps = {
    focused: boolean;
    name: string;
    nbNotifications?: number;
    mainColor?: string;
}

export default function TabBarElement({ focused, name, nbNotifications, mainColor }: TabBarElementProps) {
    const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(animValue, {
            toValue: focused ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 60
        }).start();
    }, [focused]);

    // Interpolations
    // On bouge un peu l'icône vers le haut quand c'est actif pour laisser place au point
    const translateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4]
    });

    // Léger zoom
    const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1]
    });

    const color = mainColor || Colors.main;

    return (
        <View style={styles.container}>

            {/* ICÔNE */}
            <Animated.Image
                source={functions.getIconSource(name)}
                style={{
                    width: 28, // Taille raisonnable
                    height: 28,
                    // Si actif: Orange (Main), Sinon: Gris clair (pas blanc pur pour contraste)
                    tintColor: focused ? color : '#888',
                    transform: [{ translateY }, { scale }]
                }}
                resizeMode="contain"
            />

            {/* POINT LUMINEUX (Juste en dessous) */}
            <Animated.View style={[
                styles.dot,
                {
                    opacity: animValue, // Invisible si pas focus
                    transform: [{ scale: animValue }], // Grossit en apparaissant
                    backgroundColor: color,
                    shadowColor: color,
                }
            ]} />

            {/* BADGE NOTIF */}
            {nbNotifications && nbNotifications > 0 ? (
                <View style={styles.badge}>
                    <SmallText
                        text={nbNotifications > 9 ? '9+' : nbNotifications.toString()}
                        color={Colors.white}
                        style={{ fontSize: 9, fontWeight: 'bold' }}
                    />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: 60,
    },
    dot: {
        position: 'absolute',
        bottom: 8, // Calé en bas du conteneur
        width: 5,
        height: 5,
        borderRadius: 2.5,
        // Petit effet néon
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.red,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#111', // Match le fond noir de la barre
    }
});
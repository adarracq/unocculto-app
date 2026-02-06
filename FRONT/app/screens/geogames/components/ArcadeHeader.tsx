import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
    currentStep: number;
    totalSteps: number;
    errors: number;
    elapsedTime: number;
}

export default function ArcadeHeader({ currentStep, totalSteps, errors, elapsedTime }: Props) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.header}>
            <View style={styles.badge}>
                <BodyText text={`${currentStep} / ${totalSteps}`} color={Colors.white} size="XS" />
            </View>

            <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={16} color={Colors.main} />
                <BodyText text={formatTime(elapsedTime)} color={Colors.main} size="S" style={{ fontWeight: 'bold' }} />
            </View>

            <View style={[styles.badge, { borderColor: errors > 0 ? Colors.red : 'rgba(255,255,255,0.2)' }]}>
                <BodyText text={`${errors} Erreur${errors > 1 ? 's' : ''}`} color={errors > 0 ? Colors.red : Colors.disabled} size="XS" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        zIndex: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderColor: 'rgba(255,255,255,0.2)'
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 1,
        borderColor: Colors.main
    }
});
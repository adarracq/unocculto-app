import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    mode: 'CARGO' | 'LOGBOOK';
    setMode: (mode: 'CARGO' | 'LOGBOOK') => void;
}

export default function MuseumHeader({ mode, setMode }: Props) {
    return (
        <View style={styles.header}>
            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={[styles.switchBtn, mode === 'CARGO' && styles.switchBtnActive]}
                    onPress={() => setMode('CARGO')}
                >
                    <BodyText text="CARGO" isBold color={mode === 'CARGO' ? Colors.white : Colors.lightGrey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.switchBtn, mode === 'LOGBOOK' && styles.switchBtnActive]}
                    onPress={() => setMode('LOGBOOK')}
                >
                    <BodyText text="LOGBOOK" isBold color={mode === 'LOGBOOK' ? Colors.white : Colors.lightGrey} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { alignItems: 'center', marginBottom: 20 },
    switchContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 25,
        padding: 4,
    },
    switchBtn: {
        paddingVertical: 8, paddingHorizontal: 24,
        borderRadius: 20,
    },
    switchBtnActive: {
        backgroundColor: Colors.main,
    },
});
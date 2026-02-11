import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    mode: 'MUSÉE' | 'LOGBOOK';
    setMode: (mode: 'MUSÉE' | 'LOGBOOK') => void;
    mainColor: string;
}

export default function MuseumHeader({ mode, setMode, mainColor }: Props) {
    return (
        <View style={styles.header}>
            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={[styles.switchBtn, mode === 'MUSÉE' && { backgroundColor: Colors.white }]}
                    onPress={() => setMode('MUSÉE')}
                >
                    <BodyText text="MUSÉE" isBold color={mode === 'MUSÉE' ? mainColor : Colors.lightGrey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.switchBtn, mode === 'LOGBOOK' && { backgroundColor: Colors.white }]}
                    onPress={() => setMode('LOGBOOK')}
                >
                    <BodyText text="LOGBOOK" isBold color={mode === 'LOGBOOK' ? mainColor : Colors.lightGrey} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 20
    },
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
});
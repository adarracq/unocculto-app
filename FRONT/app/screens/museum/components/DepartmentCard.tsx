import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface Props {
    title: string;
    icon: string;
    color: string;
    ownedCount: number;
    totalCount: number;
    onPress: () => void;
}

export default function DepartmentCard({ title, icon, color, ownedCount, totalCount, onPress }: Props) {
    const progress = totalCount > 0 ? ownedCount / totalCount : 0;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* Header Carte */}
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Image
                        source={functions.getIconSource(icon)}
                        style={{ width: 24, height: 24, tintColor: color }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Title1 title={title} isLeft style={{ fontSize: 16 }} />
                    <BodyText text={`${ownedCount} / ${totalCount} DÉCOUVERTES`} size="S" color={Colors.lightGrey} />
                </View>
                <Image source={functions.getIconSource('arrow-right')} style={{ width: 16, height: 16, tintColor: Colors.lightGrey }} />
            </View>

            {/* Barre de progression */}
            <View style={styles.progressContainer}>
                <Progress.Bar
                    progress={progress}
                    width={null}
                    height={4}
                    color={color}
                    unfilledColor={'rgba(255,255,255,0.1)'}
                    borderWidth={0}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 12
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    progressContainer: { width: '100%' }
});
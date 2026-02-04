import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface Props {
    label: string;
    count: number;
    total: number;
    icon: string;
    color: string;
    onPress: () => void;
    isSelected?: boolean;
}

export default function CategoryGauge({ label, count, total, icon, color, onPress, isSelected }: Props) {
    const progress = total > 0 ? count / total : 0;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <View style={styles.circleWrapper}>
                <Progress.Circle
                    size={80}
                    progress={progress}
                    color={color}
                    unfilledColor={Colors.darkGrey}
                    borderWidth={0}
                    thickness={6}
                    strokeCap="round"
                />
                <View style={[styles.innerCircle, isSelected && { backgroundColor: color + '20' }]}>
                    <Image
                        source={functions.getIconSource(icon)}
                        style={{ width: 32, height: 32, tintColor: isSelected ? color : Colors.lightGrey }}
                    />
                </View>
            </View>

            <View style={styles.textContainer}>
                <BodyText text={label} size="S" isBold color={isSelected ? color : Colors.white} />
                <BodyText text={`${count}/${total}`} size="S" color={Colors.darkGrey} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', gap: 10, width: 100 },
    circleWrapper: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
    innerCircle: {
        position: 'absolute',
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center',
    },
    textContainer: { alignItems: 'center' }
});
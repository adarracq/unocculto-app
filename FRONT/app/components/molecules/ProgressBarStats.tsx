import Colors from '@/app/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import * as Progress from 'react-native-progress';
import Title1 from '../atoms/Title1';
import Title2 from '../atoms/Title2';

type Props = {
    current: number;
    total: number;
    label: string; // Ex: "Pays explorés"
    width: number;
}

export default function ProgressBarStats({ current, total, label, width }: Props) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Petite animation quand le score change
    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
        ]).start();
    }, [current]);

    const progress = total > 0 ? current / total : 0;

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: width,
                alignItems: 'flex-end'
            }}>
                <Title1 title={label} color={Colors.white} style={{ fontSize: 16 }} />

                <Animated.View style={{ flexDirection: 'row', alignItems: 'flex-end', transform: [{ scale: scaleAnim }] }}>
                    <Title1 title={current.toString()} color={Colors.main} />
                    <Title2 title={' / ' + total} color={Colors.darkGrey} style={{ fontSize: 14 }} />
                </Animated.View>
            </View>

            <Progress.Bar
                progress={progress}
                width={width}
                height={8}
                color={Colors.main}
                unfilledColor={'rgba(255,255,255,0.1)'}
                borderWidth={0}
                borderRadius={4}
                useNativeDriver={true}
            />
        </View>
    )
}
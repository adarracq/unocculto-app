import Colors from '@/app/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

type Props = {
    color?: string;
}

export default function GlowTopGradient({ color }: Props) {
    return (
        <LinearGradient
            colors={[color ? color + '60' : Colors.main + '60', 'transparent']} // Glow orange en haut
            style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 150,
                opacity: 0.6
            }}
        />
    )
}
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Image, TouchableOpacity, Vibration } from 'react-native';

type Props = {
    onPress: () => void;
    top?: number;
    left?: number;
}
export default function BackArrow(props: Props) {

    return (
        <TouchableOpacity onPress={() => {
            Vibration.vibrate(10)
            props.onPress()
        }} style={{ position: 'absolute', top: props.top ?? 0, left: props.left ?? 0, zIndex: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
            <Image source={functions.getIconSource('arrow-left')} style={{ width: 20, height: 20, tintColor: Colors.white }} />
        </TouchableOpacity>
    )
}
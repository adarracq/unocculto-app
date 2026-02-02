import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function LoadingScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 999
        }}>
            <LottieView
                source={require('@/app/assets/lotties/loading_plane.json')}
                autoPlay
                loop
                style={{
                    width: 300,
                    height: 300
                }}
            />
        </View>
    )
}
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function LoadingScreen() {
    const insets = useSafeAreaInsets();
    return (
        <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999
            }}>
            <LottieView
                source={require('@/app/assets/lotties/loading_plane.json')}
                autoPlay
                loop
                style={{
                    width: 150,
                    height: 150
                }}
            />
        </LinearGradient>
    )
}
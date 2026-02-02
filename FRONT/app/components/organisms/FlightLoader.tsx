import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet } from 'react-native';
import BodyText from '../atoms/BodyText';
import GlowTopGradient from '../molecules/GlowTopGradient';

interface Props {
    visible: boolean;
    onAnimationFinish?: () => void; // Appelé quand l'anim est finie
}

export default function FlightLoader({ visible, onAnimationFinish }: Props) {
    const animation = useRef<LottieView>(null);

    useEffect(() => {
        if (visible) {
            animation.current?.play();
        } else {
            animation.current?.reset();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <LinearGradient
                colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
                <GlowTopGradient />
                <LottieView
                    ref={animation}
                    source={require('@/app/assets/lotties/takeoff.json')}
                    style={{ width: 300, height: 300 }}
                    autoPlay
                    loop={false}
                    onAnimationFinish={onAnimationFinish}
                />
                <Title1 title="Décollage en cours..." color={Colors.white} style={{ marginTop: 20 }} />
                <BodyText text="Attachez vos ceintures et écoutez les consignes de sécurité." color={Colors.lightGrey} style={{ marginTop: 10 }} />
            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.main,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    }
});
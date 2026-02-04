import BodyText from '@/app/components/atoms/BodyText';
import Title0 from '@/app/components/atoms/Title0';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import Colors from '@/app/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';



export default function HomeArenaScreen({ navigation }: any) {


    return (
        <LinearGradient colors={[Colors.black, Colors.realBlack]} style={styles.container}>
            <GlowTopGradient color={Colors.main} />

            <View style={styles.header}>
                <Title0 title="Arène" color={Colors.white} isLeft />
                <BodyText
                    text="AFFRONTEZ VOS ADVERSAIRES"
                    size="S"
                    color={Colors.main}
                    style={{ letterSpacing: 2 }}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 60, paddingHorizontal: 20 },
    header: { marginBottom: 20, gap: 10 },
});
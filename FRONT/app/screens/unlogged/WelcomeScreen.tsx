import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import Colors from '@/app/constants/Colors';
import { NavParams } from '@/app/navigations/UnloggedNav';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';


type Props = NativeStackScreenProps<NavParams, 'Welcome'>;

export default function WelcomeScreen({ navigation, route }: Props) {


    return (
        <LinearGradient
            colors={[Colors.darkGrey, Colors.black]}
            style={{ flex: 1 }}>
            <GlowTopGradient />
            <View style={styles.container}>
                <Title0 title="Unocculto" color={Colors.white} style={{ fontSize: 40 }} />
                <Image source={require('../../assets/images/world.png')}
                    style={{
                        maxWidth: Dimensions.get('window').width - 100,
                        maxHeight: Dimensions.get('window').height / 4,
                        resizeMode: 'contain',
                    }}
                />
                <BodyText text="Voyage, Apprends, Collectionne." color={Colors.white} isItalic />
                <View style={styles.buttonContainer}>
                    <MyButton
                        title="Commencer votre Voyage"
                        onPress={() => {
                            navigation.navigate('OnBoarding');
                        }}
                        rightIcon="arrow-right"
                        variant='glass'
                        bump
                    />
                    <MyButton
                        title="Déjà explorateur ? Se connecter"
                        onPress={() => {
                            navigation.navigate('Login', {});
                        }}
                        rightIcon="arrow-right"
                        variant='outline'
                    />
                </View>
            </View>

        </LinearGradient >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 110,
        paddingBottom: 50,
        paddingHorizontal: 20
    },
    topContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    },
});
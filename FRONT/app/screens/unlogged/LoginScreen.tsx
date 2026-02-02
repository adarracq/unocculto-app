import MyButton from '@/app/components/atoms/MyButton'
import SmallText from '@/app/components/atoms/SmallText'
import Title0 from '@/app/components/atoms/Title0'
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient'
import Colors from '@/app/constants/Colors'
import { NavParams } from '@/app/navigations/UnloggedNav'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types'

type Props = NativeStackScreenProps<NavParams, 'Login'>;
export default function LoginScreen({ navigation, route }: Props) {


    function loginWithEmail() {
        navigation.navigate('EmailInput', { country: route.params.country });
    }
    return (
        <LinearGradient
            colors={[Colors.darkGrey, Colors.black]}
            style={styles.container}>
            <GlowTopGradient />
            <View style={{ gap: 20 }}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/logo_white_filled.png')}
                        style={styles.logo}
                    />
                </View>
                <Title0 title='Embarquez pour votre voyage à travers le savoir'
                    color={Colors.white} isLeft style={{ paddingRight: 80 }} />
            </View>
            <View style={{ gap: 20 }}>
                <MyButton title="Continuer avec votre e-mail"
                    leftIcon='mail'
                    rightIcon='arrow-right'
                    variant='glass'
                    bump
                    onPress={loginWithEmail} />
            </View>
            <TouchableOpacity>
                <SmallText text="Si vous créez un nouveau compte, les conditions générales et la politique de confidentialité s'appliqueront."
                    color={Colors.white} isItalic />
            </TouchableOpacity>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.main,
        padding: 20,
        paddingVertical: 60,
        justifyContent: 'space-between'
    },
    logoContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 16,
        borderCurve: 'continuous',
    },
    logo: {
        width: 50,
        height: 50,
    }
})
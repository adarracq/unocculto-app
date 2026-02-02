import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import Colors from '@/app/constants/Colors';
import { NavParams } from '@/app/navigations/UnloggedNav';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

const slides = [
    {
        key: 1,
        title: "Explorez l'Inconnu",
        text: "Chaque jour, l'avion vous dépose dans un nouveau pays.\nDécouvrez ses secrets, de son histoire à sa géographie.",
        image: require('../../assets/images/onboarding/1.png'),
        icon: 'airplane-takeoff', // Icon library (ex: MaterialCommunityIcons)
        iconText: 'VOYAGE'
    },
    {
        key: 2,
        title: 'Jouez pour Apprendre',
        text: 'Oubliez les cours magistraux.\nMini-jeux, stories et quiz pour ancrer le savoir sans effort.',
        image: require('../../assets/images/onboarding/2.png'),
        icon: 'gamepad',
        iconText: 'LUDIQUE'
    },
    {
        key: 3,
        title: 'Remplissez le Musée',
        text: 'Collectionnez des artefacts rares et bâtissez votre propre cabinet de curiosités.',
        image: require('../../assets/images/onboarding/museum.png'),
        icon: 'museum', // ou 'bank' pour musée
        iconText: 'COLLECTION'
    }
];

type Props = NativeStackScreenProps<NavParams, 'OnBoarding'>;

export default function OnBoardingScreen({ navigation, route }: Props) {



    const renderItem = ({ item }: { item: { key: number; title: string; text: string; image: any; icon: string; iconText: string } }) => {
        return (
            <View
                style={styles.container}>
                <Title0 title="Unocculto" color={Colors.white} style={{ fontSize: 40 }} />
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 50,
                    paddingBottom: 50
                }}>

                    <Image source={item.image}
                        style={{
                            maxWidth: Dimensions.get('window').width - 100,
                            maxHeight: Dimensions.get('window').height / 4,
                            resizeMode: 'contain',
                        }}
                    />
                    <View style={{ gap: 16, alignItems: 'center' }}>

                        <View style={{
                            backgroundColor: Colors.white,
                            borderRadius: 16,
                            borderCurve: 'continuous',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 6
                        }}>
                            <Image source={functions.getIconSource(item.icon)}
                                style={{
                                    width: 20,
                                    height: 20,
                                    tintColor: Colors.mainDark,
                                }} />

                            <BodyText text={item.iconText}
                                color={Colors.mainDark} isBold />
                        </View>
                        <Title0 title={item.title} color={Colors.white} />
                        <BodyText text={item.text} color={Colors.white} centered />
                    </View>
                </View>
            </View>
        );
    };

    const renderNextButton = () => {
        return (
            <View style={{
                width: 70,
                height: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 16,
                borderCurve: 'continuous',
            }}>
                <Image source={require('../../assets/icons/arrow-right.png')} style={{ width: 30, resizeMode: 'contain', }} />
            </View>
        );
    };

    const renderDoneButton = () => {
        return (
            <MyButton
                title="Choisir ma première destination"
                onPress={() => {
                    navigation.navigate('SelectStartCountry');
                }}
                style={{ marginTop: 50 }}
                variant='glass'
                rightIcon="arrow-right"
                bump
            />
        )
    }

    return (
        <LinearGradient
            colors={[Colors.darkGrey, Colors.black]}
            style={{ paddingBottom: 100, flex: 1 }}>
            <GlowTopGradient />
            <AppIntroSlider
                renderItem={renderItem}
                data={slides}
                renderNextButton={renderNextButton}
                renderDoneButton={renderDoneButton}
                activeDotStyle={{
                    backgroundColor: Colors.white,
                    width: 30
                }}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 70,
        paddingHorizontal: 20
    }
});
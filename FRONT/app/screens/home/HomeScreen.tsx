import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import FlightLoader from '@/app/components/organisms/FlightLoader';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { storyService } from '@/app/services/story.service';
import { userService } from '@/app/services/user.service';
import { functions } from '@/app/utils/Functions';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import BoardingPass from './components/BoardingPass';
import ProfileHeader from './components/ProfileHeader';

type Props = NativeStackScreenProps<HomeNavParams, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);
    const isFocused = useIsFocused();
    const [isTakingOff, setIsTakingOff] = useState(false);
    const [showBoardingModal, setShowBoardingModal] = useState(false);

    // --- API 1: USER DATA ---
    const userApi = useApi(
        () => userService.getByEmail(userContext.email),
        'HomeScreen - GetUser'
    );

    // --- API 2: CURRENT STORY ---
    const storyApi = useApi(
        (storyId: string) => storyService.getById(storyId),
        'HomeScreen - GetCurrentStory'
    );

    const { execute: updateUserFlag } = useApi(
        (userData: any) => userService.update(userData),
        'HomeScreen - updateUser'
    );

    // --- EFFETS ---
    useEffect(() => {
        if (userContext?.email) userApi.execute();
    }, [isFocused]);

    useEffect(() => {
        if (userApi.data?.currentStoryId) {
            storyApi.execute(userApi.data.currentStoryId);
        }
    }, [userApi.data?.currentStoryId]);

    // --- HANDLERS ---
    const handleChangeFlag = async (newFlagCode: string) => {
        if (!userApi.data) return;
        const updatedUser = { ...userApi.data, selectedFlag: newFlagCode };
        const result = await updateUserFlag({ user: updatedUser });
        if (result) {
            setUserContext({ ...userContext, selectedFlag: newFlagCode });
        }
    };

    const handleBoardingPress = () => {
        if (!userApi.data || !storyApi.data) return;

        const destinationCountry = ALL_COUNTRIES.find(c => c.code === storyApi.data!.countryCode);
        const city = storyApi.data.city;

        setShowBoardingModal(true);
    };

    const confirmLaunch = () => {
        setShowBoardingModal(false);
        Vibration.vibrate([0, 50, 100, 50]);
        setIsTakingOff(true);
    };

    const onTransitionFinished = () => {
        setIsTakingOff(false);
        if (storyApi.data) {
            const destinationCountry = ALL_COUNTRIES.find(c => c.code === storyApi.data!.countryCode);
            if (destinationCountry) {
                navigation.navigate('StoryGame', {
                    story: storyApi.data,
                    country: destinationCountry
                });
            }
        }
    };

    // --- LOGIQUE ORIGINE (LAST TRIP) ---
    const getLastTripInfo = () => {
        if (!userApi.data?.passport) return null;

        // 1. Convertir le Passport (Objet/Map) en tableau
        const entries = Object.entries(userApi.data.passport);

        // 2. S'il est vide (Nouveau joueur), pas de dernier voyage
        if (entries.length === 0) return null;

        // 3. Trier par date de visite décroissante (Le plus récent en premier)
        // entry[1] contient { lastVisitedAt: string, ... }
        entries.sort((a, b) => {
            const dateA = new Date((a[1] as any).lastVisitedAt).getTime();
            const dateB = new Date((b[1] as any).lastVisitedAt).getTime();
            return dateB - dateA;
        });

        // 4. Prendre le premier (le plus récent)
        const lastEntry = entries[0]; // [codePays, data]
        const countryCode = lastEntry[0];

        // 5. Retrouver les infos du pays
        const country = ALL_COUNTRIES.find(c => c.code === countryCode);

        return {
            city: country?.capital || 'Inconnu', // On utilise la capitale par défaut comme origine
            countryCode: countryCode
        };
    };

    // --- RENDER ---

    if (!userApi.data || userApi.loading) {
        return <LoadingScreen />;
    }

    const lastTrip = getLastTripInfo();
    const destinationStory = storyApi.data;
    const destinationCountry = destinationStory
        ? ALL_COUNTRIES.find(c => c.code === destinationStory.countryCode)
        : null;


    return (
        <LinearGradient colors={[Colors.black, '#121212']} style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                <ProfileHeader user={userApi.data} onChangeFlag={handleChangeFlag} />

                <View style={styles.content}>

                    {!storyApi.loading && destinationStory && destinationCountry ? (
                        <BoardingPass
                            pseudo={userApi.data.pseudo}
                            // DESTINATION
                            color={destinationCountry.mainColor}
                            countryCode={destinationCountry.code}
                            city={destinationStory.city}
                            // ORIGINE (Calculée via Passport)
                            originCity={lastTrip?.city}
                            originCountryCode={lastTrip?.countryCode}

                            onPress={handleBoardingPress}
                        />
                    ) : (
                        // Placeholder si pas de destination choisie
                        !storyApi.loading && !userApi.data.currentStoryId && (
                            <MyButton
                                title="Choisir une destination"
                                onPress={() => navigation.navigate('SelectDestination')}
                                variant="glass"
                            />
                        )
                    )}

                </View>
            </ScrollView>

            {/* --- MODAL D'EMBARQUEMENT --- */}
            {storyApi.data && (
                <CustomModal
                    visible={showBoardingModal}
                    title="EMBARQUEMENT"
                    confirmText="Décoller"
                    color={destinationCountry?.mainColor || Colors.main}
                    onConfirm={confirmLaunch}
                    cancelText="Attendre"
                    onCancel={() => setShowBoardingModal(false)}
                >
                    {/* CONTENU RICHE */}
                    <View style={{ gap: 8 }}>
                        <BodyText text="Destination :" style={{ color: Colors.lightGrey }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 20 }}>
                            <Title0
                                title={storyApi.data.city.toUpperCase()}
                                color={Colors.white}
                            />
                            {/* Petit drapeau à côté du nom */}
                            <Image
                                source={getFlagImage(destinationCountry?.code || '')}
                                style={{ width: 40, height: 25, borderRadius: 4 }}
                                resizeMode="cover"
                            />
                        </View>
                        <BodyText text="Coût du billet :" style={{ color: Colors.lightGrey }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 20 }}>

                            <Image
                                source={functions.getIconSource('lightning')}
                                style={{ width: 26, height: 26, }}
                            />
                            <Title0 title="10" style={{ color: '#FFD700' }} />
                        </View>
                    </View>
                </CustomModal>
            )}
            <FlightLoader
                visible={isTakingOff}
                onAnimationFinish={onTransitionFinished}
                color={destinationCountry?.mainColor || Colors.main}
                // INFOS DYNAMIQUES
                originCity={lastTrip?.city || "Maison"} // D'où on vient
                destinationCity={storyApi.data?.city || "Destination"} // Où on va
                destinationCode={destinationCountry?.code || "??"} // Code pays (ex: JP)
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, marginTop: 20, gap: 10 }
});
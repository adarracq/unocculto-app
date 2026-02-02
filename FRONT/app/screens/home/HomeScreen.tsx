import MyButton from '@/app/components/atoms/MyButton';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import FlightLoader from '@/app/components/organisms/FlightLoader';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { ALL_COUNTRIES } from '@/app/models/Countries';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { storyService } from '@/app/services/story.service';
import { userService } from '@/app/services/user.service';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import BoardingPass from './components/BoardingPass';
import ProfileHeader from './components/ProfileHeader';

type Props = NativeStackScreenProps<HomeNavParams, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);
    const isFocused = useIsFocused();
    const [isTakingOff, setIsTakingOff] = useState(false);

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

        Alert.alert(
            "Embarquement immédiat",
            `Confirmez-vous le départ pour ${city} (${destinationCountry?.name_fr}) ?\n\nCoût : 1 Énergie ⚡`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "DÉCOLLER ✈️",
                    onPress: launchFlightSequence,
                    style: 'default'
                }
            ]
        );
    };

    const launchFlightSequence = () => {
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

            <FlightLoader visible={isTakingOff} onAnimationFinish={onTransitionFinished} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, marginTop: 20, gap: 10 }
});
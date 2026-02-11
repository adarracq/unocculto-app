import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import DayStreakModal from '@/app/components/organisms/DayStreakModal';
import FlightLoader from '@/app/components/organisms/FlightLoader';
import SubscriptionModal from '@/app/components/organisms/SubscriptionModal';
import Colors from '@/app/constants/Colors';
import { ThemeContext } from '@/app/contexts/ThemeContext';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { storyService } from '@/app/services/story.service';
import { userService } from '@/app/services/user.service';
import { functions } from '@/app/utils/Functions';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import BoardingPass from './components/BoardingPass';
import HomeSkeleton from './components/HomeSkeleton'; // Assure-toi d'avoir créé ce fichier ou retire l'import si tu ne l'as pas encore
import ProfileHeader from './components/ProfileHeader';

type Props = NativeStackScreenProps<HomeNavParams, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);
    const [themeContext, setThemeContext] = useContext(ThemeContext);
    const isFocused = useIsFocused();
    const [isTakingOff, setIsTakingOff] = useState(false);
    const [showBoardingModal, setShowBoardingModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumReason, setPremiumReason] = useState<'fuel' | 'story' | 'none'>('none');
    const [showStreakModal, setShowStreakModal] = useState(false);

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

    // --- 0. SOURCE DE VÉRITÉ ---
    // On utilise les données fraîches si dispos, sinon le cache du contexte
    const userData = userApi.data || userContext;
    const prevStreak = useRef<number>(userData?.dayStreak || 0);

    // --- EFFETS ---
    useEffect(() => {
        setIsTakingOff(false);
        if (userContext?.email && isFocused) {
            userApi.execute();
        }
    }, [isFocused]);

    useEffect(() => {
        // Mise à jour du thème
        if (userData?.selectedFlag) {
            let themeColor = ALL_COUNTRIES.find(c => c.code === userData.selectedFlag)?.mainColor;
            setThemeContext({ ...themeContext, mainColor: themeColor || Colors.main });
        }

        // Chargement de la story si un ID est présent dans les data (API ou Cache)
        if (userData?.currentStoryId) {
            // Petite opti : on ne recharge pas si on a déjà la bonne story
            if (storyApi.data?.storyId !== userData.currentStoryId) {
                storyApi.execute(userData.currentStoryId);
            }
        }
    }, [userData?.selectedFlag, userData?.currentStoryId]);

    // --- HANDLERS ---
    const handleChangeFlag = async (newFlagCode: string) => {
        if (!userData) return;
        // On modifie localement tout de suite pour la fluidité
        const updatedUser = { ...userData, selectedFlag: newFlagCode };

        // Optimistic UI Update
        setUserContext({ ...userContext, selectedFlag: newFlagCode });
        let themeColor = ALL_COUNTRIES.find(c => c.code === newFlagCode)?.mainColor;
        setThemeContext({ ...themeContext, mainColor: themeColor || Colors.main });

        // Appel API
        await updateUserFlag({ user: updatedUser });
        // Pas besoin de re-set le context ici si l'optimistic a marché, 
        // userApi se mettra à jour au prochain fetch
    };

    const handleBoardingPress = () => {
        if (!userData || !storyApi.data) return;

        functions.vibrate('small-success');
        setShowBoardingModal(true);
    };

    const confirmLaunch = () => {
        setShowBoardingModal(false);
        functions.vibrate('success');
        setIsTakingOff(true);
    };

    const onTransitionFinished = () => {
        if (storyApi.data && userData) {
            const destinationCountry = ALL_COUNTRIES.find(c => c.code === storyApi.data!.countryCode);
            if (destinationCountry) {
                navigation.navigate('StoryGame', {
                    story: storyApi.data,
                    country: destinationCountry,
                    user: userData // On passe bien userData ici
                });
            }
        } else {
            setIsTakingOff(false);
        }
    };

    // --- LOGIQUE ORIGINE (LAST TRIP) ---
    const getLastTripInfo = () => {
        if (!userData?.passport) return null;

        const entries = Object.entries(userData.passport);
        if (entries.length === 0) return null;

        entries.sort((a, b) => {
            const dateA = new Date((a[1] as any).lastVisitedAt).getTime();
            const dateB = new Date((b[1] as any).lastVisitedAt).getTime();
            return dateB - dateA;
        });

        const lastEntry = entries[0];
        const countryCode = lastEntry[0];
        const country = ALL_COUNTRIES.find(c => c.code === countryCode);

        return {
            city: country?.capital || 'Inconnu',
            countryCode: countryCode
        };
    };

    // --- LOGIQUE DE VERROUILLAGE ---
    const getLockedDate = () => {
        if (!userData) return null;
        if (userData.isPremium) return null;
        if ((userData.storiesPlayedCount || 0) < 3) return null;
        if (!userData.lastStoryPlayedAt) return null;

        const lastPlayed = new Date(userData.lastStoryPlayedAt);
        const nextMidnight = new Date(lastPlayed);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);

        const now = new Date();
        if (now >= nextMidnight) return null;

        return nextMidnight;
    };

    // --- DETECTION DU CHANGEMENT DE STREAK ---
    useEffect(() => {
        // On attend d'avoir des données API fraîches ou consolidées
        if (userData) {
            const currentStreak = userData.dayStreak;

            // On vérifie que le streak a AUGMENTÉ par rapport à la dernière valeur connue en mémoire
            if (currentStreak > 0 && currentStreak > prevStreak.current) {
                setShowStreakModal(true);
            }

            // On met à jour la ref pour la prochaine comparaison
            prevStreak.current = currentStreak;
        }
    }, [userData?.dayStreak]);

    // --- RENDER ---

    // 1. Si aucune donnée nulle part => Squelette complet
    if (!userData || !userData.pseudo) {
        return <HomeSkeleton />;
    }

    const lastTrip = getLastTripInfo();
    const destinationStory = storyApi.data;
    const destinationCountry = destinationStory
        ? ALL_COUNTRIES.find(c => c.code === destinationStory.countryCode)
        : null;
    const lockedUntil = getLockedDate();

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                <ProfileHeader
                    user={userData}
                    onChangeFlag={handleChangeFlag}
                    onClickStreak={() => {
                        functions.vibrate('small-warning');
                        setShowStreakModal(true)
                    }}
                    onClickFuel={() => {
                        functions.vibrate('small-warning');
                        setPremiumReason('none');
                        setShowPremiumModal(true);
                    }}
                />

                <View style={styles.content}>
                    {/* CAS 1 : On a la story chargée et le pays correspondant */}
                    {destinationStory && destinationCountry ? (
                        <BoardingPass
                            pseudo={userData.pseudo} // Utilisation de userData
                            color={themeContext.mainColor}
                            countryCode={destinationCountry.code}
                            city={destinationStory.city}
                            originCity={lastTrip?.city}
                            originCountryCode={lastTrip?.countryCode}
                            onPress={handleBoardingPress}
                            onPremiumPress={() => {
                                setPremiumReason('story');
                                setShowPremiumModal(true);
                            }}
                            lockedUntil={lockedUntil}
                        />
                    ) : (
                        // CAS 2 : Pas de story, MAIS on a un ID et c'est en train de charger
                        // On évite d'afficher le bouton "Choisir" si on sait qu'une story arrive
                        (storyApi.loading) ? (
                            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={themeContext.mainColor} />
                                <BodyText text="Récupération du billet..." style={{ marginTop: 10, color: Colors.lightGrey, fontSize: 10 }} />
                            </View>
                        ) : (
                            // CAS 3 : Vraiment aucune story en cours
                            <MyButton
                                title="Choisir une destination"
                                onPress={() => navigation.navigate('SelectDestination')}
                                variant="glass"
                                bump
                                rightIcon='arrow-right'
                            />
                        )
                    )}
                </View>
            </ScrollView>

            {/* --- MODAL D'EMBARQUEMENT --- */}
            {destinationStory && (
                <CustomModal
                    visible={showBoardingModal}
                    title="EMBARQUEMENT PORTE A21"
                    confirmText="Décoller"
                    color={destinationCountry?.mainColor || Colors.main}
                    onConfirm={confirmLaunch}
                    cancelText="Attendre"
                    onCancel={() => setShowBoardingModal(false)}
                >
                    <View style={{ gap: 8 }}>
                        <BodyText text="Destination :" style={{ color: Colors.lightGrey }} />
                        <View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 20 }}>
                            <Image
                                source={getFlagImage(destinationCountry?.code || '')}
                                style={{ width: 40, height: 25, borderRadius: 4, marginTop: 6 }}
                                resizeMode="cover"
                            />
                            <Title0
                                title={destinationStory.city.toUpperCase()}
                                color={Colors.white}
                            />
                        </View>
                    </View>
                </CustomModal>
            )}

            <FlightLoader
                visible={isTakingOff}
                onAnimationFinish={onTransitionFinished}
                color={destinationCountry?.mainColor || Colors.main}
                originCity={lastTrip?.city || "Maison"}
                destinationCity={destinationStory?.city || "Destination"}
                destinationCode={destinationCountry?.code || "??"}
            />

            <SubscriptionModal
                visible={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                reason={premiumReason}
            />
            <DayStreakModal
                visible={showStreakModal}
                streak={userData.dayStreak}
                onClose={() => setShowStreakModal(false)}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
    }
});
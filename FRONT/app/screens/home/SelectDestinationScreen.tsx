import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import SelectionGrid from '@/app/components/molecules/SelectionGrid';
import Colors from '@/app/constants/Colors';
import { UserContext } from '@/app/contexts/UserContext';
import { useApi } from '@/app/hooks/useApi';
import { Story } from '@/app/models/Story';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { storyService } from '@/app/services/story.service';
import { userService } from '@/app/services/user.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
// 1. N'oublie pas d'importer useMemo
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import DestinationGridItem from '../unlogged/components/DestinationGridItem';

type Props = NativeStackScreenProps<HomeNavParams, 'SelectDestination'>;

export default function SelectDestinationScreen({ navigation }: Props) {
    const [userContext, setUserContext] = useContext(UserContext);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

    // API 1: Fetch
    const { execute: fetchDestinations, data: rawDestinations, loading: loadingFetch } = useApi(
        () => storyService.getAvailableDestinations(),
        'SelectDest - Fetch'
    );

    // API 2: Update
    const { execute: updateChoice, loading: loadingUpdate } = useApi(
        (storyId: string) => userService.updateCurrentStoryId(storyId),
        'SelectDest - Update'
    );

    useEffect(() => {
        fetchDestinations();
    }, []);

    // --- C'EST ICI QUE TU METS LE USEMEMO ---
    // Il sert à garantir que `displayDestinations` ne change pas d'adresse mémoire
    // à chaque petit re-render (ex: quand tu cliques sur une tuile), 
    // ce qui évite de faire clignoter la grille pour rien.
    const displayDestinations = useMemo(() => {
        if (!rawDestinations) return [];
        // Si ton backend ne renvoie pas exactement 4 items ou si tu veux refiltrer par sécurité
        return rawDestinations.slice(0, 4);
    }, [rawDestinations]); // On ne recalcule que si l'API nous donne de nouvelles données

    const handleValidation = async () => {
        if (!selectedStory) return;

        // Attention ici : vérifie si ton modèle Story utilise 'id', 'storyId' ou '_id'
        // Avec notre modèle Mongoose précédent, c'était souvent 'storyId' pour le code métier
        const result = await updateChoice(selectedStory.storyId);

        if (result) {
            setUserContext({ ...userContext, currentStoryId: selectedStory.storyId });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
    };

    if (loadingFetch || loadingUpdate) return <LoadingScreen />;

    return (
        <LinearGradient colors={[Colors.black, Colors.mainDark]} style={styles.container}>
            <View style={{ gap: 20 }}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo_white_filled.png')}
                        style={styles.logo}
                    />
                </View>
                <Title0 title="Prochaine Escale ?" color={Colors.white} isLeft />
            </View>

            {/* Tu passes displayDestinations (la version mémoïsée) à la grille */}
            <SelectionGrid<Story>
                data={displayDestinations}
                selectedItem={selectedStory}
                onSelect={setSelectedStory}
                // Attention ici aussi : utilise l'ID unique stable (souvent storyId dans notre logique)
                keyExtractor={(item) => item.storyId || item._id}
                renderItemContent={(item, isSelected) => (
                    <DestinationGridItem story={item} isSelected={isSelected} />
                )}
            />

            <MyButton
                title={selectedStory ? `Cap sur ${selectedStory.city}` : "Choisir..."}
                onPress={handleValidation}
                variant={'glass'}
                disabled={!selectedStory}
                rightIcon="airplane-takeoff"
                bump={!!selectedStory}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 50,
    },
    logoContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 18,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
        width: 36,
        height: 36,
        tintColor: Colors.white
    },
});
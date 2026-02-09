import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

// Imports Components
import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import SelectionGrid from '@/app/components/molecules/SelectionGrid';

// Imports Data & Models
import Colors from '@/app/constants/Colors';
import { TUTORIAL_STORIES } from '@/app/constants/TutorialStories';
import { ALL_COUNTRIES } from '@/app/models/Countries';
import { Story } from '@/app/models/Story';
import { NavParams } from '@/app/navigations/UnloggedNav';
import DestinationGridItem from './components/DestinationGridItem';

type Props = NativeStackScreenProps<NavParams, 'SelectStartCountry'>;

export default function SelectStartCountryScreen({ navigation }: Props) {
    // On sélectionne maintenant une Story (ex: Paris), pas juste un pays
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>(Colors.darkGrey);

    // On transforme l'objet TUTORIAL_STORIES en tableau pour la grille
    // On ne garde que ceux qui sont définis
    const starterStories = Object.values(TUTORIAL_STORIES);

    const handleValidation = () => {
        if (selectedStory) {
            // On retrouve l'objet Country complet associé à la story (pour le flag, name, etc.)
            const country = ALL_COUNTRIES.find(c => c.code === selectedStory.countryCode);

            if (country) {
                navigation.navigate('FirstGame', {
                    country: country,
                    story: selectedStory
                });
            } else {
                Alert.alert("Erreur", "Pays introuvable pour cette histoire.");
            }
        }
    };

    useEffect(() => {
        if (selectedStory) {
            setSelectedColor(ALL_COUNTRIES.find(c => c.code === selectedStory.countryCode)?.mainColor || Colors.darkGrey);
        }
    }, [selectedStory]);

    return (
        <LinearGradient
            colors={[selectedColor, Colors.black]}
            style={styles.container}>
            {/* --- HEADER --- */}
            <View style={styles.topSection}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo_white.png')}
                        style={styles.logo}
                    />
                </View>

                <View style={styles.titleGroup}>
                    <Title0
                        title='Où commencer votre voyage ?'
                        color={Colors.white}
                        isLeft
                    />
                    <BodyText
                        text={"Choisissez votre première destination.\nCe choix n'est pas définitif."}
                    />
                </View>
            </View>

            {/* --- BODY : GRID --- */}
            <View style={styles.gridSection}>
                <SelectionGrid<Story>
                    data={starterStories}
                    selectedItem={selectedStory}
                    onSelect={setSelectedStory}
                    keyExtractor={(item) => item._id}
                    renderItemContent={(item, isSelected) => (
                        // On utilise DestinationGridItem qui affiche Ville + Drapeau
                        <DestinationGridItem story={item} isSelected={isSelected} />
                    )}
                />
            </View>

            {/* --- FOOTER : BOUTON --- */}
            <View style={{ height: 60 }}>
                {selectedStory && (
                    <MyButton
                        title={`Cap sur ${selectedStory.city}`}
                        onPress={handleValidation}
                        variant='glass'
                        rightIcon="arrow-right"
                    />
                )}
            </View>

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 50,
        paddingHorizontal: 20
    },
    topSection: {
        width: '100%',
        alignItems: 'flex-start',
        gap: 24,
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
    titleGroup: {
        gap: 8,
    },
    gridSection: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
});
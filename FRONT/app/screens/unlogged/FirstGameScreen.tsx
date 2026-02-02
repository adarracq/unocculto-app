import { NavParams } from '@/app/navigations/UnloggedNav';
import React from 'react';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import GameScreen from '../games/GameScreen';

type Props = NativeStackScreenProps<NavParams, 'FirstGame'>;

export default function FirstGameScreen({ navigation, route }: Props) {
    // 1. Récupération des paramètres (avec fallback si non défini)
    const country = route.params?.country;
    const story = route.params?.story;

    // Fallback de sécurité si country est undefined (ex: accès direct dev)
    const countryCode = country?.code || 'FR';
    const countryFlag = country?.flag || '🇫🇷';


    // 3. Action de fin (Navigation vers Home / Login / Next)
    const handleGameFinish = () => {
        navigation.replace('Login', { country });
    };

    // 4. Rendu de l'organisme générique
    return (
        <GameScreen
            story={story}
            onFinish={handleGameFinish}
            headerTitle={`${countryFlag} • ${story.title}`}
        />
    );
}
import MyButton from '@/app/components/atoms/MyButton';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import Colors from '@/app/constants/Colors';
import Themes from '@/app/constants/Themes';
import { useApi } from '@/app/hooks/useApi';
import Theme from '@/app/models/Theme';
import { HomeNavParams } from '@/app/navigations/HomeNav';
import { themeService } from '@/app/services/theme.service';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

type Props = NativeStackScreenProps<HomeNavParams, 'DEV'>;

export default function DEV({ navigation, route }: Props) {

    const [themes, setThemes] = useState<Theme[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const { execute: getThemes, loading: loadingThemes } = useApi(
        () => themeService.getAll(),
        'SetThemesScreen - getThemes'
    );


    async function fetchData() {
        const result = await getThemes();
        if (result) {
            setThemes(result);
        }
    }

    async function createThemesInBDD() {
        const themes = Themes.themes;

        themes.forEach(async (theme, index) => {
            if (theme.icon) {
                let base64Icon = await functions.convertImageToBase64(theme.icon);
                let _theme = new Theme(
                    theme.name,
                    theme.labelFR,
                    theme.labelEN,
                    // convert icon name to base64 string
                    base64Icon,
                );
                themeService.create(_theme);

            }
        });
    }

    useEffect(() => {
        fetchData();
    }, []);


    if (loadingThemes) {
        return <LoadingScreen />;
    }



    return (
        <LinearGradient
            colors={[Colors.mainDark, Colors.main, Colors.mainLight]}
            style={styles.container}>
            <MyButton
                title="Ajouter les Themes dans la BDD"
                onPress={async () => {
                    await createThemesInBDD();
                }}
            />

        </LinearGradient >
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        gap: 20,
        padding: 20,
    },
})
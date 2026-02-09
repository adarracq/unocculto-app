import Colors from '@/app/constants/Colors';
import { useApi } from '@/app/hooks/useApi';
import { userService } from '@/app/services/user.service';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Import des sous-composants
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import { ThemeContext } from '@/app/contexts/ThemeContext';
import { useIsFocused } from '@react-navigation/native';
import CargoView from './components/CargoView';
import LogbookView from './components/LogbookView';
import MuseumHeader from './components/MuseumHeader';

export default function HomeMuseumScreen({ navigation }: any) {
    const [mode, setMode] = useState<'CARGO' | 'LOGBOOK'>('LOGBOOK');
    const [themeContext, setThemeContext] = useContext(ThemeContext);
    const isFocused = useIsFocused();

    // --- APIS ---
    const inventoryApi = useApi(() => userService.getMuseumInventory(), 'Get Inventory');
    const logbookApi = useApi(() => userService.getPilotLogbook(), 'Get Logbook');

    useEffect(() => {
        if (isFocused) {
            console.log("HomeMuseumScreen is focused - fetching inventory and logbook");
            inventoryApi.execute();
            logbookApi.execute();
        }
    }, [isFocused]); // Re-fetch à chaque fois que l'écran est focus

    const isLoading = inventoryApi.loading || logbookApi.loading;

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <GlowTopGradient color={themeContext.mainColor} />


            <MuseumHeader mode={mode} setMode={setMode} mainColor={themeContext.mainColor} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {mode === 'CARGO' && (
                    <CargoView inventory={inventoryApi.data || []} />
                )}

                {mode === 'LOGBOOK' && (
                    <LogbookView logbook={logbookApi.data || []} />
                )}
            </ScrollView>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    scrollContent: { paddingBottom: 50, paddingHorizontal: 20 },
});
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import Colors from '@/app/constants/Colors';
import { useApi } from '@/app/hooks/useApi';
import { userService } from '@/app/services/user.service';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Import des sous-composants
import CargoView from './components/CargoView';
import LogbookView from './components/LogbookView';
import MuseumHeader from './components/MuseumHeader';

export default function HomeMuseumScreen({ navigation }: any) {
    const [mode, setMode] = useState<'CARGO' | 'LOGBOOK'>('LOGBOOK');

    // --- APIS ---
    const inventoryApi = useApi(() => userService.getMuseumInventory(), 'Get Inventory');
    const logbookApi = useApi(() => userService.getPilotLogbook(), 'Get Logbook');

    useEffect(() => {
        inventoryApi.execute();
        logbookApi.execute();
    }, []);

    const isLoading = inventoryApi.loading || logbookApi.loading;

    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            {/* Dégradé différent selon le mode pour l'ambiance */}
            <GlowTopGradient color={mode === 'CARGO' ? Colors.main : Colors.main} />

            <MuseumHeader mode={mode} setMode={setMode} />

            {isLoading ? (
                <LoadingScreen />
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {mode === 'CARGO' && (
                        <CargoView inventory={inventoryApi.data || []} />
                    )}

                    {mode === 'LOGBOOK' && (
                        <LogbookView logbook={logbookApi.data || []} />
                    )}
                </ScrollView>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    scrollContent: { paddingBottom: 50, paddingHorizontal: 20 },
});
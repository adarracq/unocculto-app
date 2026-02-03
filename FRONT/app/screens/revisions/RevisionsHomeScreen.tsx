// app/screens/RevisionsHomeScreen.tsx
import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import Colors from '@/app/constants/Colors';
import { useApi } from '@/app/hooks/useApi'; //
import { MemoryCount, userService } from '@/app/services/user.service'; //
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CockpitSwitch from './components/CockpitSwitch';

export default function RevisionsHomeScreen({ navigation }: any) {
    const isFocused = useIsFocused();

    // --- 1. ÉTATS DES SWITCHS ---
    const [filterGeo, setFilterGeo] = useState(true);
    const [filterFlag, setFilterFlag] = useState(true);
    const [filterCapital, setFilterCapital] = useState(true);
    const [filterAnecdote, setFilterAnecdote] = useState(true); // Nouveau switch

    // --- 2. ÉTAT DES DONNÉES ---
    // On stocke le détail pour recalculer instantanément le total sans rappel API
    const [count, setCount] = useState<MemoryCount>({
        flag: 0, capital: 0, location: 0, anecdote: 0
    });

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: "",
        message: ""
    });

    // Le total affiché (calculé localement)
    const [displayCount, setDisplayCount] = useState(0);

    // --- 3. API FETCH (Une seule fois au focus) ---
    const countApi = useApi(
        () => userService.getDueMemoriesCount(),
        'RevisionsHome - GetCount'
    );

    // Chargement initial des données
    useEffect(() => {
        if (isFocused) {
            countApi.execute();
        }
    }, [isFocused]);

    // Mise à jour du state local quand l'API répond
    useEffect(() => {
        if (countApi.data) {
            setCount(countApi.data);
        }
    }, [countApi.data]);
    // --- 4. CALCUL REACTIF DU TOTAL ---
    // Se déclenche dès qu'un switch change OU que les données arrivent
    useEffect(() => {
        let total = 0;
        if (filterGeo) total += count.location;
        if (filterFlag) total += count.flag;
        if (filterCapital) total += count.capital;
        if (filterAnecdote) total += count.anecdote;

        setDisplayCount(total);
    }, [count, filterGeo, filterFlag, filterCapital, filterAnecdote]);

    // --- 5. ACTIONS ---
    const handleStartMission = () => {
        if (displayCount === 0) {
            setModalConfig({
                visible: true,
                title: "Systèmes à jour",
                message: "Aucune révision nécessaire pour le moment, vous êtes à jour."
            });
            return;
        }

        navigation.navigate('ReviewSession', {
            filters: {
                geo: filterGeo,
                flag: filterFlag,
                capital: filterCapital,
                anecdote: filterAnecdote
            }
        });
    };

    if (countApi.loading && !countApi.data) {
        return <LoadingScreen />;
    }

    return (
        <LinearGradient colors={[Colors.darkGrey, '#000']} style={styles.container}>
            {/* Header style "Top Secret" */}
            <View style={styles.header}>
                <Title0 title="PRÉPARATION VOL" color={Colors.white} isLeft />
                <BodyText text="MAINTENANCE DES CONNAISSANCES" size="S" color="#666" style={{ letterSpacing: 2 }} />
            </View>

            {/* LE PANNEAU DE CONTRÔLE (Overhead Panel) */}
            <View style={styles.panelContainer}>
                <View style={styles.panelHeader}>
                    <BodyText text="SYSTÈMES DE NAVIGATION" size="S" color={Colors.white} style={{ fontWeight: 'bold' }} />
                </View>

                {/* Les Switchs (2 rangées pour accueillir Anecdote) */}
                <View style={styles.switchGrid}>
                    <CockpitSwitch label="GÉOGRAPHIE" value={filterGeo} onToggle={setFilterGeo} />
                    <CockpitSwitch label="DRAPEAUX" value={filterFlag} onToggle={setFilterFlag} />
                    <CockpitSwitch label="CAPITALES" value={filterCapital} onToggle={setFilterCapital} />
                    <CockpitSwitch label="CULTURE" value={filterAnecdote} onToggle={setFilterAnecdote} />
                </View>

                {/* Jauge de pression */}
                <View style={styles.gaugeContainer}>
                    <BodyText text="PRESSION (ITEMS)" size="S" color="#888" />
                    <Title0
                        title={displayCount.toString()}
                        color={displayCount > 10 ? Colors.red : Colors.green}
                        style={{ fontSize: 40 }}
                    />
                </View>
            </View>

            {/* Bouton d'allumage */}
            <View style={styles.footer}>
                <MyButton
                    title="DÉCOLLAGE IMMÉDIAT"
                    onPress={handleStartMission}
                    variant="glass"
                    rightIcon="airplane-takeoff"
                    bump
                />
            </View>
            {/* --- NOUVEAU : Intégration de la Modale --- */}
            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                onConfirm={() => setModalConfig({ ...modalConfig, visible: false })}
                confirmText="OK"
            // Pas de bouton Annuler nécessaire ici car c'est une info
            >
                <BodyText text={modalConfig.message} color={Colors.white} />
            </CustomModal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
    header: { marginBottom: 30 },
    panelContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#333',
        padding: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10
    },
    panelHeader: { borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10, marginBottom: 20, alignItems: 'center' },

    // Modification pour grille 2x2 ou ligne responsive
    switchGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        rowGap: 20,
        marginBottom: 30
    },

    gaugeContainer: { alignItems: 'center', backgroundColor: '#000', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
    footer: { flex: 1, justifyContent: 'flex-end', marginBottom: 40 }
});
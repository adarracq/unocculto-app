// app/screens/RevisionsHomeScreen.tsx
import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title0 from '@/app/components/atoms/Title0';
import CustomModal from '@/app/components/molecules/CustomModal';
import GlowTopGradient from '@/app/components/molecules/GlowTopGradient';
import LoadingScreen from '@/app/components/molecules/LoadingScreen';
import Colors from '@/app/constants/Colors';
import { useApi } from '@/app/hooks/useApi'; //
import { RevisionDashboardData, userService } from '@/app/services/user.service'; //
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import KnowledgeRadar from './components/KnowledgeRadar';
import RevisionCockpit from './components/RevisionCockpit';

export default function RevisionsHomeScreen({ navigation }: any) {
    const isFocused = useIsFocused();

    // --- 1. ÉTATS DES SWITCHS ---
    const [filterGeo, setFilterGeo] = useState(true);
    const [filterFlag, setFilterFlag] = useState(true);
    const [filterCapital, setFilterCapital] = useState(true);
    const [filterAnecdote, setFilterAnecdote] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: "",
        message: ""
    });

    // Le total affiché (calculé localement)
    const [displayCount, setDisplayCount] = useState(0);


    // --- 4. CALCUL REACTIF DU TOTAL ---
    // Modification du State pour accepter la structure complexe
    const [dashboardData, setDashboardData] = useState<RevisionDashboardData>({
        counts: { flag: 0, capital: 0, location: 0, anecdote: 0 },
        radarItems: []
    });


    // --- API CALL (Nouvelle méthode à créer dans le service) ---
    const dashboardApi = useApi(
        () => userService.getRevisionDashboardData(),
        'RevisionsHome - GetDashboard'
    );

    useEffect(() => {
        if (isFocused) dashboardApi.execute();
    }, [isFocused]);

    useEffect(() => {
        if (dashboardApi.data) {
            setDashboardData(dashboardApi.data);
        }
    }, [dashboardApi.data]);

    // Calcul du total basé sur les filtres (comme avant)
    useEffect(() => {
        let total = 0;
        const counts = dashboardData.counts;
        if (filterGeo) total += counts.location;
        if (filterFlag) total += counts.flag;
        if (filterCapital) total += counts.capital;
        if (filterAnecdote) total += counts.anecdote;
        setDisplayCount(total);
    }, [dashboardData, filterGeo, filterFlag, filterCapital, filterAnecdote]);

    const handleStartMission = () => {
        if (displayCount === 0) {
            setModalConfig({
                visible: true,
                title: "Systèmes à jour",
                message: "Aucune révision nécessaire pour le moment."
            });
            return;
        }
        navigation.navigate('ReviewSession', {
            filters: { geo: filterGeo, flag: filterFlag, capital: filterCapital, anecdote: filterAnecdote }
        });
    };


    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={styles.container}>
            <GlowTopGradient />
            {/* Header */}
            <View style={styles.header}>
                <Title0 title="Centre de Révision" color={Colors.white} isLeft />
                <BodyText text="MAINTENANCE DES CONNAISSANCES" size="S" color={Colors.main} style={{ letterSpacing: 2 }} />
            </View>

            {
                dashboardApi.loading && !dashboardApi.data ?
                    <LoadingScreen />
                    :

                    <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>

                        {/* 1. LE RADAR (Visuel) */}

                        <RevisionCockpit
                            totalDue={displayCount}
                            filterGeo={filterGeo} setFilterGeo={setFilterGeo}
                            filterFlag={filterFlag} setFilterFlag={setFilterFlag}
                            filterCapital={filterCapital} setFilterCapital={setFilterCapital}
                            filterAnecdote={filterAnecdote} setFilterAnecdote={setFilterAnecdote}
                        />

                        <View style={{ height: 30 }} />

                        {/* 2. LE RADAR (Visuel) */}
                        <KnowledgeRadar
                            items={dashboardData.radarItems}
                            isLoading={dashboardApi.loading}
                        />


                    </ScrollView>
            }

            {/* Bouton Flottant ou Fixe en bas */}
            <View style={styles.footer}>
                <MyButton
                    title="Décollage immédiat"
                    onPress={handleStartMission}
                    variant="glass"
                    rightIcon="arrow-right"
                    bump
                />
            </View>

            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                onConfirm={() => setModalConfig({ ...modalConfig, visible: false })}
                confirmText="OK"
            >
                <BodyText text={modalConfig.message} color={Colors.white} />
            </CustomModal>
        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 60 },
    header: { marginBottom: 20, gap: 10, paddingHorizontal: 20 },
    footer: {
        position: 'absolute',
        bottom: 20, left: 20, right: 20
    }
});
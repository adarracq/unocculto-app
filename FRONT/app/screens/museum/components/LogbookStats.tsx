import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES } from '@/app/models/Countries';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// On garde une interface locale ou importée pour le typage
interface LogbookEntry {
    countryCode: string;
    isCompleted: boolean;
    cities: string[];
}

interface Props {
    logbook: LogbookEntry[];
}

export default function LogbookStats({ logbook }: Props) {
    // 1. Calculs
    const totalCountriesInGame = ALL_COUNTRIES.length;

    const visitedCountries = logbook?.length || 0;
    const completedCountries = logbook?.filter(e => e.isCompleted).length || 0;

    const visitedCities = logbook?.reduce((acc, curr) => acc + (curr.cities ? curr.cities.length : 0), 0) || 0;

    return (
        <View style={styles.statsContainer}>
            {/* BLOC 1 : PAYS VISITÉS */}
            <View style={styles.statBox}>
                <Title1 title={`${visitedCountries}/${totalCountriesInGame}`} color={Colors.white} />
                <BodyText text="PAYS VISITÉS" size="S" color={Colors.lightGrey} style={styles.label} />
            </View>

            <View style={styles.verticalDivider} />

            {/* BLOC 2 : PAYS TERMINÉS */}
            <View style={styles.statBox}>
                <Title1 title={`${completedCountries}/${totalCountriesInGame}`} color={Colors.gold} />
                <BodyText text="100% COMPLÉTÉS" size="S" color={Colors.gold} style={styles.label} />
            </View>

            <View style={styles.verticalDivider} />

            {/* BLOC 3 : VILLES */}
            <View style={styles.statBox}>
                <Title1 title={visitedCities.toString()} color={Colors.white} />
                <BodyText text="VILLES EXPLORÉES" size="S" color={Colors.lightGrey} style={styles.label} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 10
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
        gap: 2
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
});
import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import CockpitSwitch from './CockpitSwitch';

interface Props {
    totalDue: number;
    filterGeo: boolean; setFilterGeo: (v: boolean) => void;
    filterFlag: boolean; setFilterFlag: (v: boolean) => void;
    filterCapital: boolean; setFilterCapital: (v: boolean) => void;
    filterAnecdote: boolean; setFilterAnecdote: (v: boolean) => void;
}

export default function RevisionCockpit({
    totalDue,
    filterGeo, setFilterGeo,
    filterFlag, setFilterFlag,
    filterCapital, setFilterCapital,
    filterAnecdote, setFilterAnecdote
}: Props) {

    const statusColor = totalDue > 0 ? Colors.main : Colors.green;

    return (
        <LinearGradient
            colors={[Colors.realBlack, Colors.black]}
            style={styles.container}
        >
            {/* --- ZONE GAUCHE : LE COMPTEUR --- */}
            <View style={styles.leftPanel}>
                <View style={styles.headerTitle}>
                    <Image
                        source={functions.getIconSource('logo_white')}
                        style={{ width: 16, height: 16, tintColor: Colors.darkGrey, marginRight: 6 }}
                    />
                    <BodyText text="SRS-V2" style={{ fontSize: 8, color: Colors.darkGrey }} />
                </View>

                {/* Le gros chiffre */}
                <View style={styles.counterContainer}>
                    <Title1
                        title={totalDue.toString()}
                        color={statusColor}
                        style={{ fontSize: 36, lineHeight: 40 }} // Compact
                    />
                    <BodyText text="ITEMS" style={{ color: Colors.darkGrey, marginTop: -4 }} />
                </View>

                {/* Petite barre de status */}
                <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
            </View>

            {/* Séparateur vertical */}
            <View style={styles.divider} />

            {/* --- ZONE DROITE : LES SWITCHS --- */}
            <View style={styles.rightPanel}>
                <View style={styles.grid}>
                    <CockpitSwitch label="LOCS" value={filterGeo} onToggle={setFilterGeo} />
                    <CockpitSwitch label="FLAGS" value={filterFlag} onToggle={setFilterFlag} />
                    <CockpitSwitch label="CAPITALS" value={filterCapital} onToggle={setFilterCapital} />
                    <CockpitSwitch label="FACTS" value={filterAnecdote} onToggle={setFilterAnecdote} />
                </View>
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row', // Disposition horizontale !
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        marginBottom: 15,
        alignItems: 'stretch',
        // Ombre portée subtile
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    // --- LEFT PANEL ---
    leftPanel: {
        width: '25%', // Prend moins de place
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.8,
    },
    counterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    statusBar: {
        width: 20,
        height: 2,
        borderRadius: 1,
        marginTop: 4,
        opacity: 0.8
    },

    // --- DIVIDER ---
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 10,
    },

    // --- RIGHT PANEL ---
    rightPanel: {
        flex: 1, // Prend tout le reste
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // Espacement entre les boutons
    }
});
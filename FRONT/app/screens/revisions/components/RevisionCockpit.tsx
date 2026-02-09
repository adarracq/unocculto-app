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
    mainColor: string;
}

export default function RevisionCockpit({
    totalDue,
    filterGeo, setFilterGeo,
    filterFlag, setFilterFlag,
    filterCapital, setFilterCapital,
    filterAnecdote, setFilterAnecdote,
    mainColor
}: Props) {

    const statusColor = totalDue > 0 ? mainColor : Colors.green;

    return (
        <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)']}
            style={styles.container}
        >
            {/* --- ZONE GAUCHE : COMPTEUR --- */}
            <View style={styles.leftPanel}>

                <View style={styles.panelHeader}>
                    <Image
                        source={functions.getIconSource('logo_white')}
                        style={{ width: 10, height: 10, tintColor: Colors.darkGrey, marginRight: 4 }}
                    />
                    <BodyText text="RADAR" style={{ fontSize: 8, color: Colors.darkGrey }} />
                </View>

                <View style={styles.counterWrapper}>
                    <Title1
                        title={totalDue.toString()}
                        color={statusColor}
                        // Taille réduite pour gagner en hauteur
                        style={{ fontSize: 32, lineHeight: 36, textShadowColor: statusColor, textShadowRadius: 3 }}
                    />
                    <BodyText
                        text={totalDue > 1 ? "CIBLES" : "CIBLE"}
                        style={{ color: statusColor, fontSize: 8, opacity: 0.8 }}
                    />
                </View>
            </View>

            {/* Séparateur fin */}
            <View style={styles.separator} />

            {/* --- ZONE DROITE : LISTE VERTICALE --- */}
            <View style={styles.rightPanel}>
                {/* 1 switch par ligne, prend toute la largeur */}
                <CockpitSwitch label="GÉOGRAPHIE" value={filterGeo} onToggle={setFilterGeo} mainColor={mainColor} />
                <CockpitSwitch label="DRAPEAUX" value={filterFlag} onToggle={setFilterFlag} mainColor={mainColor} />
                <CockpitSwitch label="CAPITALES" value={filterCapital} onToggle={setFilterCapital} mainColor={mainColor} />
                <CockpitSwitch label="ANECDOTES" value={filterAnecdote} onToggle={setFilterAnecdote} mainColor={mainColor} />
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)', // Bordure très discrète
        padding: 12, // Padding réduit (était 16 ou 20)
        marginBottom: 15,
        alignItems: 'stretch',
    },

    // --- LEFT PANEL ---
    leftPanel: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 10,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.6,
        marginBottom: 2,
        position: 'absolute', // On le colle en haut pour gagner de la place au centre
        top: 0,
    },
    counterWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Pour ne pas chevaucher le header absolu
    },

    // --- SEPARATOR ---
    separator: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 10,
        marginVertical: 5, // Ne touche pas les bords haut/bas
    },

    // --- RIGHT PANEL ---
    rightPanel: {
        flex: 1,
        justifyContent: 'center', // Centre verticalement les switchs
    },
});
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const GAP = 15;
const PADDING_H = 20;
// Calcul précis pour 2 colonnes
const ITEM_SIZE = (width - (PADDING_H * 2) - GAP) / 2;

interface Props<T> {
    data: T[];
    selectedItem: T | null;
    onSelect: (item: T) => void;
    renderItemContent: (item: T, isSelected: boolean) => React.ReactNode;
    keyExtractor: (item: T) => string;
}

export default function SelectionGrid<T>({
    data,
    selectedItem,
    onSelect,
    renderItemContent,
    keyExtractor
}: Props<T>) {

    // On retourne 4 cases vides si pas de données pour éviter que la grille ne disparaisse
    if (data.length === 0) {
        return (
            <View style={styles.gridContainer}>
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.itemContainer,
                            styles.unselected,
                            { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }
                        ]}
                    />
                ))}
            </View>
        );
    }

    return (
        <View style={styles.gridContainer}>
            {data.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selectedItem ? keyExtractor(selectedItem) === key : false;

                return (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.itemContainer,
                            // On change le style selon l'état
                            isSelected ? styles.selected : styles.unselected
                        ]}
                        onPress={() => {
                            onSelect(item);
                            functions.vibrate('small-warning');
                        }}
                        activeOpacity={0.7}
                    >
                        {renderItemContent(item, isSelected)}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: GAP,
        width: '100%',
    },
    itemContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderCurve: 'continuous',
    },

    // ÉTAT : NON SÉLECTIONNÉ (Reste inchangé)
    unselected: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    // ÉTAT : SÉLECTIONNÉ (C'EST ICI QU'ON CORRIGE)
    selected: {
        // 1. On enlève le fond plein qui créait le carré opaque
        backgroundColor: 'transparent', // ou très très léger 'rgba(255, 255, 255, 0.05)'

        // 2. On garde la bordure blanche éclatante
        borderWidth: 2,
        borderColor: Colors.white,

        // 3. On utilise l'ombre pour l'effet de "Glow" diffuse
        shadowColor: Colors.white,
        shadowOffset: { width: 0, height: 0 }, // L'ombre est centrée
        shadowOpacity: 0.5, // Plus forte opacité pour compenser l'absence de fond
        shadowRadius: 15, // Rayon plus large pour une diffusion douce

        // Elevation pour Android (attention, peut refaire un fond gris si backgroundColor est transparent)
        // Le mieux est de tester avec et sans. Sur un gradient, sans est souvent mieux.
        // elevation: 10, 
    }
});
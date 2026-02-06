// app/screens/museum/components/MuseumItemGrid.tsx

import { Collectible } from '@/app/models/Collectible';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    items: Collectible[];
    onSelect: (item: Collectible) => void;
}

// --- CALCUL PRÉCIS DE LA GRILLE ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const PARENT_PADDING = 20; // Le padding de l'écran parent (HomeMuseumScreen)
const GAP_SIZE = 10;       // L'espace voulu entre les items
const COLUMNS = 3;

// Formule : (LargeurEcran - PaddingGaucheDroite - (EspaceEntreItems * (NbColonnes - 1))) / NbColonnes
// On ajoute Math.floor pour éviter les décimales qui font sauter la ligne
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - (PARENT_PADDING * 2) - (GAP_SIZE * (COLUMNS - 1))) / COLUMNS) - 1;

export default function MuseumItemGrid({ items, onSelect }: Props) {

    if (!items || items.length === 0) {
        return null;
    }

    const renderItem = (item: Collectible) => {
        const isOwned = item.isOwned;

        return (
            <TouchableOpacity
                key={item.id}
                // On force la taille calculée ici
                style={[styles.itemContainer, { width: ITEM_SIZE, height: ITEM_SIZE }, !isOwned && styles.lockedContainer]}
                // CORRECTION : On autorise le clic même si !isOwned pour afficher la modal cryptée
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
            >
                {/* Image Principale */}
                <Image
                    source={{ uri: item.imageUrl }}
                    style={[styles.itemImage, !isOwned && styles.lockedImage]}
                    resizeMode="contain"
                />

                {/* --- ÉLÉMENTS VERROUILLÉS --- */}
                {!isOwned && (
                    <View style={styles.lockOverlay}>
                        <Image
                            source={functions.getIconSource('lock')}
                            style={{ width: 24, height: 24, tintColor: 'rgba(255,255,255,0.6)' }}
                        />
                    </View>
                )}

                {/* --- ÉLÉMENTS POSSÉDÉS --- */}
                {isOwned && (
                    <>
                        {item.countryCode && (
                            <View style={styles.flagBadge}>
                                <Image source={getFlagImage(item.countryCode)} style={{ width: 16, height: 12, borderRadius: 2 }} />
                            </View>
                        )}
                        <View style={[styles.rarityDot, { backgroundColor: getRarityColor(item.rarity) }]} />
                    </>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.gridContainer}>
            {items.map(renderItem)}
        </View>
    );
}

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#FFD700';
        case 'rare': return '#9D00FF';
        case 'uncommon': return '#0096FF';
        default: return '#FFFFFF';
    }
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP_SIZE, // Utilise la constante définie plus haut
        justifyContent: 'flex-start',
    },
    itemContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        position: 'relative',
        overflow: 'hidden'
    },
    lockedContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: 'rgba(255,255,255,0.02)',
    },
    itemImage: {
        width: '80%',
        height: '80%',
    },
    lockedImage: {
        opacity: 0.1, // Beaucoup plus sombre pour l'effet "inconnu"
        tintColor: 'white' // Rend la silhouette blanche/grise
    } as any,
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flagBadge: {
        position: 'absolute', top: 6, right: 6, opacity: 0.9,
    },
    rarityDot: {
        position: 'absolute', bottom: 6, right: 6, width: 8, height: 8, borderRadius: 4,
    },
});
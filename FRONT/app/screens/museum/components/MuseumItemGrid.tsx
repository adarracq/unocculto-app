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

// On calcule la largeur pour avoir 3 items par ligne avec un peu d'espace
const screenWidth = Dimensions.get('window').width;
// (Largeur écran - padding horizontal total - espaces entre les items) / 3
const itemSize = (screenWidth - 40 - 20) / 3;

export default function MuseumItemGrid({ items, onSelect }: Props) {

    if (!items || items.length === 0) {
        return null;
    }

    const renderItem = (item: Collectible) => {
        const isOwned = item.isOwned;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.itemContainer, { width: itemSize, height: itemSize }, !isOwned && styles.lockedContainer]}
                onPress={() => isOwned && onSelect(item)}
                activeOpacity={isOwned ? 0.7 : 1} // Pas de feedback tactile si verrouillé
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
                        {/* Badge Drapeau (Haut Droit) */}
                        {item.countryCode && (
                            <View style={styles.flagBadge}>
                                <Image source={getFlagImage(item.countryCode)} style={{ width: 16, height: 12, borderRadius: 2 }} />
                            </View>
                        )}

                        {/* Badge Rareté (Bas Droit) */}
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

// Helper couleur rareté (local au composant pour l'instant)
const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#FFD700'; // Or
        case 'rare': return '#9D00FF';      // Violet
        case 'uncommon': return '#0096FF';  // Bleu
        default: return '#FFFFFF';          // Blanc (Common)
    }
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10, // Espace entre les lignes et les colonnes
        justifyContent: 'flex-start',
    },
    itemContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8, // Padding interne pour que l'image ne touche pas les bords
        position: 'relative', // Pour positionner les badges en absolu
        overflow: 'hidden'
    },
    // Style quand verrouillé
    lockedContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderColor: 'rgba(255,255,255,0.02)',
    },
    itemImage: {
        width: '80%',
        height: '80%',
    },
    lockedImage: {
        opacity: 0.2,
        grayscale: 1 // Si React Native supporte (sinon l'opacité suffit)
    } as any,

    // Overlays et Badges
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    flagBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        opacity: 0.9,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 1,
    },
    rarityDot: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3,
    },
});
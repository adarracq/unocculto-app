import { Collectible } from '@/app/models/Collectible';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    items: Collectible[];
    onSelect: (item: Collectible) => void;
    // Nouvelle prop pour récupérer l'icône
    getIconForSubCategory?: (subCatId: string) => any;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PARENT_PADDING = 20;
const GAP_SIZE = 10;
const COLUMNS = 3;
// Calcul de la taille (identique à avant)
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - (PARENT_PADDING * 2) - (GAP_SIZE * (COLUMNS - 1))) / COLUMNS) - 1;

export default function MuseumItemGrid({ items, onSelect, getIconForSubCategory }: Props) {

    if (!items || items.length === 0) return null;

    const renderItem = (item: Collectible) => {
        const isOwned = item.isOwned;
        // Récupérer l'icone si la fonction est fournie
        const subCatIcon = getIconForSubCategory ? getIconForSubCategory(item.subCategory) : null;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.itemContainer, { width: ITEM_SIZE, height: ITEM_SIZE }, !isOwned && styles.lockedContainer]}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
            >
                {/* Image Principale */}
                <Image
                    source={{ uri: item.imageUri }}
                    style={[styles.itemImage, !isOwned && styles.lockedImage]}
                    resizeMode="contain"
                />

                {!isOwned && (
                    <View style={styles.lockOverlay}>
                        <Image
                            source={functions.getIconSource('lock')}
                            style={{ width: 20, height: 20, tintColor: 'rgba(255,255,255,0.4)' }}
                        />
                    </View>
                )}

                {isOwned && (
                    <>
                        {/* 1. Badge Drapeau (Haut Droit) */}
                        {item.countryCode && (
                            <View style={styles.flagBadge}>
                                <Image source={getFlagImage(item.countryCode)} style={{ width: 16, height: 12, borderRadius: 2 }} />
                            </View>
                        )}

                        {/* 2. Badge Sous-Catégorie (Haut Gauche) - NOUVEAU */}
                        {subCatIcon && (
                            <View style={styles.categoryBadge}>
                                <Image
                                    source={functions.getCategoriesource(subCatIcon)}
                                    style={{ width: 12, height: 12, tintColor: 'rgba(255,255,255,0.9)' }}
                                />
                            </View>
                        )}

                        {/* 3. Point Rareté (Bas Centre) */}
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
        default: return 'rgba(255,255,255,0.5)';
    }
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP_SIZE,
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
        width: '50%',
        height: '50%',
    },
    lockedImage: {
        opacity: 0.1,
        tintColor: 'white'
    } as any,
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Badges
    flagBadge: {
        position: 'absolute', top: 6, right: 6, opacity: 0.9,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 1,
    },
    categoryBadge: {
        position: 'absolute', top: 6, left: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 3, borderRadius: 4,
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)'
    },
    rarityDot: {
        position: 'absolute', bottom: 6,
        width: 20, height: 3, borderRadius: 2, // Barre horizontale plus discrète en bas
        opacity: 0.8
    },
});
// app/screens/museum/components/CargoView.tsx

import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
// import SelectionGrid from '@/app/components/molecules/SelectionGrid'; <--- ON RETIRE ÇA
import Colors from '@/app/constants/Colors';
import { Collectible, CollectibleTheme, DEPARTMENTS } from '@/app/models/Collectible';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DepartmentCard from './DepartmentCard';
import MuseumItemGrid from './MuseumItemGrid'; // <--- ON IMPORT LE NOUVEAU

interface Props {
    inventory: Collectible[];
}

export default function CargoView({ inventory }: Props) {
    // --- STATE NAVIGATION ---
    const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
    const [selectedThemeFilter, setSelectedThemeFilter] = useState<CollectibleTheme | 'ALL'>('ALL');

    // --- STATE MODAL ---
    const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);
    const [itemModalVisible, setItemModalVisible] = useState(false);

    // --- CALCULS (inchangés) ---
    const stats = useMemo(() => {
        const res: Record<string, { owned: number, total: number }> = {};
        DEPARTMENTS.forEach(dept => {
            const itemsInDept = inventory.filter(i => dept.themes.includes(i.type as any));
            res[dept.id] = {
                total: itemsInDept.length,
                owned: itemsInDept.filter(i => i.isOwned).length
            };
        });
        return res;
    }, [inventory]);

    const activeDepartment = DEPARTMENTS.find(d => d.id === activeDepartmentId);

    const displayedItems = useMemo(() => {
        if (!activeDepartment) return [];
        return inventory.filter(item => {
            const isInDept = activeDepartment.themes.includes(item.type as any);
            const matchesFilter = selectedThemeFilter === 'ALL' || item.type === selectedThemeFilter;
            return isInDept && matchesFilter;
        });
    }, [inventory, activeDepartment, selectedThemeFilter]);


    // --- RENDUS ---

    // ON A SUPPRIMÉ LA FONCTION renderCollectible ICI CAR ELLE EST DANS LE NOUVEAU COMPOSANT

    // --- VUE 1 : DASHBOARD (inchangé) ---
    if (!activeDepartmentId) {
        return (
            <View style={{ gap: 10, paddingTop: 10 }}>
                {DEPARTMENTS.map(dept => (
                    <DepartmentCard
                        key={dept.id}
                        title={dept.title}
                        icon={dept.icon}
                        color={dept.color}
                        ownedCount={stats[dept.id]?.owned || 0}
                        totalCount={stats[dept.id]?.total || 0}
                        onPress={() => {
                            setActiveDepartmentId(dept.id);
                            setSelectedThemeFilter('ALL');
                        }}
                    />
                ))}
            </View>
        );
    }

    // --- VUE 2 : LISTE DÉTAILLÉE (mise à jour avec la nouvelle grille) ---
    return (
        <View style={{ flex: 1, minHeight: 500 }}>
            {/* Header de section + Bouton Retour */}
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => setActiveDepartmentId(null)} style={styles.backBtn}>
                    <Image source={functions.getIconSource('arrow-left')} style={{ width: 20, height: 20, tintColor: Colors.white }} />
                </TouchableOpacity>
                <Title1 title={activeDepartment?.title || ''} style={{ fontSize: 16 }} />
            </View>

            {/* Barre de Filtres (Chips) */}
            <View style={{ height: 40, marginBottom: 15 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.chip, selectedThemeFilter === 'ALL' && { backgroundColor: Colors.white }]}
                        onPress={() => setSelectedThemeFilter('ALL')}
                    >
                        <BodyText text="TOUT" size="S" color={selectedThemeFilter === 'ALL' ? Colors.black : Colors.lightGrey} isBold />
                    </TouchableOpacity>

                    {activeDepartment?.themes.map(theme => (
                        <TouchableOpacity
                            key={theme}
                            style={[styles.chip, selectedThemeFilter === theme && { backgroundColor: activeDepartment.color }]}
                            onPress={() => setSelectedThemeFilter(theme as CollectibleTheme)}
                        >
                            <BodyText
                                text={theme.toUpperCase()}
                                size="S"
                                color={selectedThemeFilter === theme ? Colors.black : Colors.lightGrey}
                                isBold
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* LA NOUVELLE GRILLE COMPACTE */}
            <View style={{ flex: 1 }}>
                {displayedItems.length > 0 ? (
                    <MuseumItemGrid
                        items={displayedItems}
                        onSelect={(item) => {
                            setSelectedItem(item);
                            setItemModalVisible(true);
                        }}
                    />
                ) : (
                    <BodyText text="Aucun objet trouvé." style={{ textAlign: 'center', marginTop: 30, opacity: 0.5 }} />
                )}
            </View>

            {/* Modal Détail (inchangée, juste le helper getRarityColor remis ici si besoin) */}
            {selectedItem && (
                <CustomModal
                    visible={itemModalVisible}
                    title={selectedItem.name}
                    onConfirm={() => setItemModalVisible(false)}
                    confirmText="RETOUR"
                    color={activeDepartment?.color || Colors.main}
                >
                    <View style={{ alignItems: 'center', gap: 20 }}>
                        <View style={styles.modalImageContainer}>
                            <Image source={{ uri: selectedItem.imageUrl }} style={{ width: 150, height: 150 }} resizeMode="contain" />
                            <View style={styles.modalFlagTag}>
                                <Image source={getFlagImage(selectedItem.countryCode)} style={{ width: 20, height: 15 }} />
                                <BodyText text={selectedItem.countryCode} size="S" isBold />
                            </View>
                        </View>
                        <BodyText text={selectedItem.description} style={{ textAlign: 'center', fontStyle: 'italic', lineHeight: 22 }} />

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <Badge text={selectedItem.type.toUpperCase()} color={Colors.darkGrey} />
                            {/* On réutilise le helper de couleur ici pour la modale */}
                            <Badge text={selectedItem.rarity.toUpperCase()} color={getRarityColorModal(selectedItem.rarity)} />
                        </View>
                    </View>
                </CustomModal>
            )}
        </View>
    );
}

// ... Badge component and styles remain mostly the same ...
const Badge = ({ text, color }: { text: string, color: string }) => (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: color + '40', borderWidth: 1, borderColor: color }}>
        <BodyText text={text} size="S" color={Colors.white} style={{ fontSize: 10 }} />
    </View>
);

// Fonction helper locale pour la modale uniquement (l'autre est dans la grille)
const getRarityColorModal = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#FFD700';
        case 'rare': return '#9D00FF';
        case 'uncommon': return '#0096FF';
        default: return '#FFFFFF';
    }
};

const styles = StyleSheet.create({
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
    backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    filterScroll: { gap: 8, alignItems: 'center' }, // Align items center pour centrer les chips verticalement
    chip: {
        paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center'
    },
    // On supprime les styles liés à l'ancienne grille (gridItem, itemImage, etc.)
    modalImageContainer: { alignItems: 'center', gap: 10 },
    modalFlagTag: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 5, borderRadius: 8 }
});
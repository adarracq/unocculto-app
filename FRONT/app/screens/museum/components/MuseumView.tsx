import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { Collectible, DEPARTMENTS } from '@/app/models/Collectible';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DepartmentCard from './DepartmentCard';
import MuseumItemGrid from './MuseumItemGrid';

interface Props {
    inventory: Collectible[];
}

export default function MuseumView({ inventory }: Props) {
    const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
    const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | 'ALL'>('ALL');

    // --- STATE MODAL ---
    const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);
    const [itemModalVisible, setItemModalVisible] = useState(false);

    // --- LOGIQUE TEXTE CRYPTÉ ---
    const generateEncryptedText = (length: number) => {
        const chars = "████ 0101 ERROR #X99 CLASSIFIED ";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return "ACCÈS REFUSÉ. \n\n" + result.slice(0, 150) + "... [SIGNAL LOST]";
    };

    // --- CALCULS ---
    const stats = useMemo(() => {
        const res: Record<string, { owned: number, total: number }> = {};
        DEPARTMENTS.forEach(dept => {
            const itemsInDept = inventory.filter(item => dept.id == item.category);
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
            const isInDept = activeDepartment.id == item.category;
            // Correction ici : filtrer par subCategory, pas category
            const matchesFilter = selectedThemeFilter === 'ALL' || item.subCategory === selectedThemeFilter;
            return isInDept && matchesFilter;
        });
    }, [inventory, activeDepartment, selectedThemeFilter]);

    // Helper pour trouver l'icone d'une sous-category
    const getSubCategoryIcon = (subCatId: string) => {
        if (!activeDepartment) return 'help'; // Default
        const sub = activeDepartment.subcategories.find(s => s.id === subCatId);
        return sub ? sub.icon : 'help';
    };


    // --- VUE 1 : DASHBOARD ---
    if (!activeDepartmentId) {
        return (
            <View style={{ gap: 10, paddingTop: 10, paddingHorizontal: 20 }}>
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

    // --- VUE 2 : LISTE DÉTAILLÉE ---
    return (
        <View style={{ flex: 1, minHeight: 500 }}>
            <View style={styles.sectionHeader}>
                <BackArrow onPress={() => setActiveDepartmentId(null)} left={20} />
                <View></View>
                <Title1 title={activeDepartment?.title || ''} style={{ fontSize: 16, textAlign: 'right' }} />
            </View>

            {/* --- NOUVEAU SÉLECTEUR DE SOUS-CATÉGORIES --- */}
            <View style={{ height: 120, marginBottom: 5 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {/* Bouton TOUT */}
                    <TouchableOpacity
                        style={[
                            styles.filterCard,
                            selectedThemeFilter === 'ALL' ? { backgroundColor: Colors.white, borderColor: Colors.white } : styles.filterCardInactive
                        ]}
                        onPress={() => setSelectedThemeFilter('ALL')}
                    >
                        <BodyText
                            text="TOUT"
                            size="S"
                            color={selectedThemeFilter === 'ALL' ? Colors.black : Colors.lightGrey}
                            isBold
                        />
                    </TouchableOpacity>

                    {/* Boutons Sous-Catégories */}
                    {activeDepartment?.subcategories.map(subCat => {
                        const isSelected = selectedThemeFilter === subCat.id;
                        return (
                            <TouchableOpacity
                                key={subCat.id}
                                style={[
                                    styles.filterCard,
                                    isSelected
                                        ? { backgroundColor: activeDepartment.color, borderColor: activeDepartment.color }
                                        : styles.filterCardInactive
                                ]}
                                onPress={() => setSelectedThemeFilter(subCat.id as string)}
                            >
                                <View style={[styles.iconCircle, isSelected ? { backgroundColor: 'rgba(0,0,0,0.1)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Image
                                        source={functions.getCategoriesource(subCat.icon)}
                                        style={{
                                            width: 24, height: 24,
                                            tintColor: isSelected ? Colors.black : Colors.lightGrey
                                        }}
                                    />
                                </View>
                                <BodyText
                                    text={subCat.title.toUpperCase()}
                                    size="S"
                                    color={isSelected ? Colors.black : Colors.lightGrey}
                                    style={{ fontSize: 10, marginTop: 4, textAlign: 'center' }}
                                    isBold={isSelected}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                {displayedItems.length > 0 ? (
                    <MuseumItemGrid
                        items={displayedItems}
                        // On passe l'icone de la sous-catégorie à l'item grid pour l'affichage
                        getIconForSubCategory={getSubCategoryIcon}
                        onSelect={(item) => {
                            setSelectedItem(item);
                            setItemModalVisible(true);
                            if (item.isOwned) {
                                functions.vibrate('small-success');
                            } else {
                                functions.vibrate('small-error');
                            }
                        }}
                    />
                ) : (
                    <BodyText text="Aucun objet trouvé." style={{ textAlign: 'center', marginTop: 30, opacity: 0.5 }} />
                )}
            </View>

            {/* --- MODALE DÉTAIL --- */}
            {selectedItem && (
                <CustomModal
                    visible={itemModalVisible}
                    title={selectedItem.isOwned ? selectedItem.name : "FICHIER CRYPTÉ"}
                    onConfirm={() => setItemModalVisible(false)}
                    confirmText="RETOUR"
                    color={selectedItem.isOwned ? (activeDepartment?.color || Colors.main) : '#FF4444'}
                >
                    <View style={{ alignItems: 'center', gap: 20 }}>
                        <View style={styles.modalImageContainer}>
                            {selectedItem.isOwned ? (
                                <Image source={{ uri: selectedItem.imageUri }} style={{ width: 150, height: 150 }} resizeMode="contain" />
                            ) : (
                                <Image source={functions.getIconSource('lock')} style={{ width: 80, height: 80, tintColor: '#FF4444', opacity: 0.8 }} resizeMode="contain" />
                            )}

                            {/* Drapeau pays */}
                            {selectedItem.isOwned && (

                                <Image source={getFlagImage(selectedItem.countryCode)} style={{ width: 32, height: 20, borderRadius: 2 }} />

                            )}
                        </View>

                        <BodyText
                            text={selectedItem.isOwned ? selectedItem.description : generateEncryptedText(selectedItem.description.length)}
                            style={{
                                textAlign: 'center',
                                fontStyle: selectedItem.isOwned ? 'italic' : 'normal',
                                lineHeight: 22,
                                fontFamily: selectedItem.isOwned ? undefined : 'Courier',
                                color: selectedItem.isOwned ? Colors.white : Colors.lightGrey
                            }}
                        />

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            {/* Badge Catégorie avec icône */}
                            <View style={[styles.badge, { borderColor: activeDepartment?.color, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
                                <Image
                                    source={functions.getCategoriesource(getSubCategoryIcon(selectedItem.subCategory))}
                                    style={{ width: 12, height: 12, tintColor: activeDepartment?.color }}
                                />
                                <BodyText text={activeDepartment?.subcategories.find(sub => sub.id === selectedItem.subCategory)?.title.toUpperCase() || 'INCONNU'} size="S"
                                    color={activeDepartment?.color || Colors.darkGrey}
                                    style={{ fontSize: 10 }} />
                            </View>

                            {/* Badge Rareté */}
                            <Badge
                                text={selectedItem.rarity.toUpperCase()}
                                color={selectedItem.isOwned ? getRarityColorModal(selectedItem.rarity) : Colors.darkGrey}
                            />
                        </View>
                    </View>
                </CustomModal>
            )}
        </View>
    );
}

// Helpers
const Badge = ({ text, color }: { text: string, color: string }) => (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '40' }]}>
        <BodyText text={text} size="S" color={Colors.white} style={{ fontSize: 10 }} />
    </View>
);

const getRarityColorModal = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#FFD700';
        case 'rare': return '#9D00FF';
        case 'uncommon': return '#0096FF';
        default: return '#FFFFFF';
    }
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 20,

    },
    // Nouveau style pour le scroll horizontal
    filterScroll: {
        gap: 12,
        alignItems: 'center',
        paddingHorizontal: 20
    },
    filterCard: {
        width: 120,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    filterCardInactive: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconCircle: {
        width: 36, height: 36,
        borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 2
    },

    // Modal Styles
    modalImageContainer: { alignItems: 'center', gap: 15, marginBottom: 10 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
});
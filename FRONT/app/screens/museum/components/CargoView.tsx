// app/screens/museum/components/CargoView.tsx

import BackArrow from '@/app/components/atoms/BackArrow';
import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { Collectible, CollectibleTheme, DEPARTMENTS } from '@/app/models/Collectible';
import { getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import DepartmentCard from './DepartmentCard';
import MuseumItemGrid from './MuseumItemGrid';

interface Props {
    inventory: Collectible[];
}

export default function CargoView({ inventory }: Props) {
    const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
    const [selectedThemeFilter, setSelectedThemeFilter] = useState<CollectibleTheme | 'ALL'>('ALL');

    // --- STATE MODAL ---
    const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);
    const [itemModalVisible, setItemModalVisible] = useState(false);

    // --- LOGIQUE TEXTE CRYPTÉ ---
    // Génère un faux texte type "████ 0x4F ████"
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


    // --- VUE 1 : DASHBOARD ---
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

    // --- VUE 2 : LISTE DÉTAILLÉE ---
    return (
        <View style={{ flex: 1, minHeight: 500 }}>
            <View style={styles.sectionHeader}>
                <BackArrow onPress={() => setActiveDepartmentId(null)} />
                <View></View>
                <Title1 title={activeDepartment?.title || ''} style={{ fontSize: 16 }} />
            </View>

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

            <View style={{ flex: 1 }}>
                {displayedItems.length > 0 ? (
                    <MuseumItemGrid
                        items={displayedItems}
                        onSelect={(item) => {
                            setSelectedItem(item);
                            setItemModalVisible(true);
                            // Vibration positive si debloqué negative sinon
                            if (item.isOwned) {
                                Vibration.vibrate([0, 50, 50, 50]);
                            } else {
                                Vibration.vibrate([0, 100, 50, 100]);
                            }
                        }}
                    />
                ) : (
                    <BodyText text="Aucun objet trouvé." style={{ textAlign: 'center', marginTop: 30, opacity: 0.5 }} />
                )}
            </View>

            {/* --- MODALE DYNAMIQUE (CRYPTÉE ou NORMALE) --- */}
            {selectedItem && (
                <CustomModal
                    visible={itemModalVisible}
                    title={selectedItem.isOwned ? selectedItem.name : "FICHIER CRYPTÉ"}
                    onConfirm={() => setItemModalVisible(false)}
                    confirmText="RETOUR"
                    // Couleur rouge si pas possédé, sinon couleur du département
                    color={selectedItem.isOwned ? (activeDepartment?.color || Colors.main) : '#FF4444'}
                >
                    <View style={{ alignItems: 'center', gap: 20 }}>
                        <View style={styles.modalImageContainer}>
                            {selectedItem.isOwned ? (
                                <Image source={{ uri: selectedItem.imageUrl }} style={{ width: 150, height: 150 }} resizeMode="contain" />
                            ) : (
                                // Image Cadenas pour item verrouillé
                                <Image source={functions.getIconSource('lock')} style={{ width: 100, height: 100, tintColor: '#FF4444', opacity: 0.8 }} resizeMode="contain" />
                            )}

                            {/* On cache le drapeau si pas possédé pour garder le mystère */}
                            {selectedItem.isOwned && (
                                <Image source={getFlagImage(selectedItem.countryCode)} style={{ width: 40, height: 30, borderRadius: 4 }} />
                            )}
                        </View>

                        <BodyText
                            text={selectedItem.isOwned ? selectedItem.description : generateEncryptedText(selectedItem.description.length)}
                            style={{
                                textAlign: 'center',
                                fontStyle: selectedItem.isOwned ? 'italic' : 'normal',
                                lineHeight: 22,
                                // Style "Code" pour le texte crypté
                                fontFamily: selectedItem.isOwned ? undefined : 'Courier',
                                color: selectedItem.isOwned ? Colors.white : Colors.lightGrey
                            }}
                        />

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            {/* On peut afficher le type (Catégorie) car l'utilisateur est déjà dans le rayon */}
                            <Badge text={selectedItem.type.toUpperCase()} color={Colors.darkGrey} />

                            <Badge
                                text={selectedItem.isOwned ? selectedItem.rarity.toUpperCase() : "INCONNU"}
                                color={selectedItem.isOwned ? getRarityColorModal(selectedItem.rarity) : Colors.darkGrey}
                            />
                        </View>
                    </View>
                </CustomModal>
            )}
        </View>
    );
}

// Helpers... (inchangés)
const Badge = ({ text, color }: { text: string, color: string }) => (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: color + '40', borderWidth: 1, borderColor: color }}>
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
        marginBottom: 30,
        height: 40,
    },
    filterScroll: { gap: 8, alignItems: 'center' },
    chip: {
        paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center'
    },
    modalImageContainer: { alignItems: 'center', gap: 10 },
});
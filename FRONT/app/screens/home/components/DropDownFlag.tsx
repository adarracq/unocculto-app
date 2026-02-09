import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import React, { useRef } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

type SelectorProps = {
    unlockedFlags: string[];
    selectedFlag: string | null;
    onChangeFlag: (code: string) => void;
    passport?: Record<string, { isCompleted: boolean }>;
    children: React.ReactNode;
}

export default function DropDownFlag({ unlockedFlags, selectedFlag, onChangeFlag, passport = {}, children }: SelectorProps) {
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const myFlags = ALL_COUNTRIES.filter(c => unlockedFlags.includes(c.code));

    const renderFlagItem = ({ item }: { item: typeof ALL_COUNTRIES[0] }) => {
        const isSelected = selectedFlag === item.code;
        const isCompleted = passport[item.code]?.isCompleted || false;

        // Logique visuelle (identique à ton code, très bien faite)
        const opacity = isSelected ? 1 : (isCompleted ? 0.6 : 0.3);
        const borderColor = isSelected ? Colors.gold : isCompleted ? Colors.gold + '60' : 'transparent';
        const backgroundColor = isSelected
            ? (isCompleted ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)')
            : 'transparent';

        return (
            <TouchableOpacity
                onPress={() => {
                    onChangeFlag(item.code);
                    actionSheetRef.current?.hide();
                }}
                style={styles.stampSlot}
                activeOpacity={0.7}
            >
                <View style={[styles.stampFrame, { borderColor, backgroundColor }, isSelected && styles.activeShadow]}>
                    <Image source={getFlagImage(item.code)} style={[styles.flagImage, { opacity }]} resizeMode="cover" />
                </View>

                <BodyText
                    text={item.code}
                    style={{
                        fontSize: 10,
                        color: isSelected ? Colors.white : 'rgba(255,255,255,0.3)',
                        marginTop: 6,
                        fontWeight: isSelected ? 'bold' : 'normal',
                    }}
                />
            </TouchableOpacity>
        );
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => actionSheetRef.current?.show()}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>

            {/* ACTION SHEET (Inchangé car il fonctionne bien) */}
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={styles.sheetContainer}
                indicatorStyle={{ backgroundColor: Colors.lightGrey }}
                gestureEnabled={true}
            >
                <View style={styles.sheetHeader}>
                    <Title2 title="PAGES VISAS" color={Colors.white} style={{ letterSpacing: 2 }} />
                    <BodyText text={`${myFlags.length} DESTINATIONS DISPONIBLES`} style={{ color: Colors.lightGrey, fontSize: 10, marginTop: 4 }} />
                </View>

                <FlatList
                    data={myFlags}
                    keyExtractor={(item) => item.code}
                    numColumns={4}
                    renderItem={renderFlagItem}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.listRow}
                />
            </ActionSheet>
        </>
    )
}

const styles = StyleSheet.create({
    triggerContainer: {
        position: 'relative',
        // Pas de dimensions fixes ici, on s'adapte au contenu
    },
    // --- LE STYLE DU BOUTON MODERNE ---
    editBadge: {
        position: 'absolute',
        bottom: 6, // Flotte en bas du drapeau
        alignSelf: 'center', // Centré horizontalement
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        // Effet Glassmorphism sombre
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
    },

    // ... Le reste de tes styles ActionSheet (inchangés ou nettoyés) ...
    sheetContainer: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingBottom: 40, maxHeight: '70%',
    },
    sheetHeader: {
        padding: 20, alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    listContent: { paddingHorizontal: 20, paddingTop: 10 },
    listRow: { justifyContent: 'space-between', marginBottom: 20 },
    stampSlot: { width: '22%', alignItems: 'center' },
    stampFrame: {
        width: '100%', aspectRatio: 1.4, borderRadius: 6, borderWidth: 1.5,
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 2,
    },
    activeShadow: {
        shadowColor: Colors.white, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 3
    },
    flagImage: { width: '105%', height: '105%', borderRadius: 4 },
    inkStampContainer: {
        ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5,
    },
    inkStampBorder: {
        borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.8)', borderRadius: 4,
        paddingHorizontal: 4, paddingVertical: 1, transform: [{ rotate: '-15deg' }],
        backgroundColor: 'rgba(0,0,0,0.4)',
    }
});
import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useRef } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

type DropDownProps = {
    unlockedFlags: string[]; // Codes pays ex: ['FR', 'US']
    selectedFlag: string | null;
    color: string;
    onChangeFlag: (code: string) => void;
}

export default function DropDownFlag({ unlockedFlags, selectedFlag, color, onChangeFlag }: DropDownProps) {
    const actionSheetRef = useRef<ActionSheetRef>(null);

    // On récupère les objets pays complets correspondant aux codes débloqués
    // On ajoute un tri éventuel (alphabétique ou par ordre de déblocage)
    const myFlags = ALL_COUNTRIES.filter(c => unlockedFlags.includes(c.code));

    const renderFlagItem = ({ item }: { item: typeof ALL_COUNTRIES[0] }) => {
        const isSelected = selectedFlag === item.code;

        return (
            <TouchableOpacity
                onPress={() => {
                    onChangeFlag(item.code);
                    actionSheetRef.current?.hide();
                }}
                style={[
                    styles.flagCard,
                    isSelected && styles.flagCardSelected
                ]}
            >
                <Image
                    source={getFlagImage(item.code)}
                    style={{ width: 40, height: 25, borderRadius: 4 }}
                    resizeMode="cover"
                />
                <BodyText text={item.code} style={{ fontSize: 12, color: Colors.white, marginTop: 4 }} isBold />

                {isSelected && (
                    <View style={styles.checkBadge}>
                        <Image
                            source={functions.getIconSource('check')}
                            style={{ width: 10, height: 10, tintColor: Colors.white }}
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <>
            {/* BOUTON DECLENCHEUR (Petit crayon/change) */}
            <TouchableOpacity
                onPress={() => actionSheetRef.current?.show()}
                style={[styles.triggerButton, { backgroundColor: color }]}
                activeOpacity={0.8}
            >
                <Image
                    source={functions.getIconSource('change')}
                    style={{ width: 16, height: 16, tintColor: Colors.white }}
                />
            </TouchableOpacity>

            {/* ACTION SHEET */}
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={styles.sheetContainer}
                indicatorStyle={{ backgroundColor: Colors.darkGrey }}
                gestureEnabled={true}
            >
                <View style={styles.sheetHeader}>
                    <Title2 title="Choisir mon Emblème" color={Colors.white} />
                    <BodyText
                        text={`Vous avez débloqué ${myFlags.length} drapeaux`}
                        style={{ color: Colors.darkGrey, fontSize: 12 }}
                    />
                </View>

                {myFlags.length > 0 ? (
                    <FlatList
                        data={myFlags}
                        keyExtractor={(item) => item.code}
                        numColumns={4}
                        renderItem={renderFlagItem}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.listRow}
                    />
                ) : (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <BodyText text="Terminez un pays pour gagner son drapeau !" style={{ color: Colors.darkGrey, textAlign: 'center' }} />
                    </View>
                )}
            </ActionSheet>
        </>
    )
}

const styles = StyleSheet.create({
    triggerButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    sheetContainer: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    sheetHeader: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    listRow: {
        gap: 15,
        paddingVertical: 10,
        justifyContent: 'flex-start' // Ou space-between selon préférence
    },
    flagCard: {
        width: '22%', // Pour 4 colonnes environ
        aspectRatio: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    flagCardSelected: {
        borderColor: Colors.main,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    flagEmoji: {
        fontSize: 32,
    },
    checkBadge: {
        position: 'absolute',
        top: -6, right: -6,
        backgroundColor: Colors.main,
        width: 20, height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
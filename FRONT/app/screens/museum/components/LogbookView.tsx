import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import CustomModal from '@/app/components/molecules/CustomModal';
import Colors from '@/app/constants/Colors';
import { ThemeContext } from '@/app/contexts/ThemeContext';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { functions } from '@/app/utils/Functions';
import React, { useContext, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import LogbookStats from './LogbookStats';
// Type exporté pour l'usage dans le parent
export interface LogbookEntry {
    countryCode: string;
    visitDate: string;
    isCompleted: boolean;
    storiesCount: number;
    cities: string[];
    hasFlag: boolean;
}

interface Props {
    logbook: LogbookEntry[];
}

export default function LogbookView({ logbook }: Props) {
    const [selectedCountryEntry, setSelectedCountryEntry] = useState<LogbookEntry | null>(null);
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [themeContext, setThemeContext] = useContext(ThemeContext);

    const renderLogbookEntry = (entry: LogbookEntry) => {
        const countryData = ALL_COUNTRIES.find(c => c.code === entry.countryCode);
        if (!countryData) return null;

        return (
            <TouchableOpacity
                key={entry.countryCode}
                style={styles.logbookRow}
                onPress={() => {
                    setSelectedCountryEntry(entry);
                    setCountryModalVisible(true);
                }}
            >
                <View style={styles.flagWrapper}>
                    <Image source={getFlagImage(entry.countryCode)} style={styles.rowFlag} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Title1
                            title={countryData.name_fr.toUpperCase()}
                            isLeft
                            style={{ fontSize: 16, color: entry.isCompleted ? Colors.gold : Colors.white }}
                        />
                        {entry.isCompleted && (
                            <Image source={functions.getIconSource('check')} style={{ width: 16, height: 16, tintColor: Colors.gold }} />
                        )}
                    </View>

                    <BodyText
                        text={`${entry.cities.length} Ville(s) • ${functions.stringDateToString(entry.visitDate)}`}
                        size="S"
                        color={Colors.lightGrey}
                    />
                </View>

                <Image source={functions.getIconSource('arrow-right')} style={{ width: 16, height: 16, tintColor: Colors.lightGrey }} />
            </TouchableOpacity>
        );
    };

    // rajoute des \n\n dans le texte après les .
    function addLineBreaks(text: string) {
        return text.replace(/\. /g, '.\n\n');
    }

    return (
        <View style={{ gap: 20 }}>
            {/* Le composant importé */}
            <LogbookStats logbook={logbook} />

            {/* Liste des entrées */}
            <View style={{ gap: 12 }}>
                {logbook?.map(renderLogbookEntry)}
            </View>

            {/* Modal Pays */}
            {selectedCountryEntry && (
                <CustomModal
                    visible={countryModalVisible}
                    title={ALL_COUNTRIES.find(c => c.code === selectedCountryEntry.countryCode)?.name_fr.toUpperCase() || ""}
                    onConfirm={() => setCountryModalVisible(false)}
                    confirmText="FERMER DOSSIER"
                    variant={selectedCountryEntry.isCompleted ? 'gold' : 'default'}
                    color={themeContext.mainColor}
                >
                    {(() => {
                        const countryStatic = ALL_COUNTRIES.find(c => c.code === selectedCountryEntry.countryCode);
                        if (!countryStatic) return null;
                        return (
                            <View style={{ gap: 20 }}>
                                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 }}>
                                    <Image source={getFlagImage(countryStatic.code)} style={{ width: 50, height: 35, borderRadius: 4 }} />
                                    <View>
                                        <BodyText text={`Capitale : ${countryStatic.capital}`} size="S" isBold />
                                        <BodyText text={`Villes explorées : ${selectedCountryEntry.cities.join(', ')}`} size="S" color={themeContext.mainColor} />
                                    </View>
                                </View>

                                <View style={{ gap: 8 }}>
                                    <Title2 title="ARCHIVES" isLeft style={{ marginTop: 8 }} />
                                    <BodyText
                                        text={addLineBreaks(countryStatic.intro_fr)}
                                        style={{ marginLeft: 20 }}
                                    />
                                    <Title2 title="RECOMPENSES" isLeft style={{ marginTop: 8, color: themeContext.mainColor }} />
                                    <BodyText
                                        text={`Votre exploration ici a permis de collecter ${selectedCountryEntry.storiesCount} souvenirs majeurs.`}
                                        style={{ marginLeft: 20 }} color={themeContext.mainColor}
                                    />
                                    <Title2 title="STATUT" isLeft style={{ marginTop: 8, color: selectedCountryEntry.isCompleted ? Colors.gold : Colors.lightGrey }} />
                                    {selectedCountryEntry.isCompleted ? (
                                        <BodyText text="100% EXPLORÉ. Dossier complet." color={Colors.gold} style={{ marginLeft: 20 }} />
                                    ) : (
                                        <BodyText text="Exploration partielle. Retour conseillé." color={Colors.lightGrey} style={{ marginLeft: 20 }} />
                                    )}
                                </View>
                            </View>
                        );
                    })()}
                </CustomModal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    logbookRow: {
        flexDirection: 'row', alignItems: 'center', gap: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    flagWrapper: { position: 'relative' },
    rowFlag: { width: 40, height: 40, borderRadius: 20 },
    completeBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: Colors.gold, borderRadius: 8, padding: 3, borderWidth: 1, borderColor: Colors.black }
});
import BodyText from '@/app/components/atoms/BodyText';
import Title1 from '@/app/components/atoms/Title1';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, LayoutAnimation, Modal, Platform, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';

// Activation des animations pour Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface Props {
    visible: boolean;
    onClose: () => void;
    reason: 'fuel' | 'story';
}

const SUBSCRIPTIONS = [
    {
        id: 'copilote',
        title: 'COPILOTE',
        price: '2.49 €',
        period: '/ mois',
        color: Colors.silver,
        accent: '#E0E0E0',
        features: [
            { label: "Max 20 Fuel (au lieu de 5)", icon: 'fuel' },
            { label: "3 Voyages / jour", icon: 'flight-ticket' },
            { label: "Pas de publicités", icon: 'close' },
            { label: "", icon: 'fuel' },
        ]
    },
    {
        id: 'capitaine',
        title: 'CAPITAINE',
        price: '7.99 €',
        period: '/ mois',
        color: Colors.gold,
        accent: '#FFFACD',
        features: [
            { label: "Fuel ILLIMITÉ", icon: 'fuel' },
            { label: "Voyages ILLIMITÉS", icon: 'flight-ticket' },
            { label: "Pas de publicités", icon: 'close' },
            { label: "Accès aux voyages exclusifs", icon: 'check' },
        ]
    }
];

export default function SubscriptionModal({ visible, onClose, reason }: Props) {
    // Par défaut, on sélectionne l'offre la plus chère (Capitaine) pour maximiser la conversion
    const [selectedId, setSelectedId] = useState<string>('capitaine');

    const handleSwitch = (id: string) => {
        // Animation fluide lors du changement
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedId(id);
    };

    const handleSelectPlan = (id: string) => {
        // Ici, on déclencherait le processus d'achat (ex: via RevenueCat ou l'API d'Apple/Google)
        console.log(`Achat: ${id}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Pour l'instant, on ferme la modal après sélection
        onClose();
    };

    const currentPlan = SUBSCRIPTIONS.find(s => s.id === selectedId) || SUBSCRIPTIONS[1];
    const isGold = currentPlan.id === 'capitaine';

    // Contenu dynamique selon la raison du blocage
    const headerConfig = reason === 'fuel'
        ? {
            icon: 'fuel',
            title: "RÉSERVOIR VIDE",
            subtitle: "Rechargez pour continuer l'aventure."
        }
        : {
            icon: 'flight-ticket',
            title: "QUOTA ATTEINT",
            subtitle: "Débloquez plus de voyages maintenant."
        };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />

                <LinearGradient
                    colors={[Colors.black, Colors.realBlack]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.sheetContainer}
                >
                    {/* --- HEADER --- */}
                    <View style={styles.handleBar} />

                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Image
                            source={functions.getIconSource('close')}
                            style={{ width: 14, height: 14, tintColor: Colors.lightGrey }}
                        />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Image
                                source={functions.getIconSource(headerConfig.icon)}
                                style={{ width: 32, height: 32, tintColor: Colors.red }} // Utilisation de l'orange
                            />
                        </View>
                        <Title1 title={headerConfig.title} color={Colors.white} style={{ marginTop: 15 }} />
                        <BodyText text={headerConfig.subtitle} style={{ color: Colors.lightGrey, textAlign: 'center', marginTop: 5 }} />
                    </View>

                    {/* --- SWITCHER (ONGLETS) --- */}
                    <View style={styles.switchContainer}>
                        {SUBSCRIPTIONS.map((plan) => {
                            const isActive = selectedId === plan.id;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    style={[
                                        styles.switchButton,
                                        isActive && { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: plan.color, borderWidth: 1 }
                                    ]}
                                    onPress={() => handleSwitch(plan.id)}
                                    activeOpacity={0.7}
                                >
                                    <BodyText
                                        text={plan.title}
                                        isBold={isActive}
                                        style={{
                                            color: isActive ? plan.color : Colors.darkGrey,
                                            fontSize: 12
                                        }}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* --- CARTE DÉTAILS DYNAMIQUE --- */}
                    <View style={styles.contentContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.03)', 'transparent']}
                            style={[styles.detailCard, { borderColor: currentPlan.color }]}
                        >
                            {/* Header de la carte (Prix) */}
                            <View style={styles.priceContainer}>
                                <View>
                                    <Title2 title={currentPlan.price} color={Colors.white} style={{ fontSize: 32 }} />
                                    <BodyText text={currentPlan.period} style={{ color: Colors.lightGrey }} />
                                </View>
                                {isGold && (
                                    <View style={[styles.badge, { backgroundColor: currentPlan.color }]}>
                                        <BodyText text="BEST VALUE" isBold style={{ fontSize: 10, color: Colors.black }} />
                                    </View>
                                )}
                            </View>

                            {/* Séparateur */}
                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 }} />

                            {/* Liste des features */}
                            <View style={styles.featuresList}>
                                {currentPlan.features.map((feat, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        {feat.label &&
                                            <View style={[styles.checkCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                                <Image
                                                    source={functions.getIconSource(feat.icon)}
                                                    style={{ width: 20, height: 20, tintColor: currentPlan.color }}
                                                />
                                            </View>}
                                        <BodyText text={feat.label} style={{ fontSize: 14, color: Colors.lightGrey }} />
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>

                        {/* --- CTA BUTTON --- */}
                        <TouchableOpacity
                            style={[styles.ctaButton, { shadowColor: currentPlan.color }]}
                            onPress={() => handleSelectPlan(currentPlan.id)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[currentPlan.color, currentPlan.id === 'capitaine' ? '#FFA500' : '#808080']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.ctaGradient}
                            >

                                <BodyText
                                    text={`ACTIVER LE MODE ${currentPlan.title}`}
                                    isBold
                                    style={{ color: Colors.black, fontSize: 14 }}
                                />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => console.log("Restore")} style={{ marginTop: 20 }}>
                            <BodyText text="Restaurer les achats" style={{ fontSize: 11, color: Colors.darkGrey, textDecorationLine: 'underline', textAlign: 'center' }} />
                        </TouchableOpacity>
                    </View>

                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheetContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingBottom: 50,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        maxHeight: '90%',
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    iconCircle: {
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.red + 'AA',
        marginBottom: 5
    },

    // SWITCH STYLES
    switchContainer: {
        flexDirection: 'row',
        backgroundColor: '#0A0A0A',
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 50,
    },
    switchButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },

    // DETAIL CARD
    contentContainer: {
        width: '100%',
    },
    detailCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        backgroundColor: '#000000',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    featuresList: {
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 28,
    },
    checkCircle: {
        width: 28, height: 28,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    // CTA
    ctaButton: {
        marginTop: 25,
        height: 56,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    ctaGradient: {
        flex: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
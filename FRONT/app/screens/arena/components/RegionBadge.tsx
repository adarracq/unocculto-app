import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

const { width } = Dimensions.get('window');
const SPACING = 15;
const CARD_WIDTH = (width - 40 - SPACING) / 2;

interface Props {
    name: string;
    code: string;
    level: 0 | 1 | 2 | 3;
    onPress: () => void;
    isLarge?: boolean;
    isLocked?: boolean;
}

export default function RegionBadge({ name, code, level, onPress, isLarge = false, isLocked = false }: Props) {

    // --- Animation & Haptics Logic (From MyButton) ---
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        isLocked ? functions.vibrate('small-error') : functions.vibrate('small-success');

        Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    };

    const handleOnPress = () => {
        if (!isLocked) {
            onPress();
        }
        else {
            showMessage({
                message: "Région verrouillée",
                description: "Complétez les niveaux précédents pour déverrouiller cette région.",
                type: "warning",
                backgroundColor: Colors.black,
                color: Colors.white,
            });
        }
    }

    // --- Couleurs ---
    // Bordure : Grise si lock, Orange si ouvert, Or si max
    const borderColor =
        isLocked ? 'rgba(255,255,255,0.05)' :
            level === 0 ? Colors.darkGrey :
                level === 1 ? Colors.bronze :
                    level === 2 ? Colors.silver :
                        Colors.gold;

    const gradientColors =
        isLocked ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] :
            level === 0 ? [Colors.black, Colors.realBlack] :
                level === 1 ? [Colors.bronze + '40', Colors.realBlack] :
                    level === 2 ? [Colors.silver + '40', Colors.realBlack] :
                        [Colors.gold + '40', Colors.realBlack];


    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    width: isLarge ? '100%' : CARD_WIDTH,
                    transform: [{ scale: scaleValue }]
                }
            ]}
        >
            <Pressable
                onPress={handleOnPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{ flex: 1 }} // Important pour que le Pressable remplisse la vue animée
            >
                <LinearGradient
                    colors={gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, { borderColor }]}
                >
                    {/* --- BACKGROUND TEXTURE --- */}
                    <View style={styles.bgIconContainer}>
                        <Image
                            source={functions.getImageSource(code)}
                            style={[
                                styles.bgIcon,
                                { tintColor: isLocked ? Colors.darkGrey : Colors.white }
                            ]}
                            resizeMode="contain"
                        />
                    </View>

                    {/* --- CONTENU --- */}
                    <View style={styles.content}>

                        {/* EN-TÊTE : Code technique */}
                        <View style={styles.header}>
                            <View style={[styles.codeTag, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <BodyText
                                    text={code}
                                    style={{ fontSize: 9, fontWeight: '900', letterSpacing: 1 }}
                                    color={isLocked ? Colors.darkGrey : borderColor}
                                />
                            </View>

                            {/* Indicateur Lock discret */}
                            {isLocked && (
                                <Image source={functions.getIconSource('lock')} style={{ width: 12, height: 12, tintColor: Colors.darkGrey }} />
                            )}
                        </View>

                        {/* TITRE : Nom de la région */}
                        <View style={styles.titleContainer}>
                            <Title2
                                title={name.toUpperCase()}
                                color={isLocked ? Colors.darkGrey : Colors.white}
                                style={{
                                    fontSize: isLarge ? 22 : 18,
                                    textAlign: 'left',
                                    letterSpacing: 0.5
                                }}
                            />
                        </View>

                        {/* FOOTER : Progression */}
                        <View style={styles.footer}>
                            {isLocked ? (
                                <BodyText text="ACCESS DENIED" style={{ fontSize: 9, color: Colors.darkGrey, letterSpacing: 2 }} />
                            ) : (
                                <View style={styles.progressRow}>
                                    <EnergyCell active={level >= 1} color={Colors.bronze} label="I" />
                                    <EnergyCell active={level >= 2} color={Colors.silver} label="II" />
                                    <EnergyCell active={level >= 3} color={Colors.gold} label="III" />
                                </View>
                            )}
                        </View>

                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

// Composant Cellule d'énergie (Style HUD)
const EnergyCell = ({ active, color, label }: { active: boolean, color: string, label: string }) => (
    <View style={styles.energyCellWrapper}>
        <View style={[
            styles.energyCell,
            {
                backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
                shadowColor: active ? color : 'transparent',
                shadowOpacity: active ? 0.8 : 0,
                shadowRadius: 6,
                borderColor: active ? color : 'transparent',
                borderWidth: active ? 0 : 1,
            }
        ]} />
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        height: 130,
        marginBottom: SPACING,
        // Ombre portée de la carte elle-même
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    container: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        padding: 12,
    },

    // BACKGROUND IMAGE
    bgIconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
    },
    bgIcon: {
        width: '90%',
        height: '90%',
        opacity: 0.08,
        right: -20,
        top: -20,
    },

    // CONTENT
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },

    // Title
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    progressRow: {
        flexDirection: 'row',
        gap: 6,
        width: '100%',
    },
    energyCellWrapper: {
        flex: 1,
        height: 4,
    },
    energyCell: {
        flex: 1,
        borderRadius: 2,
    }
});
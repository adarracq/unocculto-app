import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import Title1 from '@/app/components/atoms/Title1';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, View } from 'react-native';
import Title0 from '../atoms/Title0';

interface Props {
    visible: boolean;
    streak: number;
    onClose: () => void;
}

export default function DayStreakModal({ visible, streak, onClose }: Props) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const lottieRef = useRef<LottieView>(null);

    // On initialise directement avec streak - 1
    const [displayStreak, setDisplayStreak] = useState(streak > 0 ? streak - 1 : 0);

    useEffect(() => {
        if (visible) {
            // ETAPE 1 : Réinitialisation forcée immédiate (Important !)
            const startValue = streak > 0 ? streak - 1 : 0;
            setDisplayStreak(startValue);
            scaleAnim.setValue(0);

            // ETAPE 2 : Lancer l'animation de "POP"
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true
            }).start();

            // ETAPE 3 : Jouer le feu après un court délai
            setTimeout(() => {
                lottieRef.current?.play();
            }, 100);

            // ETAPE 4 : Incrémenter le chiffre (l'animation du nombre)
            // On attend 600ms (après le POP) pour changer le chiffre
            const timer = setTimeout(() => {
                // On passe de (streak-1) à (streak)
                // Tu peux faire un incrément simple ou une petite boucle si l'écart est grand
                // Ici, on simule un changement rapide
                const interval = setInterval(() => {
                    setDisplayStreak((prev) => {
                        if (prev < streak) {
                            return prev + 1;
                        } else {
                            clearInterval(interval);
                            return prev;
                        }
                    });
                }, 50); // Vitesse du compteur

                // Nettoyage de l'intervalle au cas où
                return () => clearInterval(interval);

            }, 800); // Délai avant que le chiffre ne change

            return () => clearTimeout(timer);

        } else {
            // Reset quand on ferme
            scaleAnim.setValue(0);
        }
    }, [visible, streak]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={[Colors.gold + '20', Colors.black]}
                        style={styles.card}
                    >
                        <View style={styles.header}>
                            <Title1 title="SÉRIE EN FLAMME !" color={Colors.white} style={{ letterSpacing: 1 }} />
                            <BodyText text="La régularité paie." style={{ color: Colors.lightGrey, fontSize: 12 }} />
                        </View>

                        <View style={styles.centerContent}>
                            <View style={styles.lottieContainer}>
                                <LottieView
                                    ref={lottieRef}
                                    source={require('@/app/assets/lotties/fire.json')}
                                    style={{ width: 200, height: 200 }}
                                    autoPlay={false}
                                    loop={true}
                                />
                            </View>

                            <View style={styles.numberContainer}>
                                {/* C'est ici qu'on affiche le state displayStreak */}
                                <Title0
                                    title={displayStreak.toString()}
                                    color={Colors.white}
                                    style={{ fontSize: 64, lineHeight: 70, textShadowColor: Colors.main, textShadowRadius: 20 }}
                                />
                                <Title1 title="JOURS" color={Colors.white} />
                            </View>
                        </View>

                        <View style={styles.bonusRow}>
                            <View style={styles.bonusBadge}>
                                <Image source={functions.getIconSource('fuel')} style={{ width: 16, height: 16 }} />
                                <BodyText text="+5 Fuel" style={{ color: Colors.lightGrey, fontWeight: 'bold' }} />
                            </View>
                            <BodyText text="Bonus quotidien récupéré" style={{ color: Colors.lightGrey, fontSize: 10 }} />
                        </View>

                        <View style={{ width: '100%' }}>
                            <MyButton
                                title="Continuer"
                                onPress={onClose}
                                variant="outline"
                                rightIcon='arrow-right'
                                bump
                            />
                        </View>

                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gold + '40',
        overflow: 'hidden',
        backgroundColor: Colors.black
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginVertical: 25,
    },
    lottieContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    bonusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 25,
        backgroundColor: 'rgba(255,255,255,.02)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    bonusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    }
});
import BodyText from '@/app/components/atoms/BodyText';
import MyButton from '@/app/components/atoms/MyButton';
import SmallText from '@/app/components/atoms/SmallText';
import Title0 from '@/app/components/atoms/Title0';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { StoryStep } from '@/app/models/Story';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

interface Props {
    step: StoryStep;
    onValid: () => void;
}

export default function OrderGameView({ step, onValid }: Props) {
    const correctOrder = step.orderItems || [];

    // DÉTECTION MODE LETTRES (Word Puzzle)
    // Si tous les items font 1 caractère, on passe en affichage horizontal
    const isWordMode = correctOrder.every(item => item.length === 1);

    const [pool, setPool] = useState<string[]>([]);
    const [slots, setSlots] = useState<(string | null)[]>([]);
    const [status, setStatus] = useState<'playing' | 'success' | 'error'>('playing');

    useEffect(() => {
        if (correctOrder.length > 0) {
            const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
            setPool(shuffled);
            setSlots(Array(correctOrder.length).fill(null));
            setStatus('playing');
        }
    }, [step]);

    const handlePressPoolItem = (item: string) => {
        if (status === 'success') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const firstEmptyIndex = slots.findIndex(s => s === null);
        if (firstEmptyIndex !== -1) {
            const newSlots = [...slots];
            newSlots[firstEmptyIndex] = item;
            setSlots(newSlots);

            // Pour les lettres, on retire du pool pour éviter les doublons visuels
            // (Note: Si deux lettres sont identiques, filter en retire une seule instance via index ou copie)
            // Ici, pour simplifier avec des strings primitives, on retire la PREMIÈRE occurrence trouvée
            const poolIndex = pool.indexOf(item);
            if (poolIndex > -1) {
                const newPool = [...pool];
                newPool.splice(poolIndex, 1);
                setPool(newPool);
            }

            if (status === 'error') setStatus('playing');
        }
    };

    const handlePressSlotItem = (item: string, index: number) => {
        if (status === 'success') return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        setPool([...pool, item]);

        if (status === 'error') setStatus('playing');
    };

    const checkAnswer = () => {
        if (slots.includes(null)) return;
        const isCorrect = JSON.stringify(slots) === JSON.stringify(correctOrder);

        if (isCorrect) {
            setStatus('success');
            Vibration.vibrate([0, 100, 50, 100, 50, 100, 200, 500]);
        } else {
            setStatus('error');
            Vibration.vibrate([0, 80, 50, 80, 50, 120]);
            setTimeout(() => {
                // On remet tout dans le pool en cas d'erreur
                const usedItems = slots.filter(s => s !== null) as string[];
                setPool([...pool, ...usedItems]);
                setSlots(Array(correctOrder.length).fill(null));
                setStatus('playing');
            }, 1500);
        }
    };

    const isFull = !slots.includes(null);

    return (
        <View style={styles.container}>
            <Title0 title={step.title} color={Colors.white} isLeft />
            <BodyText text={step.content} size='XL' color={Colors.white} style={{ marginBottom: 20 }} />

            {/* ZONE DE SLOTS (Réponse) */}
            <View style={[
                styles.slotsContainer,
                isWordMode ? styles.slotsContainerRow : styles.slotsContainerCol
            ]}>
                {slots.map((item, index) => (
                    <TouchableOpacity
                        key={`slot-${index}`}
                        style={[
                            styles.slot,
                            isWordMode ? styles.slotSquare : styles.slotRect, // Style conditionnel
                            item ? styles.slotFilled : styles.slotEmpty,
                            status === 'error' && styles.slotError,
                            status === 'success' && styles.slotSuccess,
                        ]}
                        onPress={() => item && handlePressSlotItem(item, index)}
                        activeOpacity={0.8}
                        disabled={!item}
                    >
                        {/* Pas de badge numéro en mode Word */}
                        {!isWordMode && item && (
                            <View style={styles.numberBadge}>
                                <Text style={styles.numberText}>{index + 1}</Text>
                            </View>
                        )}
                        {item &&
                            <Title2 title={item || ''} color={Colors.black} />
                        }
                    </TouchableOpacity>
                ))}
            </View>

            {/* ZONE DE POOL (Choix) */}
            <View style={styles.poolContainer}>
                {pool.map((item, index) => (
                    <TouchableOpacity
                        key={`pool-${index}`} // Index car items peuvent être identiques (ex: deux 'A' dans PANA)
                        style={[styles.poolItem, isWordMode && styles.poolItemSquare]}
                        onPress={() => handlePressPoolItem(item)}
                    >
                        <BodyText text={item} style={styles.poolText} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <MyButton
                    title={status === 'success' ? "Continuer" : "Vérifier"}
                    onPress={() => status === 'success' ? onValid() : checkAnswer()}
                    variant={'glass'}
                    disabled={!isFull}
                    rightIcon='arrow-right'
                    bump
                />
                {status === 'error' && <SmallText text="Ce n'est pas le bon ordre." style={{ color: Colors.red }} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', gap: 20, justifyContent: 'space-between' },

    // CONTAINERS
    slotsContainer: { width: '100%', marginBottom: 20 },
    slotsContainerCol: { gap: 12 },
    slotsContainerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },

    // SLOTS COMMON
    slot: {
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    // VARIANTE RECTANGLE (PHRASES)
    slotRect: { height: 56, flexDirection: 'row', paddingHorizontal: 16, width: '100%' },
    // VARIANTE CARRÉE (LETTRES)
    slotSquare: { width: 50, height: 50 },

    slotEmpty: { backgroundColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
    slotFilled: { backgroundColor: Colors.white, borderColor: Colors.white },
    slotError: { borderColor: '#FF5252', borderWidth: 2 },
    slotSuccess: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },

    numberBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.main, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    numberText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    // POOL
    poolContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, flex: 1, alignContent: 'center' },
    poolItem: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    poolItemSquare: { width: 50, height: 50, paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center', alignItems: 'center' },
    poolText: { color: Colors.white, fontSize: 18, fontWeight: '600' },

    footer: { marginTop: 10, minHeight: 80, alignItems: 'center', gap: 10 },
});
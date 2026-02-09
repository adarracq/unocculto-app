import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import { GameMode } from '@/app/constants/GameConfig';
import { Country, getFlagImage } from '@/app/models/Countries';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    mode: GameMode;
    options: Country[];
    onValidate: (code: string) => void;
    targetCode?: string;
}

export default function ArcadeControls({ mode, options, onValidate, targetCode }: Props) {
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Reset à chaque nouvelle question
    useEffect(() => {
        setSelectedCode(null);
        setIsValidating(false);
    }, [targetCode]);

    const handleOptionPress = (code: string) => {
        if (isValidating) return;

        setSelectedCode(code);
        setIsValidating(true);

        // Délai pour laisser l'utilisateur voir son clic avant la validation
        setTimeout(() => {
            onValidate(code);
        }, 800);
    };

    return (
        <View style={styles.choicesGrid}>
            {options.map((opt) => {
                const isSelected = selectedCode === opt.code;
                const isCorrectAnswer = opt.code === targetCode;
                const hasAnswered = selectedCode !== null;

                // Logique de couleur (Feedback immédiat au clic)
                let activeColor: string | null = null;
                let activeBg: string | null = null;

                if (isSelected) {
                    // C'est le bouton cliqué : Vert si juste, Rouge si faux
                    activeColor = isCorrectAnswer ? Colors.green : Colors.red;
                    activeBg = isCorrectAnswer ? Colors.green + '40' : Colors.red + '40';
                } else if (hasAnswered && isCorrectAnswer) {
                    // Correction : on montre la bonne réponse en vert si l'user s'est trompé
                    activeColor = Colors.green;
                    activeBg = Colors.green + '40';
                }

                return (
                    <TouchableOpacity
                        key={opt.code}
                        style={[
                            styles.choiceBtn,
                            {
                                aspectRatio: mode === 'flag' ? 1.5 : undefined,
                                borderColor: activeColor || 'rgba(255,255,255,0.2)'
                            }
                        ]}
                        onPress={() => handleOptionPress(opt.code)}
                        disabled={isValidating}
                    >
                        {mode === 'flag' ? (
                            <Image source={getFlagImage(opt.code)} style={styles.flag} />
                        ) : (
                            <BodyText
                                text={mode === 'capital' ? opt.capital : opt.name_fr}
                                color={Colors.white}
                                size="M"
                                style={{ textAlign: 'center', zIndex: 2 }}
                            />
                        )}

                        {/* OVERLAY COLORÉ */}
                        {activeBg && (
                            <View style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: activeBg, borderRadius: 10, zIndex: 1 }
                            ]} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
    choiceBtn: {
        width: '47%', height: 60, backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
        padding: 12
    },
    flag: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
});
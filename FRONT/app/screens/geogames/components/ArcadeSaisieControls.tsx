import SmallText from '@/app/components/atoms/SmallText';
import Colors from '@/app/constants/Colors';
import { GameMode } from '@/app/constants/GameConfig';
import { isFuzzyMatch } from '@/app/utils/textUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface Props {
    mode: GameMode;
    targetName?: string;
    targetCapital?: string;
    targetCode?: string;
    onValidate: (code: string) => void;
}

export default function ArcadeSaisieControls({ mode, targetName, targetCapital, targetCode, onValidate }: Props) {
    const [inputText, setInputText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [validationState, setValidationState] = useState<'neutral' | 'valid' | 'invalid'>('neutral');

    // Pour éviter le double déclenchement
    const [hasValidated, setHasValidated] = useState(false);

    // Reset à chaque nouvelle question
    useEffect(() => {
        setInputText('');
        setValidationState('neutral');
        setHasValidated(false);
        // On garde le focus si possible, ou on laisse le clavier ouvert
    }, [targetCode]);

    const handleTextChange = (text: string) => {
        if (hasValidated) return;
        setInputText(text);

        const answer = mode === 'capital' ? targetCapital : targetName;

        // Validation Fuzzy
        if (answer && targetCode && isFuzzyMatch(text, answer)) {
            setInputText(answer); // Corrige l'input avec la bonne réponse
            setHasValidated(true);
            setValidationState('valid');

            // Délai pour l'animation de succès
            setTimeout(() => {
                onValidate(targetCode);
            }, 300);
        }
    };

    // --- STYLES DYNAMIQUES ---
    const getBorderColor = () => {
        if (validationState === 'valid') return Colors.green;
        if (isFocused) return Colors.main;
        return 'rgba(255,255,255,0.1)';
    };

    const getBackgroundColor = () => {
        if (validationState === 'valid') return 'rgba(76, 175, 80, 0.1)'; // Vert très léger
        return 'rgba(0,0,0,0.3)'; // Fond sombre standard
    };

    const getIconName = () => {
        if (validationState === 'valid') return "checkmark-circle";
        if (isFocused) return "pencil"; // Ou "pulse"
        return "terminal-outline";
    };

    const getIconColor = () => {
        if (validationState === 'valid') return Colors.green;
        if (isFocused) return Colors.main;
        return Colors.darkGrey;
    };

    return (
        <View style={styles.container}>
            {/* LABEL TECHNIQUE */}
            <View style={styles.headerLabel}>
                <SmallText
                    text={mode === 'capital' ? "CAPITAL_DECRYPTION //" : "COUNTRY_IDENTIFICATION //"}
                    style={{ fontSize: 9, opacity: 0.7, letterSpacing: 1 }}
                    color={isFocused ? Colors.main : Colors.lightGrey}
                />
            </View>

            {/* ZONE DE SAISIE */}
            <View style={[
                styles.inputWrapper,
                {
                    borderColor: getBorderColor(),
                    backgroundColor: getBackgroundColor()
                }
            ]}>
                <TextInput
                    style={styles.input}
                    placeholder={mode === 'capital' ? "Entrez la capitale..." : "Entrez le pays..."}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={inputText}
                    onChangeText={handleTextChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoFocus={true}
                    selectionColor={Colors.main}
                />

                {/* ICONE D'ÉTAT (Droite) */}
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getIconName() as any}
                        size={20}
                        color={getIconColor()}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerLabel: {
        marginBottom: 6,
        paddingLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 12,
        borderWidth: 1, // Bordure fine et précise
        paddingHorizontal: 16,
        // Effet Glass léger
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: 18,
        fontFamily: 'text-regular',
        height: '100%',
        paddingRight: 10,
        letterSpacing: 0.5, // Un peu d'air pour le style tech
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
    }
});
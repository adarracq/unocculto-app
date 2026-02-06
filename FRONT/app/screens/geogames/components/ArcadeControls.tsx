import BodyText from '@/app/components/atoms/BodyText';
import Colors from '@/app/constants/Colors';
import { GameLevel, GameMode } from '@/app/constants/GameConfig';
import { Country, getFlagImage } from '@/app/models/Countries';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    level: GameLevel;
    mode: GameMode;
    options: Country[];
    onValidate: (code: string) => void;
    targetName?: string; // Pour valider l'input
    targetCapital?: string;
}

export default function ArcadeControls({ level, mode, options, onValidate, targetName, targetCapital }: Props) {
    const [inputText, setInputText] = useState('');

    const handleInputSubmit = () => {
        if (!targetName) return;
        const answer = mode === 'capital' ? targetCapital : targetName;
        // Comparaison souple (trim + lowercase)
        if (answer && inputText.toLowerCase().trim() === answer.toLowerCase()) {
            // Astuce: on renvoie le bon code via le parent qui connait le contexte, 
            // mais ici on peut juste déclencher la validation success du parent si on avait le code.
            // Mieux vaut passer "onValidate" qui prend le code. 
            // Pour simplifier ici on suppose que le parent gère ou on triche un peu en envoyant un signal special ou le code si on l'avait.
            // ==> RECTIFICATION: Le composant doit recevoir la "bonne réponse" pour comparer, ou renvoyer le texte au parent.
            // Pour rester simple avec l'architecture précédente :
            // On va dire que si ça match, on appelle onValidate('CORRECT_CODE') -> Mais on n'a pas le code cible ici dans props si options est vide.
            // Le plus propre : Le parent gère la validation du texte.
            onValidate(inputText);
        } else {
            onValidate('WRONG_ANSWER');
        }
        setInputText('');
    };

    if (level === 2) {
        return (
            <View style={styles.hintContainer}>
                <Ionicons name="finger-print" size={24} color={Colors.main} />
                <BodyText text="Touchez la zone correspondante sur la carte" color={Colors.main} size="S" />
            </View>
        );
    }

    if (level === 3) {
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={mode === 'capital' ? "Nom de la capitale..." : "Nom du pays..."}
                    placeholderTextColor={Colors.disabled}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleInputSubmit}
                    autoCorrect={false}
                />
                <TouchableOpacity style={styles.validateBtn} onPress={handleInputSubmit}>
                    <Ionicons name="arrow-forward" size={24} color={Colors.black} />
                </TouchableOpacity>
            </View>
        );
    }

    // Level 1
    return (
        <View style={styles.choicesGrid}>
            {options.map((opt) => (
                <TouchableOpacity
                    key={opt.code}
                    style={styles.choiceBtn}
                    onPress={() => onValidate(opt.code)}
                >
                    {mode === 'flag' ? (
                        <Image source={getFlagImage(opt.code)} style={styles.flagSmall} />
                    ) : (
                        <BodyText
                            text={mode === 'capital' ? opt.capital : opt.name_fr}
                            color={Colors.white}
                            size="M"
                            style={{ textAlign: 'center' }}
                        />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
    choiceBtn: {
        width: '47%', height: 60, backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', padding: 5
    },
    flagSmall: { width: 50, height: 35, borderRadius: 4 },
    hintContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: 20, backgroundColor: 'rgba(219, 157, 0, 0.15)',
        borderRadius: 12, borderWidth: 1, borderColor: Colors.main
    },
    inputContainer: { flexDirection: 'row', gap: 10 },
    input: {
        flex: 1, height: 50, backgroundColor: Colors.darkBlue, borderRadius: 12,
        paddingHorizontal: 15, color: Colors.white, borderWidth: 1, borderColor: Colors.disabled
    },
    validateBtn: {
        width: 50, height: 50, borderRadius: 12, backgroundColor: Colors.main,
        justifyContent: 'center', alignItems: 'center'
    }
});
import BodyText from "@/app/components/atoms/BodyText";
import MyButton from "@/app/components/atoms/MyButton";
import Title0 from "@/app/components/atoms/Title0";
import Colors from "@/app/constants/Colors";
import { RewardStep } from "@/app/models/Story"; // On importe le type spécifique
import { functions } from "@/app/utils/Functions";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

interface Props {
    step: RewardStep; // CORRECTION ICI : On précise le type exact
    onNext: () => void;
}

export default function StoryReward({ step, onNext }: Props) {

    const [next, setNext] = useState(false);
    // Logique d'image : 
    // Si c'est une URL/URI (http ou file), on l'utilise directement (pour les drapeaux générés)
    // Sinon, on passe par la fonction helper (pour les badges statiques 'badge_paris')
    const imageSource = step.rewardImage?.startsWith('http') || step.rewardImage?.startsWith('file')
        ? { uri: step.rewardImage }
        : functions.getRewardSource(step.rewardImage || 'none');

    useEffect(() => {
        functions.vibrate('success');
        setNext(false);
    }, [step]);

    return (
        <View style={styles.container}>
            <View style={styles.centerContent}>

                <Title0 title={step.title} color={Colors.white} />

                {step.rewardImage && (
                    <View style={styles.rewardContainer}>
                        <Image
                            source={imageSource}
                            style={styles.rewardImage}
                            resizeMode='contain'
                        />
                    </View>
                )}

                <BodyText
                    text={step.content}
                    style={{ color: Colors.lightGrey, textAlign: 'center', }}
                />
            </View>

            <View style={{ width: '100%' }}>
                {
                    !next &&
                    <MyButton
                        title="Réclamer"
                        onPress={() => {
                            setNext(true);
                            onNext();
                        }}
                        variant="glass"
                        rightIcon="arrow-right"
                        bump
                    />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between' },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
    },
    glowContainer: {
        shadowColor: Colors.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30, // Effet "Légendaire"
        elevation: 10,
    },
    rewardContainer: {
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        backgroundColor: Colors.white + '10',
        borderWidth: 1,
        borderColor: Colors.white + '20',
    },
    rewardImage: {
        width: 150,
        height: 150
    }

});
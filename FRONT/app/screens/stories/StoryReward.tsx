import BodyText from "@/app/components/atoms/BodyText";
import MyButton from "@/app/components/atoms/MyButton";
import Title0 from "@/app/components/atoms/Title0";
import Colors from "@/app/constants/Colors";
import { RewardStep } from "@/app/models/Story"; // On importe le type spécifique
import { functions } from "@/app/utils/Functions";
import { Image, StyleSheet, View } from "react-native";

interface Props {
    step: RewardStep; // CORRECTION ICI : On précise le type exact
    onNext: () => void;
}

export default function StoryReward({ step, onNext }: Props) {

    // Logique d'image : 
    // Si c'est une URL/URI (http ou file), on l'utilise directement (pour les drapeaux générés)
    // Sinon, on passe par la fonction helper (pour les badges statiques 'badge_paris')
    const imageSource = step.rewardImage?.startsWith('http') || step.rewardImage?.startsWith('file')
        ? { uri: step.rewardImage }
        : functions.getRewardSource(step.rewardImage || 'none');

    return (
        <View style={styles.container}>
            <View style={styles.centerContent}>

                <Title0 title={step.title} color={Colors.white} />

                {step.rewardImage && (
                    <View style={styles.glowContainer}>
                        <Image
                            source={imageSource}
                            style={styles.rewardImage}
                            resizeMode='contain'
                        />
                    </View>
                )}

                <BodyText
                    text={step.content}
                    size='XL'
                    style={{ color: Colors.white, textAlign: 'center', opacity: 0.9 }}
                />
            </View>

            <View style={{ width: '100%' }}>
                <MyButton
                    title="Réclamer"
                    onPress={onNext}
                    variant="glass"
                    rightIcon="arrow-right"
                    bump
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
    },
    glowContainer: {
        shadowColor: Colors.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30, // Effet "Légendaire"
        elevation: 10,
    },
    rewardImage: {
        width: 220,
        height: 220,
    }
});
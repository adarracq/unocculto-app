import BodyText from "@/app/components/atoms/BodyText";
import SmallText from "@/app/components/atoms/SmallText";
import Title0 from "@/app/components/atoms/Title0";
import Colors from "@/app/constants/Colors";
import { StoryStep } from "@/app/models/Story";
import { Image, StyleSheet, View } from "react-native";


export default function StoryDialogue({ step }: { step: StoryStep }) {
    return (
        <View style={styles.centerContent}>
            {step.imageUri && (
                <Image
                    source={{
                        uri: step.imageUri,
                        headers: {
                            'User-Agent': 'Unocculto/1.0 (contact@unocculto.com)'
                        }
                    }}
                    style={styles.storyImage}
                    resizeMode='contain'
                    // load
                    onLoad={() => console.log("Image loaded:", step.imageUri)}
                />
            )}
            <View style={{ gap: 20, marginTop: step.imageUri ? 20 : 0 }}>
                <Title0 title={step.title} isLeft color={Colors.white} />
                <BodyText text={step.content} size='XL' style={{ color: Colors.white }} />
            </View>

            {/* Indication visuelle subtile pour dire qu'on peut taper */}
            <View style={styles.tapIndicator}>
                <SmallText text="Appuyez pour continuer" style={{ opacity: 0.6 }} />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center', // Attention, peut casser l'alignement gauche du texte
    },
    storyImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 30,
    },
    tapIndicator: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    }
});
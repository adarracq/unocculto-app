import BodyText from "@/app/components/atoms/BodyText";
import MyButton from "@/app/components/atoms/MyButton";
import Title0 from "@/app/components/atoms/Title0";
import Colors from "@/app/constants/Colors";
import { StoryStep } from "@/app/models/Story";
import { functions } from "@/app/utils/Functions";
import { Image, StyleSheet, View } from "react-native";

interface Props {
    step: StoryStep;
    onNext: () => void; // Nouvelle prop
}

export default function StoryReward({ step, onNext }: Props) {


    return (
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 40 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 50 }}>
                {/* Image de récompense si dispo */}
                <Title0 title={step.title} color={Colors.white} />
                <Image
                    source={functions.getRewardSource(step.rewardImage || 'none')}
                    style={{ width: 200, height: 200, alignSelf: 'center', }}
                    resizeMode='contain'
                />

                <BodyText
                    text={step.content}
                    size='XL'
                    style={{ color: Colors.white, textAlign: 'center', opacity: 0.9 }}
                />
            </View>

            <View style={{ width: '100%' }}>
                <MyButton
                    title="Continuer"
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
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
    },
    tapIndicator: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    }
});
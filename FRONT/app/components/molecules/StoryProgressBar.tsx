import Colors from "@/app/constants/Colors";
import { StoryStep } from "@/app/models/Story";
import { Animated, StyleSheet, View } from "react-native";


export default function StoryProgressBar(
    { steps, currentIndex, animValue }: { steps: StoryStep[], currentIndex: number, animValue: Animated.Value }) {
    return (
        <View style={styles.progressContainer}>
            {steps.map((step, index) => {
                return (
                    <View key={index} style={styles.progressBarBackground}>
                        {/* Barre remplie (Passé) */}
                        {index < currentIndex && (
                            <View style={[styles.progressBarFill, { width: '100%' }]} />
                        )}
                        {/* Barre en cours (Animation) */}
                        {index === currentIndex && (
                            <Animated.View style={[
                                styles.progressBarFill,
                                {
                                    width: animValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]} />
                        )}
                    </View>
                );
            })}
        </View>
    );
};


const styles = StyleSheet.create({

    progressContainer: {
        flexDirection: 'row',
        gap: 4, // Espace entre les barres
        height: 4, // Hauteur fine style Insta
    },
    progressBarBackground: {
        flex: 1, // Répartition équitable
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        height: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        backgroundColor: Colors.white,
        height: '100%',
        borderRadius: 2,
    },
});
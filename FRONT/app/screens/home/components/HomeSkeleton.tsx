// Exemple simplifié d'un HomeSkeleton
import Colors from '@/app/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function HomeSkeleton() {
    return (
        <LinearGradient colors={[Colors.darkGrey, Colors.black]} style={{ flex: 1 }}>
            {/* Faux Header */}
            <LinearGradient colors={[Colors.black, Colors.realBlack]} style={{ paddingTop: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 30, paddingBottom: 80 }}>
                <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    {/* Rond pour le streak */}
                    <View style={{ width: 80, height: 30, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    {/* Rond pour le fuel */}
                    <View style={{ width: 60, height: 30, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                </View>
                {/* Faux Passeport (gros bloc) */}
                <View style={{ marginHorizontal: 20, height: 180, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }} />
            </LinearGradient>

            {/* Faux Boarding Pass */}
            <View style={{ margin: 20, height: 250, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginTop: 100 }} />
        </LinearGradient>
    );
}
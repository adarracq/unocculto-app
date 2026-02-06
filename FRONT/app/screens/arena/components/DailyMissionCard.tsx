import BodyText from '@/app/components/atoms/BodyText';
import SmallText from '@/app/components/atoms/SmallText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { functions } from '@/app/utils/Functions';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    title: string;
    type: string; // ex: "DRAPEAUX"
    bonus: string; // ex: "XP x2"
    regionId: string; // ex: "AFR" pour afficher l'icone de fond
    onPress: () => void;
}

export default function DailyMissionCard({ title, type, bonus, regionId, onPress }: Props) {
    // --- COMPTE A REBOURS DYNAMIQUE ---
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // Minuit pile ce soir

            const diff = midnight.getTime() - now.getTime();

            if (diff <= 0) return "EXPIRÉ";

            const hours = Math.floor((diff / (1000 * 60 * 60)));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return `${hours}h${minutes}min`;
        };

        // Init
        setTimeLeft(calculateTimeLeft());

        // Update chaque minute
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
            <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(0,0,0,0)']} // Gold subtil
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {/* Header Badge */}
                <View style={styles.badgeRow}>
                    <View style={styles.tagContainer}>
                        <SmallText text="PRIORITÉ HAUTE" color={Colors.black} isBold style={{ fontSize: 10 }} />
                    </View>
                    {/* Timer Dynamique */}
                    <SmallText text={`EXPIRE DANS ${timeLeft}`} color={Colors.gold} />
                </View>

                {/* Contenu */}
                <View style={styles.contentRow}>
                    <View style={{ flex: 1 }}>
                        <SmallText text={`CIBLE : ${type}`} color={'rgba(255,255,255,0.5)'} isLeft />
                        <Title2 title={title} color={Colors.white} isLeft style={{ marginTop: 2 }} />
                    </View>

                    {/* Bonus Pill */}
                    <View style={styles.bonusPill}>
                        {/* Tu peux importer ton icone lightning ici si tu veux */}
                        <BodyText text={bonus} isBold style={{ color: Colors.black }} />
                    </View>
                </View>

                {/* Décoration */}
                <View style={styles.bgIconContainer}>
                    <Image
                        source={functions.getImageSource(regionId)}
                        style={styles.bgIcon}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 25,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.gold,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    gradient: { padding: 16 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tagContainer: { backgroundColor: Colors.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    contentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bonusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.white,
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#FFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    bgIconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
    },
    bgIcon: {
        width: '100%',
        height: '100%',
        opacity: 0.08,
        right: 0,
        top: 0,
    },
});
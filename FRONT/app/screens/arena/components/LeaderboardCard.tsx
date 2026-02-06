import BodyText from '@/app/components/atoms/BodyText';
import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { getFlagImage } from '@/app/models/Countries'; // Import nécessaire
import { functions } from '@/app/utils/Functions';
import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

export interface LeaderboardEntry {
    rank: number;
    pseudo: string;
    time?: string;
    accuracy?: number;
    score?: string | number;
    isUser?: boolean;
    flag?: string; // Code drapeau (ex: "FR")
}

interface Props {
    title: string;
    subTitle?: string;
    data: LeaderboardEntry[] | null;
    style?: ViewStyle;
    limit?: number;
    headerRightComponent?: React.ReactNode;
}

export default function LeaderboardCard({ title, subTitle, data, style, limit = 10, headerRightComponent }: Props) {
    const displayData = data && data.length > 0 ? data.slice(0, limit) : [];
    const isEmpty = !data || data.length === 0;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <View>
                    <Title2 title={title} color={Colors.lightGrey} isLeft />
                    {subTitle && (
                        <BodyText text={subTitle} color={Colors.gold} style={{ fontSize: 10, fontWeight: 'bold' }} />
                    )}
                </View>
                {headerRightComponent}
            </View>

            <View style={styles.box}>
                {isEmpty ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <BodyText text="AUCUNE DONNÉE" color={Colors.darkGrey} style={{ fontSize: 12 }} />
                    </View>
                ) : (
                    displayData.map((item, index) => (
                        <LeaderboardRow
                            key={index}
                            {...item}
                            isLast={index === displayData.length - 1}
                        />
                    ))
                )}
            </View>
        </View>
    );
}

const LeaderboardRow = ({ rank, pseudo, time, accuracy, score, isUser, flag, isLast }: any) => {
    const rankColor = rank === 1 ? Colors.gold : rank === 2 ? Colors.silver : rank === 3 ? Colors.bronze : Colors.darkGrey;
    const textColor = isUser ? Colors.main : Colors.white;

    return (
        <View style={[styles.row, !isLast && styles.borderBottom, isUser && styles.userHighlight]}>
            {/* 1. Rang */}
            <BodyText text={`#${rank}`} color={rankColor} isBold style={{ width: 30 }} />

            {/* 2. Drapeau + Pseudo */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {/* Affichage du drapeau si présent */}
                {flag && (
                    <Image
                        source={getFlagImage(flag)}
                        style={styles.flagIcon}
                        resizeMode="cover"
                    />
                )}

                <BodyText
                    text={pseudo}
                    color={textColor}
                    isBold={isUser}
                    style={{ flex: 1 }}
                />
            </View>

            {/* 3. Stats (Droite) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {time && accuracy !== undefined ? (
                    <>
                        <View style={styles.statTag}>
                            <Image source={functions.getIconSource('target')} style={[styles.icon, { tintColor: Colors.lightGrey }]} />
                            <BodyText text={`${accuracy}%`} color={Colors.lightGrey} style={styles.mono} />
                        </View>
                        <View style={styles.statTag}>
                            <Image source={functions.getIconSource('clock')} style={[styles.icon, { tintColor: isUser ? Colors.main : Colors.white }]} />
                            <BodyText text={time} color={isUser ? Colors.main : Colors.white} style={styles.mono} />
                        </View>
                    </>
                ) : (
                    <BodyText text={score?.toString()} color={Colors.lightGrey} style={styles.mono} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
    box: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, height: 48 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    userHighlight: {
        backgroundColor: 'rgba(255, 150, 0, 0.05)',
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    statTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    icon: { width: 12, height: 12 },
    mono: { fontFamily: 'monospace', fontSize: 12 },

    // Style Drapeau
    flagIcon: {
        width: 24,
        height: 16,
        borderRadius: 2,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)'
    }
});
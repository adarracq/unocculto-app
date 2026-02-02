import Title2 from '@/app/components/atoms/Title2';
import Colors from '@/app/constants/Colors';
import { ALL_COUNTRIES, getFlagImage } from '@/app/models/Countries';
import { Story } from '@/app/models/Story'; // Ton interface Story
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
    story: Story; // On reçoit une story (light), pas juste un country
    isSelected: boolean;
}

export default function DestinationGridItem({ story, isSelected }: Props) {
    // On retrouve le drapeau via le code pays
    const countryInfo = ALL_COUNTRIES.find(c => c.code === story.countryCode);
    const flag = countryInfo?.flag || '✈️';

    return (
        <View style={styles.container}>
            {/* Header : Drapeau + Code Pays */}
            <View style={styles.header}>
                <Image
                    source={getFlagImage(story.countryCode)}
                    style={{ width: 40, height: 25, borderRadius: 4 }}
                    resizeMode="cover"
                />
                <Text style={[
                    styles.code,
                    { color: isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }
                ]}>
                    {story.countryCode}
                </Text>
            </View>

            {/* Info Ville */}
            <View>
                <Title2
                    title={story.city.toUpperCase()}
                    color={isSelected ? Colors.white : 'rgba(255,255,255,0.9)'}
                    style={{ fontSize: 18, letterSpacing: 1 }}
                />
                <Text style={[
                    styles.subtitle,
                    { color: isSelected ? Colors.main : 'rgba(255,255,255,0.5)' }
                ]}>
                    {story.title}
                </Text>
            </View>

            {/* Badge Rareté (Optionnel, petit point de couleur) */}
            {story.rarity !== 'common' && (
                <View style={[
                    styles.rarityBadge,
                    { backgroundColor: story.rarity === 'legendary' ? '#FFD700' : '#A020F0' }
                ]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        padding: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flag: { fontSize: 24 },
    code: { fontSize: 20, fontWeight: '900' },
    subtitle: { fontSize: 10, marginTop: 2 },
    rarityBadge: {
        position: 'absolute',
        top: 0, right: 0,
        width: 8, height: 8,
        borderRadius: 4,
    }
});
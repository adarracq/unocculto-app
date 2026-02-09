// app/components/molecules/ProgressBarLvl.tsx
import Colors from '@/app/constants/Colors';
import Levels from '@/app/constants/Levels'; // Assurez-vous que l'import matche le fichier créé
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import * as Progress from 'react-native-progress';
import BodyText from '../atoms/BodyText';
import Title1 from '../atoms/Title1';

type ProgressBarLvlProps = {
    xp: number; // Renommé pour la clarté
    width: number;
    color?: string; // Optionnel, on peut utiliser la couleur par défaut
}

export default function ProgressBarLvl(props: ProgressBarLvlProps) {
    const levels = Levels.levels;
    const safeXp = props.xp || 0;
    const barColor = props.color || Colors.main;

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isFirstRender = useRef(true);

    // Calcul du niveau actuel et du prochain palier
    const progressData = useMemo(() => {
        let currentLevel = levels[0];
        let nextLevel = levels[1] || { xpThreshold: safeXp * 1.5 }; // Fallback fin

        // Trouver le niveau actuel
        for (let i = 0; i < levels.length; i++) {
            if (safeXp >= levels[i].xpThreshold) {
                currentLevel = levels[i];
                nextLevel = levels[i + 1] || { xpThreshold: levels[i].xpThreshold * 1.5 };
            } else {
                break;
            }
        }

        // Pour la barre : on veut montrer la progression DANS le niveau courant
        // ex: Niv 1 (0xp) -> Niv 2 (200xp). J'ai 100xp. Progression = 50%.
        const xpInLevel = safeXp; // - currentLevel.xpThreshold; (Optionnel si on veut une barre relative)
        const xpTarget = nextLevel.xpThreshold;

        return {
            label: currentLevel.labelFR,
            current: safeXp,
            target: xpTarget,
            progress: Math.min(1, safeXp / xpTarget)
        };
    }, [safeXp]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
            // Petite animation "pop" quand l'XP change
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true })
            ]).start();
        }
    }, [safeXp]);

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: props.width,
                alignItems: 'flex-end'
            }}>
                {/* Niveau (Label) */}
                <Title1 title={progressData.label.toUpperCase()} color={Colors.white} style={{ fontSize: 16 }} />

                {/* Score Animé */}
                <Animated.View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    transform: [{ scale: scaleAnim }]
                }}>
                    <Title1 title={progressData.current.toString()} color={barColor} />
                    <BodyText text={' / ' + progressData.target + ' XP'} color={Colors.lightGrey} size='S' />
                </Animated.View>
            </View>

            <Progress.Bar
                progress={progressData.progress}
                width={props.width}
                height={8}
                color={barColor}
                unfilledColor={'rgba(255,255,255,0.1)'}
                borderWidth={0}
                borderRadius={4}
                useNativeDriver={true}
            />
        </View>
    )
}
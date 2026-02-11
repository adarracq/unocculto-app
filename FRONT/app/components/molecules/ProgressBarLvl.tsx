// app/components/molecules/ProgressBarLvl.tsx
import Colors from '@/app/constants/Colors';
import Levels from '@/app/constants/Levels';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import * as Progress from 'react-native-progress';
import BodyText from '../atoms/BodyText';
import Title1 from '../atoms/Title1';

type ProgressBarLvlProps = {
    xp: number;
    width: number;
    color?: string;
}

export default function ProgressBarLvl(props: ProgressBarLvlProps) {
    const levels = Levels.levels; // Assure-toi d'accéder au bon tableau exporté
    const safeXp = props.xp || 0;
    const barColor = props.color || Colors.main;

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isFirstRender = useRef(true);

    const progressData = useMemo(() => {
        // 1. Trouver l'index du niveau actuel
        // On cherche le dernier niveau dont le seuil est inférieur ou égal à l'XP
        let currentLevelIndex = 0;

        for (let i = 0; i < levels.length; i++) {
            if (safeXp >= levels[i].xpThreshold) {
                currentLevelIndex = i;
            } else {
                // Dès qu'on dépasse notre XP, on arrête, on est au niveau précédent
                break;
            }
        }

        const currentLevel = levels[currentLevelIndex];
        const nextLevel = levels[currentLevelIndex + 1];

        // 2. Définir les bornes (Floor et Ceiling)
        const xpFloor = currentLevel.xpThreshold; // Début du niveau (ex: 1000)

        // Si on est au niveau max, on invente un plafond pour ne pas casser l'app
        const xpCeiling = nextLevel ? nextLevel.xpThreshold : (xpFloor * 1.5); // Fin du niveau (ex: 1500)

        // 3. Calculer la progression RELATIVE
        const xpGainedInLevel = safeXp - xpFloor; // J'ai fait combien depuis le début du niveau ?
        const levelRange = xpCeiling - xpFloor;    // Quelle est la taille du niveau ?

        // On s'assure de ne pas diviser par 0 et de rester entre 0 et 1
        const progressPercent = levelRange > 0 ? Math.min(1, Math.max(0, xpGainedInLevel / levelRange)) : 1;

        return {
            label: currentLevel.labelFR,
            // Option A: Afficher l'XP relative (ex: 250 / 500 XP)
            textCurrent: Math.floor(xpGainedInLevel),
            textTarget: levelRange,

            // Option B: Garder l'XP totale mais avec la bonne barre (ex: 1250 / 1500 XP)
            // Si tu préfères l'option B, décommente les lignes ci-dessous :
            // textCurrent: safeXp,
            // textTarget: xpCeiling,

            progress: progressPercent
        };
    }, [safeXp, levels]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
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
                    <Title1 title={progressData.textCurrent.toString()} color={barColor} />
                    <BodyText text={' / ' + progressData.textTarget + ' XP'} color={Colors.lightGrey} size='S' />
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
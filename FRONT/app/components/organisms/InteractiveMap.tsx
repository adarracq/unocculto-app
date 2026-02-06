import Colors from '@/app/constants/Colors';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

// @ts-ignore
import WorldGeoJSON from '@/app/constants/world-countriesM.json';

// Pour éviter les warnings
MapLibreGL.setAccessToken(null);

// STYLE VIDE ABSOLU (Noir, sans sources)
const VOID_STYLE = {
    version: 8,
    name: "Void",
    sources: {}, // Aucune source de données = Pas de frontières bleues, pas de texte
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#000000' // Noir profond
            }
        }
    ]
};

interface Props {
    countryColors?: Record<string, string>;
    onCountryPress?: (countryCode: string) => void;
    selectedCountry?: string | null;
    focusCoordinates?: [number, number] | null;
    isFullHeight?: boolean; // Option pour forcer la hauteur à 100% du parent
}

export default function InteractiveMap({ countryColors = {}, onCountryPress, selectedCountry, focusCoordinates, isFullHeight }: Props) {
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    useEffect(() => {
        if (focusCoordinates && cameraRef.current) {
            // Si on reçoit des coordonnées, on vole vers elles
            cameraRef.current.setCamera({
                centerCoordinate: focusCoordinates,
                zoomLevel: 3, // Zoom suffisant pour bien voir le pays
                animationDuration: 2000, // 2 secondes de vol (fluide)
                animationMode: 'flyTo'
            });
        }
    }, [focusCoordinates]);

    // --- LOGIQUE COULEURS ---
    const fillColorExpression = useMemo(() => {
        const cases: any[] = [];

        // 1. COULEURS FORCÉES (Gagné/Perdu)
        Object.entries(countryColors).forEach(([code, color]) => {
            cases.push(code, color);
        });

        // 2. SÉLECTION JOUEUR (Orange)
        if (selectedCountry && !countryColors[selectedCountry]) {
            cases.push(selectedCountry, Colors.main);
        }

        // Si vide, retour gris foncé
        if (cases.length === 0) {
            return '#2A2A2A';
        }

        // MATCH sur 'iso_a2_eh' (Propriété validée pour la France)
        return ['match', ['get', 'iso_a2_eh'], ...cases, '#2A2A2A'];

    }, [countryColors, selectedCountry]);

    const handleShapePress = (e: any) => {
        const feature = e.features[0];
        const countryCode = feature?.properties?.iso_a2_eh;

        if (countryCode && onCountryPress) {
            onCountryPress(countryCode);
        }
    };

    return (
        <View style={[styles.container,
        {
            height: isFullHeight ? Dimensions.get('window').height + 100 : 450
        }]}>
            <MapLibreGL.MapView
                key="map-void" // Force un render unique propre
                style={styles.map}
                mapStyle={JSON.stringify(VOID_STYLE)}
                logoEnabled={false}
                attributionEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: [2.35, 48.85], // Europe
                        zoomLevel: 1 // Monde
                    }}
                />

                {/* NOS DONNÉES GEOJSON */}
                <MapLibreGL.ShapeSource
                    id="countriesSource"
                    shape={WorldGeoJSON}
                    onPress={handleShapePress}
                >
                    {/* Remplissage */}
                    <MapLibreGL.FillLayer
                        id="countriesFill"
                        style={{
                            fillColor: fillColorExpression,
                            fillOpacity: 1
                        }}
                    />

                    {/* Frontières (Gris, fin) */}
                    <MapLibreGL.LineLayer
                        id="countriesLine"
                        style={{
                            lineColor: '#333333',
                            lineWidth: 0.5,
                            lineOpacity: 1
                        }}
                    />
                </MapLibreGL.ShapeSource>
            </MapLibreGL.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '120%',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#000000'
    },
    map: {
        flex: 1
    }
});
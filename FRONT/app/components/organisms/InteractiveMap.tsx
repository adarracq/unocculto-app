import Colors from '@/app/constants/Colors';
import WorldGeoJSON from '@/app/constants/world-countriesM.json';
import { MICRO_ISLANDS_STATES } from '@/app/models/Countries';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

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
                'background-color': '#0000' // Noir profond
            }
        }
    ]
};

const SCALE_FACTOR = 3;       // Grossissement général (ex: x3)
const EXTRA_THICKNESS = 0.2; // Épaisseur ajoutée en degrés (Le "Gras")

interface Props {
    countryColors?: Record<string, string>;
    onCountryPress?: (countryCode: string) => void;
    selectedCountry?: string | null;
    focusCoordinates?: [number, number] | null;
    isFullHeight?: boolean; // Option pour forcer la hauteur à 100% du parent
    zoomLevel?: number;
    defaultCenter?: [number, number];
    defaultZoom?: number;
}

export default function InteractiveMap({ countryColors = {}, onCountryPress, selectedCountry, focusCoordinates, isFullHeight, zoomLevel = 3, defaultCenter = [2.35, 48.85], defaultZoom = 1 }: Props) {
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    useEffect(() => {
        // On utilise un timeout pour s'assurer que la Map est bien montée
        // avant d'envoyer la commande de caméra (fixe le bug du start)
        const timer = setTimeout(() => {
            if (cameraRef.current) {
                if (focusCoordinates) {
                    cameraRef.current.setCamera({
                        centerCoordinate: focusCoordinates,
                        zoomLevel: zoomLevel,
                        animationDuration: 2000,
                        animationMode: 'flyTo'
                    });
                }
            }
        }, 200); // 200ms de délai suffisent

        return () => clearTimeout(timer);
    }, [focusCoordinates, zoomLevel]);


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

    const scaleRingWithThickness = (coordinates: number[][]) => {
        if (!coordinates || coordinates.length === 0) return coordinates;

        // 1. Trouver le centre géométrique
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        coordinates.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // 2. Déplacer les points
        return coordinates.map(([x, y]) => {
            // Vecteur du centre vers le point
            const dx = x - centerX;
            const dy = y - centerY;

            // Distance actuelle
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Si le point est confondu avec le centre (bug rare), on ne touche pas
            if (dist === 0) return [x, y];

            // Vecteur Unitaire (Direction pure, longueur 1)
            const ux = dx / dist;
            const uy = dy / dist;

            // NOUVELLE FORMULE :
            // On garde la proportion (dist * factor) 
            // ET on ajoute une épaisseur fixe (EXTRA_THICKNESS) qui gonfle les formes fines
            const newDist = (dist * SCALE_FACTOR) + EXTRA_THICKNESS;

            return [
                centerX + ux * newDist,
                centerY + uy * newDist
            ];
        });
    };

    const scaledGeoJSON = useMemo(() => {
        const modifiedJSON = JSON.parse(JSON.stringify(WorldGeoJSON));

        modifiedJSON.features = modifiedJSON.features.map((feature: any) => {
            const countryCode = feature.properties.iso_a2_eh;

            if (!MICRO_ISLANDS_STATES.includes(countryCode)) {
                return feature;
            }

            // On applique la nouvelle fonction qui gonfle ET agrandit
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates = feature.geometry.coordinates.map((ring: any) =>
                    scaleRingWithThickness(ring)
                );
            }
            else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates = feature.geometry.coordinates.map((polygon: any) =>
                    polygon.map((ring: any) => scaleRingWithThickness(ring))
                );
            }

            return feature;
        });

        return modifiedJSON;
    }, []);


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
                        centerCoordinate: defaultCenter,
                        zoomLevel: defaultZoom,
                    }}
                />

                {/* NOS DONNÉES GEOJSON */}
                <MapLibreGL.ShapeSource
                    id="countriesSource"
                    shape={scaledGeoJSON} // <--- CHANGEMENT ICI
                    onPress={handleShapePress}
                    hitbox={{ width: 50, height: 50 }} // Aide au clic
                >
                    <MapLibreGL.FillLayer
                        id="countriesFill"
                        style={{
                            fillColor: fillColorExpression,
                            fillOpacity: 1
                        }}
                    />
                    <MapLibreGL.LineLayer
                        id="countriesLine"
                        style={{
                            lineColor: Colors.darkGrey,
                            lineWidth: 0.5,
                            lineOpacity: 0.5
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
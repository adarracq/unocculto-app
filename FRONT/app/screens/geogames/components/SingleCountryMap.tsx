import Colors from '@/app/constants/Colors';
import WorldGeoJSON from '@/app/constants/world-countriesM.json'; // Assurez-vous que le chemin est bon
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

// Fonction utilitaire pour calculer la Bounding Box [minX, minY, maxX, maxY]
// afin de centrer la caméra sur le pays
const calculateBounds = (coordinates: any[], type: string): [number, number, number, number] | null => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const traverse = (coords: any[]) => {
        // Si c'est un point [lon, lat]
        if (typeof coords[0] === 'number') {
            const x = coords[0];
            const y = coords[1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        } else {
            // Sinon on descend
            coords.forEach(sub => traverse(sub));
        }
    };

    traverse(coordinates);

    if (minX === Infinity) return null;

    // Ajout d'une marge (padding) de 10% pour que le contour ne colle pas aux bords
    const paddingX = (maxX - minX) * 0.1;
    const paddingY = (maxY - minY) * 0.1;

    return [minX - paddingX, minY - paddingY, maxX + paddingX, maxY + paddingY];
};

interface Props {
    countryCode: string;
    color?: string;
}

export default function SingleCountryMap({ countryCode, color = Colors.white }: Props) {
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    // 1. Extraire uniquement la Feature du pays cible
    const countryFeature = useMemo(() => {
        const feature = (WorldGeoJSON as any).features.find(
            (f: any) => f.properties.iso_a2_eh === countryCode
        );

        if (!feature) return null;

        return {
            type: "FeatureCollection",
            features: [feature]
        };
    }, [countryCode]);

    // 2. Calculer les bounds pour le zoom automatique
    const bounds = useMemo(() => {
        if (!countryFeature || !countryFeature.features[0]) return null;
        const feature = countryFeature.features[0];
        return calculateBounds(feature.geometry.coordinates, feature.geometry.type);
    }, [countryFeature]);

    if (!countryFeature) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                mapStyle={JSON.stringify({
                    version: 8,
                    name: "Void",
                    sources: {},
                    layers: [{
                        id: 'background',
                        type: 'background',
                        paint: { 'background-color': Colors.black } // Fond transparent
                    }]
                })}
                logoEnabled={false}
                attributionEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                scrollEnabled={false} // On bloque l'interaction pour forcer le focus
                zoomEnabled={false}
            >
                {/* Caméra qui s'adapte aux bounds */}
                <MapLibreGL.Camera
                    ref={cameraRef}
                    bounds={bounds ? {
                        ne: [bounds[2], bounds[3]],
                        sw: [bounds[0], bounds[1]],
                        paddingBottom: 50,
                        paddingTop: 50,
                        paddingLeft: 50,
                        paddingRight: 50
                    } : undefined}
                    animationDuration={1000}
                />

                <MapLibreGL.ShapeSource id="singleCountrySource" shape={countryFeature}>
                    {/* Remplissage léger */}
                    <MapLibreGL.FillLayer
                        id="singleCountryFill"
                        style={{
                            fillColor: color,
                            fillOpacity: 0.15
                        }}
                    />
                    {/* Contour épais et néon */}
                    <MapLibreGL.LineLayer
                        id="singleCountryLine"
                        style={{
                            lineColor: color,
                            lineWidth: 3,
                            lineOpacity: 1,
                            lineBlur: 1 // Petit effet glow
                        }}
                    />
                </MapLibreGL.ShapeSource>
            </MapLibreGL.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        marginBottom: 300,
    },
    map: {
        flex: 1,
    }
});
import Colors from '@/app/constants/Colors';
import WorldGeoJSON from '@/app/constants/world-countriesM.json';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

// Configuration (hack pour éviter le crash si pas de token, même si on ne s'en sert pas)
//MapLibreGL.setAccessToken(null);

interface Props {
    countryColors?: Record<string, string>;
    onCountryPress?: (countryCode: string) => void;
    selectedCountry?: string | null;
}

export default function InteractiveMap({ countryColors = {}, onCountryPress, selectedCountry }: Props) {
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    // --- STYLE DYNAMIQUE (JSON Expression) ---
    // C'est du code "Mapbox Style Spec" qui tourne en C++ (Ultra rapide)

    // Logique pour la COULEUR DE REMPLISSAGE :
    const fillColorExpression = [
        'match',
        ['get', 'iso_a2'], // On regarde la propriété iso_a2 du GeoJSON
    ];

    // 1. Ajout des couleurs spécifiques (Gagné/Perdu)
    Object.entries(countryColors).forEach(([code, color]) => {
        fillColorExpression.push(code);
        fillColorExpression.push(color);
    });

    // 2. Ajout de la sélection active (Orange)
    if (selectedCountry) {
        fillColorExpression.push(selectedCountry);
        fillColorExpression.push(Colors.main);
    }

    // 3. Couleur par défaut (Gris foncé "Premium")
    fillColorExpression.push('#1E1E1E');


    // --- GESTION DU CLIC ---
    const handleShapePress = (e: any) => {
        // MapLibre retourne les "features" touchées
        const feature = e.features[0];
        const countryCode = feature?.properties?.iso_a2;

        if (countryCode && onCountryPress) {
            console.log("Pays touché :", countryCode);
            onCountryPress(countryCode);
        }
    };

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                // Pas de styleURL (évite de charger des tuiles OSM moches ou payantes)
                // On stylise tout nous-mêmes
                styleJSON={JSON.stringify({
                    version: 8,
                    sources: {
                        // Notre source locale
                        'world_source': {
                            type: 'geojson',
                            data: WorldGeoJSON
                        }
                    },
                    layers: [
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#000000' // Fond Océan Noir
                            }
                        }
                    ]
                })}
                logoEnabled={false}
                attributionEnabled={false}
                rotateEnabled={false} // Garder le nord en haut
                pitchEnabled={false}  // Pas de 3D inclinée
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: [2.35, 48.85], // Centré Europe par défaut
                        zoomLevel: 1 // Vue monde entier
                    }}
                />

                {/* NOS PAYS (AFFICHÉS PAR DESSUS LE FOND NOIR) */}
                <MapLibreGL.ShapeSource
                    id="countriesSource"
                    shape={WorldGeoJSON}
                    onPress={handleShapePress}
                >
                    <MapLibreGL.FillLayer
                        id="countriesFill"
                        style={{
                            fillColor: fillColorExpression as any,
                            fillOpacity: 1,
                            fillOutlineColor: '#333333' // Contour gris subtil
                        }}
                    />

                    {/* Optionnel : Contour plus épais au survol/sélection si besoin, 
                        mais fillOutlineColor suffit souvent */}
                </MapLibreGL.ShapeSource>

            </MapLibreGL.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 450,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    map: {
        flex: 1
    }
});
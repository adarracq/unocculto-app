declare module '@maplibre/maplibre-react-native' {
    import React from 'react';
    import { ViewProps } from 'react-native';

    export interface CameraRef {
        // Ajouter les méthodes si nécessaire
    }

    export interface MapViewProps extends ViewProps {
        styleJSON?: string;
        logoEnabled?: boolean;
        attributionEnabled?: boolean;
        rotateEnabled?: boolean;
        pitchEnabled?: boolean;
        children?: React.ReactNode;
    }

    export interface CameraProps {
        ref?: React.Ref<CameraRef>;
        defaultSettings?: {
            centerCoordinate?: [number, number];
            zoomLevel?: number;
        };
    }

    export interface ShapeSourceProps {
        id: string;
        shape: any;
        onPress?: (e: any) => void;
        children?: React.ReactNode;
    }

    export interface FillLayerProps {
        id: string;
        style?: any;
    }

    export class MapView extends React.Component<MapViewProps> { }
    export class Camera extends React.Component<CameraProps> { }
    export class ShapeSource extends React.Component<ShapeSourceProps> { }
    export class FillLayer extends React.Component<FillLayerProps> { }

    export function setAccessToken(token: string | null): void;

    namespace MapLibreGL {
        export { MapView, Camera, ShapeSource, FillLayer, setAccessToken };
    }

    export default MapLibreGL;
}
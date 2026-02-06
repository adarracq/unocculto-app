import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeArenaScreen from '../screens/arena/HomeArenaScreen';
import LicenseMapScreen from '../screens/arena/LicenseMapScreen';
import RegionLevelsScreen from '../screens/arena/RegionLevelsScreen';
import GeoGameScreen from '../screens/geogames/GeoGameScreen';

export type ArenaNavParams = {
    HomeArena: undefined;
    LicenseMap: { mode: 'country' | 'flag' | 'capital' };
    RegionLevels: { regionId: string, mode: 'country' | 'flag' | 'capital' };
    GeoGame: { mode: 'country' | 'flag' | 'capital', regionId: string, level: number, isDailyBonus: boolean };
};

const Stack = createStackNavigator<ArenaNavParams>();

export default function ArenaNav() {

    return (
        <Stack.Navigator initialRouteName={'HomeArena'}>
            <Stack.Screen name="HomeArena" component={HomeArenaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LicenseMap" component={LicenseMapScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegionLevels" component={RegionLevelsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="GeoGame" component={GeoGameScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}
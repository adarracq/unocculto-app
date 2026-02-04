import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeMuseumScreen from '../screens/museum/HomeMuseumScreen';

export type MuseumNavParams = {
    HomeMuseum: undefined;
};

const Stack = createStackNavigator<MuseumNavParams>();

export default function MuseumNav() {

    return (
        <Stack.Navigator initialRouteName={'HomeMuseum'}>
            <Stack.Screen name="HomeMuseum" component={HomeMuseumScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}
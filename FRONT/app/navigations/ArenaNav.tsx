import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeArenaScreen from '../screens/arena/HomeArenaScreen';

export type ArenaNavParams = {
    HomeArena: undefined;
};

const Stack = createStackNavigator<ArenaNavParams>();

export default function ArenaNav() {

    return (
        <Stack.Navigator initialRouteName={'HomeArena'}>
            <Stack.Screen name="HomeArena" component={HomeArenaScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}
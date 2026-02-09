import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { Country } from '../models/Countries';
import { Story } from '../models/Story';
import User from '../models/User';
import HomeScreen from '../screens/home/HomeScreen';
import SelectDestinationScreen from '../screens/home/SelectDestinationScreen';
import StoryGameScreen from '../screens/home/StoryGameScreen';

export type HomeNavParams = {
    Home: undefined;
    StoryGame: { country: Country, story: Story, user: User }
    SelectDestination: undefined;
};

const Stack = createStackNavigator<HomeNavParams>();

export default function HomeNav() {

    return (
        <Stack.Navigator
            initialRouteName={'Home'}
            screenOptions={{
                ...TransitionPresets.SlideFromRightIOS,
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StoryGame" component={StoryGameScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SelectDestination" component={SelectDestinationScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );

}
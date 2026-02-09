import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import ReviewSessionScreen from '../screens/revisions/ReviewSessionScreen';
import RevisionsHomeScreen from '../screens/revisions/RevisionsHomeScreen';

export type RevisionsNavParams = {
    RevisionsHome: undefined;
    ReviewSession: { filters?: any };
};

const Stack = createStackNavigator<RevisionsNavParams>();

export default function RevisionsNav() {

    return (
        <Stack.Navigator initialRouteName={'RevisionsHome'}
            screenOptions={{
                ...TransitionPresets.SlideFromRightIOS,
            }}
        >
            <Stack.Screen name="RevisionsHome" component={RevisionsHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReviewSession" component={ReviewSessionScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );

}
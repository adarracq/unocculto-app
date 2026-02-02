import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Country } from '../models/Countries';
import { Story } from '../models/Story';
import User from '../models/User';
import CheckEmailCodeScreen from '../screens/unlogged/CheckEmailCodeScreen';
import ChoosePseudoScreen from '../screens/unlogged/ChoosePseudo';
import EmailInputScreen from '../screens/unlogged/EmailInputScreen';
import FirstGameScreen from '../screens/unlogged/FirstGameScreen';
import LoginScreen from '../screens/unlogged/LoginScreen';
import OnBoardingScreen from '../screens/unlogged/OnBoardingScreen';
import SelectStartCountryScreen from '../screens/unlogged/SelectStartCountryScreen';
import WelcomeScreen from '../screens/unlogged/WelcomeScreen';

export type NavParams = {
    Welcome: undefined;
    OnBoarding: undefined;
    SelectStartCountry: undefined;
    FirstGame: { country: Country, story: Story };
    Login: { country?: Country };
    EmailInput: { country?: Country };
    CheckEmailCode: { email: string, loginOrSignup: string, country?: Country };
    ChoosePseudo: { user: User, country?: Country };
};

const Stack = createStackNavigator<NavParams>();

export default function UnLoggedNav() {


    return (
        <Stack.Navigator initialRouteName={"Welcome"}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OnBoarding" component={OnBoardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SelectStartCountry" component={SelectStartCountryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FirstGame" component={FirstGameScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EmailInput" component={EmailInputScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CheckEmailCode" component={CheckEmailCodeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChoosePseudo" component={ChoosePseudoScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}
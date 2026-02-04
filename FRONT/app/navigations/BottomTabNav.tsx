import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Platform } from 'react-native';
import TabBarElement from '../components/molecules/TabBarElement';
import { useNotifications } from '../contexts/NotificationContext';
import { UserContext } from '../contexts/UserContext';
import ArenaNav from './ArenaNav';
import HomeNav from './HomeNav';
import MuseumNav from './MuseumNav';
import RevisionsNav from './RevisionsNav';

export type BottomNavParams = {
    Home: undefined;
    Revision: undefined;
    Quiz: undefined;
    Museum: undefined;
};

const Tab = createBottomTabNavigator<BottomNavParams>();

export default function BottomTabNav() {
    const [user, setUser] = useContext(UserContext);
    const { notifications, resetNotification } = useNotifications();

    const noTabBarScreens = [
        'StoryGame',
        'SelectDestination',
        'ReviewSession',
    ];

    return (
        <Tab.Navigator
            initialRouteName={"Home"}
            screenOptions={(props) => {
                const routeName = getFocusedRouteNameFromRoute(props.route) ?? '';
                const isHidden = noTabBarScreens.includes(routeName);

                return {
                    headerShown: false,
                    tabBarShowLabel: false,

                    // FORCE LE CENTRAGE DES ITEMS
                    tabBarItemStyle: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 70, // Doit matcher la hauteur de la barre
                    },
                    tabBarIconStyle: {
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },

                    tabBarStyle: {
                        position: 'absolute',
                        bottom: isHidden ? -100 : Platform.OS === 'ios' ? 30 : 20,
                        left: 20,
                        right: 20,
                        borderRadius: 35, // Capsule parfaite
                        height: 70,
                        backgroundColor: 'rgba(15, 15, 15, 0.95)', // Noir profond
                        borderTopWidth: 0,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 10,
                        display: isHidden ? 'none' : 'flex',
                    },
                };
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNav}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarElement
                            focused={focused}
                            name='compass'
                            nbNotifications={notifications.courses}
                        />
                    ),
                }}
                listeners={{ focus: () => resetNotification('courses') }}
            />
            <Tab.Screen
                name={"Revision"}
                component={RevisionsNav}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarElement
                            focused={focused}
                            name='student'
                            nbNotifications={notifications.revisions}
                        />
                    ),
                }}
                listeners={{ focus: () => resetNotification('revisions') }}
            />
            <Tab.Screen
                name="Quiz"
                component={ArenaNav}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarElement
                            focused={focused}
                            name='duel'
                            nbNotifications={notifications.quiz}
                        />
                    ),
                }}
                listeners={{ focus: () => resetNotification('quiz') }}
            />
            <Tab.Screen
                name="Museum"
                component={MuseumNav}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarElement
                            focused={focused}
                            name='museum'
                            nbNotifications={notifications.museum}
                        />
                    ),
                }}
                listeners={{ focus: () => resetNotification('museum') }}
            />
        </Tab.Navigator>
    );
}
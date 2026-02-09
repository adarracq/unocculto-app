import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import React, { useContext } from 'react';
import TabBarElement from '../components/molecules/TabBarElement';
import { useNotifications } from '../contexts/NotificationContext';
import { ThemeContext } from '../contexts/ThemeContext';
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
    const [themeContext, setThemeContext] = useContext(ThemeContext);
    const { notifications, resetNotification } = useNotifications();

    const noTabBarScreens = [
        'StoryGame',
        'SelectDestination',
        'ReviewSession',
        'GeoGame',
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
                        height: 70,
                        marginBottom: -1,
                        display: isHidden ? 'none' : 'flex',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
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
                            mainColor={themeContext.mainColor}
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
                            mainColor={themeContext.mainColor}
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
                            mainColor={themeContext.mainColor}
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
                            mainColor={themeContext.mainColor}
                        />
                    ),
                }}
                listeners={{ focus: () => resetNotification('museum') }}
            />
        </Tab.Navigator>
    );
}
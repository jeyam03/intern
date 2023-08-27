import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';

import YoutubePlayerScreen from './pages/YoutubePlayerScreen';

export default function App() {
  const Drawer = createDrawerNavigator();
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <ThemeProvider>
      <PaperProvider theme={paperTheme}>

        <NavigationContainer>
          <Drawer.Navigator
            screenOptions={({ route }) => ({
              headerStyle: { backgroundColor: paperTheme.colors.surface, },
              headerTintColor: paperTheme.colors.primary,
              headerTitleStyle: { fontSize: 20, },
              headerShadowVisible: false,

              drawerActiveBackgroundColor: paperTheme.colors.primary,
              drawerActiveTintColor: paperTheme.colors.surface,
              drawerStyle: { backgroundColor: paperTheme.colors.surface, },
              drawerInactiveTintColor: paperTheme.colors.secondary,

              drawerIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Page 1') {
                  iconName = focused ? 'youtube' : 'youtube';
                } else if (route.name === 'Page 2') {
                  iconName = focused ? 'youtube' : 'youtube';
                }

                return <Icon name={iconName} size={size} color={color} />;
              }
            })}
          >
            <Drawer.Screen name="Page 1" component={TabNavigation} />
            <Drawer.Screen name="Page 2" component={YoutubePlayerScreen} />
          </Drawer.Navigator>
        </NavigationContainer>

        <StatusBar style="auto" />
      </PaperProvider>
    </ThemeProvider>
  );
}


const TabNavigation = ({ }) => {
  const Tab = createBottomTabNavigator();
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.text,
        tabBarStyle: {
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.border,
        },
        headerStyle: {
          backgroundColor: paperTheme.colors.surface,
          shadowColor: paperTheme.colors.shadow,
        },
        headerTintColor: paperTheme.colors.secondary,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Tab 1') {
            iconName = focused ? 'youtube' : 'youtube';
          } else if (route.name === 'Tab 2') {
            iconName = focused ? 'youtube' : 'youtube';
          }

          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Tab 1" component={YoutubePlayerScreen} />
      <Tab.Screen name="Tab 2" component={YoutubePlayerScreen} />

    </Tab.Navigator>
  );
}
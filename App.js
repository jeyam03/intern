import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import YoutubePlayerScreen from './pages/YoutubePlayerScreen';

export default function App() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const Drawer = createDrawerNavigator();

  return (
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

              if (route.name === 'Youtube Player') {
                iconName = focused ? 'youtube' : 'youtube';
              } else if (route.name === 'Youtube') {
                iconName = focused ? 'youtube' : 'youtube';
              }

              return <Icon name={iconName} size={size} color={color} />;
            }
          })}
        >
          <Drawer.Screen
            name="Youtube Player"
            component={TabNavigation}
            initialParams={{ paperTheme: paperTheme }}
          />
          <Drawer.Screen
            name="Youtube"
            component={YoutubePlayerScreen}
            initialParams={{ paperTheme: paperTheme }}
          />
        </Drawer.Navigator>
      </NavigationContainer>

      <StatusBar style="auto" />
    </PaperProvider>
  );
}


const TabNavigation = ({ route }) => {
  const Tab = createBottomTabNavigator();
  const { paperTheme } = route.params;

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

          if (route.name === 'Youtube Player') {
            iconName = focused ? 'youtube' : 'youtube';
          } else if (route.name === 'Youtube') {
            iconName = focused ? 'youtube' : 'youtube';
          }

          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Youtube Player" component={YoutubePlayerScreen} initialParams={{ paperTheme: paperTheme }} />
      <Tab.Screen name="Youtube" component={YoutubePlayerScreen} initialParams={{ paperTheme: paperTheme }} />

    </Tab.Navigator>
  );
}
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, useColorScheme, Image, Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ThemeProvider } from './ThemeProvider';
import { DownloadProvider } from './DownloadContext';

import YoutubePlayerScreen from './pages/YoutubePlayerScreen';
import NotificationScreen from './pages/NotificationScreen';
import PdfViewScreen from './pages/PdfViewScreen';
import PdfDownloadScreen from './pages/PdfDownloadScreen';
import RazorpayScreen from './pages/RazorpayScreen';
import UploadFiles from './pages/UploadFiles';

export default function App() {
  const Drawer = createDrawerNavigator();
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;

  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  return (
    <ThemeProvider>
      <DownloadProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer>
            <Drawer.Navigator
              drawerContent={(props) => <CustomDrawerContent {...props} />}
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

                  if (route.name === 'YT & Notifications') {
                    iconName = focused ? 'youtube' : 'youtube';
                  } else if (route.name === 'PDF Viewer') {
                    iconName = focused ? 'file-pdf-box' : 'file-pdf-box';
                  } else if (route.name === 'Razorpay') {
                    iconName = focused ? 'cash-multiple' : 'cash-multiple';
                  } else if (route.name === 'File Uploads') {
                    iconName = focused ? 'nas' : 'nas';
                  }

                  return <Icon name={iconName} size={size} color={color} />;
                }
              })}
            >
              <Drawer.Screen name="YT & Notifications" component={TabNavigation} />
              <Drawer.Screen name="PDF Viewer" component={PdfViewerNavigation} />
              <Drawer.Screen name="Razorpay" component={RazorpayScreen} />
              <Drawer.Screen name="File Uploads" component={UploadFiles} />
            </Drawer.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </PaperProvider>
      </DownloadProvider>
    </ThemeProvider>
  );
}


const TabNavigation = ({ }) => {
  const Tab = createBottomTabNavigator();
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paddingBottom = Platform.OS === 'android' ? 4 : 32;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.text,
        tabBarStyle: {
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.border,
          paddingBottom: paddingBottom,
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
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell';
          }

          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Youtube Player" component={YoutubePlayerScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />

    </Tab.Navigator>
  );
}

const PdfViewerNavigation = ({ }) => {
  const Tab = createBottomTabNavigator();
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paddingBottom = Platform.OS === 'android' ? 4 : 32;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.text,
        tabBarStyle: {
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.border,
          paddingBottom: paddingBottom,
        },
        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "View PDFs") {
            iconName = focused ? 'file-pdf-box' : 'file-pdf-box';
          } else if (route.name === "Downloaded PDFs") {
            iconName = focused ? 'download' : 'download';
          }

          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="View PDFs" component={PdfViewScreen} />
      <Tab.Screen name="Downloaded PDFs" component={PdfDownloadScreen} />

    </Tab.Navigator>
  );
}

const CustomDrawerContent = props => {
  const paperTheme = useColorScheme() === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 24, color: paperTheme.colors.primary }}>Hello, John Doe</Text>
            <Text style={{ fontSize: 12, color: paperTheme.colors.secondary }}>johndoe@example.com</Text>
          </View>
          <Image source={{ uri: 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg' }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={{ borderTopWidth: 0.5, borderTopColor: paperTheme.colors.border, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon name="location-exit" size={24} color={paperTheme.colors.secondary} />
        <Text style={{ fontSize: 18, color: paperTheme.colors.secondary }}>Logout</Text>
      </View>
    </View>
  );
}
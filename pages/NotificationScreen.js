import React, { useState, useCallback, useRef, useEffect } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TouchableOpacity, View, useColorScheme, Button, Alert } from 'react-native';
import { useTheme } from '../ThemeProvider';
import notifee, { EventType, TimestampTrigger, TriggerType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

const NotificationScreen = ({ }) => {
  const { paperTheme } = useTheme();

  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          break;
      }
    });
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      onDisplayNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  async function onMessageReceived(message) {
    console.log('onMessageReceived', message);
  }
  
  messaging().onMessage(onMessageReceived);
  messaging().setBackgroundMessageHandler(onMessageReceived);

  async function onDisplayNotification(remoteMessage) {
    await notifee.requestPermission()

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage?.notification?.title || 'Notification Title',
      body: remoteMessage?.notification?.body || 'Notification Body',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  async function getAllTriggers() {
    notifee.getTriggerNotificationIds().then(ids => console.log('All trigger notifications: ', ids));
  }

  async function cancel(notificationId) {
    await notifee.cancelNotification(notificationId);
  }

  async function onCreateTriggerNotification() {
    const date = new Date(Date.now());
    date.setHours(12);
    date.setMinutes(1);
    date.setSeconds(30)

    await notifee.createTriggerNotification(
      {
        title: 'Meeting with Jane',
        body: 'Today at 11:20am',
        android: {
          channelId: 'your-channel-id',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        alarmManager: {
          allowWhileIdle: true,
        }
      },
    ).then((id) => console.log('Trigger notification created', id, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
    .catch((err) => console.log('Trigger notification failed to create', err));
  }

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.PRESS:
        console.log('User pressed notification', detail.notification);
        break;
    }
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: paperTheme.colors.background, padding: 14, gap: 30 }}>
      <Text style={{ color: paperTheme.colors.tertiary, fontSize: 36, fontWeight: 'bold', textAlign: 'center' }}>Notification</Text>

      <Button title="Display Notification" onPress={() => onDisplayNotification()} />
      <Button title="Cancel Notification" onPress={() => cancel('123')} />
      <Button title="Create Trigger Notification" onPress={() => onCreateTriggerNotification()} />
      <Button title="Get All Triggers" onPress={() => getAllTriggers()} />
    </View>
  );
};

export default NotificationScreen;
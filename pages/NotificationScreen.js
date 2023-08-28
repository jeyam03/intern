import React, { useState, useCallback, useRef, useEffect } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TouchableOpacity, View, useColorScheme, Button } from 'react-native';
import { useTheme } from '../ThemeProvider';
import notifee, { EventType, TimestampTrigger, TriggerType } from '@notifee/react-native';

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

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission()

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });

    // await notifee.displayNotification({
    //   id: '123',
    //   title: 'Updated Notification Title',
    //   body: 'Updated main body content of the notification',
    //   android: {
    //     channelId,
    //   },
    // });
  }

  async function getAllTriggers() {
    notifee.getTriggerNotificationIds().then(ids => console.log('All trigger notifications: ', ids));
  }

  async function cancel(notificationId) {
    await notifee.cancelNotification(notificationId);
  }

  async function onCreateTriggerNotification() {
    const date = new Date(Date.now());
    date.setHours(8);
    date.setMinutes(44);
    date.setSeconds(30)

    // Create a trigger notification
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
    ).then((id) => console.log('Trigger notification created', id, date.getDate()))
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
import React, { useState, useCallback, useRef, useEffect } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TouchableOpacity, View, useColorScheme, Button, Alert, Linking } from 'react-native';
import { useTheme } from '../ThemeProvider';
import notifee, { AndroidImportance, AndroidStyle, EventType, TimestampTrigger, TriggerType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import DateTimePicker from '@react-native-community/datetimepicker';

const NotificationScreen = ({ }) => {
  const { paperTheme } = useTheme();
  const [allTriggers, setAllTriggers] = useState([]);

  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User foreground pressed notification', detail.notification);
          Linking.openURL(detail.notification.data.route)
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

  async function onDisplayNotification(remoteMessage) {
    await notifee.requestPermission()

    await notifee.setNotificationCategories([
      {
        id: 'post',
        actions: [
          {
            id: 'like',
            title: 'Like Post',
          },
          {
            id: 'dislike',
            title: 'Dislike Post',
          },
        ],
      },
    ]);

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: remoteMessage?.notification?.title || 'Notification Title',
      body: remoteMessage?.notification?.body || 'Notification Body',
      subtitle: 'Notification Subtitle',
      data: {'route': 'intern://file'},
      ios: {
        attachments: [
          {
            url: remoteMessage?.notification?.android?.imageUrl ? remoteMessage?.notification?.android?.imageUrl : 'https://picsum.photos/200/300',
          },
        ],
        categoryId: 'post',
      },

      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher_round',
        actions: [
          {
            title: '<p style="color: #6D9E6D;"><b>Approve</b> &#128516;</p>',
            pressAction: { id: 'approve' },
          },
          {
            title: '<p style="color: #f44336;"><b>Cancel</b> &#128532;</p>',
            pressAction: { id: 'cancel' },
          },
        ],
        showTimestamp: true,
        style: { type: AndroidStyle.BIGPICTURE, picture: `${remoteMessage?.notification?.android?.imageUrl ? remoteMessage?.notification?.android?.imageUrl : 'https://picsum.photos/200/300'}` },
      },
    });
  }

  async function getAllTriggers() {
    notifee.getTriggerNotificationIds().then(
      (ids) => {
        notifee.getTriggerNotifications(ids).then(
          (trigger) => {
            setAllTriggers(trigger);
          }
        );
      },
    );
  }

  useEffect(() => {
    getAllTriggers();
  }, []);

  async function cancel(notificationId) {
    await notifee.cancelNotification(notificationId);
    getAllTriggers();
  }

  async function onCreateTriggerNotification() {
    await notifee.createTriggerNotification(
      {
        title: 'Your payment is due!',
        body: `Today at ${date.getHours()}:${date.getMinutes()}`,
        subtitle: 'Trigger Notification',
        android: {
          channelId: 'your-channel-id',
        },
        data: {'route': 'intern://razorpay'},
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        alarmManager: {
          allowWhileIdle: true,
        }
      },
    ).then((id) => {
      console.log('Trigger notification created', id, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
      getAllTriggers();
    })
      .catch((err) => console.log('Trigger notification failed to create', err));
  }

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.PRESS:
        console.log('User background pressed notification', detail.notification);
        break;
    }
  });

  const [date, setDate] = useState(new Date(Date.now()));
  const onChange = (event, selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: paperTheme.colors.background, padding: 14, gap: 30, alignItems: 'center', }}>
      <TouchableOpacity onPress={() => onDisplayNotification()} style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 12, borderRadius: 12 }} >
        <Text style={{ color: paperTheme.colors.primary, fontWeight: 500, fontSize: 16 }}>Display Test Notification</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'space-evenly', marginTop: 72 }}>
        <Text style={{ width: '30%', textAlign: 'center' }}>Create a time based trigger notification</Text>
        <DateTimePicker
          style={{ width: '70%' }}
          value={date}
          mode={'datetime'}
          is24Hour={true}
          onChange={onChange}
        />
      </View>
      <TouchableOpacity onPress={() => onCreateTriggerNotification()} style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 12, borderRadius: 12 }} >
        <Text style={{ color: paperTheme.colors.primary, fontWeight: 500, fontSize: 16 }}>Create Trigger Notification</Text>
      </TouchableOpacity>


      {allTriggers && allTriggers.length > 0 && (
        <View style={{ marginTop: 72 }}>
          <Text>Upcoming Notifications</Text>

          {allTriggers.map((trigger, index) => {
            return (
              <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 12, gap: 12 }}>
                <Text style={{ fontWeight: '500', fontSize: 16, color: paperTheme.colors.tertiary }}>{trigger.notification.title}</Text>

                <Text style={{ fontSize: 14, color: paperTheme.colors.secondary }}>{trigger.notification.body}</Text>
                <TouchableOpacity onPress={() => cancel(trigger.notification.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'darkred', padding: 8, borderRadius: 8 }}>
                  <Icon name="delete" size={20} color={paperTheme.colors.background} />
                  <Text style={{ color: paperTheme.colors.background, marginLeft: 8 }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      )}

    </View>
  );
};

export default NotificationScreen;
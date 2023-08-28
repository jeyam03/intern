import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Update external API
    console.log('Marking notification as read', notification);
    
    // Remove the notification
    await notifee.cancelNotification(notification.id);
  }

  // check if user pressed or dismissed notification
  switch (type) {
    case EventType.DISMISSED:
      console.log('User dismissed notification in the background', notification);
      break;
    case EventType.PRESS:
      console.log('User pressed notification in the background', notification);
      break;
  }

});

// Register main application
AppRegistry.registerComponent('app', () => App);
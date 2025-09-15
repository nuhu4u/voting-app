import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiConfig } from './config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'election' | 'vote' | 'result' | 'system' | 'security';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled?: boolean;
  scheduledTime?: Date;
  read?: boolean;
}

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
  deviceId: string;
  platform: string;
}

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = token.data;
      this.isInitialized = true;

      // Register token with backend
      await this.registerToken(token.data);

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async registerToken(token: string): Promise<boolean> {
    try {
      const deviceId = Device.osInternalBuildId || 'unknown';
      const platform = Platform.OS;

      const response = await fetch(`${apiConfig.baseUrl}/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          type: 'expo',
          deviceId,
          platform,
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  async sendLocalNotification(notification: Omit<NotificationData, 'id'>): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
        priority: notification.priority === 'urgent' ? 'high' : 'normal',
      },
      trigger: notification.scheduled && notification.scheduledTime
        ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notification.scheduledTime }
        : null,
    });

    return id;
  }

  async sendPushNotification(
    token: string,
    notification: Omit<NotificationData, 'id'>
  ): Promise<boolean> {
    try {
      const message = {
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority === 'urgent' ? 'high' : 'normal',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      return data.data?.[0]?.status === 'ok';
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async scheduleNotification(
    notification: Omit<NotificationData, 'id'>,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
        priority: notification.priority === 'urgent' ? 'high' : 'normal',
      },
      trigger,
    });

    return id;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async getDeliveredNotifications(): Promise<Notifications.Notification[]> {
    return await Notifications.getPresentedNotificationsAsync();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await Notifications.dismissNotificationAsync(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Election-specific notifications
  async notifyElectionCreated(election: any): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'New Election Available',
      body: `${election.title} is now open for voting`,
      data: { electionId: election.id, type: 'election' },
      type: 'election',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  async notifyElectionEnding(election: any, hoursLeft: number): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'Election Ending Soon',
      body: `${election.title} ends in ${hoursLeft} hours`,
      data: { electionId: election.id, type: 'election' },
      type: 'election',
      priority: 'high',
    };

    await this.sendLocalNotification(notification);
  }

  async notifyElectionEnded(election: any): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'Election Results Available',
      body: `Results for ${election.title} are now available`,
      data: { electionId: election.id, type: 'result' },
      type: 'result',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  async notifyVoteCast(election: any, candidate: any): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'Vote Cast Successfully',
      body: `Your vote for ${candidate.name} in ${election.title} has been recorded`,
      data: { electionId: election.id, candidateId: candidate.id, type: 'vote' },
      type: 'vote',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  async notifySecurityAlert(message: string): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'Security Alert',
      body: message,
      data: { type: 'security' },
      type: 'security',
      priority: 'urgent',
    };

    await this.sendLocalNotification(notification);
  }

  async notifySystemUpdate(message: string): Promise<void> {
    const notification: Omit<NotificationData, 'id'> = {
      title: 'System Update',
      body: message,
      data: { type: 'system' },
      type: 'system',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  // Schedule recurring notifications
  async scheduleElectionReminders(election: any): Promise<void> {
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const now = new Date();

    // Reminder 1 hour before election starts
    if (startDate > now) {
      const reminderTime = new Date(startDate.getTime() - 60 * 60 * 1000);
      await this.scheduleNotification(
        {
          title: 'Election Starting Soon',
          body: `${election.title} starts in 1 hour`,
          data: { electionId: election.id, type: 'election' },
          type: 'election',
          priority: 'high',
        },
        { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime }
      );
    }

    // Reminder 1 hour before election ends
    if (endDate > now) {
      const reminderTime = new Date(endDate.getTime() - 60 * 60 * 1000);
      await this.scheduleNotification(
        {
          title: 'Election Ending Soon',
          body: `${election.title} ends in 1 hour`,
          data: { electionId: election.id, type: 'election' },
          type: 'election',
          priority: 'high',
        },
        { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime }
      );
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Check if initialized
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // Add notification listener
  addNotificationListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Add notification response listener
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove notification listener
  removeNotificationListener(subscription: Notifications.Subscription): void {
    subscription.remove();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

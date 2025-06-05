import axios from './axios';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

class NotificationsAPI {
  async getNotifications(): Promise<Notification[]> {
    const response = await axios.get('/notifications');
    return response.data;
  }

  async markAsRead(notificationId: number): Promise<void> {
    await axios.post(`/notifications/${notificationId}/mark-read`);
  }

  async markAllAsRead(): Promise<void> {
    await axios.post('/notifications/mark-all-read');
  }
}

export const notificationsApi = new NotificationsAPI();

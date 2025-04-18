import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Define notification types
export interface Notification {
  event_id: number;
  camera_id: number;
  status: 'unread' | 'resolved' | 'false_alarm';
  blob_url: string;
  timestamp: string;
  camera_name: string;
  home_name: string;
  home_id: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsResolved: (eventId: number) => Promise<void>;
  markAsFalseAlarm: (eventId: number) => Promise<void>;
  getNotificationById: (eventId: number) => Promise<Notification | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotifications(response.data.notifications);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as resolved
  const markAsResolved = async (eventId: number) => {
    if (!token) return;
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${eventId}/status`,
        { status: 'resolved' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.event_id === eventId ? { ...n, status: 'resolved' } : n)
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update notification');
      console.error('Error updating notification:', err);
    }
  };

  // Mark notification as false alarm
  const markAsFalseAlarm = async (eventId: number) => {
    if (!token) return;
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${eventId}/status`,
        { status: 'false_alarm' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.event_id === eventId ? { ...n, status: 'false_alarm' } : n)
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update notification');
      console.error('Error updating notification:', err);
    }
  };

  // Get notification by ID
  const getNotificationById = async (eventId: number): Promise<Notification | null> => {
    if (!token) return null;
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data.notification;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch notification details');
      console.error('Error fetching notification details:', err);
      return null;
    }
  };

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!token) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Set up polling
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [token]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsResolved,
    markAsFalseAlarm,
    getNotificationById
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

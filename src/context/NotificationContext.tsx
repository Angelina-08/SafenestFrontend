import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

// API base URL
const API_BASE_URL = 'https://safe-nest-back-end.vercel.app';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark notification as resolved
  const markAsResolved = async (eventId: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/notifications/${eventId}/status`, {
        status: 'resolved'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.event_id === eventId 
            ? { ...notification, status: 'resolved' } 
            : notification
        )
      );
      
      setError(null);
    } catch (err: any) {
      console.error('Error marking notification as resolved:', err);
      setError('Failed to update notification');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as false alarm
  const markAsFalseAlarm = async (eventId: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/notifications/${eventId}/status`, {
        status: 'false_alarm'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.event_id === eventId 
            ? { ...notification, status: 'false_alarm' } 
            : notification
        )
      );
      
      setError(null);
    } catch (err: any) {
      console.error('Error marking notification as false alarm:', err);
      setError('Failed to update notification');
    } finally {
      setLoading(false);
    }
  };

  // Get notification by ID
  const getNotificationById = async (eventId: number): Promise<Notification | null> => {
    if (!token) return null;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setError(null);
      return response.data.notification || null;
    } catch (err: any) {
      console.error('Error fetching notification details:', err);
      setError('Failed to fetch notification details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!token) return;

    // Initial fetch
    fetchNotifications();
    
    // Set up polling
    const interval = setInterval(() => {
      // Check if we're on a notification detail page
      if (!window.location.pathname.includes('/notifications/')) {
        fetchNotifications();
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

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

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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
  pausePolling: () => void;
  resumePolling: () => void;
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
  const [isPollingActive, setIsPollingActive] = useState(true);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Ensure token exists before proceeding
    if (!token) {
      return;
    }
    
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
  }, [token]); // Dependency: token

  // Mark notification as resolved
  const markAsResolved = useCallback(async (eventId: number) => {
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
      setError('Failed to mark as resolved');
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependencies: token

  // Mark notification as false alarm
  const markAsFalseAlarm = useCallback(async (eventId: number) => {
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
      setError('Failed to mark as false alarm');
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependencies: token

  // Get notification by ID
  const getNotificationById = useCallback(async (eventId: number): Promise<Notification | null> => {
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
  }, [token]); // Dependency: token

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!token) return;

    // Initial fetch when component mounts or token changes
    fetchNotifications();
    
    // Set up polling
    const interval = setInterval(() => {
      console.log(`[Polling Check] ${new Date().toLocaleTimeString()} - isPollingActive: ${isPollingActive}`); // Log polling status
      // Only fetch if polling is active
      if (isPollingActive) { 
        // Check if we're on a notification detail page (Keep the old check as a backup)
        if (!window.location.pathname.includes('/notifications/')) {
          console.log(`[Polling Fetch] ${new Date().toLocaleTimeString()} - Fetching notifications...`); // Log fetch attempt
          fetchNotifications();
        } else {
          console.log(`[Polling Skip] ${new Date().toLocaleTimeString()} - Skipped fetch (on detail page).`); // Log skip reason
        }
      } else {
        console.log(`[Polling Skip] ${new Date().toLocaleTimeString()} - Skipped fetch (polling paused).`); // Log skip reason
      }
    }, 10000); // 10 seconds
    
    return () => {
      console.log(`[Polling Cleanup] ${new Date().toLocaleTimeString()} - Clearing interval.`); // Log interval clear
      clearInterval(interval);
    };
  }, [token, fetchNotifications, isPollingActive]);

  // Functions to control polling
  const pausePolling = useCallback(() => {
    console.log("[Context] Calling pausePolling"); // Add log
    setIsPollingActive(false);
  }, []); // No dependencies needed

  const resumePolling = useCallback(() => {
    console.log("[Context] Calling resumePolling"); // Add log
    setIsPollingActive(true);
  }, []); // No dependencies needed

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsResolved,
    markAsFalseAlarm,
    getNotificationById,
    pausePolling, 
    resumePolling
  }), [notifications, unreadCount, loading, error, fetchNotifications, markAsResolved, markAsFalseAlarm, getNotificationById, pausePolling, resumePolling]); // Memoize the context value object

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

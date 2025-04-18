import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    navigate(`/notifications/${notification.event_id}`);
    setIsOpen(false);
  };

  // Group notifications: unread first, then read
  const groupedNotifications = {
    unread: notifications.filter(n => n.status === 'unread'),
    read: notifications.filter(n => n.status !== 'unread')
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with notification count */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50"
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            {/* Unread notifications */}
            {groupedNotifications.unread.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  New
                </div>
                {groupedNotifications.unread.map((notification) => (
                  <button
                    key={notification.event_id}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-start"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Alert at {notification.home_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Camera: {notification.camera_name} • {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="ml-2 flex-shrink-0 w-2 h-2 rounded-full bg-red-600"></span>
                  </button>
                ))}
              </div>
            )}

            {/* Read notifications */}
            {groupedNotifications.read.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Earlier
                </div>
                {groupedNotifications.read.map((notification) => (
                  <button
                    key={notification.event_id}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-start"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        Alert at {notification.home_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Camera: {notification.camera_name} • {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {notifications.length === 0 && (
              <div className="py-8 px-4 text-center text-gray-500">
                <p>No notifications yet</p>
                <p className="text-sm mt-1">You'll see alerts here when they occur</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

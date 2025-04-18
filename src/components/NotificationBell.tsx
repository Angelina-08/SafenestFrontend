import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X 
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      navigate(`/notifications/${notification.event_id}`);
    }
    setOpen(false);
  };

  // Group notifications: unread first, then read
  const groupedNotifications = {
    unread: notifications.filter(n => n.status === 'unread'),
    read: notifications.filter(n => n.status !== 'unread')
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="w-80 p-0 bg-white rounded-md shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <>
                {/* Unread notifications */}
                {groupedNotifications.unread.length > 0 && (
                  <div>
                    {groupedNotifications.unread.map((notification) => (
                      <div 
                        key={notification.event_id}
                        onClick={() => handleNotificationClick(notification)}
                        className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-start">
                          <div className="h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full" />
                          <div>
                            <p className="font-medium">
                              Alert detected at {notification.home_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Camera: {notification.camera_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.timestamp))} ago
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Read notifications */}
                {groupedNotifications.read.length > 0 && (
                  <div className="opacity-70">
                    {groupedNotifications.read.map((notification) => (
                      <div 
                        key={notification.event_id}
                        className="p-4 border-b"
                      >
                        <div className="flex items-start">
                          <div>
                            <p className="font-medium">
                              Alert {notification.status === 'resolved' ? 'resolved' : 'false alarm'} at {notification.home_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Camera: {notification.camera_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.timestamp))} ago
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

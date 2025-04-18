import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, X } from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

interface NotificationItemProps {
  isUnread: boolean;
  isClickable: boolean;
}

const NotificationItem = styled.div<NotificationItemProps>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-3);
  cursor: ${(props) => props.isClickable ? 'pointer' : 'default'};
  background-color: ${(props) => props.isUnread ? 'var(--blue-2)' : 'transparent'};
  opacity: ${(props) => props.isClickable ? 1 : 0.7};

  &:last-child {
    border-bottom: none;
  }

  ${(props) => props.isClickable && `
    &:hover {
      background-color: var(--gray-3);
    }
  `}

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .timestamp {
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.25rem;
  }
`;

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNotificationClick }) => {
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const groupedNotifications = {
    unread: notifications.filter(n => n.status === 'unread'),
    read: notifications.filter(n => n.status !== 'unread'),
  };

  const handleItemClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      navigate(`/notifications/${notification.event_id}`);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="start"
          sideOffset={8}
          className="w-80 rounded-md z-50"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)'
          }}
        >
          <Popover.Arrow offset={12} className="fill-current text-white" />
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <Popover.Close asChild>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </Popover.Close>
          </div>
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {groupedNotifications.unread.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  New
                </div>
                {groupedNotifications.unread.map(n => (
                  <NotificationItem
                    key={n.event_id}
                    isUnread={true}
                    isClickable={true}
                    onClick={() => handleItemClick(n)}
                  >
                    <p>
                      Alert at {n.home_name}
                    </p>
                    <p className="timestamp">
                      Camera: {n.camera_name} • {' '}
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </p>
                  </NotificationItem>
                ))}
              </div>
            )}
            {groupedNotifications.read.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Earlier
                </div>
                {groupedNotifications.read.map(n => (
                  <NotificationItem
                    key={n.event_id}
                    isUnread={false}
                    isClickable={false}
                  >
                    <p>
                      Alert at {n.home_name}
                    </p>
                    <p className="timestamp">
                      Camera: {n.camera_name} • {' '}
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </p>
                  </NotificationItem>
                ))}
              </div>
            )}
            {notifications.length === 0 && (
              <div className="py-8 px-4 text-center text-gray-500">
                <p>No notifications yet</p>
                <p className="text-sm mt-1">
                  You'll see alerts here when they occur
                </p>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

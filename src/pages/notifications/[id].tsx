import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../context/NotificationContext';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { Button } from '../../components/Button';
import styled from 'styled-components';

// Create a danger button variant
const DangerButton = styled(Button)`
  background-color: #e11d48; /* Red color */
  color: white;
  &:hover:not(:disabled) {
    background-color: #be123c;
  }
  &:active:not(:disabled) {
    background-color: #9f1239;
  }
`;

// Create a text button for the back button
const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  color: var(--gray-600);
  &:hover {
    color: var(--gray-900);
  }
`;

const NotificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const { getNotificationById, markAsResolved, markAsFalseAlarm } = useNotifications();

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id) return;
      
      setLoading(true);
      const notificationData = await getNotificationById(Number(id));
      setNotification(notificationData);
      setLoading(false);
    };

    fetchNotification();
  }, [id, getNotificationById]);

  const handleResolve = async () => {
    if (!notification) return;
    
    await markAsResolved(notification.event_id);
    navigate('/dashboard');
  };

  const handleFalseAlarm = async () => {
    if (!notification) return;
    
    await markAsFalseAlarm(notification.event_id);
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <TextButton 
          onClick={() => navigate(-1)} 
          className="flex items-center mb-6 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </TextButton>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-96 w-full bg-gray-200 animate-pulse rounded-md"></div>
            <div className="flex space-x-4">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ) : notification ? (
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Alert Detected at {notification.home_name}
            </h1>
            <p className="text-gray-600 mb-6">
              Camera: {notification.camera_name} • 
              {format(new Date(notification.timestamp), 'PPpp')}
            </p>

            <div className="mb-8 relative h-[600px] w-full">
              <img
                src={notification.blob_url}
                alt="Alert detection snapshot"
                className="object-contain rounded-md h-full w-full"
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleResolve}
                variant="primary"
              >
                Mark as Resolved
              </Button>
              <DangerButton 
                onClick={handleFalseAlarm}
              >
                Mark as False Alarm
              </DangerButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              Notification not found
            </h2>
            <p className="text-gray-500 mt-2">
              The notification you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationDetail;

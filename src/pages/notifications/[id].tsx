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
  const { getNotificationById, markAsResolved, markAsFalseAlarm, pausePolling, resumePolling } = useNotifications();

  // Pause polling when component mounts and resume when it unmounts
  useEffect(() => {
    pausePolling(); // Pause polling when entering the detail page
    return () => {
      resumePolling(); // Resume polling when leaving the detail page
    };
  }, [pausePolling, resumePolling]); // Dependencies

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
          // Main content structure: Use Flexbox
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Image */}
            <div className="md:w-2/3 lg:w-3/4">
              <div className="relative h-[400px] md:h-[600px] w-full mb-4 md:mb-0">
                <img
                  src={notification.blob_url}
                  alt="Alert detection snapshot"
                  className="object-contain rounded-md h-full w-full"
                />
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="md:w-1/3 lg:w-1/4 flex flex-col">
              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-2">
                  Alert Detected at {notification.home_name}
                </h1>
                <p className="text-gray-600 mb-4">
                  Camera: {notification.camera_name}
                </p>
                <p className="text-gray-600 mb-6">
                  {format(new Date(notification.timestamp), 'PPpp')}
                </p>
              </div>

              {/* Buttons stacked at the bottom */}
              <div className="mt-auto flex flex-col space-y-3 items-end">
                <Button 
                  onClick={handleResolve}
                  className="bg-black text-white hover:bg-gray-800 active:bg-gray-900 w-full md:w-auto py-1 px-3 text-sm" // Black bg, white text, smaller
                >
                  Mark as Resolved
                </Button>
                <DangerButton 
                  onClick={handleFalseAlarm}
                  className="w-full md:w-auto py-1 px-3 text-sm" // Smaller
                >
                  Mark as False Alarm
                </DangerButton>
              </div>
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

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HouseCard } from '../components/HouseCard';
import { CreateHouseDialog } from '../components/CreateHouseDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { TopBar } from '../components/TopBar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNotifications, Notification } from '../context/NotificationContext'; 
import { NotificationDetailView } from '../components/NotificationDetailView';
import * as Dialog from '@radix-ui/react-dialog'; 

const API_BASE_URL = 'https://safe-nest-back-end.vercel.app';

const Container = styled.div`
  min-height: 100vh;
  background: var(--gray-2);
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HousesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const AddHouseCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed var(--gray-6);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: var(--gray-8);
  }
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SkeletonImage = styled(Skeleton)`
  height: 200px;
  width: 100%;
`;

const SkeletonContent = styled.div`
  padding: 1rem;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const DialogContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 900px; 
  max-height: 85vh;
  overflow-y: auto; 
  padding: 0; 
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes overlayShow {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes contentShow {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
`;

interface House {
  homeId: number;
  homeName: string;
  homeImage: string;
  homeOwner: string;
  ownerEmail: string;
  permissions?: Array<{
    email: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { 
    markAsResolved, 
    markAsFalseAlarm,
  } = useNotifications();

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/houses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouses(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Failed to fetch houses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification); 
    setIsDetailOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedNotification(null);
    setIsDetailOpen(false);
  };

  const handleResolve = async (eventId: number) => {
    try {
      await markAsResolved(eventId);
      handleCloseDialog();
    } catch (err) {
      console.error("Error resolving notification:", err);
      setError('Failed to mark notification as resolved.');
    }
  };

  const handleFalseAlarm = async (eventId: number) => {
    try {
      await markAsFalseAlarm(eventId);
      handleCloseDialog();
    } catch (err) {
      console.error("Error marking as false alarm:", err);
      setError('Failed to mark notification as false alarm.');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchHouses();
    }
  }, [user, authLoading, navigate, fetchHouses]);

  const handleCreateHouse = async (name: string, imageUrl: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/houses`, 
        { name, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHouses(prev => [...prev, response.data]);
      setError('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating house:', error);
      setError('Failed to create house. Please try again.');
      throw error;
    }
  };

  const handleUpdateHouse = async (id: number, name: string, imageUrl: string, permissions: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (name || imageUrl) {
        const response = await axios.put(`${API_BASE_URL}/api/houses/${id}`, 
          { name, imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data) throw new Error('Failed to update house');
      }

      const permissionsResponse = await axios.put(`${API_BASE_URL}/api/houses/${id}/permissions`, 
        { permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!permissionsResponse.data) throw new Error('Failed to update permissions');

      await fetchHouses();
      setError('');
    } catch (error) {
      console.error('Error updating house:', error);
      setError('Failed to update house. Please try again.');
      throw error;
    }
  };

  if (authLoading) {
    return <LoadingSkeleton />;
  }

  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4].map((key) => (
        <SkeletonCard key={key}>
          <SkeletonImage />
          <SkeletonContent>
            <Skeleton width="70%" height={24} />
          </SkeletonContent>
        </SkeletonCard>
      ))}
    </>
  );

  return (
    <Container>
      <TopBar 
        firstName={user?.firstName}
        showAvatar={true}
        onNotificationClick={handleNotificationClick} 
      />
      <Content>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md border border-red-300">Error: {error}</p>}
        <HousesGrid>
          {loading ? (
            renderSkeletons()
          ) : (
            <>
              {houses.map((house) => (
                <HouseCard
                  key={house.homeId}
                  house={house}
                  currentUserId={user?.email || ''}
                  onUpdateHouse={handleUpdateHouse}
                />
              ))}
              <AddHouseCard onClick={() => setShowCreateDialog(true)}>
                <span>+ Add House</span>
              </AddHouseCard>
            </>
          )}
        </HousesGrid>

        <CreateHouseDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateHouse={handleCreateHouse}
        />

        <Dialog.Root open={isDetailOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <Dialog.Portal>
            <DialogOverlay />
            <DialogContent>
              {selectedNotification ? (
                <NotificationDetailView 
                  notification={selectedNotification}
                  onResolve={handleResolve}
                  onFalseAlarm={handleFalseAlarm}
                  onClose={handleCloseDialog}
                />
              ) : (
                <div className="p-8 text-center text-red-600">Failed to load details.</div> 
              )}
            </DialogContent>
          </Dialog.Portal>
        </Dialog.Root>
      </Content>
    </Container>
  );
};

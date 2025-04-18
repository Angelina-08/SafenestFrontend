import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { TopBar } from '../components/TopBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CameraPlayer } from '../components/CameraPlayer';
import { EditCameraDialog } from '../components/EditCameraDialog';
import { Button } from '../components/Button';
import { ArrowLeftIcon, Pencil1Icon } from '@radix-ui/react-icons';

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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--gray-12);
  margin: 0;
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlayerSection = styled.div`
  margin-bottom: 2rem;
`;

const CameraInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  width: 120px;
  font-weight: 500;
  color: var(--gray-11);
`;

const InfoValue = styled.div`
  flex: 1;
  color: var(--gray-12);
  word-break: break-all;
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

interface CameraData {
  cameraId: number;
  cameraName: string;
  cameraAddress: string;
  hlsAddress: string;
  homeId: number;
  createdAt: string;
  updatedAt: string;
}

export const CameraDetail: React.FC = () => {
  const [camera, setCamera] = useState<CameraData | null>(null);
  const [houseName, setHouseName] = useState<string>('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { cameraId } = useParams<{ cameraId: string }>();

  const fetchCamera = useCallback(async () => {
    if (!cameraId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch camera details
      const response = await axios.get(`${API_BASE_URL}/api/camera/${cameraId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCamera(response.data);
      
      // Fetch house name
      const houseResponse = await axios.get(`${API_BASE_URL}/api/houses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const house = houseResponse.data.find((h: any) => h.homeId === response.data.homeId);
      if (house) {
        setHouseName(house.homeName);
      }
      
    } catch (error) {
      console.error('Error fetching camera:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cameraId, navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchCamera();
    }
  }, [user, authLoading, navigate, fetchCamera]);

  const handleUpdateCamera = async (id: number, cameraName: string, cameraAddress: string, hlsAddress: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/camera/${id}`, 
        { cameraName, cameraAddress, hlsAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCamera(response.data);
    } catch (error) {
      console.error('Error updating camera:', error);
      throw error;
    }
  };

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  if (!camera) {
    return (
      <Container>
        <TopBar 
          firstName={user?.firstName}
          showAvatar={true}
        />
        <Content>
          <Header>
            <BackButton 
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="small"
            >
              <ArrowLeftIcon /> Back to Dashboard
            </BackButton>
          </Header>
          <div>Camera not found or you don't have access to view it.</div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <TopBar 
        firstName={user?.firstName}
        showAvatar={true}
      />
      <Content>
        <Header>
          <BackButton 
            onClick={() => navigate(`/house/${camera.homeId}`)}
            variant="secondary"
            size="small"
          >
            <ArrowLeftIcon /> Back to {houseName || 'House'}
          </BackButton>
          <Title>{camera.cameraName}</Title>
        </Header>

        <PlayerSection>
          <CameraPlayer 
            rtspUrl={camera.cameraAddress} 
            hlsUrl={camera.hlsAddress}
            cameraId={camera.cameraId} 
          />
        </PlayerSection>

        <CameraInfo>
          <InfoRow>
            <InfoLabel>Camera Name:</InfoLabel>
            <InfoValue>{camera.cameraName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>RTSP Address:</InfoLabel>
            <InfoValue>{camera.cameraAddress}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>HLS Address:</InfoLabel>
            <InfoValue>{camera.hlsAddress || 'Not set'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>House:</InfoLabel>
            <InfoValue>{houseName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Created:</InfoLabel>
            <InfoValue>{new Date(camera.createdAt).toLocaleString()}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Updated:</InfoLabel>
            <InfoValue>{new Date(camera.updatedAt).toLocaleString()}</InfoValue>
          </InfoRow>

          <ButtonGroup>
            <ActionButton 
              onClick={() => setShowEditDialog(true)}
              variant="secondary"
            >
              <Pencil1Icon /> Edit Camera
            </ActionButton>
          </ButtonGroup>
        </CameraInfo>

        <EditCameraDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          camera={camera}
          onUpdateCamera={handleUpdateCamera}
        />
      </Content>
    </Container>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/TopBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Button } from '../components/Button';
import { Camera } from '../types/Camera';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ArrowLeftIcon, DotsVerticalIcon, Pencil1Icon, TrashIcon, Cross2Icon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

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

const CamerasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const AddCameraCard = styled.div`
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--gray-9);
  
  h3 {
    margin-bottom: 1rem;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CameraPreview = styled.div`
  height: 180px;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const CameraIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CameraName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-12);
`;

const CameraAddress = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-11);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 4px;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const StyledContent = styled(DropdownMenu.Content)`
  min-width: 180px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  z-index: 1000;
`;

const StyledItem = styled(DropdownMenu.Item)`
  font-size: 13px;
  line-height: 1;
  color: var(--gray-11);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 5px;
  position: relative;
  padding-left: 25px;
  user-select: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background-color: var(--gray-3);
    color: var(--gray-12);
  }
`;

const ItemIcon = styled.div`
  position: absolute;
  left: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const AlertDialogOverlay = styled(AlertDialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const AlertDialogContent = styled(AlertDialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const AlertDialogTitle = styled(AlertDialog.Title)`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--gray-12);
`;

const AlertDialogDescription = styled(AlertDialog.Description)`
  margin-bottom: 1.5rem;
  color: var(--gray-11);
  font-size: 0.875rem;
  line-height: 1.5;
`;

const AlertDialogFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const DialogContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
`;

const DialogTitle = styled(Dialog.Title)`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--gray-12);
`;

const CloseButton = styled(Dialog.Close)`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--gray-11);
  &:hover { color: var(--gray-12); }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--gray-7);
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: var(--blue-8);
    box-shadow: 0 0 0 1px var(--blue-8);
  }
`;

const FormField = styled(Form.Field)`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled(Form.Label)`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--gray-12);
`;

const StyledForm = styled(Form.Root)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SubmitButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: #333333;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  box-sizing: border-box;
  text-align: center;
  opacity: 1;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: #444444;
    color: #e0e0e0;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #666666;
  }

  &:active:not(:disabled) {
    background-color: #1a1a1a;
  }

  &:disabled {
    background-color: #999999;
    cursor: not-allowed;
    color: #e0e0e0;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: var(--gray-10);
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

export const CameraView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [houseName, setHouseName] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cameraName, setCameraName] = useState('');
  const [cameraAddress, setCameraAddress] = useState('');
  const [hlsAddress, setHlsAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { homeId } = useParams<{ homeId: string }>();

  const fetchCameras = useCallback(async () => {
    if (!homeId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch house details to get the name
      const houseResponse = await axios.get(`${API_BASE_URL}/api/houses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const house = houseResponse.data.find((h: any) => h.homeId === parseInt(homeId));
      if (house) {
        setHouseName(house.homeName);
      }

      // Fetch cameras for this house
      const response = await axios.get(`${API_BASE_URL}/api/camera/house/${homeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCameras(response.data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  }, [homeId, navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchCameras();
    }
  }, [user, authLoading, navigate, fetchCameras]);

  const handleCreateCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraName.trim() || !cameraAddress.trim() || !hlsAddress.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/camera`, 
        { 
          cameraName, 
          cameraAddress, 
          hlsAddress,
          homeId: parseInt(homeId || '0') 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCameras(prev => [...prev, response.data]);
      setShowCreateDialog(false);
      setCameraName('');
      setCameraAddress('');
      setHlsAddress('');
    } catch (error) {
      console.error('Error creating camera:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCamera = async () => {
    if (!cameraToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/camera/${cameraToDelete.cameraId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCameras(prev => prev.filter(camera => camera.cameraId !== cameraToDelete.cameraId));
      setShowDeleteDialog(false);
      setCameraToDelete(null);
    } catch (error) {
      console.error('Error deleting camera:', error);
      throw error;
    }
  };

  const openDeleteDialog = (camera: Camera) => {
    setCameraToDelete(camera);
    setShowDeleteDialog(true);
  };

  const handleCameraClick = (camera: Camera) => {
    navigate(`/camera/${camera.cameraId}`);
  };

  const resetCreateDialog = () => {
    setCameraName('');
    setCameraAddress('');
    setHlsAddress('');
    setShowCreateDialog(false);
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

  const CameraCardComponent = ({ camera }: { camera: Camera }) => {
    return (
      <Card>
        <CameraPreview onClick={() => handleCameraClick(camera)}>
          <CameraIcon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </CameraIcon>
          <MenuButton onClick={(e) => e.stopPropagation()}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div>
                  <DotsVerticalIcon />
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <StyledContent align="end">
                  <StyledItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/camera/${camera.cameraId}/edit`);
                  }}>
                    <ItemIcon>
                      <Pencil1Icon />
                    </ItemIcon>
                    Edit Camera
                  </StyledItem>
                  <StyledItem onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(camera);
                  }} color="red">
                    <ItemIcon>
                      <TrashIcon />
                    </ItemIcon>
                    Delete Camera
                  </StyledItem>
                </StyledContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </MenuButton>
        </CameraPreview>
        <CardContent>
          <CameraName>{camera.cameraName}</CameraName>
          <CameraAddress>{camera.cameraAddress}</CameraAddress>
        </CardContent>
      </Card>
    );
  };

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
            $variant="secondary"
            $size="small"
          >
            <ArrowLeftIcon /> Back to Dashboard
          </BackButton>
          <Title>{houseName || 'Home'} Cameras</Title>
        </Header>

        <CamerasGrid>
          {loading ? (
            renderSkeletons()
          ) : (
            <>
              {cameras.length === 0 ? (
                <EmptyState>
                  <h3>No cameras found</h3>
                  <p>Add your first camera to start monitoring your home</p>
                </EmptyState>
              ) : (
                cameras.map((camera) => (
                  <CameraCardComponent
                    key={camera.cameraId}
                    camera={camera}
                  />
                ))
              )}
              <AddCameraCard onClick={() => setShowCreateDialog(true)}>
                <span>+ Add Camera</span>
              </AddCameraCard>
            </>
          )}
        </CamerasGrid>

        <Dialog.Root open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <Dialog.Portal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Add New Camera</DialogTitle>
              <CloseButton onClick={resetCreateDialog}>
                <Cross2Icon />
              </CloseButton>

              <StyledForm onSubmit={handleCreateCamera}>
                <FormField name="cameraName">
                  <FormLabel>Camera Name</FormLabel>
                  <Form.Control asChild>
                    <FormInput
                      type="text"
                      value={cameraName}
                      onChange={(e) => setCameraName(e.target.value)}
                      required
                      placeholder="Enter camera name"
                    />
                  </Form.Control>
                  <Form.Message match="valueMissing">
                    Please enter a camera name
                  </Form.Message>
                </FormField>

                <FormField name="cameraAddress">
                  <FormLabel>RTSP Address</FormLabel>
                  <Form.Control asChild>
                    <FormInput
                      type="text"
                      value={cameraAddress}
                      onChange={(e) => setCameraAddress(e.target.value)}
                      required
                      placeholder="rtsp://username:password@camera-ip:port/stream"
                    />
                  </Form.Control>
                  <HelpText>
                    Enter the RTSP URL for your camera. This usually looks like: rtsp://username:password@camera-ip:port/stream
                  </HelpText>
                  <Form.Message match="valueMissing">
                    Please enter the RTSP address
                  </Form.Message>
                </FormField>

                <FormField name="hlsAddress">
                  <FormLabel>HLS Address</FormLabel>
                  <Form.Control asChild>
                    <FormInput
                      type="text"
                      value={hlsAddress}
                      onChange={(e) => setHlsAddress(e.target.value)}
                      required
                      placeholder="hls://username:password@camera-ip:port/stream.m3u8"
                    />
                  </Form.Control>
                  <HelpText>
                    Enter the HLS URL for your camera. This usually looks like: hls://username:password@camera-ip:port/stream.m3u8
                  </HelpText>
                  <Form.Message match="valueMissing">
                    Please enter the HLS address
                  </Form.Message>
                </FormField>

                <Form.Submit asChild>
                  <SubmitButton
                    type="submit"
                    $variant="primary"
                    $fullWidth
                    disabled={!cameraName.trim() || !cameraAddress.trim() || !hlsAddress.trim() || isSubmitting}
                  >
                    {isSubmitting && <Spinner />}
                    {isSubmitting ? 'Creating...' : 'Add Camera'}
                  </SubmitButton>
                </Form.Submit>
              </StyledForm>
            </DialogContent>
          </Dialog.Portal>
        </Dialog.Root>

        <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialog.Portal>
            <AlertDialogOverlay />
            <AlertDialogContent>
              <AlertDialogTitle>Delete Camera</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{cameraToDelete?.cameraName}"? This action cannot be undone.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <Button $variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button $variant="primary" style={{ backgroundColor: 'var(--red-9)', color: 'white' }} onClick={handleDeleteCamera}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </Content>
    </Container>
  );
};

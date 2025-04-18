import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { DotsVerticalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Camera } from '../types/Camera';
import { Button } from './Button';

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

interface CameraCardProps {
  camera: Camera;
  onUpdateCamera: (id: number, cameraName: string, cameraAddress: string) => Promise<void>;
  onDeleteCamera: (id: number) => Promise<void>;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onUpdateCamera,
  onDeleteCamera
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/camera/${camera.cameraId}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/camera/${camera.cameraId}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDeleteCamera(camera.cameraId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting camera:', error);
    }
  };

  return (
    <>
      <Card>
        <CameraPreview onClick={handleCardClick}>
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
                  <StyledItem onClick={handleEditClick}>
                    <ItemIcon>
                      <Pencil1Icon />
                    </ItemIcon>
                    Edit Camera
                  </StyledItem>
                  <StyledItem onClick={handleDeleteClick} color="red">
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

      <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Portal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{camera.cameraName}"? This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button $variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button $variant="primary" onClick={handleDeleteConfirm} style={{ backgroundColor: 'var(--red-9)', color: 'white' }}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

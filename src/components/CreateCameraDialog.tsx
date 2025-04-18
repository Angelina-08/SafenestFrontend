import React, { useState } from 'react';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from './Button';

const StyledOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const StyledContent = styled(Dialog.Content)`
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

const StyledTitle = styled(Dialog.Title)`
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

const ErrorMessage = styled.div`
  color: var(--red-9);
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

interface CreateCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCamera: (cameraName: string, cameraAddress: string, hlsAddress: string) => Promise<void>;
}

export const CreateCameraDialog: React.FC<CreateCameraDialogProps> = ({
  open,
  onOpenChange,
  onCreateCamera
}) => {
  const [cameraName, setCameraName] = useState('');
  const [cameraAddress, setCameraAddress] = useState('');
  const [hlsAddress, setHlsAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraName.trim() || !cameraAddress.trim() || !hlsAddress.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateCamera(cameraName, cameraAddress, hlsAddress);
      onOpenChange(false);
      setCameraName('');
      setCameraAddress('');
      setHlsAddress('');
    } catch (error) {
      console.error('Error creating camera:', error);
      setError('Failed to create camera. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <StyledTitle>Add New Camera</StyledTitle>
          <CloseButton>
            <Cross2Icon />
          </CloseButton>

          <StyledForm onSubmit={handleSubmit}>
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
                <ErrorMessage>Please enter a camera name</ErrorMessage>
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
                <ErrorMessage>Please enter the RTSP address</ErrorMessage>
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
                  placeholder="http://camera-ip:port/stream.m3u8"
                />
              </Form.Control>
              <HelpText>
                Enter the HLS URL for your camera. This is required for web browser playback.
              </HelpText>
              <Form.Message match="valueMissing">
                <ErrorMessage>Please enter the HLS address</ErrorMessage>
              </Form.Message>
            </FormField>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form.Submit asChild>
              <SubmitButton
                type="submit"
                disabled={!cameraName.trim() || !cameraAddress.trim() || !hlsAddress.trim() || isSubmitting}
                fullWidth
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? 'Creating...' : 'Add Camera'}
              </SubmitButton>
            </Form.Submit>
          </StyledForm>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

import React from 'react';
import { Notification } from '../context/NotificationContext'; // Correct path to singular 'context'
import { format } from 'date-fns';
import { Button } from './Button'; // Assuming path is correct
import styled from 'styled-components';
import { X } from 'lucide-react'; // Use X for close button

// --- Styles ---
// Style for the main resolve button (black background)
const ResolveButton = styled(Button)`
  background-color: black;
  color: white;
  &:hover:not(:disabled) {
    background-color: #333333; // Dark grey for hover
  }
  &:active:not(:disabled) {
    background-color: #555555; // Slightly lighter grey for active
  }
`;

// Keep DangerButton for False Positive (red background)
const DangerButton = styled(Button)`
  background-color: #dc2626; // Hardcoded red (Tailwind's red-600)
  color: white;
  &:hover:not(:disabled) {
    background-color: #b91c1c; // Darker red (Tailwind's red-700)
  }
  &:active:not(:disabled) {
    background-color: #991b1b; // Even darker red (Tailwind's red-800)
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem; /* 12px */
  right: 0.75rem; /* 12px */
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  padding: 0.25rem; /* 4px */
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

// Container for the centered content
const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  padding: 1rem; // Add some padding around the content
`;

// Container for the image with border
const ImageContainer = styled.div`
  width: 100%;
  max-width: 600px; // Limit max width of image container
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--gray-6); // Thin border
  border-radius: 4px; // Slight rounding for the border
  position: relative; // Needed if we add overlays later
  background-color: var(--gray-2); // Background for letterboxing
`;

// Container for the buttons
const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem; // Space between buttons
  margin-top: 1.5rem;
`;

// --- End Styles ---

interface NotificationDetailViewProps {
  notification: Notification;
  onResolve: (eventId: number) => Promise<void>;
  onFalseAlarm: (eventId: number) => Promise<void>;
  onClose: () => void; // Function to close the detail view
}

export const NotificationDetailView: React.FC<NotificationDetailViewProps> = ({
  notification,
  onResolve,
  onFalseAlarm,
  onClose,
}) => {
  const handleResolve = async () => {
    await onResolve(notification.event_id);
  };

  const handleFalseAlarm = async () => {
    await onFalseAlarm(notification.event_id);
  };

  // Basic error check if notification object is somehow null/undefined
  if (!notification) {
     return (
        <div className="p-4 text-center text-red-600">
            Error: Notification data is missing.
        </div>
     );
  }

  return (
    // Adjust overall padding, keep relative for CloseButton
    <div className="relative p-4 md:p-6">
      <CloseButton onClick={onClose} aria-label="Close notification detail">
        <X size={18} />
      </CloseButton>

      {/* Use the CenteredContent container */}
      <CenteredContent>
        {/* Title First */}
        <h1 className="text-xl md:text-2xl font-semibold mb-1 text-center">
          Alert Detected
        </h1>
        {/* Optional: Sub-details under title */}
        {(notification.home_name || notification.camera_name) && (
          <p className="text-gray-600 text-sm mb-2 text-center">
            {notification.home_name && `Location: ${notification.home_name}`}
            {notification.home_name && notification.camera_name && ' • '}
            {notification.camera_name && `Camera: ${notification.camera_name}`}
          </p>
        )}

        {/* Image Container */}
        <ImageContainer>
          {notification.blob_url ? (
            <img
              src={notification.blob_url}
              alt={`Alert at ${notification.camera_name || 'camera'} on ${format(new Date(notification.timestamp), 'PP')}`}
              className="object-contain w-full h-auto" // Explicitly set height to auto
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Image not available
            </div>
          )}
        </ImageContainer>

        {/* Timestamp Below Image */}
        <p className="text-gray-500 text-sm mt-2">
          {format(new Date(notification.timestamp), 'PPpp')}
        </p>

        {/* Action Buttons */}
        <ActionButtons>
          <ResolveButton
            $variant="primary" // Keep variant for potential base styles
            $size="small" 
            onClick={handleResolve}
            className="rounded-md" // Apply slight rounding via class
          >
            Mark as Resolved
          </ResolveButton>
          <DangerButton
            $size="small"
            onClick={handleFalseAlarm}
            className="rounded-md" // Apply slight rounding via class
          >
            Mark as False Positive
          </DangerButton>
        </ActionButtons>
      </CenteredContent>
    </div>
  );
};

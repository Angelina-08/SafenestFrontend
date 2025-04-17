import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons';

const PlayerContainer = styled.div`
  width: 100%;
  position: relative;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PlayerControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PlayerContainer}:hover & {
    opacity: 1;
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface CameraPlayerProps {
  rtspUrl: string;
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ rtspUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when URL changes
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.src = '';
    }

    // In a real implementation, you would use a library like JSMpeg, node-rtsp-stream, or a service
    // like WebRTC to handle RTSP streams in the browser.
    // For this example, we'll simulate the process with a timeout

    const loadTimeout = setTimeout(() => {
      // In a real implementation, this is where you would initialize the RTSP player
      // For now, we'll just simulate success or failure
      
      if (rtspUrl.includes('error')) {
        setError('Failed to connect to camera stream. Please check the RTSP URL and try again.');
        setIsLoading(false);
      } else {
        setIsLoading(false);
        // Auto-play would happen here in a real implementation
      }
    }, 2000);

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [rtspUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
    // In a real implementation, you would start the stream here
  };

  const handlePause = () => {
    setIsPlaying(false);
    // In a real implementation, you would pause the stream here
  };

  const handleReload = () => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    
    // Simulate reloading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <PlayerContainer>
      <VideoElement 
        ref={videoRef}
        playsInline
      />
      
      {isLoading && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      
      {error && (
        <ErrorOverlay>
          <p>{error}</p>
          <Button onClick={handleReload} variant="secondary" size="small">
            <ReloadIcon /> Try Again
          </Button>
        </ErrorOverlay>
      )}
      
      {!isLoading && !error && (
        <PlayerControls>
          {isPlaying ? (
            <Button onClick={handlePause} variant="secondary" size="small">
              <PauseIcon /> Pause
            </Button>
          ) : (
            <Button onClick={handlePlay} variant="secondary" size="small">
              <PlayIcon /> Play
            </Button>
          )}
          <Button onClick={handleReload} variant="secondary" size="small">
            <ReloadIcon /> Reload
          </Button>
        </PlayerControls>
      )}
    </PlayerContainer>
  );
};

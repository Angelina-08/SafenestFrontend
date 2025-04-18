import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons';
import axios from 'axios';

const API_BASE_URL = 'https://safe-nest-back-end.vercel.app';

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

const CanvasElement = styled.canvas`
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
  cameraId: number;
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ rtspUrl, cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<{ streamId: string, streamUrl: string } | null>(null);

  // Function to handle WebSocket connection
  const connectToWebSocket = useCallback((streamUrl: string) => {
    if (!canvasRef.current) return;
    
    // Parse the URL to get the base URL and stream ID
    const urlParts = streamUrl.split('/stream/');
    if (urlParts.length !== 2) {
      console.error('Invalid stream URL format:', streamUrl);
      setError('Invalid stream URL format');
      setIsLoading(false);
      return;
    }
    
    const baseUrl = urlParts[0];
    const streamId = urlParts[1];
    
    // Create WebSocket URL (convert http to ws, https to wss)
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = baseUrl.replace(/^http(s?):\/\//, `${wsProtocol}://`);
    const wsUrl = `${wsBaseUrl}/stream/${streamId}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create new WebSocket connection
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;
    
    // Set up canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas context');
      setError('Failed to initialize video player');
      setIsLoading(false);
      return;
    }
    
    // Draw initial background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Connecting to stream...', canvas.width / 2, canvas.height / 2);
    
    // WebSocket event handlers
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsLoading(false);
    };
    
    ws.onmessage = (event) => {
      // Convert ArrayBuffer to Blob
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create an image element
      const img = new Image();
      
      // When the image loads, draw it on the canvas
      img.onload = () => {
        if (!ctx || !canvas) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Release the blob URL
        URL.revokeObjectURL(url);
      };
      
      // Set the image source to the blob URL
      img.src = url;
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error connecting to stream. Please try again.');
      setIsLoading(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (isPlaying) {
        setError('Stream connection closed. Please try again.');
      }
    };
    
  }, [isPlaying]);

  // Start stream when component mounts or when play is clicked
  const startStream = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting stream for camera ID:', cameraId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Request stream from backend
      console.log('Sending request to:', `${API_BASE_URL}/api/camera/stream/start`);
      const response = await axios.post(
        `${API_BASE_URL}/api/camera/stream/start`,
        { cameraId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Stream response:', response.data);
      
      // Make sure the streamUrl is a complete URL
      let streamUrl = response.data.streamUrl;
      
      // If the URL doesn't start with http, assume it's a path and prepend the MJPEG server URL
      if (!streamUrl.startsWith('http')) {
        // Extract the MJPEG server URL from the response if possible
        const baseUrl = response.data.streamUrl.split('/stream/')[0] || 'http://56.228.7.181:3000';
        streamUrl = `${baseUrl}${streamUrl}`;
      }
      
      console.log('Final stream URL:', streamUrl);
      
      setStreamInfo({
        streamId: response.data.streamId,
        streamUrl: streamUrl
      });
      
      // Connect to WebSocket for streaming
      connectToWebSocket(streamUrl);
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Error starting stream:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      setError('Failed to start camera stream. Please try again.');
      setIsLoading(false);
    }
  }, [cameraId, connectToWebSocket]);

  // Stop stream when component unmounts or when pause is clicked
  const stopStream = useCallback(async () => {
    if (!streamInfo) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Request stream termination from backend
      await axios.post(
        `${API_BASE_URL}/api/camera/stream/stop`,
        { streamId: streamInfo.streamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsPlaying(false);
      setStreamInfo(null);
      
      // Clear the canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      // Even if there's an error, we still want to update the UI
      setIsPlaying(false);
    }
  }, [streamInfo]);

  // Start/stop stream based on isPlaying state
  useEffect(() => {
    // Auto-start the stream when component mounts
    if (!streamInfo) {
      startStream();
    }
    
    return () => {
      // Clean up stream when component unmounts
      if (streamInfo) {
        stopStream();
      }
    };
  }, [streamInfo, startStream, stopStream]);

  // Set up canvas dimensions
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
    }
  }, []);

  const handlePlay = () => {
    startStream();
  };

  const handlePause = () => {
    stopStream();
  };

  const handleReload = () => {
    if (streamInfo) {
      stopStream();
    }
    setTimeout(() => {
      startStream();
    }, 500);
  };

  return (
    <PlayerContainer>
      {streamInfo ? (
        <>
          <CanvasElement ref={canvasRef} />
          <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 5px', borderRadius: 3, fontSize: 12 }}>
            Stream ID: {streamInfo.streamId.substring(0, 8)}...
          </div>
        </>
      ) : (
        <VideoElement 
          ref={videoRef}
          playsInline
        />
      )}
      
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

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

// Define JSMpeg types
declare global {
  interface Window {
    JSMpeg: any;
  }
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ rtspUrl, cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<{ streamId: string, streamUrl: string } | null>(null);
  const [jsmpegLoaded, setJsmpegLoaded] = useState(false);

  // Load JSMpeg library
  const loadJSMpeg = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.JSMpeg) {
        setJsmpegLoaded(true);
        resolve();
        return;
      }
      
      // Try multiple CDN sources
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/jsmpeg@1.0.0/jsmpeg.min.js',
        'https://unpkg.com/jsmpeg@1.0.0/jsmpeg.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jsmpeg/0.1/jsmpeg.min.js'
      ];
      
      const loadScript = (index: number) => {
        if (index >= cdnUrls.length) {
          console.error('Failed to load JSMpeg from all CDN sources');
          reject(new Error('Failed to load video player from all sources'));
          return;
        }
        
        const script = document.createElement('script');
        script.src = cdnUrls[index];
        
        script.onload = () => {
          console.log('JSMpeg loaded successfully from', cdnUrls[index]);
          setJsmpegLoaded(true);
          resolve();
        };
        
        script.onerror = () => {
          console.warn(`Failed to load JSMpeg from ${cdnUrls[index]}, trying next source...`);
          document.head.removeChild(script);
          loadScript(index + 1);
        };
        
        document.head.appendChild(script);
      };
      
      loadScript(0);
    });
  }, []);

  // Connect to the WebSocket stream
  const connectToStream = useCallback((streamUrl: string) => {
    if (!canvasRef.current || !streamInfo || !jsmpegLoaded) {
      console.error('Cannot connect to stream: Canvas ref, stream info, or JSMpeg not available');
      return;
    }
    
    try {
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
      const wsUrl = `${wsBaseUrl}/ws/${streamId}`;
      
      console.log('Connecting to WebSocket stream:', wsUrl);
      
      // Check if JSMpeg is available
      if (!window.JSMpeg) {
        console.error('JSMpeg library not loaded');
        setError('Video player not available. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }
      
      // Clean up existing player if any
      if (playerRef.current) {
        if (playerRef.current.destroy) {
          playerRef.current.destroy();
        }
        playerRef.current = null;
      }
      
      // Create new player
      try {
        playerRef.current = new window.JSMpeg.Player(wsUrl, {
          canvas: canvasRef.current,
          autoplay: true,
          audio: false,
          loop: false,
          onSourceEstablished: () => {
            console.log('Stream source established');
          },
          onSourceCompleted: () => {
            console.log('Stream source completed');
          },
          onPlay: () => {
            console.log('Stream playback started');
            setIsLoading(false);
          },
          onStalled: () => {
            console.log('Stream stalled');
          },
          onEnded: () => {
            console.log('Stream ended');
            setError('Stream ended unexpectedly. Please try again.');
          }
        });
        
        console.log('JSMpeg player created');
        
        // Send heartbeat to keep stream alive
        const heartbeatInterval = setInterval(() => {
          if (streamInfo) {
            fetch(`${baseUrl}/stream/${streamId}/heartbeat`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).catch(err => console.error('Heartbeat error:', err));
          }
        }, 30000); // every 30 seconds
        
        // Store interval for cleanup
        if (playerRef.current) {
          playerRef.current.heartbeatInterval = heartbeatInterval;
        }
      } catch (err) {
        console.error('Error creating JSMpeg player:', err);
        setError('Failed to initialize video player. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error connecting to stream:', error);
      setError('Failed to connect to stream. Please try again.');
      setIsLoading(false);
    }
  }, [streamInfo, jsmpegLoaded]);

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

      // Load JSMpeg library first
      try {
        await loadJSMpeg();
      } catch (err) {
        console.error('Failed to load JSMpeg:', err);
        setError('Failed to load video player. Please refresh the page and try again.');
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
      
      // Connect to the stream
      connectToStream(streamUrl);
      
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
  }, [cameraId, loadJSMpeg, connectToStream]);

  // Stop stream when component unmounts or when pause is clicked
  const stopStream = useCallback(async () => {
    if (!streamInfo) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Clean up player
      if (playerRef.current) {
        // Clear heartbeat interval
        if (playerRef.current.heartbeatInterval) {
          clearInterval(playerRef.current.heartbeatInterval);
        }
        
        // Destroy player
        if (playerRef.current.destroy) {
          playerRef.current.destroy();
        }
        playerRef.current = null;
      }

      // Request stream termination from backend
      await axios.post(
        `${API_BASE_URL}/api/camera/stream/stop`,
        { streamId: streamInfo.streamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsPlaying(false);
      setStreamInfo(null);
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

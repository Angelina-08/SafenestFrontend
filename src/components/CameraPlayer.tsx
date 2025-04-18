import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons';
import axios from 'axios';
// Import Hls.js types
import Hls from 'hls.js';

// Define types for Hls.js events
interface HlsEventData {
  type?: string;
  details?: string;
  fatal?: boolean;
  [key: string]: any;
}

// Define HLS.js types
declare global {
  interface Window {
    Hls: typeof Hls;
  }
}

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
  hlsUrl: string;
  cameraId: number;
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ rtspUrl, hlsUrl, cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<{ 
    streamId: string, 
    hlsUrl: string
  } | null>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [heartbeatIntervalId, setHeartbeatIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [directPlaybackMode, setDirectPlaybackMode] = useState<boolean>(false);

  // Function to test if a URL is accessible
  const testUrlAccess = useCallback(async (url: string): Promise<boolean> => {
    try {
      setDebugInfo(prev => `${prev}\nTesting URL access: ${url}`);
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      return true;
    } catch (error) {
      setDebugInfo(prev => `${prev}\nURL access test failed: ${error}`);
      return false;
    }
  }, []);

  // Start stream when component mounts or when play is clicked
  const startStream = useCallback(async () => {
    if (isPlaying) return;
    
    setIsLoading(true);
    setError(null);
    setDebugInfo(`Attempting to play HLS stream: ${hlsUrl}`);
    
    // Test URL access first
    const canAccess = await testUrlAccess(hlsUrl);
    if (!canAccess) {
      setDebugInfo(prev => `${prev}\nCannot access HLS URL directly. This may be a CORS issue.`);
    }
    
    // Check if URL is from ngrok
    const isNgrokUrl = hlsUrl.includes('ngrok');
    if (isNgrokUrl) {
      setDebugInfo(prev => `${prev}\nDetected ngrok URL - applying special handling`);
    }
    
    // Always use the direct HLS URL provided
    try {
      if (videoRef.current) {
        if (Hls.isSupported()) {
          // Create HLS instance with more detailed logging
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false, // Change to false for more stable playback
            backBufferLength: 30,
            debug: true,
            // Special configuration for ngrok
            xhrSetup: function(xhr, url) {
              // Log URL being requested
              setDebugInfo(prev => `${prev}\nRequesting: ${url}`);
              
              // Add CORS headers if needed
              xhr.withCredentials = false;
              
              // Add custom headers that might be needed for ngrok
              xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
              
              // Add cache control
              xhr.setRequestHeader('Cache-Control', 'no-cache');
            },
            // Adjust chunk loading settings for better compatibility
            maxBufferLength: 60,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 1,
            liveSyncDuration: 3,
            liveMaxLatencyDuration: 30, // Increased for more stability
            liveDurationInfinity: true,
            startLevel: -1, // Auto select quality level
            fragLoadingTimeOut: 20000, // Longer timeout for fragment loading
            manifestLoadingTimeOut: 20000, // Longer timeout for manifest loading
            levelLoadingTimeOut: 20000 // Longer timeout for level loading
          });
          
          // Add more detailed event listeners
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            setDebugInfo(prev => `${prev}\nMedia attached to video element`);
          });
          
          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            setDebugInfo(prev => `${prev}\nManifest parsed: ${data.levels.length} quality levels`);
            videoRef.current?.play().catch(e => {
              console.error('Error playing video:', e);
              setDebugInfo(prev => `${prev}\nPlay error: ${e.message}`);
              setError(`Failed to play video: ${e.message}`);
            });
            setIsLoading(false);
            setIsPlaying(true);
          });
          
          hls.on(Hls.Events.ERROR, (event: string, data: HlsEventData) => {
            console.error('HLS error:', data);
            setDebugInfo(prev => `${prev}\nHLS error: ${data.type} - ${data.details}`);
            
            if (data.fatal) {
              setError(`Stream playback error: ${data.type} - ${data.details}`);
              hls.destroy();
              
              // If we get a fatal error, try direct playback as fallback
              if (!directPlaybackMode) {
                setDebugInfo(prev => `${prev}\nTrying direct video tag playback as fallback`);
                setDirectPlaybackMode(true);
                tryDirectPlayback();
              }
            }
          });
          
          hls.on(Hls.Events.MANIFEST_LOADING, () => {
            setDebugInfo(prev => `${prev}\nManifest loading...`);
          });
          
          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            setDebugInfo(prev => `${prev}\nLevel loaded: duration ${data.details.totalduration}s`);
          });
          
          // Load the source and attach media
          setDebugInfo(prev => `${prev}\nLoading source: ${hlsUrl}`);
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);
          
          setHlsInstance(hls);
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari which has built-in HLS support
          setDebugInfo(prev => `${prev}\nUsing native HLS support in Safari`);
          videoRef.current.src = hlsUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            videoRef.current?.play().catch(e => {
              console.error('Error playing video:', e);
              setDebugInfo(prev => `${prev}\nPlay error: ${e.message}`);
              setError(`Failed to play video: ${e.message}`);
            });
            setIsLoading(false);
            setIsPlaying(true);
          });
          
          videoRef.current.addEventListener('error', (e) => {
            const videoError = videoRef.current?.error;
            const errorMessage = videoError ? 
              `Video error: ${videoError.code} - ${videoError.message}` : 
              'Unknown video error';
            
            setDebugInfo(prev => `${prev}\n${errorMessage}`);
            setError(errorMessage);
            setIsLoading(false);
          });
        } else {
          setError('Your browser does not support HLS playback');
          setDebugInfo(prev => `${prev}\nBrowser does not support HLS playback`);
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error playing HLS stream:', error);
      setDebugInfo(prev => `${prev}\nException: ${error.message}`);
      setError(`Failed to play HLS stream: ${error.message}`);
      setIsLoading(false);
    }
  }, [hlsUrl, isPlaying, directPlaybackMode, testUrlAccess]);

  // Try direct playback as a fallback
  const tryDirectPlayback = useCallback(() => {
    if (videoRef.current) {
      setDebugInfo(prev => `${prev}\nAttempting direct playback of: ${hlsUrl}`);
      
      videoRef.current.src = hlsUrl;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('controls', 'true');
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('muted', 'true');
      
      videoRef.current.addEventListener('canplay', () => {
        setDebugInfo(prev => `${prev}\nDirect playback can play`);
        setIsLoading(false);
      });
      
      videoRef.current.addEventListener('playing', () => {
        setDebugInfo(prev => `${prev}\nDirect playback is playing`);
        setIsLoading(false);
        setIsPlaying(true);
      });
      
      videoRef.current.addEventListener('error', (e) => {
        const videoError = videoRef.current?.error;
        const errorMessage = videoError ? 
          `Direct playback error: ${videoError.code} - ${videoError.message}` : 
          'Unknown video error';
        
        setDebugInfo(prev => `${prev}\n${errorMessage}`);
        setError(errorMessage);
        setIsLoading(false);
      });
      
      videoRef.current.load();
      videoRef.current.play().catch(e => {
        setDebugInfo(prev => `${prev}\nDirect playback error: ${e.message}`);
      });
    }
  }, [hlsUrl]);

  // Stop stream
  const stopStream = useCallback(async () => {
    if (!isPlaying) return;
    
    try {
      // Clean up HLS player
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      
      // Clear heartbeat interval
      if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId);
        setHeartbeatIntervalId(null);
      }
      
      // Reset direct playback mode
      setDirectPlaybackMode(false);
      
      // Stop stream on server if we have a streamId
      if (streamInfo?.streamId) {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/api/camera/stream/stop`, 
          { streamId: streamInfo.streamId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStreamInfo(null);
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    } finally {
      // Even if there's an error, we still want to update the UI
      setIsPlaying(false);
    }
  }, [streamInfo, hlsInstance, heartbeatIntervalId, isPlaying]);

  // Start/stop stream based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      startStream();
    } else {
      stopStream();
    }
  }, [isPlaying, startStream, stopStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Restart stream
  const restartStream = () => {
    stopStream().then(() => {
      setIsPlaying(true);
    });
  };

  // Function to open stream in new tab for testing
  const openInNewTab = () => {
    window.open(hlsUrl, '_blank');
  };

  return (
    <PlayerContainer>
      <VideoElement 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls
      />
      
      {isLoading && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      
      {error && (
        <ErrorOverlay>
          <p>{error}</p>
          <pre>{debugInfo}</pre>
          <Button onClick={restartStream} variant="secondary" size="small">
            <ReloadIcon /> Try Again
          </Button>
          <Button onClick={openInNewTab} variant="secondary" size="small">
            Open in New Tab
          </Button>
        </ErrorOverlay>
      )}
      
      {!isLoading && !error && (
        <PlayerControls>
          {isPlaying ? (
            <Button onClick={togglePlayback} variant="secondary" size="small">
              <PauseIcon /> Pause
            </Button>
          ) : (
            <Button onClick={togglePlayback} variant="secondary" size="small">
              <PlayIcon /> Play
            </Button>
          )}
          <Button onClick={restartStream} variant="secondary" size="small">
            <ReloadIcon /> Reload
          </Button>
        </PlayerControls>
      )}
    </PlayerContainer>
  );
};

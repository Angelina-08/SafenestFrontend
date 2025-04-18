import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './Button';
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Define props interface
interface CameraPlayerProps {
  rtspUrl: string;
  hlsUrl: string;
  cameraId: number;
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ rtspUrl, hlsUrl, cameraId }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Initialize video.js player
  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      setDebugInfo(`Initializing Video.js player with HLS URL: ${hlsUrl}`);
      
      // Create video element
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-fill');
      videoRef.current.appendChild(videoElement);
      
      // Configure Video.js options
      const options = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: hlsUrl,
          type: 'application/x-mpegURL'
        }],
        html5: {
          hls: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            handleManifestRedirects: true,
          }
        }
      };
      
      // Initialize the player
      try {
        const player = videojs(videoElement, options);
        playerRef.current = player;
        
        // Add event listeners
        player.on('ready', () => {
          setDebugInfo(prev => `${prev}\nPlayer is ready`);
          setIsLoading(false);
        });
        
        player.on('error', (e: any) => {
          const error = player.error();
          const errorMessage = error ? `Video.js error: ${error.code} - ${error.message}` : 'Unknown video error';
          setDebugInfo(prev => `${prev}\n${errorMessage}`);
          setError(errorMessage);
          setIsLoading(false);
        });
        
        player.on('waiting', () => {
          setDebugInfo(prev => `${prev}\nPlayer is waiting for data`);
          setIsLoading(true);
        });
        
        player.on('playing', () => {
          setDebugInfo(prev => `${prev}\nPlayback started`);
          setIsLoading(false);
          setIsPlaying(true);
          setError(null);
        });
        
        player.on('ended', () => {
          setDebugInfo(prev => `${prev}\nPlayback ended`);
          setIsPlaying(false);
        });
      } catch (e: any) {
        setError(`Failed to initialize video player: ${e.message}`);
        setDebugInfo(prev => `${prev}\nPlayer initialization error: ${e.message}`);
      }
    }
    
    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [hlsUrl]);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play().catch((e: any) => {
        setError(`Failed to play video: ${e.message}`);
        setDebugInfo(prev => `${prev}\nPlay error: ${e.message}`);
      });
    }
  }, [isPlaying]);

  // Restart the player
  const restartStream = useCallback(() => {
    if (!playerRef.current) return;
    
    setDebugInfo(prev => `${prev}\nRestarting player`);
    playerRef.current.pause();
    playerRef.current.currentTime(0);
    playerRef.current.play().catch((e: any) => {
      setError(`Failed to restart video: ${e.message}`);
      setDebugInfo(prev => `${prev}\nRestart error: ${e.message}`);
    });
  }, []);

  // Function to open stream in new tab for testing
  const openInNewTab = useCallback(() => {
    window.open(hlsUrl, '_blank');
  }, [hlsUrl]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video.js container */}
      <div ref={videoRef} className="w-full aspect-video" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <div className="text-white text-xs mb-4 max-h-32 overflow-auto p-2 bg-gray-800 rounded w-full">
            <pre>{debugInfo}</pre>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={restartStream} 
              $variant="secondary" 
              $size="small"
            >
              <ReloadIcon className="mr-2" />
              Retry
            </Button>
            <Button 
              onClick={openInNewTab} 
              $variant="secondary" 
              $size="small"
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      )}
      
      {/* Controls (only show when not using native controls) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-between items-center">
          <Button 
            onClick={togglePlayback} 
            $variant="secondary" 
            $size="small"
          >
            {isPlaying ? <PauseIcon className="mr-2" /> : <PlayIcon className="mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button 
            onClick={restartStream} 
            $variant="secondary" 
            $size="small"
          >
            <ReloadIcon className="mr-2" />
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
};

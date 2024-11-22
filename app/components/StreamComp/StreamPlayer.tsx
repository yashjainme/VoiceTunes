import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import {  CurrentVidInterface} from "./streamTypes";
//@ts-ignore
import YTPlayer from "yt-player";
import { YT_REGEX } from '@/app/lib/utils';



interface StreamPlayerProps {
  currentVideo: CurrentVidInterface | null;
  onPlayNext: () => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ currentVideo, onPlayNext }) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const autoplayAttempted = useRef(false);

  const getVideoId = (url: string) => {
    
    const match = url.match(YT_REGEX);
    return match ? match[5] : null;
  };

  const initializePlayer = (videoId: string) => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    if (playerContainerRef.current) {
      playerRef.current = new YTPlayer(playerContainerRef.current, {
        related: false,
        modestBranding: true,
        playsinline: true,
        host: 'https://www.youtube-nocookie.com',
      });

      playerRef.current.on('ready', () => {
        setIsPlayerReady(true);
        handleAutoplay();
      });

      playerRef.current.on('playing', () => {
        if (playerRef.current.isMuted()) {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
        }
      });

      playerRef.current.on('ended', onPlayNext);

      playerRef.current.load(videoId, true);
    }
  };

  const handleAutoplay = async () => {
    if (!playerRef.current || !isPlayerReady || autoplayAttempted.current) return;

    autoplayAttempted.current = true;
    
    try {
      playerRef.current.mute();
      await playerRef.current.play();
    } catch (error) {
      console.error('Autoplay failed:', error);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (currentVideo) {
      const videoId = getVideoId(currentVideo.url);
      if (videoId) {
        autoplayAttempted.current = false;
        setIsPlayerReady(false);
        initializePlayer(videoId);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentVideo]);

  return (
    <div className="rounded-lg overflow-hidden bg-gray-800/50 backdrop-blur-md shadow-xl">
      <div className="aspect-video relative rounded-lg overflow-hidden">
        {currentVideo ? (
          <>
            <div 
              ref={playerContainerRef}
              className="absolute inset-0 w-full h-full"
            />
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors duration-200"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur">
            <Music className="h-16 w-16 text-purple-400 animate-pulse" />
            <p className="mt-4 text-gray-300">No video is currently playing</p>
          </div>
        )}
      </div>
    </div>
  );
};

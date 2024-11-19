
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Link as LinkIcon, Share2, Music, SkipForward, Loader, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { YT_REGEX } from '../lib/utils';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//@ts-ignore
import YTPlayer from "yt-player";

interface VideoItem {
  id: string;
  extractId: string;
  title: string;
  thumbnail: string;
  votes: number;
  haveUpvoted: boolean;
}


interface Stream {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  votes?: number;
  upvotes?: number;
  haveUpvoted?: boolean;
  smallImg?: string;
}

interface CurrentVidInterface {
  id: string;
  type: "Youtube";
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  played: boolean;
  playedTs: null;
  createdAt: string;
  userId: string;
  addedBy: string;
  spaceId: null;
}

interface StreamViewProps {
  creatorId: string;
  playVideo: boolean;
}

const StreamView: React.FC<StreamViewProps> = ({ creatorId, playVideo = false }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CurrentVidInterface | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const REFRESH_INTERVAL_MS = 5 * 1000;
  const autoplayAttempted = useRef(false);

  
   // Update the refreshStreams function to handle video IDs
const refreshStreams = async () => {
  try {
    const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
    const streams = res.data.streams.map((stream: any) => ({
      id: stream.id,
      url: stream.url, // Make sure URL is included
      title: stream.title,
      thumbnail: stream.smallImg,
      votes: stream.upvotes || 0,
      haveUpvoted: stream.haveUpvoted,
    }));
    
    // Sort by votes
    streams.sort((a: any, b: any) => b.votes - a.votes);
    setQueue(streams);

    // Only set current video if there isn't one playing
    if (!currentVideo && res.data.activeStream) {
      setCurrentVideo(res.data.activeStream);
    }
  } catch (error) {
    console.error('Error fetching streams:', error);
    toast.error('Error loading streams. Try again later.');
  }
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

      // Add event listeners
      playerRef.current.on('unstarted', () => {
        console.log('Player unstarted - attempting autoplay');
        handleAutoplay();
      });

      playerRef.current.on('ready', () => {
        console.log('Player ready');
        setIsPlayerReady(true);
        handleAutoplay();
      });

      playerRef.current.on('playing', () => {
        console.log('Video playing');
        // Once playing, unmute if it was muted for autoplay
        if (playerRef.current.isMuted()) {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
        }
      });

      playerRef.current.on('ended', () => {
        console.log('Video ended');
        handlePlayNext();
      });

      playerRef.current.on('error', (err: any) => {
        console.error('Player error:', err);
        toast.error('Error playing video. Skipping to next...');
        handlePlayNext();
      });

      // Load the video
      playerRef.current.load(videoId, true);
    }
  };


  const handleAutoplay = async () => {
    if (!playerRef.current || !isPlayerReady || autoplayAttempted.current) return;

    autoplayAttempted.current = true;
    
    try {
      // Try to play muted first (more likely to succeed with autoplay policies)
      playerRef.current.mute();
      await playerRef.current.play();
      
      // Check if video is actually playing
      setTimeout(() => {
        if (playerRef.current && !playerRef.current.getDuration()) {
          // If video didn't start playing, show a toast message
          toast.info('Click to start playing');
        }
      }, 1000);
    } catch (error) {
      console.error('Autoplay failed:', error);
      toast.info('Click to start playing');
    }
  };


  useEffect(() => {
    if (creatorId) {
      refreshStreams();
      const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
      return () => {
        clearInterval(interval);
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    }
  }, [creatorId]);

  useEffect(() => {
    if (currentVideo) {
      const videoId = getVideoId(currentVideo.url);
      if (videoId) {
        console.log('Initializing player with video:', videoId);
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


  const toggleVote = async (id: string, currentVote: boolean) => {
    try {
      if (currentVote) {
        await axios.post('/api/streams/downvote', { streamId: id });
      } else {
        await axios.post('/api/streams/upvote', { streamId: id });
      }

      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.id === id
            ? { ...item, votes: currentVote ? item.votes - 1 : item.votes + 1, haveUpvoted: !currentVote }
            : item
        ).sort((a, b) => b.votes - a.votes)
      );
    } catch (error) {
      console.error('Error toggling vote:', error);
      toast.error('Failed to update vote.');
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }
  
    const extractedId = getVideoId(videoUrl);
    if (!extractedId) {
      toast.error('Invalid YouTube URL');
      return;
    }
  
    try {
      setLoading(true);
  
      // First, get the latest queue state from the server
      const currentQueueResponse = await axios.get(`/api/streams?creatorId=${creatorId}`);
      const currentQueue: Stream[] = currentQueueResponse.data.streams;
      const activeStream: Stream | null = currentQueueResponse.data.activeStream;
  
      // Check for duplicates in the latest server state
      const isDuplicate = currentQueue.some((stream: Stream) => {
        const streamVideoId = getVideoId(stream.url);
        return streamVideoId === extractedId;
      });
  
      const isCurrentlyPlaying = activeStream && getVideoId(activeStream.url) === extractedId;
  
      if (isDuplicate || isCurrentlyPlaying) {
        toast.error('This video has already been added to your stream');
        setLoading(false);
        return;
      }
  
      // If no duplicate found, proceed to add the video
      const res = await axios.post('/api/streams', { 
        creatorId, 
        url: videoUrl
      });
  
      if (!res.data?.id) {
        throw new Error('Invalid response from server');
      }
  
      // After successful addition, refresh the queue to get the latest state
      await refreshStreams();
      
      setVideoUrl('');
      toast.success('Video added to queue!');
  
    } catch (error) {
      console.error('Error adding video to queue:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('This video has already been added to the stream');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to add video. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this cool music stream!',
        url: `${window.location.origin}/creator/${creatorId}`,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(YT_REGEX);
    return match ? match[5] : null;
  };

  const handlePlayNext = async () => {
    try {
      // Clean up current player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const res = await axios.get(`/api/streams/playnext`);
      const nextVideo = res.data.stream;

      if (nextVideo) {
        
        setCurrentVideo(nextVideo);

        setQueue((prevQueue) => {
          return prevQueue.filter((video) => video.id !== nextVideo.id); // Remove nextVideo from the queue
        });
        toast.success('Playing next video!');
      } else {
        setCurrentVideo(null);
        toast.info('No more videos in the queue.');
      }
    } catch (error) {
      console.error('Error playing next video:', error);
      toast.error('Failed to play next video. Try again.');
    }
  };
 

  const videoId = currentVideo ? getVideoId(currentVideo.url) : null;

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

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 ">
      <Header />
      <ToastContainer />
      
      <main className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">


            
            {/* Player Card */}
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

            {/* Submit Song Card */}
            <div className="rounded-lg bg-gray-800/50 backdrop-blur-md shadow-xl">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Submit a Song</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Paste YouTube URL here"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    disabled={loading}
                    onClick={handleUrlSubmit}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Add to Queue
                      </>
                    )}
                  </button>
                </div>
                {videoUrl && (
                  <div className="mt-4">
                    <LiteYouTubeEmbed id={getVideoId(videoUrl) || ''} title="Video Preview" poster="hqdefault" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Queue Card */}
            <div className="rounded-lg bg-gray-800/50 backdrop-blur-md shadow-xl">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Up Next</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {queue.length > 0 ? (
                    queue.map((video) => (
                      <div 
                        key={video.id} 
                        className="group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-gray-700/50 backdrop-blur"
                      >
                        <div className="relative w-20 h-12 rounded overflow-hidden">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-gray-200">{video.title}</p>
                          <p className="text-sm text-purple-400">{video.votes} votes</p>
                        </div>
                        <button
                          onClick={() => toggleVote(video.id, video.haveUpvoted)}
                          className={`p-2 rounded-lg transition-colors ${
                            video.haveUpvoted 
                              ? 'text-blue-400 hover:text-blue-500' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {video.haveUpvoted ? <ThumbsDown className="h-5 w-5" /> : <ThumbsUp className="h-5 w-5" />}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Music className="h-12 w-12 mb-3 opacity-50" />
                      <p>No upcoming videos in the queue</p>
                    </div>
                  )}
                </div>
                {playVideo && queue.length > 0 && (
                  <button
                    onClick={handlePlayNext}
                    className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <SkipForward className="h-5 w-5 mr-2" />
                    Play Next
                  </button>
                )}
              </div>
            </div>

            {/* Share Button Card */}
            <div className="rounded-lg bg-gray-800/50 backdrop-blur-md shadow-xl p-4">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Stream
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default StreamView;


























// "use client"

// import React, { useEffect, useState } from 'react';
// import VideoPlayer from './StreamComp/VideoPlayer';
// import SubmitSong from './StreamComp/SubmitSong';
// import Queue from './StreamComp/Queue';
// import ShareButton from './StreamComp/ShareButton';
// import { toast } from 'react-toastify';
// import { CurrentVidInterface, VideoItem } from './StreamComp/StreamTypes';
// import axios from 'axios';
// import Header from './Header';

// interface StreamViewProps {
//   creatorId: string;
//   playVideo: boolean;
// }

// const StreamView: React.FC<StreamViewProps> = ({ creatorId, playVideo }) => {
//   const [videoUrl, setVideoUrl] = useState('');
//   const [queue, setQueue] = useState<VideoItem[]>([]);
//   const [currentVideo, setCurrentVideo] = useState<CurrentVidInterface | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (creatorId) {
//       refreshStreams();
//       const interval = setInterval(refreshStreams, 5000);
//       return () => clearInterval(interval);
//     }
//   }, [creatorId]);

//   const refreshStreams = async () => {
//     try {
//       const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
//       const streams = res.data.streams.map((stream: any) => ({
//         id: stream.id,
//         url: stream.url,
//         title: stream.title,
//         thumbnail: stream.smallImg,
//         votes: stream.upvotes || 0,
//         haveUpvoted: stream.haveUpvoted,
//       }));

//       streams.sort((a: any, b: any) => b.votes - a.votes);
//       setQueue(streams);

//       if (!currentVideo && res.data.activeStream) {
//         setCurrentVideo(res.data.activeStream);
//       }
//     } catch (error) {
//       console.error('Error fetching streams:', error);
//       toast.error('Error loading streams. Try again later.');
//     }
//   };

//   const toggleVote = async (id: string, currentVote: boolean) => {
//     try {
//       if (currentVote) {
//         await axios.post('/api/streams/downvote', { streamId: id });
//       } else {
//         await axios.post('/api/streams/upvote', { streamId: id });
//       }

//       setQueue((prevQueue) =>
//         prevQueue
//           .map((item) =>
//             item.id === id
//               ? { ...item, votes: currentVote ? item.votes - 1 : item.votes + 1, haveUpvoted: !currentVote }
//               : item
//           )
//           .sort((a, b) => b.votes - a.votes)
//       );
//     } catch (error) {
//       console.error('Error toggling vote:', error);
//       toast.error('Failed to update vote.');
//     }
//   };

//   const handlePlayNext = async () => {
//     try {
//       const res = await axios.get(`/api/streams/playnext`);
//       const nextVideo = res.data.stream;

//       if (nextVideo) {
//         setCurrentVideo(nextVideo);
//         setQueue((prevQueue) => prevQueue.filter((video) => video.id !== nextVideo.id));
//         toast.success('Playing next video!');
//       } else {
//         setCurrentVideo(null);
//         toast.info('No more videos in the queue.');
//       }
//     } catch (error) {
//       console.error('Error playing next video:', error);
//       toast.error('Failed to play next video. Try again.');
//     }
//   };

//   const toggleMute = () => {
//     setIsMuted((prevState) => !prevState);
//   };

//   // Fixing the issue with `videoId` type
//   const videoId = currentVideo ? currentVideo.url.split('/').pop() ?? null : null;

//   return (
//     <>
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
//     <Header/>
//       <main className="container mx-auto p-4 max-w-6xl">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-6">
//             <VideoPlayer videoId={videoId} isMuted={isMuted} toggleMute={toggleMute} />
//             <SubmitSong creatorId={creatorId} loading={loading} setLoading={setLoading} setQueue={setQueue} videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
//           </div>

//           <div className="lg:col-span-1 space-y-6">
//             <Queue queue={queue} toggleVote={toggleVote} handlePlayNext={handlePlayNext} />
//             <ShareButton creatorId={creatorId} />
//           </div>
//         </div>
//       </main>
//     </div>
//     </>
//   );
// };

// export default StreamView;

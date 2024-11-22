

"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import { StreamPlayer } from './StreamComp/StreamPlayer';
import { VideoSubmissionCard } from './StreamComp/VideoSubmissionCard';
import { VideoQueueCard } from './StreamComp/VideoQueueCard';
import { ShareStreamCard } from './StreamComp/ShareStreamCard';
import { VideoItem, CurrentVidInterface, StreamViewProps } from './StreamComp/streamTypes';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const StreamView: React.FC<StreamViewProps> = ({ creatorId, playVideo = false }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CurrentVidInterface | null>(null);
  const REFRESH_INTERVAL_MS = 5 * 1000;

  const refreshStreams = async () => {
    try {
      const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
      const streams = res.data.streams.map((stream: any) => ({
        id: stream.id,
        url: stream.url,
        title: stream.title,
        thumbnail: stream.smallImg,
        votes: stream.upvotes || 0,
        haveUpvoted: stream.haveUpvoted,
      }));
      
      streams.sort((a: any, b: any) => b.votes - a.votes);
      setQueue(streams);

      if (!currentVideo && res.data.activeStream) {
        setCurrentVideo(res.data.activeStream);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Error loading streams. Try again later.');
    }
  };

  const toggleVote = async (id: string, currentVote: boolean) => {
    // Optimistically update the UI
    setQueue((prevQueue) =>
      prevQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              votes: currentVote ? item.votes - 1 : item.votes + 1,
              haveUpvoted: !currentVote,
            }
          : item
      ).sort((a, b) => b.votes - a.votes)
    );
  
    try {
      // Make the actual API call
      if (currentVote) {
        await axios.post('/api/streams/downvote', { streamId: id });
      } else {
        await axios.post('/api/streams/upvote', { streamId: id });
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      toast.error('Failed to update vote.');
  
      // Revert the optimistic update on error
      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.id === id
            ? {
                ...item,
                votes: currentVote ? item.votes + 1 : item.votes - 1,
                haveUpvoted: currentVote,
              }
            : item
        ).sort((a, b) => b.votes - a.votes)
      );
    }
  };
  

  const handlePlayNext = async () => {
    try {
      const res = await axios.get(`/api/streams/playnext`);
      const nextVideo = res.data.stream;

      if (nextVideo) {
        setCurrentVideo(nextVideo);
        setQueue((prevQueue) => prevQueue.filter((video) => video.id !== nextVideo.id));
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

  useEffect(() => {
    if (creatorId && status === "authenticated") {
      refreshStreams();
      const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [creatorId, status]);

  // Render authentication screen if not authenticated
  const renderAuthScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-300 mb-6">Please sign in to access the stream content.</p>
        <button 
          onClick={() => signIn()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
        >
          Sign In
        </button>
      </div>
    </div>
  );

  // Render main content if authenticated
  const renderMainContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <Header />
      <ToastContainer />
      
      <main className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StreamPlayer 
              currentVideo={currentVideo} 
              onPlayNext={handlePlayNext} 
            />
            
            <VideoSubmissionCard 
              creatorId={creatorId} 
              onVideoAdded={refreshStreams} 
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <VideoQueueCard 
              queue={queue}
              playVideo={playVideo}
              onToggleVote={toggleVote}
              onPlayNext={handlePlayNext}
            />
            
            <ShareStreamCard creatorId={creatorId} />
          </div>
        </div>
      </main>
    </div>
  );

  return status === "authenticated" ? renderMainContent() : renderAuthScreen();
};

export default StreamView;
























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
import { PriorityQueueCard, EnhancedVideoItem } from './StreamComp/PriorityQueueCard';
import { initializePayment } from '../utils/razorpay';
import { Tv2 } from 'lucide-react';
import Pusher from 'pusher-js';

const StreamView: React.FC<StreamViewProps> = ({ creatorId, playVideo = false }) => {
  const { data: session, status } = useSession();
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<EnhancedVideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CurrentVidInterface | null>(null);
  const REFRESH_INTERVAL_MS = 5 * 1000;

  // ── Derived: is the current logged-in user the owner of this stream? ──────
  const isStreamer =
    status === 'authenticated' && (session?.user as any)?.id === creatorId;

  // ── Fetch queue & active stream ──────────────────────────────────────────
  const refreshStreams = async () => {
    try {
      const res = await axios.get(`/api/streams?creatorId=${creatorId}`);

      const streams: any[] = res.data.streams.map((stream: any) => ({
        id: stream.id,
        url: stream.url,
        title: stream.title,
        thumbnail: stream.smallImg,
        votes: stream.upvotes || 0,
        haveUpvoted: stream.haveUpvoted,
        isPriority: stream.payment?.status === 'COMPLETED',
        payment: stream.payment
          ? {
              amount: stream.payment.amount,
              status: stream.payment.status,
              createdAt: new Date(stream.payment.createdAt),
            }
          : undefined,
      }));

      const regular = streams
        .filter((s) => !s.isPriority)
        .sort((a, b) => b.votes - a.votes);
      const priority = streams
        .filter((s) => s.isPriority)
        .sort((a, b) => b.payment.amount - a.payment.amount);

      setQueue(regular);
      setPriorityQueue(priority as EnhancedVideoItem[]);

      // activeStream is a CurrentStream row; .stream is the raw Stream object
      if (!currentVideo && res.data.activeStream?.stream) {
        setCurrentVideo(res.data.activeStream.stream as CurrentVidInterface);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Error loading streams. Try again later.');
    }
  };

  // ── Payment / priority boost ─────────────────────────────────────────────
  const handleInitiatePayment = async (videoId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to make a priority request');
      return;
    }
    try {
      const result = await initializePayment(
        videoId,
        100,
        (session.user as any).id || creatorId,
        session.user.email!
      );
      if (result.success) {
        toast.success('Payment successful! Your request is now prioritized.');
        refreshStreams();
      } else {
        toast.error(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again later.');
    }
  };

  // ── Upvote / downvote (optimistic) ───────────────────────────────────────
  const toggleVote = async (id: string, currentVote: boolean) => {
    setQueue((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                votes: currentVote ? item.votes - 1 : item.votes + 1,
                haveUpvoted: !currentVote,
              }
            : item
        )
        .sort((a, b) => b.votes - a.votes)
    );

    try {
      if (currentVote) {
        await axios.post('/api/streams/downvote', { streamId: id });
      } else {
        await axios.post('/api/streams/upvote', { streamId: id });
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      toast.error('Failed to update vote.');
      // Revert optimistic update
      setQueue((prev) =>
        prev
          .map((item) =>
            item.id === id
              ? {
                  ...item,
                  votes: currentVote ? item.votes + 1 : item.votes - 1,
                  haveUpvoted: currentVote,
                }
              : item
          )
          .sort((a, b) => b.votes - a.votes)
      );
    }
  };

  // ── Play next (priority or regular) ─────────────────────────────────────
  const handlePlayNext = async (isPriority: boolean = false) => {
    try {
      const res = await axios.get(
        `/api/streams/playnext?isPriority=${isPriority}`
      );
      const nextVideo = res.data.stream;

      if (nextVideo) {
        setCurrentVideo(nextVideo);
        if (isPriority) {
          setPriorityQueue((prev) =>
            prev.filter((video) => video.id !== nextVideo.id)
          );
        } else {
          setQueue((prev) => prev.filter((video) => video.id !== nextVideo.id));
        }
        toast.success(
          isPriority ? '⭐ Priority video now playing!' : '▶ Playing next video!'
        );
      } else {
        toast.info(
          isPriority ? 'No more priority videos.' : 'No more videos in queue.'
        );
      }
    } catch (error) {
      console.error('Error playing next video:', error);
      toast.error('Failed to play next video. Try again.');
    }
  };

  // ── Smart auto-play: always drain priority queue first ───────────────────
  const handleAutoPlayNext = async () => {
    if (priorityQueue.length > 0) {
      await handlePlayNext(true);
    } else {
      await handlePlayNext(false);
    }
  };

  // ── Real-time event listener (Pusher) with polling fallback ──────────────
  useEffect(() => {
    if (!creatorId || status !== 'authenticated') return;

    // Initial load
    refreshStreams();

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    // Fall back to polling if environment variables are not present
    if (!pusherKey || !pusherCluster) {
      console.warn(
        'Pusher client keys not configured. Falling back to HTTP polling.'
      );
      const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
    }

    // Initialize Pusher Client
    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channelName = `creator-${creatorId}`;
    const channel = pusher.subscribe(channelName);

    // Bind to real-time events to refresh queue status
    channel.bind('queue-updated', (data: any) => {
      console.log('Real-time queue update received:', data);
      refreshStreams();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [creatorId, status]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-400 font-medium text-sm tracking-wide">
            Loading session…
          </p>
        </div>
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <div className="text-center p-10 bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv2 className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Sign in to join the stream, submit songs, and vote for your
            favourites.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <Header />
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />

      <main className="container mx-auto px-4 pb-10 max-w-6xl">
        {/* Creator banner */}
        {isStreamer && (
          <div className="mb-5 px-4 py-2.5 bg-purple-950/60 border border-purple-700/40 rounded-xl flex items-center gap-2.5 text-sm text-purple-300">
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse flex-shrink-0" />
            <span>
              You are the <strong>creator</strong> of this stream — only you can
              advance the queue.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: player + submission ── */}
          <div className="lg:col-span-2 space-y-6">
            <StreamPlayer
              currentVideo={currentVideo}
              onPlayNext={handleAutoPlayNext}
            />
            <VideoSubmissionCard
              creatorId={creatorId}
              onVideoAdded={refreshStreams}
            />
          </div>

          {/* ── Right column: priority queue + regular queue + share ── */}
          <div className="lg:col-span-1 space-y-5">
            <PriorityQueueCard
              priorityQueue={priorityQueue}
              onPlayNext={() => handlePlayNext(true)}
              onInitiatePayment={handleInitiatePayment}
              isStreamer={isStreamer}
            />
            <VideoQueueCard
              queue={queue}
              playVideo={playVideo || isStreamer}
              onToggleVote={toggleVote}
              onPlayNext={() => handlePlayNext(false)}
            />
            <ShareStreamCard creatorId={creatorId} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StreamView;
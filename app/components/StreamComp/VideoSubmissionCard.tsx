
import React, { useState } from 'react';
import { Link as LinkIcon, Loader, Crown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { initializePayment } from '@/app/utils/razorpay';
import { YT_REGEX } from '@/app/lib/utils';
import { useSession } from 'next-auth/react';

interface VideoSubmissionCardProps {
  creatorId: string;
  onVideoAdded: () => void;
}

export const VideoSubmissionCard: React.FC<VideoSubmissionCardProps> = ({ creatorId, onVideoAdded }) => {
  const { data: session } = useSession();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [amount, setAmount] = useState<number>(100); // Default amount in INR

  const getVideoId = (url: string) => {
    const match = url.match(YT_REGEX);
    return match ? match[5] : null;
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
      const currentQueue = currentQueueResponse.data.streams;
      // activeStream is a CurrentStream row; the raw Stream lives at .stream
      const activeStreamRow = currentQueueResponse.data.activeStream;
      const activeStreamUrl = activeStreamRow?.stream?.url ?? null;
  
      // Check for duplicates in the latest server state
      const isDuplicate = currentQueue.some((stream: any) => {
        const streamVideoId = getVideoId(stream.url);
        return streamVideoId === extractedId;
      });
  
      const isCurrentlyPlaying =
        activeStreamUrl && getVideoId(activeStreamUrl) === extractedId;
  
      if (isDuplicate || isCurrentlyPlaying) {
        toast.error('This video has already been added to your stream');
        setLoading(false);
        return;
      }
  
      // Add the video first
      const response = await axios.post('/api/streams', { 
        creatorId, 
        url: videoUrl
      });

      const streamId = response.data.id;

      // If priority, handle payment
      if (isPriority) {
        const paymentResult = await initializePayment(
          streamId,
          amount,
          (session?.user as any)?.id || creatorId,
          session?.user?.email || 'user@example.com'
        );

        if (!paymentResult.success) {
          // If payment fails, we should delete the stream
          await axios.delete(`/api/streams/${streamId}`);
          toast.error('Payment failed. Video was not added to queue.');
          setLoading(false);
          return;
        }
      }
  
      setVideoUrl('');
      toast.success(isPriority ? 'Priority video added to queue!' : 'Video added to queue!');
      setIsPriority(false);
      onVideoAdded();
  
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

  return (
    <div className="rounded-lg bg-gray-800/50 backdrop-blur-md shadow-xl">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Submit a Song</h2>
      </div>
      <div className="p-4 space-y-4">
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
            className={`px-4 py-2 ${
              isPriority 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]`}
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isPriority ? (
                  <Crown className="h-4 w-4 mr-2" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                {isPriority ? 'Add Priority' : 'Add to Queue'}
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-300">Make Priority Request</span>
          </label>
          
          {isPriority && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Amount:</span>
              <select
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-sm text-white"
              >
                <option value={100}>₹100</option>
                <option value={200}>₹200</option>
                <option value={500}>₹500</option>
                <option value={1000}>₹1000</option>
              </select>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="mt-4">
            <LiteYouTubeEmbed id={getVideoId(videoUrl) || ''} title="Video Preview" poster="hqdefault" />
          </div>
        )}
      </div>
    </div>
  );
};

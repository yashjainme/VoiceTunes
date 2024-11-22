import React, { useState } from 'react';
import { Link as LinkIcon, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { YT_REGEX } from '@/app/lib/utils';

interface VideoSubmissionCardProps {
  creatorId: string;
  onVideoAdded: () => void;
}

export const VideoSubmissionCard: React.FC<VideoSubmissionCardProps> = ({ creatorId, onVideoAdded }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

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
      const activeStream = currentQueueResponse.data.activeStream;
  
      // Check for duplicates in the latest server state
      const isDuplicate = currentQueue.some((stream: any) => {
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
      await axios.post('/api/streams', { 
        creatorId, 
        url: videoUrl
      });
  
      setVideoUrl('');
      toast.success('Video added to queue!');
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
  );
};
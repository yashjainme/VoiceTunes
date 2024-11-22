import React from 'react';
import { ThumbsUp, ThumbsDown, Music, SkipForward } from 'lucide-react';

import {  VideoItem} from "./streamTypes";

interface VideoQueueCardProps {
  queue: VideoItem[];
  playVideo?: boolean;
  onToggleVote: (id: string, currentVote: boolean) => void;
  onPlayNext?: () => void;
 
}

export const VideoQueueCard: React.FC<VideoQueueCardProps> = ({ 
  queue, 
  playVideo = false, 
  onToggleVote, 
  onPlayNext 
}) => {

  
  return (
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
                  onClick={() => onToggleVote(video.id, video.haveUpvoted)}
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
        {playVideo && queue.length > 0 && onPlayNext && (
          <button
            onClick={onPlayNext}
            className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <SkipForward className="h-5 w-5 mr-2" />
            Play Next
          </button>
        )}
      </div>
    </div>
  );
};

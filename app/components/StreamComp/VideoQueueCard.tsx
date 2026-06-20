import React from 'react';
import { ThumbsUp, ThumbsDown, Music, SkipForward } from 'lucide-react';
import { VideoItem } from './streamTypes';

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
  onPlayNext,
}) => {
  return (
    <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md shadow-xl border border-gray-700/40">
      <div className="p-4 border-b border-gray-700/40 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">Up Next</h2>
        <span className="bg-gray-700/60 text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {queue.length} songs
        </span>
      </div>

      <div className="p-4">
        {queue.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700/50">
            {queue.map((video) => (
              <div
                key={video.id}
                className="group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-gray-700/40"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-200" />
                </div>

                {/* Title + votes */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-200">
                    {video.title}
                  </p>
                  <p className="text-xs text-purple-400 mt-0.5">
                    {video.votes} vote{video.votes !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Vote button */}
                <button
                  onClick={() => onToggleVote(video.id, video.haveUpvoted)}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
                    video.haveUpvoted
                      ? 'text-blue-400 hover:text-blue-300 bg-blue-900/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
                  }`}
                  title={video.haveUpvoted ? 'Remove vote' : 'Upvote'}
                >
                  {video.haveUpvoted ? (
                    <ThumbsDown className="h-4 w-4" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Music className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No upcoming videos in the queue</p>
          </div>
        )}

        {/* Creator-only: play next from regular queue */}
        {playVideo && queue.length > 0 && onPlayNext && (
          <button
            onClick={onPlayNext}
            className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-900/40"
          >
            <SkipForward className="h-4 w-4" />
            Play Next
          </button>
        )}
      </div>
    </div>
  );
};

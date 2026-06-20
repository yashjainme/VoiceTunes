import React from 'react';
import { Crown, Play, Music, Zap } from 'lucide-react';
import { VideoItem } from './streamTypes';

export interface EnhancedVideoItem extends VideoItem {
  payment: {
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
  };
}

interface PriorityQueueCardProps {
  priorityQueue: EnhancedVideoItem[];
  /** Called when the creator clicks the play button on a priority item */
  onPlayNext: () => void;
  onInitiatePayment: (videoId: string) => void;
  isStreamer: boolean;
}

export const PriorityQueueCard: React.FC<PriorityQueueCardProps> = ({
  priorityQueue,
  onPlayNext,
  onInitiatePayment,
  isStreamer,
}) => {
  // Sort descending by amount; ties broken by earliest payment (FIFO fairness)
  const sorted = [...priorityQueue].sort(
    (a, b) =>
      b.payment.amount - a.payment.amount ||
      new Date(a.payment.createdAt).getTime() -
        new Date(b.payment.createdAt).getTime()
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-950/60 to-gray-800/60 backdrop-blur-md shadow-xl border border-yellow-800/30">
      {/* Header */}
      <div className="p-4 border-b border-yellow-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-yellow-300">
            Priority Queue
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
            {priorityQueue.length} paid
          </span>
          {/* Creator-only: play top priority now */}
          {isStreamer && priorityQueue.length > 0 && (
            <button
              onClick={onPlayNext}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-yellow-500/30"
            >
              <Play className="h-3.5 w-3.5" />
              Play Top
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Music className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm text-center">No priority requests yet</p>
            <p className="text-xs text-gray-600 mt-1 text-center">
              Boost a song to the top by paying any amount
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-yellow-800/40">
            {sorted.map((video, i) => (
              <div
                key={video.id}
                className="group flex items-center gap-3 p-2.5 rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-200"
              >
                {/* Rank badge */}
                <div className="flex-shrink-0 w-6 text-center">
                  {i === 0 ? (
                    <Zap className="h-4 w-4 text-yellow-400 mx-auto" />
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">
                      #{i + 1}
                    </span>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {video.title}
                  </p>
                  <span className="text-yellow-400 text-xs font-semibold">
                    ₹{video.payment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
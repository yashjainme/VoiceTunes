import React from 'react';
import { VideoItem } from './streamTypes';
import Image from 'next/image';

interface PriorityQueueCardProps {
  priorityQueue: VideoItem[];
  onPlayNext: (isPriority: boolean) => void;
}

export const PriorityQueueCard: React.FC<PriorityQueueCardProps> = ({
  priorityQueue,
  onPlayNext,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-400">Priority Queue</h2>
        {priorityQueue.length > 0 && (
          <button
            onClick={() => onPlayNext(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Play Priority Next
          </button>
        )}
      </div>

      {priorityQueue.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No priority requests yet</p>
      ) : (
        <div className="space-y-4">
          {priorityQueue.map((video) => (
            <div
              key={video.id}
              className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
            >
              <div className="flex-shrink-0 w-24 h-16 relative">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  layout="fill"
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
                <p className="text-yellow-400 text-sm mt-1">
                  Paid Request: ${video.paidAmount?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
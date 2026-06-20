  // import React from 'react';
  // import { VideoItem } from './streamTypes';
  // import Image from 'next/image';

  // interface PriorityQueueCardProps {
  //   priorityQueue: VideoItem[];
  //   onPlayNext: (isPriority: boolean) => void;
  // }

  // export const PriorityQueueCard: React.FC<PriorityQueueCardProps> = ({
  //   priorityQueue,
  //   onPlayNext,
  // }) => {
  //   return (
  //     <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
  //       <div className="flex justify-between items-center mb-4">
  //         <h2 className="text-xl font-bold text-yellow-400">Priority Queue</h2>
  //         {priorityQueue.length > 0 && (
  //           <button
  //             onClick={() => onPlayNext(true)}
  //             className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-200"
  //           >
  //             Play Priority Next
  //           </button>
  //         )}
  //       </div>

  //       {priorityQueue.length === 0 ? (
  //         <p className="text-gray-400 text-center py-4">No priority requests yet</p>
  //       ) : (
  //         <div className="space-y-4">
  //           {priorityQueue.map((video) => (
  //             <div
  //               key={video.id}
  //               className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
  //             >
  //               <div className="flex-shrink-0 w-24 h-16 relative">
  //                 <Image
  //                   src={video.thumbnail}
  //                   alt={video.title}
  //                   layout="fill"
  //                   className="rounded-md object-cover"
  //                 />
  //               </div>
  //               <div className="flex-grow">
  //                 <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
  //                 <p className="text-yellow-400 text-sm mt-1">
  //                   Paid Request: ${video.paidAmount?.toFixed(2)}
  //                 </p>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };














import React from 'react';
import { Crown, Play, Music, AlertCircle } from 'lucide-react';
import { VideoItem } from './streamTypes';

// Update VideoItem type to include payment information
interface EnhancedVideoItem extends VideoItem {
  payment: {
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
  };
}

interface PriorityQueueCardProps {
  priorityQueue: EnhancedVideoItem[];
  onPlayNext: (videoId: string) => void;
  onInitiatePayment: (videoId: string) => void;
  isStreamer: boolean;
}

export const PriorityQueueCard: React.FC<PriorityQueueCardProps> = ({
  priorityQueue,
  onPlayNext,
  onInitiatePayment,
  isStreamer
}) => {
  const sortedQueue = [...priorityQueue].sort((a, b) => 
    b.payment.amount - a.payment.amount || 
    new Date(b.payment.createdAt).getTime() - new Date(a.payment.createdAt).getTime()
  );

  return (
    <div className="rounded-lg bg-gradient-to-br from-yellow-900/50 to-gray-800/50 backdrop-blur-md shadow-xl">
      <div className="p-4 border-b border-yellow-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-yellow-400">Priority Queue</h2>
        </div>
        <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
          {priorityQueue.length} requests
        </span>
      </div>

      <div className="p-4">
        {priorityQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Music className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center">No priority requests yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Support your favorite streamer by making a priority request
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQueue.map((video) => (
              <div
                key={video.id}
                className="group relative flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-200"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-200" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-200 line-clamp-1">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400 font-semibold">
                      ₹{video.payment.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(video.payment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {isStreamer && (
                  <button
                    onClick={() => onPlayNext(video.id)}
                    className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                  >
                    <Play className="h-5 w-5" />
                  </button>
                )}

                {video.payment.status === 'PENDING' && !isStreamer && (
                  <button
                    onClick={() => onInitiatePayment(video.id)}
                    className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                  >
                    Pay Now
                  </button>
                )}

                {video.payment.status === 'PENDING' && (
                  <div className="absolute top-2 right-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareStreamCardProps {
  creatorId: string;
}

export const ShareStreamCard: React.FC<ShareStreamCardProps> = ({ creatorId }) => {
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

  return (
    <div className="rounded-lg bg-gray-800/50 backdrop-blur-md shadow-xl p-4">
      <button
        onClick={handleShare}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Stream
      </button>
    </div>
  );
};

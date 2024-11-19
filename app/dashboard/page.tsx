  // "use client";

  // import React, { useEffect, useState } from 'react';
  // import { ThumbsUp, ThumbsDown, Music, Link as LinkIcon, Share2 } from 'lucide-react';
  // import axios from 'axios';

  // import LiteYouTubeEmbed from 'react-lite-youtube-embed';
  // import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
  // import { YT_REGEX } from '../lib/utils';
  // import TestEmbed from './TestEmbed';


  // interface VideoItem {
  //   id: string;
  //   title: string;
  //   thumbnail: string;
  //   votes: number;
  //   userVote: 'up' | 'down' | null;
    
  // }

  // const StreamPlayer = () => {
  //   const [videoUrl, setVideoUrl] = useState('');
  //   const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  //   const REFRESH_INTERVAL_MS = 10 * 1000;


  //   // Mock data for the queue
  //   const [queue, setQueue] = useState<VideoItem[]>([]);


  //   async function refreshStreams() {
  //     try {
  //       const res = await axios.get('api/streams/my');
  //       console.log(res.data); // Log the response data, not the whole response object
  //     } catch (error) {
  //       console.error('Error fetching streams:', error);
  //     }
  //   }
    
  //   useEffect(()=>{
  //     refreshStreams();
  //     const interval = setInterval(()=>{

  //     }, REFRESH_INTERVAL_MS)
  //   }, [])



  //   const  handleVote  = async (id: string, voteType: 'up' | 'down') => {
  //     setQueue(queue.map(item => {
  //       if (item.id === id) {
  //         const voteChange = 
  //           item.userVote === voteType ? -1 :
  //           item.userVote === null ? 1 :
  //           2;
  //         return {
  //           ...item,
  //           votes: item.votes + (voteType === 'up' ? voteChange : -voteChange),
  //           userVote: item.userVote === voteType ? null : voteType
  //         };
  //       }
  //       return item;
  //     }).sort((a, b) => b.votes - a.votes));

      

  //     const upvoteStream = async (streamId: string): Promise<void> => {
  //       try {
  //         const res = await axios.post('/api/streams/upvote', {
  //           streamId, // Pass the streamId in the request body
  //         });
  //         console.log(res.data); // Log the response data
  //       } catch (error) {
  //         console.error('Error upvoting stream:', error);
  //       }
  //     };
      
  //     // Example usage: Call this function with the specific stream ID you want to upvote
  //     upvoteStream('a1240d9e-0589-4351-8bb7-f3aeb7f57bb0');

  //   };

  //   const handleUrlSubmit = async () => {
  //     if (!videoUrl.trim()) return; // Prevent submission if the URL is empty
  //     console.log(videoUrl)
  //     try {
  //       const res = await axios.post('/api/streams', {
  //         creatorId: "aae230cb-ee96-400d-ba56-70662d2fc709",
  //         url: videoUrl
  //       });

  //       console.log(res)
    
  //       // Assuming the response contains the video data
  //       const newVideoItem = {
  //         id: res.data.id || 'new_id', // Use the ID from the response or generate a new one
  //         title: res.data.title || 'New Video', // Use the title from the response
  //         thumbnail: res.data.smallImg || '/api/placeholder/120/68',
  //         votes: 0,
  //         userVote: null,
  //       };
    
  //       // Update the queue state
  //       setQueue(prevQueue => [...prevQueue, newVideoItem]);
    
  //       // Optional: Clear the videoUrl after submission
  //       setVideoUrl('');
  //     } catch (error) {
  //       console.error('Error adding video to queue:', error);
  //     }
  //   };
    

  //   const handleShare = () => {
  //     if (navigator.share) {
  //       navigator.share({
  //         title: 'Check out this cool music stream!',
  //         url: window.location.href,
  //       }).then(() => {
  //         console.log('Page shared successfully!');
  //       }).catch((error) => {
  //         console.error('Error sharing:', error);
  //       });
  //     } else {
  //       alert('Web Share API is not supported in your browser.');
  //     }
  //   };


  //   const getVideoId = (url: string) => {
  //     const match = url.match(YT_REGEX);
  //     return match ? match[5] : null;
  //   };
    
  //   const videoId = getVideoId(videoUrl);




  //   return (
  //     <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
  //       <div className="container mx-auto p-4 max-w-6xl flex-1">
  //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //           {/* Main Video Player */}
            
  //           <div className="lg:col-span-2 space-y-4">
  //           <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
  //           {videoId && (
  //   <div className="relative w-full h-0 pb-[56.25%] bg-gray-800 rounded-lg overflow-hidden">
  //     <LiteYouTubeEmbed id={videoId} title="Video Preview" poster="hqdefault" />
  //   </div>
  // )}

              
  //           </div>
              

  //             {/* Video Submission */}
  //             <div className="bg-gray-800 rounded-lg p-4 shadow">
  //               <h2 className="text-lg font-semibold mb-2">Submit a Song</h2>
  //               <div className="flex gap-2">
  //                 <input
  //                   type="text"
  //                   placeholder="Paste YouTube URL here"
  //                   value={videoUrl}
  //                   onChange={(e) => setVideoUrl(e.target.value)}
  //                   className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
  //                 />
  //                 <button 
  //                   onClick={handleUrlSubmit}
  //                   className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
  //                 >
  //                   <LinkIcon className="h-4 w-4 mr-2" />
  //                   Add to Queue
  //                 </button>
  //               </div>

  //               {previewVideo && (
  //                 <div className="mt-4 bg-gray-700/50 p-3 rounded border border-gray-600">
  //                   <div className="flex items-center">
  //                     <img src={previewVideo.thumbnail} alt="" className="w-20 h-12 rounded mr-3" />
  //                     <p>Added to queue: {previewVideo.title}</p>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           {/* Queue */}
  //           <div className="lg:col-span-1 space-y-4">
  //             <div className="bg-gray-800 rounded-lg p-4 shadow">
  //               <h2 className="text-lg font-semibold mb-4">Up Next</h2>
  //               <div className="space-y-4">
  //                 {queue.map((video) => (
  //                   <div key={video.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50">
  //                     <img src={video.thumbnail} alt="" className="w-20 h-12 rounded" />
  //                     <div className="flex-1 min-w-0">
  //                       <p className="truncate">{video.title}</p>
  //                       <p className="text-sm text-gray-400">{video.votes} votes</p>
  //                     </div>
  //                     <div className="flex items-center gap-1">
  //                       <button 
  //                         onClick={() => handleVote(video.id, 'up')}
  //                         className={`p-2 rounded ${
  //                           video.userVote === 'up' 
  //                             ? 'bg-purple-600 text-white' 
  //                             : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
  //                         }`}
  //                       >
  //                         <ThumbsUp className="h-4 w-4" />
  //                       </button>
  //                       <button 
  //                         onClick={() => handleVote(video.id, 'down')}
  //                         className={`p-2 rounded ${
  //                           video.userVote === 'down' 
  //                             ? 'bg-purple-600 text-white' 
  //                             : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
  //                         }`}
  //                       >
  //                         <ThumbsDown className="h-4 w-4" />
  //                       </button>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>

  //             {/* Share Button */}
  //             <div className="bg-gray-800 rounded-lg p-4 shadow">
  //               <h2 className="text-lg font-semibold mb-4">Share this Stream</h2>
  //               <button 
  //                 onClick={handleShare}
  //                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
  //               >
  //                 <Share2 className="h-4 w-4 mr-2" />
  //                 Share Stream
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>




  //     </div>



  //   );
  // };

  // export default StreamPlayer;
































    
    

   









//   "use client";

// import React, { useEffect, useState } from 'react';
// import { ThumbsUp, ThumbsDown, Link as LinkIcon, Share2, ColumnsIcon, ChevronUp, ChevronDown } from 'lucide-react';
// import axios from 'axios';
// import LiteYouTubeEmbed from 'react-lite-youtube-embed';
// import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
// import { YT_REGEX } from '../lib/utils';
// import Header from '../components/Header';
// import TestEmbed from './TestEmbed';

// interface VideoItem {
//   id: string;
//   title: string;
//   thumbnail: string;
//   votes: number;
//   userVote: 'up' | 'down' | null;
// }

// const StreamPlayer = () => {
//   const [videoUrl, setVideoUrl] = useState('');
//   const [queue, setQueue] = useState<VideoItem[]>([]);
//   const REFRESH_INTERVAL_MS = 10 * 1000;


  
//   // Fetch and set the initial queue of streams
//   async function refreshStreams() {
//     try {
//       const res = await axios.get('api/streams/my');
      
      
      
//       const streams = res.data.streams.map((stream: any) => ({
//         id: stream.id,
//         title: stream.title,
//         thumbnail: stream.smallImg,
//         votes: stream.upvotes || 0,
//         userVote: null,
//       }));
//       setQueue(streams);
//     } catch (error) {
//       console.error('Error fetching streams:', error);
//     }
//   }

//   useEffect(() => {
//     refreshStreams();
//     const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
//     return () => clearInterval(interval);
//   }, []);



//   const upvoteStream = async (streamId: string): Promise<void> => {
//     try {
//       await axios.post('/api/streams/upvote', { streamId });
//     } catch (error) {
//       console.error('Error upvoting stream:', error);
//     }
//   };
  
//   const downvoteStream = async (streamId: string): Promise<void> => {
//     try {
//       await axios.post('/api/streams/downvote', { streamId });
//     } catch (error) {
//       console.error('Error downvoting stream:', error);
//     }
//   };
  
//   // Adjusted handleVote function to call upvote/downvote based on voteType
//   const handleVote = (id: string, voteType: 'up' | 'down') => {
//     setQueue((prevQueue) =>
//       prevQueue.map((item) => {
//         if (item.id === id) {
//           // Decide vote change direction
//           const voteChange = 
//             item.userVote === voteType ? -1 :
//             item.userVote === null ? 1 :
//             2;
  
//           // Call appropriate upvote/downvote function
//           if (voteType === 'up') upvoteStream(id);
//           else downvoteStream(id);
  
//           return {
//             ...item,
//             votes: item.votes + (voteType === 'up' ? voteChange : -voteChange),
//             userVote: item.userVote === voteType ? null : voteType,
//           };
//         }
//         return item;
//       }).sort((a, b) => b.votes - a.votes)
//     );
//   };
  


//  const handleUrlSubmit = async () => {
//   const res = await axios.get('api/user');
//   const creatorId = res.data.userId.id;

//   if (!videoUrl.trim()) return;
//   try {
//     const res = await axios.post('/api/streams', {
//       creatorId: creatorId,
//       url: videoUrl,
//     });

//     const newVideoItem = {
//       id: res.data.id || 'new_id',
//       title: res.data.title || 'New Video',
//       thumbnail: res.data.smallImg || '/api/placeholder/120/68',
//       votes: 0,
//       userVote: null,
//     };

//     // Preload image
//     await new Promise((resolve, reject) => {
//       const img = new Image();
//       img.src = newVideoItem.thumbnail;
//       img.onload = resolve;
//       img.onerror = reject;
//     });

//     // Once image is loaded, update the queue
//     setQueue(prevQueue => [...prevQueue,   newVideoItem]);
//     setVideoUrl('');
//   } catch (error) {
//     console.error('Error adding video to queue:', error);
//   }
// };


//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: 'Check out this cool music stream!',
//         url: window.location.href,
//       }).catch((error) => {
//         console.error('Error sharing:', error);
//       });
//     } else {
//       alert('Web Share API is not supported in your browser.');
//     }
//   };

//   const getVideoId = (url: string) => {
//     const match = url.match(YT_REGEX);
//     return match ? match[5] : null;
//   };

//   const videoId = getVideoId(videoUrl);



//   // console.log(creatorId)
  

//   return (
//     <>
    
//     <Header/>
//     <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
//       <div className="container mx-auto p-4 max-w-6xl flex-1">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-4">
//             <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
//               {videoId && (
//                 <div className="relative w-full h-0 pb-[56.25%] bg-gray-800 rounded-lg overflow-hidden">
//                   <LiteYouTubeEmbed id={videoId} title="Video Preview" poster="hqdefault" />
//                 </div>
//               )}
//             </div>
//             <div className="bg-gray-800 rounded-lg p-4 shadow">
//               <h2 className="text-lg font-semibold mb-2">Submit a Song</h2>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Paste YouTube URL here"
//                   value={videoUrl}
//                   onChange={(e) => setVideoUrl(e.target.value)}
//                   className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//                 <button 
//                   onClick={handleUrlSubmit}
//                   className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
//                 >
//                   <LinkIcon className="h-4 w-4 mr-2" />
//                   Add to Queue
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="lg:col-span-1 space-y-4">
//             <div className="bg-gray-800 rounded-lg p-4 shadow">
//               <h2 className="text-lg font-semibold mb-4">Up Next</h2>
//               <div className="space-y-4">
//                 {queue.map((video) => (
//                   <div key={video.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50">
//                     <img src={video.thumbnail} alt="" className="w-20 h-12 rounded" />
//                     <div className="flex-1 min-w-0">
//                       <p className="truncate">{video.title}</p>
//                       <p className="text-sm text-gray-400">{video.votes} votes</p>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <button 
//                         onClick={() => handleVote(video.id, 'up')}
//                         className={`p-2 rounded ${video.userVote === 'up' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
//                       >
//                         <ThumbsUp className="h-4 w-4" />
//                       </button>
//                       <button 
//                         onClick={() => handleVote(video.id, 'down')}
//                         className={`p-2 rounded ${video.userVote === 'down' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
//                       >
//                         <ThumbsDown className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-gray-800 rounded-lg p-4 shadow">
//               <h2 className="text-lg font-semibold mb-4">Share this Stream</h2>
//               <button 
//                 onClick={handleShare}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
//               >
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share Stream
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>



//     {/* <TestEmbed/> */}
//     </>
//   );
// };

// export default StreamPlayer;
























































  // "use client";

  // import React, { useEffect, useState } from 'react';
  // import { ThumbsUp, ThumbsDown, Link as LinkIcon, Share2 } from 'lucide-react';
  // import axios from 'axios';
  // import LiteYouTubeEmbed from 'react-lite-youtube-embed';
  // import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
  // import { YT_REGEX } from '../lib/utils';
  // import Header from '../components/Header';

  // interface VideoItem {
  //   id: string;
  //   title: string;
  //   thumbnail: string;
  //   votes: number;
  //   haveUpvoted: boolean;  // Indicates if the user has upvoted
  // }


  // const StreamPlayer = () => {
  //   const [videoUrl, setVideoUrl] = useState('');
  //   const [queue, setQueue] = useState<VideoItem[]>([]);
  //   const REFRESH_INTERVAL_MS = 10 * 1000;
  //   const [creatorId, setCreatorId] = useState('')
    
  //   // Fetch and set the initial queue of streams
  //   async function refreshStreams() {
  //     try {

  //       const userres = await axios.get('api/user');
  //     setCreatorId(userres.data.userId.id);

  //     //  console.log(creatorId)
  //       const res = await axios.get('api/streams/my');



    
  //       console.log(res.data);
  //       const streams = res.data.streams.map((stream: any) => ({
  //         id: stream.id,
  //         title: stream.title,
  //         thumbnail: stream.smallImg,
  //         votes: stream.upvotes || 0,
  //         haveUpvoted: stream.haveUpvoted,
  //       }));
        
  //       // Sort streams by votes in descending order
  //       streams.sort((a: VideoItem, b: VideoItem) => b.votes - a.votes);
  //       setQueue(streams);
  //     } catch (error) {
  //       console.error('Error fetching streams:', error);
  //     }
  //   }

  //   useEffect(() => {
  //     refreshStreams();
  //     const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
  //     return () => clearInterval(interval);
  //   }, []);

    
  // const toggleVote = async (id: string, currentVote: boolean) => {
  //   try {
  //     if (currentVote) {
  //       await axios.post('/api/streams/downvote', { streamId: id });
  //     } else {
  //       await axios.post('/api/streams/upvote', { streamId: id });
  //     }
      
  //     setQueue((prevQueue) => {
  //       const updatedQueue = prevQueue.map((item) =>
  //         item.id === id
  //           ? {
  //               ...item,
  //               votes: currentVote ? item.votes - 1 : item.votes + 1,
  //               haveUpvoted: !currentVote,
  //             }
  //           : item
  //       );

  //       // Sort updatedQueue by votes in descending order
  //       return updatedQueue.sort((a, b) => b.votes - a.votes);
  //     });
  //   } catch (error) {
  //     console.error('Error toggling vote:', error);
  //   }
  // };
    

  //   const handleUrlSubmit = async () => {
      
      
  //     if (!videoUrl.trim()) return;
  //     try {
  //       const res = await axios.post('/api/streams', {
  //         creatorId: creatorId,
  //         url: videoUrl,
  //       });

  //       const newVideoItem = {
  //         id: res.data.id || 'new_id',
  //         title: res.data.title || 'New Video',
  //         thumbnail: res.data.smallImg || '/api/placeholder/120/68',
  //         votes: 0,
  //         haveUpvoted: false,
  //       };

  //       await new Promise((resolve, reject) => {
  //         const img = new Image();
  //         img.src = newVideoItem.thumbnail;
  //         img.onload = resolve;
  //         img.onerror = reject;
  //       });

  //       setQueue((prevQueue) => [...prevQueue, newVideoItem]);
  //       setVideoUrl('');
  //     } catch (error) {
  //       console.error('Error adding video to queue:', error);
  //     }
  //   };

  //   const handleShare = () => {
  //     if (navigator.share) {
  //       navigator.share({
  //         title: 'Check out this cool music stream!',
  //         url: `${window.location.origin}/creator/${creatorId}`,
  //       }).catch((error) => {
  //         console.error('Error sharing:', error);
  //       });
  //     } else {
  //       alert('Web Share API is not supported in your browser.');
  //     }
  //   };

  //   const getVideoId = (url: string) => {
  //     const match = url.match(YT_REGEX);
  //     return match ? match[5] : null;
  //   };

  //   const videoId = getVideoId(videoUrl);

  //   return (
  //     <>
  //       <Header />
  //       <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
  //         <div className="container mx-auto p-4 max-w-6xl flex-1">
  //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //             <div className="lg:col-span-2 space-y-4">
  //               <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
  //                 {videoId && (
  //                   <div className="relative w-full h-0 pb-[56.25%] bg-gray-800 rounded-lg overflow-hidden">
  //                     <LiteYouTubeEmbed id={videoId} title="Video Preview" poster="hqdefault" />
  //                   </div>
  //                 )}
  //               </div>
  //               <div className="bg-gray-800 rounded-lg p-4 shadow">
  //                 <h2 className="text-lg font-semibold mb-2">Submit a Song</h2>
  //                 <div className="flex gap-2">
  //                   <input
  //                     type="text"
  //                     placeholder="Paste YouTube URL here"
  //                     value={videoUrl}
  //                     onChange={(e) => setVideoUrl(e.target.value)}
  //                     className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
  //                   />
  //                   <button
  //                     onClick={handleUrlSubmit}
  //                     className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
  //                   >
  //                     <LinkIcon className="h-4 w-4 mr-2" />
  //                     Add to Queue
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="lg:col-span-1 space-y-4">
  //               <div className="bg-gray-800 rounded-lg p-4 shadow">
  //                 <h2 className="text-lg font-semibold mb-4">Up Next</h2>
  //                 <div className="space-y-4">
  //                 {queue.map((video) => (
  //   <div key={video.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50">
  //     <img src={video.thumbnail} alt="" className="w-20 h-12 rounded" />
  //     <div className="flex-1 min-w-0">
  //       <p className="truncate">{video.title}</p>
  //       <p className="text-sm text-gray-400">{video.votes} votes</p>
  //     </div>
  //     <button
  //       onClick={() => toggleVote(video.id, video.haveUpvoted)}
  //       className="p-2 rounded text-gray-400 hover:text-white"
  //     >
  //       {video.haveUpvoted ? <ThumbsDown className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
  //     </button>
  //   </div>
  // ))}

  //                 </div>
  //               </div>
  //               <div className="bg-gray-800 rounded-lg p-4 shadow">
  //                 <h2 className="text-lg font-semibold mb-4">Share this Stream</h2>
  //                 <button
  //                   onClick={handleShare}
  //                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
  //                 >
  //                   <Share2 className="h-4 w-4 mr-2" />
  //                   Share Stream
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // };

  // export default StreamPlayer;




























































"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StreamView from '../components/StreamView';

const StreamPlayer = () => {
  const [creatorId, setCreatorId] = useState('');

  const getCreatorId = async () => {
    try {
      const userres = await axios.get('/api/user'); // Ensure this endpoint is correct
      setCreatorId(userres.data.userId.id);
    } catch (error) {
      console.error("Error fetching creator ID:", error);
    }
  };

  useEffect(() => {
    getCreatorId();
  }, []);

  return (
    <>
      <StreamView creatorId={creatorId} playVideo={true} /> {/* Pass creatorId as a prop */}
    </>
  );
};

export default StreamPlayer;

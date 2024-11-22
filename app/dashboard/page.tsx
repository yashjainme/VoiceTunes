


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

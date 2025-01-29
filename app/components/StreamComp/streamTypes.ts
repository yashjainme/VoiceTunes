export interface VideoItem {
    id: string;
    extractId?: string;
    title: string;
    thumbnail: string;
    votes: number;
    haveUpvoted: boolean;
    url?: string;
    

  
    
  }
  
  export interface Stream {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
    votes?: number;
    upvotes?: number;
    haveUpvoted?: boolean;
    smallImg?: string;
  }
  
  export interface CurrentVidInterface {
    id: string;
    type: "Youtube";
    url: string;
    extractedId: string;
    title: string;
    smallImg: string;
    bigImg: string;
    active: boolean;
    played: boolean;
    playedTs: null;
    createdAt: string;
    userId: string;
    addedBy: string;
    spaceId: null;
  }
  
  export interface StreamViewProps {
    creatorId: string;
    playVideo?: boolean;
  }
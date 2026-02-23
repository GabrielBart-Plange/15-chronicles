import { Timestamp } from "firebase/firestore";

// Authentication
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Reader Profile
export interface ReaderProfile {
  email: string;
  username: string;
  createdAt: Timestamp;
}

// Reading Progress
export interface ReadingProgress {
  novelId: string;
  novelTitle?: string;
  coverImage?: string;
  authorName?: string;
  currentChapterId: string;
  currentChapterTitle?: string;
  progressPercentage: number;
  lastReadAt: Timestamp;
}

// Social Interactions
export interface Like {
  userId: string;
  likedAt: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Timestamp;
}

// Library
export interface LibraryData {
  likedStories: StoryReference[];
  savedNovels: NovelReference[];
  novelsInProgress: NovelProgressReference[];
}

export interface StoryReference {
  id: string;
  title: string;
  coverImage: string;
  authorName: string;
  likedAt: Timestamp;
}

export interface NovelProgressReference {
  id: string;
  title: string;
  coverImage: string;
  authorName: string;
  currentChapterId: string;
  currentChapterTitle: string;
  progressPercentage: number;
  lastReadAt: Timestamp;
}

export interface NovelReference {
  id: string;
  title: string;
  coverImage: string;
  authorName: string;
  savedAt: Timestamp;
}

export interface ArtPiece {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  authorId?: string;
  createdAt: Timestamp;
}

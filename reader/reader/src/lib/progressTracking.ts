import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { ReadingProgress, LibraryData, StoryReference, NovelProgressReference, NovelReference } from "@/types";

interface ProgressTrackingService {
  saveProgress: (
    userId: string,
    novelId: string,
    novelTitle: string,
    coverImage: string,
    authorName: string,
    chapterId: string,
    chapterTitle: string,
    currentChapterOrder: number,
    totalChapters: number
  ) => Promise<void>;

  getProgress: (
    userId: string,
    novelId: string
  ) => Promise<ReadingProgress | null>;

  getUserLibrary: (
    userId: string
  ) => Promise<LibraryData>;
}

export const progressTracking: ProgressTrackingService = {
  saveProgress: async (
    userId: string,
    novelId: string,
    novelTitle: string,
    coverImage: string,
    authorName: string,
    chapterId: string,
    chapterTitle: string,
    currentChapterOrder: number,
    totalChapters: number
  ): Promise<void> => {
    try {
      const progressRef = doc(db, "users", userId, "progress", novelId);

      // Calculate progress percentage
      const progressPercentage = totalChapters > 0
        ? Math.min(Math.round(((currentChapterOrder + 1) / totalChapters) * 100), 100)
        : 0;

      const progressData: ReadingProgress = {
        novelId,
        novelTitle,
        coverImage,
        authorName,
        currentChapterId: chapterId,
        currentChapterTitle: chapterTitle,
        progressPercentage,
        lastReadAt: Timestamp.now()
      };

      await setDoc(progressRef, progressData);
    } catch (error) {
      console.error("Error saving progress:", error);
      throw error;
    }
  },

  getProgress: async (
    userId: string,
    novelId: string
  ): Promise<ReadingProgress | null> => {
    try {
      const progressRef = doc(db, "users", userId, "progress", novelId);
      const snapshot = await getDoc(progressRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          novelId: data.novelId,
          novelTitle: data.novelTitle,
          coverImage: data.coverImage,
          authorName: data.authorName,
          currentChapterId: data.currentChapterId,
          currentChapterTitle: data.currentChapterTitle,
          progressPercentage: data.progressPercentage,
          lastReadAt: data.lastReadAt
        } as ReadingProgress;
      }

      return null;
    } catch (error) {
      console.error("Error getting progress:", error);
      return null;
    }
  },

  getUserLibrary: async (userId: string): Promise<LibraryData> => {
    try {
      // Get liked stories from user library
      const likedStoriesRef = collection(db, "users", userId, "likedStories");
      const likedStoriesQuery = query(likedStoriesRef, orderBy("likedAt", "desc"));
      const likedStoriesSnapshot = await getDocs(likedStoriesQuery);

      const likedStories: StoryReference[] = likedStoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        coverImage: doc.data().coverImage,
        authorName: doc.data().authorName,
        likedAt: doc.data().likedAt || Timestamp.now()
      }));

      // Get saved novels
      const savedNovelsRef = collection(db, "users", userId, "savedNovels");
      const savedNovelsQuery = query(savedNovelsRef, orderBy("savedAt", "desc"));
      const savedNovelsSnapshot = await getDocs(savedNovelsQuery);

      const savedNovels: NovelReference[] = savedNovelsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        coverImage: doc.data().coverImage,
        authorName: doc.data().authorName,
        savedAt: doc.data().savedAt || Timestamp.now()
      }));

      // Get novels in progress
      const progressRef = collection(db, "users", userId, "progress");
      const progressSnapshot = await getDocs(progressRef);

      const novelsInProgress: NovelProgressReference[] = progressSnapshot.docs.map(progressDoc => {
        const progressData = progressDoc.data() as ReadingProgress;
        return {
          id: progressDoc.id,
          title: progressData.novelTitle || "Unknown Novel",
          coverImage: progressData.coverImage || "",
          authorName: progressData.authorName || "Unknown Author",
          currentChapterId: progressData.currentChapterId,
          currentChapterTitle: progressData.currentChapterTitle || "Unknown Chapter",
          progressPercentage: progressData.progressPercentage,
          lastReadAt: progressData.lastReadAt
        };
      });
      return {
        likedStories,
        savedNovels,
        novelsInProgress
      };
      return {
        likedStories,
        savedNovels,
        novelsInProgress
      };
    } catch (error) {
      console.error("Error getting user library:", error);
      return {
        likedStories: [],
        savedNovels: [],
        novelsInProgress: []
      };
    }
  }
};

// Utility functions
export const calculateProgressPercentage = (
  currentChapterOrder: number,
  totalChapters: number
): number => {
  return Math.min(Math.round((currentChapterOrder / totalChapters) * 100), 100);
};

export const isNovelCompleted = (progressPercentage: number): boolean => {
  return progressPercentage >= 100;
};

# Implementation Plan: Reader Engagement Enhancements

## Overview

This implementation plan breaks down the reader engagement enhancements into discrete, incremental coding tasks. The approach follows a layered implementation strategy: first establishing the authentication foundation, then building social interactions on top of it, and finally connecting the cross-app integration. Each task builds on previous work and includes validation through tests.

## Tasks

- [x] 1. Set up Firebase Authentication in Reader App
  - Add Firebase Auth import to reader/reader/src/lib/firebase.ts
  - Add missing Firebase config properties (storageBucket, messagingSenderId, appId) from creator app
  - Export auth instance for use throughout the app
  - _Requirements: 1.1, 1.2, 6.1_

- [x] 2. Create Authentication Context
  - [x] 2.1 Implement AuthContext with provider and hook
    - Create reader/reader/src/contexts/AuthContext.tsx
    - Implement useAuth hook with user state, loading state, signIn, signOut, and error handling
    - Use onAuthStateChanged to track auth state
    - _Requirements: 1.4, 1.7, 1.8_
  
  - [x] 2.2 Write property test for auth state persistence
    - **Property 3: Authentication state persists across sessions**
    - **Validates: Requirements 1.7**
  
  - [x] 2.3 Write unit tests for AuthContext
    - Test sign-in success and failure scenarios
    - Test sign-out behavior
    - Test loading states
    - _Requirements: 1.4, 1.6, 1.8_

- [x] 3. Implement Login Page
  - [x] 3.1 Create login page component
    - Create reader/reader/src/app/login/page.tsx
    - Implement email and password form with validation
    - Use existing glass-panel styling for consistency
    - Handle authentication errors with user-friendly messages
    - Redirect to /library on success or returnUrl if provided
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 9.1, 9.3_
  
  - [x] 3.2 Write property test for successful auth redirect
    - **Property 1: Successful authentication redirects to library**
    - **Validates: Requirements 1.5**
  
  - [x] 3.3 Write property test for failed auth error display
    - **Property 2: Failed authentication displays error**
    - **Validates: Requirements 1.6**
  
  - [x] 3.4 Write unit tests for login page
    - Test form validation
    - Test error message display for specific error codes
    - Test return URL handling
    - _Requirements: 1.3, 1.6, 9.3_

- [x] 4. Update Navbar with Authentication
  - [x] 4.1 Add auth state to Navbar component
    - Update reader/reader/src/components/layout/Navbar.tsx
    - Show sign-out button for authenticated users
    - Update "Join the Archives" links to point to creator app signup
    - Implement sign-out functionality with redirect to home
    - _Requirements: 1.8, 7.1, 7.2, 7.3_
  
  - [x] 4.2 Write property test for sign-out behavior
    - **Property 4: Sign-out clears authentication and redirects**
    - **Validates: Requirements 1.8**
  
  - [x] 4.3 Write unit tests for navbar auth integration
    - Test sign-out button visibility for authenticated users
    - Test signup link URL construction
    - _Requirements: 1.8, 7.1, 7.2_

- [x] 5. Checkpoint - Ensure authentication works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [~] 6. Create TypeScript Type Definitions
  - Create or update reader/reader/src/types/index.ts
  - Define interfaces for User, ReaderProfile, ReadingProgress, Like, Comment, LibraryData
  - Export all types for use throughout the app
  - _Requirements: 2.3, 3.1, 4.3, 5.2_

- [ ] 7. Implement Like Button Component
  - [~] 7.1 Create reusable LikeButton component
    - Create reader/reader/src/components/interactions/LikeButton.tsx
    - Accept contentType, contentId, novelId (optional), initialLikeCount as props
    - Check if user has liked content on mount
    - Implement like/unlike with Firestore transactions
    - Update like count optimistically with rollback on error
    - Redirect to login if unauthenticated
    - Use existing button styling from story/chapter pages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9_
  
  - [~] 7.2 Write property test for like storage path correctness
    - **Property 8: Like storage path correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [~] 7.3 Write property test for like count updates
    - **Property 9: Like operations update aggregate counts**
    - **Validates: Requirements 3.4, 3.5**
  
  - [~] 7.4 Write property test for like/unlike round trip
    - **Property 10: Like/unlike round trip restores state**
    - **Validates: Requirements 3.5**
  
  - [~] 7.5 Write property test for like state persistence
    - **Property 11: Like state reflects persistence**
    - **Validates: Requirements 3.6**
  
  - [~] 7.6 Write property test for unauthenticated like redirect
    - **Property 12: Unauthenticated like attempts redirect to login**
    - **Validates: Requirements 3.7**
  
  - [~] 7.7 Write unit tests for LikeButton
    - Test optimistic updates
    - Test error handling and rollback
    - Test loading states
    - _Requirements: 3.4, 3.5, 9.2_

- [ ] 8. Implement Comment Section Component
  - [~] 8.1 Create CommentSection component
    - Create reader/reader/src/components/interactions/CommentSection.tsx
    - Accept contentType, contentId, novelId (optional), initialCommentCount as props
    - Fetch and display comments from Firestore on mount
    - Display comments in reverse chronological order
    - Show comment form for authenticated users
    - Show sign-in prompt for anonymous users
    - Implement comment submission with validation
    - Show delete button on user's own comments
    - Implement comment deletion with count decrement
    - Use existing glass-panel styling
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [~] 8.2 Write property test for comment storage path correctness
    - **Property 14: Comment storage path correctness**
    - **Validates: Requirements 4.3**
  
  - [~] 8.3 Write property test for comment required fields
    - **Property 15: Comment documents contain required fields**
    - **Validates: Requirements 4.4**
  
  - [~] 8.4 Write property test for comment count updates
    - **Property 16: Comment operations update aggregate counts**
    - **Validates: Requirements 4.5, 4.10**
  
  - [~] 8.5 Write property test for comment sort order
    - **Property 17: Comments display in reverse chronological order**
    - **Validates: Requirements 4.6**
  
  - [~] 8.6 Write property test for comment display fields
    - **Property 18: Comment display includes required information**
    - **Validates: Requirements 4.7**
  
  - [~] 8.7 Write property test for delete button visibility
    - **Property 19: Delete button visibility matches ownership**
    - **Validates: Requirements 4.9**
  
  - [~] 8.8 Write property test for add/delete comment round trip
    - **Property 20: Add/delete comment round trip restores state**
    - **Validates: Requirements 4.10**
  
  - [~] 8.9 Write unit tests for CommentSection
    - Test comment form validation
    - Test error handling for submission failures
    - Test anonymous user view
    - _Requirements: 4.8, 9.2, 9.6_

- [ ] 9. Integrate Like and Comment Components into Story Page
  - [~] 9.1 Replace client-side like logic with LikeButton component
    - Update reader/reader/src/app/stories/[id]/page.tsx
    - Replace existing like button with LikeButton component
    - Pass story ID and initial like count
    - Remove local like state management
    - _Requirements: 3.1, 3.4, 3.6, 3.8_
  
  - [~] 9.2 Add CommentSection component to story page
    - Add CommentSection below story content
    - Pass story ID and initial comment count
    - _Requirements: 4.1, 4.11_
  
  - [~] 9.3 Write property test for aggregate count visibility
    - **Property 21: Aggregate counts visible regardless of auth state**
    - **Validates: Requirements 3.8, 4.11**

- [ ] 10. Integrate Like and Comment Components into Chapter Page
  - [~] 10.1 Replace client-side like logic with LikeButton component
    - Update reader/reader/src/app/novels/[id]/chapter/[chapterId]/page.tsx
    - Replace existing like button with LikeButton component
    - Pass chapter ID, novel ID, and initial like count
    - Remove local like state management
    - _Requirements: 3.3, 3.4, 3.6, 3.8_
  
  - [~] 10.2 Add CommentSection component to chapter page
    - Add CommentSection below chapter content
    - Pass chapter ID, novel ID, and initial comment count
    - _Requirements: 4.2, 4.11_

- [ ] 11. Checkpoint - Ensure social interactions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement Progress Tracking Service
  - [~] 12.1 Create progress tracking utility functions
    - Create reader/reader/src/lib/progressTracking.ts
    - Implement saveProgress function to record chapter views
    - Implement getProgress function to retrieve user's progress
    - Implement getUserLibrary function to fetch liked content and progress
    - Calculate progress percentage based on chapter order
    - Mark novels as completed when final chapter is viewed
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [~] 12.2 Write property test for progress storage path
    - **Property 23: Progress storage path correctness**
    - **Validates: Requirements 5.2**
  
  - [~] 12.3 Write property test for progress required fields
    - **Property 24: Progress documents contain required fields**
    - **Validates: Requirements 5.3**
  
  - [~] 12.4 Write property test for progress percentage calculation
    - **Property 26: Progress percentage calculation correctness**
    - **Validates: Requirements 5.5**
  
  - [~] 12.5 Write property test for completion marking
    - **Property 27: Final chapter marks completion**
    - **Validates: Requirements 5.6**
  
  - [~] 12.6 Write unit tests for progress tracking
    - Test edge cases (first chapter, last chapter, single chapter novel)
    - Test error handling
    - _Requirements: 5.1, 5.6, 9.2_

- [~] 13. Integrate Progress Tracking into Chapter Page
  - Update reader/reader/src/app/novels/[id]/chapter/[chapterId]/page.tsx
  - Call saveProgress when authenticated user views a chapter
  - Pass novel ID, chapter ID, and total chapter count
  - Handle errors gracefully
  - _Requirements: 5.1, 5.2_

- [ ] 14. Implement Enhanced Library Page
  - [~] 14.1 Update library page with authentication gate
    - Update reader/reader/src/app/library/page.tsx
    - Check auth state using useAuth hook
    - Keep existing sign-in prompt for anonymous users
    - Fetch user's library data for authenticated users
    - Display liked stories section with cards
    - Display novels in progress section with progress bars
    - Handle empty states with encouraging messages
    - Use existing glass-panel and card styling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_
  
  - [~] 14.2 Write property test for library data storage path
    - **Property 5: Library data storage path correctness**
    - **Validates: Requirements 2.3, 6.4**
  
  - [~] 14.3 Write property test for library content fields
    - **Property 6: Library content displays required fields**
    - **Validates: Requirements 2.4, 2.5**
  
  - [~] 14.4 Write property test for library navigation
    - **Property 7: Library navigation restores context**
    - **Validates: Requirements 2.6, 2.7**
  
  - [~] 14.5 Write property test for progress restoration
    - **Property 25: Library navigation restores reading position**
    - **Validates: Requirements 5.4**
  
  - [~] 14.6 Write unit tests for library page
    - Test anonymous user view
    - Test empty library state
    - Test navigation behavior
    - _Requirements: 2.1, 2.8_

- [~] 15. Update LikeButton to Add Content to Library
  - Update reader/reader/src/components/interactions/LikeButton.tsx
  - When a story or novel is liked, add reference to user's library
  - Store story/novel metadata for library display
  - Handle errors gracefully
  - _Requirements: 3.9_
  
  - [~] 15.1 Write property test for like adds to library
    - **Property 13: Like adds content to library**
    - **Validates: Requirements 3.9**

- [ ] 16. Checkpoint - Ensure library and progress tracking work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement Cross-App Authentication Testing
  - [~] 17.1 Write property test for cross-app credentials
    - **Property 28: Credentials work across both apps**
    - **Validates: Requirements 6.2, 6.3**
  
  - [~] 17.2 Write property test for dual profile independence
    - **Property 29: Dual profiles maintain independence**
    - **Validates: Requirements 6.5**
  
  - [~] 17.3 Write property test for signup link redirect
    - **Property 30: Signup links redirect to creator app**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [~] 17.4 Write property test for creator signup enables reader signin
    - **Property 31: Creator signup enables reader signin**
    - **Validates: Requirements 7.4**

- [ ] 18. Implement Error Handling Enhancements
  - [~] 18.1 Create error handling utilities
    - Create reader/reader/src/lib/errorHandling.ts
    - Implement getAuthErrorMessage function for Firebase Auth errors
    - Implement error logging and user-friendly message display
    - Add retry logic for network timeouts
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [~] 18.2 Write property test for auth error messages
    - **Property 32: Auth errors display user-friendly messages**
    - **Validates: Requirements 9.1**
  
  - [~] 18.3 Write property test for Firestore error handling
    - **Property 33: Firestore errors are handled gracefully**
    - **Validates: Requirements 9.2**
  
  - [~] 18.4 Write property test for protected content redirect
    - **Property 34: Protected content redirects with return URL**
    - **Validates: Requirements 9.3**
  
  - [~] 18.5 Write property test for network timeout retry
    - **Property 35: Network timeouts provide retry option**
    - **Validates: Requirements 9.4**
  
  - [~] 18.6 Write property test for comment submission failure recovery
    - **Property 36: Failed comment submission preserves text**
    - **Validates: Requirements 9.6**
  
  - [~] 18.7 Write unit tests for error handling
    - Test specific error code mappings
    - Test retry button functionality
    - Test error state recovery
    - _Requirements: 9.1, 9.2, 9.4, 9.6_

- [x] 19. Add AuthProvider to App Root
  - Update reader/reader/src/app/layout.tsx
  - Wrap application with AuthProvider
  - Ensure auth context is available throughout the app
  - _Requirements: 1.7_

- [~] 20. Clean Up Non-Functional Routes
  - Remove or redirect any non-functional /signup routes in reader app
  - Ensure all signup links point to creator app
  - _Requirements: 7.5_

- [ ] 21. Final Integration Testing
  - [~] 21.1 Write integration tests for complete user flows
    - Test: Sign in → View library → Click novel → Resume at last chapter
    - Test: View story → Like → Check library → Story appears
    - Test: View chapter → Post comment → Refresh → Comment persists
    - Test: Sign up in creator app → Sign in to reader app → Access library
    - _Requirements: 1.4, 1.5, 2.2, 2.6, 2.7, 3.9, 4.4, 5.4, 6.2, 7.4_

- [ ] 22. Final Checkpoint - Ensure all features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - Verify UI preservation (glass panels, gradients, typography, spacing)
  - Test responsive behavior on mobile and desktop
  - Verify cross-app authentication works correctly

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests verify complete user flows across components
- All new UI must match existing design system (glass panels, gradients, typography)
- Firebase Emulator Suite recommended for local testing

# Requirements Document

## Introduction

This document specifies requirements for enhancing reader engagement in the 15-Chronicles reader application. The system will implement authentication, persistent social interactions (likes and comments), and unified account management across the dual-platform ecosystem (reader and creator apps). These enhancements enable readers to build personal libraries, engage with content through persistent social features, and seamlessly transition to becoming creators using shared Firebase authentication.

## Glossary

- **Reader_App**: The Next.js application for consuming stories and novels, located at reader/reader/src/
- **Creator_App**: The Next.js application for authoring content, located at creator/creator/src/
- **Firebase_Auth**: Firebase Authentication service shared between both applications
- **Firestore**: Firebase Firestore database for storing user data, likes, and comments
- **Library**: A user's personal collection of liked stories, reading progress, and bookmarks
- **Story**: A standalone short-form narrative stored in the "stories" collection
- **Novel**: A multi-chapter long-form narrative stored in the "novels" collection
- **Chapter**: An individual unit of a novel stored as a subcollection under novels
- **Like**: A persistent user interaction indicating appreciation for content
- **Comment**: A persistent user-generated text response to content
- **User_Profile**: Firestore document containing user metadata and preferences
- **Reading_Progress**: Tracked position within a novel indicating how far a user has read
- **Authenticated_User**: A user who has successfully signed in via Firebase_Auth
- **Anonymous_User**: A user browsing without authentication

## Requirements

### Requirement 1: Firebase Authentication Integration

**User Story:** As a reader, I want to sign in to the reader app using my email and password, so that I can access personalized features and save my reading preferences.

#### Acceptance Criteria

1. THE Reader_App SHALL import Firebase_Auth from the firebase/auth package
2. THE Reader_App SHALL initialize Firebase_Auth using the shared Firebase project configuration
3. WHEN an Anonymous_User navigates to /login, THE Reader_App SHALL display a sign-in form with email and password fields
4. WHEN an Authenticated_User submits valid credentials on the login page, THE Reader_App SHALL authenticate the user via Firebase_Auth
5. WHEN authentication succeeds, THE Reader_App SHALL redirect the user to the /library page
6. WHEN authentication fails, THE Reader_App SHALL display an error message describing the failure reason
7. THE Reader_App SHALL persist authentication state across browser sessions using Firebase_Auth session management
8. WHEN an Authenticated_User clicks a sign-out button, THE Reader_App SHALL sign out the user via Firebase_Auth and redirect to the home page

### Requirement 2: Personal Library with Authentication Gate

**User Story:** As an authenticated reader, I want to view my personal library containing stories I've liked and novels I'm reading, so that I can easily return to content I care about.

#### Acceptance Criteria

1. WHEN an Anonymous_User navigates to /library, THE Reader_App SHALL display a sign-in prompt with a link to /login
2. WHEN an Authenticated_User navigates to /library, THE Reader_App SHALL fetch the user's library data from Firestore
3. THE Reader_App SHALL store user library data in a Firestore collection named "readers" with document ID matching the user's Firebase_Auth UID
4. THE Reader_App SHALL display liked stories in the library with title, cover image, and author information
5. THE Reader_App SHALL display novels in progress with title, cover image, current chapter, and reading progress percentage
6. WHEN an Authenticated_User clicks a story in their library, THE Reader_App SHALL navigate to that story's detail page
7. WHEN an Authenticated_User clicks a novel in their library, THE Reader_App SHALL navigate to the last chapter they were reading
8. WHEN the library is empty, THE Reader_App SHALL display a message encouraging the user to explore and like content

### Requirement 3: Persistent Likes System

**User Story:** As an authenticated reader, I want to like stories and novels so that I can show appreciation and save them to my library, with my likes persisting across sessions.

#### Acceptance Criteria

1. WHEN an Authenticated_User clicks the like button on a Story, THE Reader_App SHALL save the like to Firestore under stories/{storyId}/likes/{userId}
2. WHEN an Authenticated_User clicks the like button on a Novel, THE Reader_App SHALL save the like to Firestore under novels/{novelId}/likes/{userId}
3. WHEN an Authenticated_User clicks the like button on a Chapter, THE Reader_App SHALL save the like to Firestore under novels/{novelId}/chapters/{chapterId}/likes/{userId}
4. WHEN a like is saved, THE Reader_App SHALL increment the like count on the parent document
5. WHEN an Authenticated_User unlikes content, THE Reader_App SHALL remove the like document from Firestore and decrement the like count
6. WHEN an Authenticated_User views content they have previously liked, THE Reader_App SHALL display the like button in the active state
7. WHEN an Anonymous_User clicks the like button, THE Reader_App SHALL redirect to the login page
8. THE Reader_App SHALL display the total like count for all content regardless of authentication state
9. WHEN a like is added to a Story or Novel, THE Reader_App SHALL add the content reference to the user's library in Firestore

### Requirement 4: Functional Comments System

**User Story:** As an authenticated reader, I want to post comments on stories and chapters so that I can share my thoughts and engage with other readers.

#### Acceptance Criteria

1. WHEN an Authenticated_User views a Story, THE Reader_App SHALL display a comment section below the content
2. WHEN an Authenticated_User views a Chapter, THE Reader_App SHALL display a comment section below the content
3. THE Reader_App SHALL store comments in Firestore subcollections: stories/{storyId}/comments and novels/{novelId}/chapters/{chapterId}/comments
4. WHEN an Authenticated_User submits a comment, THE Reader_App SHALL save the comment with userId, username, text, and timestamp to Firestore
5. WHEN a comment is saved, THE Reader_App SHALL increment the commentCount field on the parent document
6. THE Reader_App SHALL display comments in chronological order with newest comments first
7. THE Reader_App SHALL display each comment with the author's username, comment text, and relative timestamp
8. WHEN an Anonymous_User views the comment section, THE Reader_App SHALL display existing comments but show a prompt to sign in to post
9. WHEN an Authenticated_User views their own comment, THE Reader_App SHALL display a delete button
10. WHEN an Authenticated_User deletes their comment, THE Reader_App SHALL remove the comment from Firestore and decrement the commentCount
11. THE Reader_App SHALL display the total comment count for all content regardless of authentication state

### Requirement 5: Reading Progress Tracking

**User Story:** As an authenticated reader, I want my reading progress in novels to be automatically saved, so that I can resume reading from where I left off.

#### Acceptance Criteria

1. WHEN an Authenticated_User views a Chapter, THE Reader_App SHALL record the chapter ID and novel ID in the user's reading progress
2. THE Reader_App SHALL store reading progress in Firestore at readers/{userId}/progress/{novelId}
3. THE reading progress document SHALL contain novelId, currentChapterId, lastReadAt timestamp, and progress percentage
4. WHEN an Authenticated_User navigates to a novel from their library, THE Reader_App SHALL open the last chapter they were reading
5. THE Reader_App SHALL calculate progress percentage as (current chapter number / total published chapters) * 100
6. WHEN an Authenticated_User completes the final chapter, THE Reader_App SHALL mark the novel as completed in their progress document

### Requirement 6: Unified Account System

**User Story:** As a user, I want to use the same account credentials for both the reader and creator apps, so that I can seamlessly transition between reading and creating content.

#### Acceptance Criteria

1. THE Reader_App SHALL use the same Firebase project configuration as the Creator_App
2. WHEN a user creates an account in the Creator_App, THE Reader_App SHALL recognize those credentials for authentication
3. WHEN a user creates an account in the Reader_App, THE Creator_App SHALL recognize those credentials for authentication
4. THE Reader_App SHALL store reader-specific data in a "readers" collection separate from the "users" collection used by creators
5. WHEN an Authenticated_User has both reader and creator data, THE system SHALL maintain both profiles independently

### Requirement 7: Creator App Signup Integration

**User Story:** As a reader who wants to become a creator, I want "Join the Archives" links to direct me to the creator signup page, so that I can easily create an account and start writing.

#### Acceptance Criteria

1. WHEN an Anonymous_User clicks "Join the Archives" in the Reader_App navbar, THE Reader_App SHALL redirect to the Creator_App signup page
2. WHEN an Anonymous_User clicks "Join the Archives" in the Reader_App mobile menu, THE Reader_App SHALL redirect to the Creator_App signup page
3. THE Reader_App SHALL construct the Creator_App signup URL using the creator app's domain or relative path
4. WHEN a user completes signup in the Creator_App, THE user SHALL be able to immediately sign in to the Reader_App using the same credentials
5. THE Reader_App SHALL remove any non-functional /signup routes that do not exist

### Requirement 8: UI Preservation

**User Story:** As a product owner, I want all new features to preserve existing UI styling and layout, so that the user experience remains consistent and polished.

#### Acceptance Criteria

1. WHEN new authentication UI is added, THE Reader_App SHALL use existing glass-panel, border, and gradient styles
2. WHEN the library page displays user content, THE Reader_App SHALL maintain the existing typography, spacing, and layout patterns
3. WHEN comment sections are added, THE Reader_App SHALL use existing component styling for consistency
4. THE Reader_App SHALL preserve all existing design elements including glass panels, gradients, typography, and spacing
5. THE Reader_App SHALL NOT modify core functionality that is already working correctly

### Requirement 9: Error Handling and Edge Cases

**User Story:** As a developer, I want the system to handle errors gracefully, so that users have a smooth experience even when things go wrong.

#### Acceptance Criteria

1. WHEN Firebase_Auth returns an error, THE Reader_App SHALL display a user-friendly error message
2. WHEN Firestore operations fail, THE Reader_App SHALL log the error and display a generic error message to the user
3. WHEN a user attempts to access protected content while unauthenticated, THE Reader_App SHALL redirect to the login page with a return URL
4. WHEN network requests timeout, THE Reader_App SHALL display a retry option
5. WHEN a user's library is empty, THE Reader_App SHALL display helpful guidance rather than an empty state
6. WHEN comment submission fails, THE Reader_App SHALL preserve the user's comment text and allow retry

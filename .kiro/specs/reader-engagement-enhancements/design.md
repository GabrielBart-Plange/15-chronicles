# Design Document: Reader Engagement Enhancements

## Overview

This design implements three interconnected features for the 15-Chronicles reader application: Firebase authentication integration, persistent social interactions (likes and comments), and unified account management with the creator app. The implementation leverages the existing Firebase project (chronicles-11261) shared between both applications and follows the established UI patterns using glass panels, gradients, and the existing design system.

The architecture maintains separation of concerns by keeping reader-specific data in a dedicated "readers" collection while sharing authentication state through Firebase Auth. Social interactions (likes and comments) are stored as Firestore subcollections under their parent content documents, enabling efficient queries and real-time updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Project                         │
│                   (chronicles-11261)                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication (Shared)  │  Firestore Database             │
│  - Email/Password         │  - users/ (creators)            │
│  - Session Management     │  - readers/ (reader profiles)   │
│                           │  - stories/ (with subcollections)│
│                           │  - novels/ (with subcollections) │
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
    ┌────┴────┐                    ┌────┴────┐
    │ Reader  │                    │ Creator │
    │  App    │◄──signup link──────│  App    │
    └─────────┘                    └─────────┘
```

### Component Architecture

**Reader App Components:**
- **Authentication Module**: Handles sign-in, sign-out, and auth state management
- **Library Module**: Displays user's liked content and reading progress
- **Social Interactions Module**: Manages likes and comments on stories/chapters
- **Progress Tracking Module**: Records and retrieves reading progress
- **Navigation Module**: Updated to link to creator app signup

### Data Flow

1. **Authentication Flow:**
   - User enters credentials → Firebase Auth validates → Auth state persists → UI updates
   - Shared auth state enables cross-app authentication

2. **Like Flow:**
   - User clicks like → Check auth → Save to Firestore subcollection → Increment count → Update UI → Add to library

3. **Comment Flow:**
   - User submits comment → Check auth → Save to Firestore subcollection → Increment count → Display in list

4. **Library Flow:**
   - User navigates to library → Check auth → Query Firestore for user's likes and progress → Display content

5. **Progress Tracking Flow:**
   - User views chapter → Save progress to Firestore → Calculate percentage → Update library

## Components and Interfaces

### 1. Firebase Configuration Module

**Location:** `reader/reader/src/lib/firebase.ts`

**Purpose:** Initialize Firebase services with authentication support

**Interface:**
```typescript
// Exports
export const auth: Auth;
export const db: Firestore;

// Configuration
const firebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};
```

**Implementation Notes:**
- Import `getAuth` from `firebase/auth`
- Add missing config properties (storageBucket, messagingSenderId, appId) from creator app
- Export `auth` instance for use throughout the app

### 2. Authentication Context

**Location:** `reader/reader/src/contexts/AuthContext.tsx` (new file)

**Purpose:** Provide authentication state and methods throughout the app

**Interface:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element;
export function useAuth(): AuthContextType;
```

**Implementation Notes:**
- Use `onAuthStateChanged` to track auth state
- Persist user object in context
- Handle loading states during auth operations
- Provide error handling for auth failures

### 3. Login Page

**Location:** `reader/reader/src/app/login/page.tsx` (new file)

**Purpose:** Allow users to sign in with email and password

**Interface:**
```typescript
export default function LoginPage(): JSX.Element;
```

**UI Requirements:**
- Match existing design system (glass panels, gradients)
- Email and password input fields
- Submit button with loading state
- Error message display
- Link to creator app signup
- Redirect to /library on success

### 4. Library Page (Enhanced)

**Location:** `reader/reader/src/app/library/page.tsx` (existing, to be modified)

**Purpose:** Display authenticated user's personal library

**Interface:**
```typescript
interface LibraryData {
  likedStories: Story[];
  novelsInProgress: NovelProgress[];
}

interface NovelProgress {
  novelId: string;
  novelTitle: string;
  coverImage: string;
  currentChapterId: string;
  currentChapterTitle: string;
  progressPercentage: number;
  lastReadAt: Timestamp;
}

export default function LibraryPage(): JSX.Element;
```

**Implementation Notes:**
- Check auth state using `useAuth()`
- If unauthenticated, show existing sign-in prompt
- If authenticated, query Firestore for user's library data
- Display liked stories and novels in progress in separate sections
- Use existing card/panel styling

### 5. Like Button Component

**Location:** `reader/reader/src/components/interactions/LikeButton.tsx` (new file)

**Purpose:** Reusable like button with persistent state

**Interface:**
```typescript
interface LikeButtonProps {
  contentType: 'story' | 'novel' | 'chapter';
  contentId: string;
  novelId?: string; // Required for chapters
  initialLikeCount: number;
}

export default function LikeButton(props: LikeButtonProps): JSX.Element;
```

**Implementation Notes:**
- Check if user has liked content on mount
- Handle like/unlike with Firestore transactions
- Update local state optimistically
- Redirect to login if unauthenticated
- Use existing button styling from story/chapter pages

### 6. Comment Section Component

**Location:** `reader/reader/src/components/interactions/CommentSection.tsx` (new file)

**Purpose:** Display and submit comments on content

**Interface:**
```typescript
interface CommentSectionProps {
  contentType: 'story' | 'chapter';
  contentId: string;
  novelId?: string; // Required for chapters
  initialCommentCount: number;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Timestamp;
}

export default function CommentSection(props: CommentSectionProps): JSX.Element;
```

**Implementation Notes:**
- Fetch comments from Firestore on mount
- Display comments in reverse chronological order
- Show comment form only to authenticated users
- Handle comment submission with validation
- Allow users to delete their own comments
- Use existing glass panel styling

### 7. Progress Tracking Service

**Location:** `reader/reader/src/lib/progressTracking.ts` (new file)

**Purpose:** Manage reading progress for novels

**Interface:**
```typescript
interface ReadingProgress {
  novelId: string;
  currentChapterId: string;
  progressPercentage: number;
  lastReadAt: Timestamp;
}

export async function saveProgress(
  userId: string,
  novelId: string,
  chapterId: string,
  totalChapters: number
): Promise<void>;

export async function getProgress(
  userId: string,
  novelId: string
): Promise<ReadingProgress | null>;

export async function getUserLibrary(
  userId: string
): Promise<LibraryData>;
```

**Implementation Notes:**
- Calculate progress percentage based on chapter order
- Update progress on chapter view
- Query progress for library display
- Handle edge cases (completed novels, first chapter)

### 8. Navigation Updates

**Location:** `reader/reader/src/components/layout/Navbar.tsx` (existing, to be modified)

**Purpose:** Update signup links to point to creator app

**Changes:**
- Replace `/signup` links with creator app URL
- Determine creator app URL (could be relative path or full URL)
- Update both desktop "Sign In" button and mobile menu "Join the Archives" link
- Add sign-out button for authenticated users

## Data Models

### Firestore Collections Structure

```
firestore/
├── users/                          # Creator profiles (existing)
│   └── {userId}/
│       ├── username: string
│       ├── email: string
│       ├── role: "creator"
│       └── createdAt: Timestamp
│
├── readers/                        # Reader profiles (new)
│   └── {userId}/
│       ├── email: string
│       ├── username: string
│       ├── createdAt: Timestamp
│       └── progress/               # Subcollection
│           └── {novelId}/
│               ├── novelId: string
│               ├── currentChapterId: string
│               ├── progressPercentage: number
│               └── lastReadAt: Timestamp
│
├── stories/                        # Existing collection
│   └── {storyId}/
│       ├── title: string
│       ├── content: string
│       ├── likes: number           # Aggregate count
│       ├── commentCount: number    # Aggregate count
│       ├── likes/                  # Subcollection (new)
│       │   └── {userId}/
│       │       ├── userId: string
│       │       └── likedAt: Timestamp
│       └── comments/               # Subcollection (new)
│           └── {commentId}/
│               ├── userId: string
│               ├── username: string
│               ├── text: string
│               └── createdAt: Timestamp
│
└── novels/                         # Existing collection
    └── {novelId}/
        ├── title: string
        ├── likes: number           # Aggregate count
        ├── commentCount: number    # Aggregate count
        ├── likes/                  # Subcollection (new)
        │   └── {userId}/
        │       ├── userId: string
        │       └── likedAt: Timestamp
        └── chapters/               # Existing subcollection
            └── {chapterId}/
                ├── title: string
                ├── content: string
                ├── order: number
                ├── likes: number   # Aggregate count
                ├── commentCount: number
                ├── likes/          # Subcollection (new)
                │   └── {userId}/
                │       ├── userId: string
                │       └── likedAt: Timestamp
                └── comments/       # Subcollection (new)
                    └── {commentId}/
                        ├── userId: string
                        ├── username: string
                        ├── text: string
                        └── createdAt: Timestamp
```

### TypeScript Type Definitions

**Location:** `reader/reader/src/types/index.ts` (new or existing)

```typescript
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
  currentChapterId: string;
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
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

**Property 1: Successful authentication redirects to library**
*For any* valid user credentials, when authentication succeeds, the user should be redirected to the /library page.
**Validates: Requirements 1.5**

**Property 2: Failed authentication displays error**
*For any* invalid credentials, when authentication fails, an error message describing the failure reason should be displayed to the user.
**Validates: Requirements 1.6**

**Property 3: Authentication state persists across sessions**
*For any* authenticated user, when the browser session is reloaded, the authentication state should persist and the user should remain authenticated.
**Validates: Requirements 1.7**

**Property 4: Sign-out clears authentication and redirects**
*For any* authenticated user, when they sign out, the authentication state should be cleared and they should be redirected to the home page.
**Validates: Requirements 1.8**

### Library Properties

**Property 5: Library data storage path correctness**
*For any* user library data, when saved to Firestore, it should be stored in the "readers" collection with document ID matching the user's Firebase Auth UID.
**Validates: Requirements 2.3, 6.4**

**Property 6: Library content displays required fields**
*For any* library item (story or novel), when rendered, it should contain all required fields: title, cover image, author information, and for novels, current chapter and progress percentage.
**Validates: Requirements 2.4, 2.5**

**Property 7: Library navigation restores context**
*For any* content item in the library, when clicked, the user should navigate to the appropriate page: story detail page for stories, or last-read chapter for novels.
**Validates: Requirements 2.6, 2.7**

### Social Interaction Properties

**Property 8: Like storage path correctness**
*For any* content type (story, novel, or chapter) and any authenticated user, when a like is saved, it should be stored at the correct Firestore path: stories/{storyId}/likes/{userId}, novels/{novelId}/likes/{userId}, or novels/{novelId}/chapters/{chapterId}/likes/{userId}.
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 9: Like operations update aggregate counts**
*For any* content, when a like is added, the like count should increment by 1, and when a like is removed, the like count should decrement by 1.
**Validates: Requirements 3.4, 3.5**

**Property 10: Like/unlike round trip restores state**
*For any* content, liking then immediately unliking should restore the original state (like count and user's like status).
**Validates: Requirements 3.5**

**Property 11: Like state reflects persistence**
*For any* content that a user has previously liked, when the user views that content, the like button should be displayed in the active state.
**Validates: Requirements 3.6**

**Property 12: Unauthenticated like attempts redirect to login**
*For any* content, when an unauthenticated user clicks the like button, they should be redirected to the login page.
**Validates: Requirements 3.7**

**Property 13: Like adds content to library**
*For any* story or novel, when an authenticated user likes it, a reference to that content should be added to the user's library in Firestore.
**Validates: Requirements 3.9**

**Property 14: Comment storage path correctness**
*For any* content type (story or chapter) and any comment, when saved, it should be stored at the correct Firestore path: stories/{storyId}/comments/{commentId} or novels/{novelId}/chapters/{chapterId}/comments/{commentId}.
**Validates: Requirements 4.3**

**Property 15: Comment documents contain required fields**
*For any* submitted comment, when saved to Firestore, it should contain userId, username, text, and timestamp fields.
**Validates: Requirements 4.4**

**Property 16: Comment operations update aggregate counts**
*For any* content, when a comment is added, the commentCount should increment by 1, and when a comment is deleted, the commentCount should decrement by 1.
**Validates: Requirements 4.5, 4.10**

**Property 17: Comments display in reverse chronological order**
*For any* set of comments, when displayed, they should be ordered with the newest comments first (descending by timestamp).
**Validates: Requirements 4.6**

**Property 18: Comment display includes required information**
*For any* displayed comment, it should show the author's username, comment text, and relative timestamp.
**Validates: Requirements 4.7**

**Property 19: Delete button visibility matches ownership**
*For any* comment, when viewed by an authenticated user, a delete button should be visible if and only if the viewing user is the comment author.
**Validates: Requirements 4.9**

**Property 20: Add/delete comment round trip restores state**
*For any* content, adding a comment then immediately deleting it should restore the original state (comment count and comment list).
**Validates: Requirements 4.10**

**Property 21: Aggregate counts visible regardless of auth state**
*For any* content, the like count and comment count should be visible to both authenticated and unauthenticated users.
**Validates: Requirements 3.8, 4.11**

### Reading Progress Properties

**Property 22: Chapter view records progress**
*For any* authenticated user viewing a chapter, the chapter ID and novel ID should be recorded in the user's reading progress in Firestore.
**Validates: Requirements 5.1**

**Property 23: Progress storage path correctness**
*For any* reading progress, when saved, it should be stored at readers/{userId}/progress/{novelId} in Firestore.
**Validates: Requirements 5.2**

**Property 24: Progress documents contain required fields**
*For any* saved reading progress, it should contain novelId, currentChapterId, lastReadAt timestamp, and progressPercentage fields.
**Validates: Requirements 5.3**

**Property 25: Library navigation restores reading position**
*For any* novel with saved progress, when navigated to from the library, the last chapter the user was reading should open.
**Validates: Requirements 5.4**

**Property 26: Progress percentage calculation correctness**
*For any* chapter in a novel, the progress percentage should equal (current chapter order / total published chapters) * 100.
**Validates: Requirements 5.5**

**Property 27: Final chapter marks completion**
*For any* novel, when an authenticated user views the final chapter, the novel should be marked as completed in their progress document.
**Validates: Requirements 5.6**

### Cross-App Authentication Properties

**Property 28: Credentials work across both apps**
*For any* user account created in either the Reader_App or Creator_App, those credentials should successfully authenticate in both applications.
**Validates: Requirements 6.2, 6.3**

**Property 29: Dual profiles maintain independence**
*For any* user with both reader and creator data, both profiles should exist independently without conflicts or data corruption.
**Validates: Requirements 6.5**

**Property 30: Signup links redirect to creator app**
*For any* "Join the Archives" link in the Reader_App (navbar or mobile menu), when clicked, it should redirect to the Creator_App signup page.
**Validates: Requirements 7.1, 7.2, 7.3**

**Property 31: Creator signup enables reader signin**
*For any* user who completes signup in the Creator_App, they should be able to immediately sign in to the Reader_App using the same credentials.
**Validates: Requirements 7.4**

### Error Handling Properties

**Property 32: Auth errors display user-friendly messages**
*For any* Firebase Auth error, a user-friendly error message should be displayed to the user.
**Validates: Requirements 9.1**

**Property 33: Firestore errors are handled gracefully**
*For any* Firestore operation failure, the error should be logged and a generic error message should be displayed to the user.
**Validates: Requirements 9.2**

**Property 34: Protected content redirects with return URL**
*For any* protected content, when accessed by an unauthenticated user, they should be redirected to the login page with a return URL parameter.
**Validates: Requirements 9.3**

**Property 35: Network timeouts provide retry option**
*For any* network request that times out, a retry option should be displayed to the user.
**Validates: Requirements 9.4**

**Property 36: Failed comment submission preserves text**
*For any* comment submission that fails, the comment text should be preserved in the input field and the user should be able to retry.
**Validates: Requirements 9.6**

## Error Handling

### Authentication Errors

**Firebase Auth Error Codes:**
- `auth/invalid-email`: Display "Please enter a valid email address"
- `auth/user-disabled`: Display "This account has been disabled"
- `auth/user-not-found`: Display "No account found with this email"
- `auth/wrong-password`: Display "Incorrect password"
- `auth/too-many-requests`: Display "Too many failed attempts. Please try again later"
- `auth/network-request-failed`: Display "Network error. Please check your connection"

**Implementation:**
```typescript
function getAuthErrorMessage(error: FirebaseError): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
  };
  return errorMessages[error.code] || 'An error occurred. Please try again';
}
```

### Firestore Errors

**Error Handling Strategy:**
- Catch all Firestore errors at the operation level
- Log detailed error information to console for debugging
- Display generic user-friendly message: "Something went wrong. Please try again"
- For critical operations (likes, comments), provide retry button
- For non-critical operations (view counts), fail silently

**Implementation Pattern:**
```typescript
try {
  await firestoreOperation();
} catch (error) {
  console.error('Firestore operation failed:', error);
  setError('Something went wrong. Please try again');
  // Optionally: setRetryAvailable(true);
}
```

### Network Timeouts

**Timeout Configuration:**
- Set reasonable timeout values for Firestore operations (10 seconds)
- Detect timeout errors specifically
- Provide retry button with exponential backoff
- Show loading states during retry attempts

### Protected Route Handling

**Authentication Gate Pattern:**
```typescript
// In protected pages/components
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) {
  router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
  return null;
}
```

**Return URL Handling:**
```typescript
// In login page after successful auth
const returnUrl = searchParams.get('returnUrl') || '/library';
router.push(returnUrl);
```

### Edge Cases

**Empty States:**
- Empty library: Show encouraging message with link to explore stories
- No comments: Show "Be the first to comment" message
- No reading progress: Show "Start reading to track your progress"

**Data Consistency:**
- If like count is negative, reset to 0
- If progress percentage > 100, cap at 100
- If chapter doesn't exist in progress, default to first chapter

**Concurrent Operations:**
- Use Firestore transactions for like/unlike to prevent race conditions
- Use increment() for atomic counter updates
- Handle optimistic UI updates with rollback on failure

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of authentication flows (valid login, invalid password)
- Edge cases (empty library, no comments, completed novels)
- Error conditions (network failures, invalid data)
- Integration points (Firebase Auth, Firestore queries)
- UI component rendering with specific props

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Data integrity across operations (like/unlike, add/delete comment)
- Path correctness for Firestore operations
- Calculation correctness (progress percentage)
- State consistency (auth persistence, like state)

### Property-Based Testing Configuration

**Library Selection:** Use `@fast-check/jest` for TypeScript/JavaScript property-based testing

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: reader-engagement-enhancements, Property N: [property text]`

**Example Property Test Structure:**
```typescript
// Feature: reader-engagement-enhancements, Property 9: Like operations update aggregate counts
test('liking content increments count, unliking decrements', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        contentType: fc.constantFrom('story', 'novel', 'chapter'),
        contentId: fc.uuid(),
        userId: fc.uuid(),
        initialCount: fc.nat(1000),
      }),
      async ({ contentType, contentId, userId, initialCount }) => {
        // Setup: Create content with initial like count
        // Action: Like content
        // Assert: Count increased by 1
        // Action: Unlike content
        // Assert: Count decreased by 1, back to initial
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Authentication Module:**
- Unit: Login form validation, error message display, redirect behavior
- Property: Auth state persistence, cross-app credential validation

**Library Module:**
- Unit: Empty state display, specific content rendering
- Property: Data fetch correctness, navigation behavior, field presence

**Social Interactions Module:**
- Unit: Comment form validation, delete button visibility
- Property: Path correctness, count updates, round-trip consistency, sort order

**Progress Tracking Module:**
- Unit: Completion detection, first chapter default
- Property: Progress calculation, storage path, field presence

**Error Handling:**
- Unit: Specific error code handling, retry button display
- Property: All errors display messages, failed operations preserve state

### Integration Testing

**Cross-Component Flows:**
1. Sign in → View library → Click novel → Resume at last chapter
2. View story → Like → Check library → Story appears
3. View chapter → Post comment → Refresh → Comment persists
4. Sign up in creator app → Sign in to reader app → Access library

**Firebase Integration:**
- Use Firebase Emulator Suite for local testing
- Test actual Firestore queries and auth operations
- Verify subcollection structure and document paths
- Test real-time updates and listeners

### Manual Testing Checklist

**UI Preservation:**
- [ ] New components match existing glass-panel styling
- [ ] Typography and spacing consistent with existing pages
- [ ] Gradients and borders match design system
- [ ] Responsive behavior works on mobile and desktop

**Cross-App Integration:**
- [ ] Signup in creator app, signin in reader app works
- [ ] Signup in reader app (if implemented), signin in creator app works
- [ ] "Join the Archives" links navigate to correct URL

**User Flows:**
- [ ] Complete authentication flow from anonymous to authenticated
- [ ] Like content and verify it appears in library
- [ ] Post comment and verify it displays correctly
- [ ] Read chapters and verify progress tracking
- [ ] Sign out and verify state clears properly

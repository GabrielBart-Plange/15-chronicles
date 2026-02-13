# Senior Software Quality Assurance Engineer Analysis
## Prompt:
*You are a Senior Software Quality Assurance Engineer with 15+ years of experience in edge case analysis, defensive programming, and code review. Your task is to analyze the provided code, automatically infer its purpose and expected behavior, then systematically identify all potential edge cases and failure scenarios.*

---

## Brief Summary
**Project:** Vellum (Unified Reader & Archivist App)  
**Purpose:** A full-stack creative writing and reading platform. It handles user authentication, multi-role profile management (Reader/Archivist), story/novel progress tracking, and draft management.  
**Inferred Behavior:** The system relies heavily on Firebase Firestore for real-time data persistence and Auth for security. It aims for a "unified" experience where a single login session manages both reading activities and archivist (creator) dashboards, with automatic profile provisioning for new roles.

---

## Comprehensive List of Edge Cases by Category

### 1. Authentication & Profile Synchronization
| Scenario Name | Example Test Input | Expected vs. Likely Behavior | Risk Level | Suggested Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Race Condition: Double Sync** | User signs in via Google. | **Expected:** `syncReaderProfile` runs once and terminates. <br>**Likely:** Both `signInWithGoogle` and a possible background observer trigger sync simultaneously, potentially lead to duplicate role entries or overwritten metadata if `merge: true` is omitted in any child call. | **Medium** | Ensure `syncReaderProfile` is idempotent and use Firestore transactions for role array updates. |
| **Tab Sync Logout Failure** | User logs out on Tab A; Tab B is on Creator Dashboard. | **Expected:** Both tabs redirect to login. <br>**Likely:** Tab B remains on a "ghost" session until a data fetch fails, as `BroadcastChannel` might be blocked by certain browser privacy settings or failed to register. | **Low** | Implement a `useEffect` listener on `AuthContext` specifically for cross-tab visibility changes. |
| **Role Conflict** | User with 'creator' role signs in as a guest/reader first. | **Expected:** Keep existing roles. <br>**Likely:** `syncReaderProfile` handles role merging, but does not verify if the user *should* have been downgraded if they lost creator status. | **Low** | Strictly additive role logic is correct, but add an audit log for role transitions. |

### 2. Performance & Resource management (Progress Tracking)
| Scenario Name | Example Test Input | Expected vs. Likely Behavior | Risk Level | Suggested Fix |
| :--- | :--- | :--- | :--- | :--- |
| **"Waterfall" Firestore Read Storm** | User with 50 novels "in progress" opens Library. | **Expected:** Fast loading profile. <br>**Likely:** `getUserLibrary` triggers **100+ separate getDoc calls** sequentially (2 per novel). Page takes 5-10s to load; Firestore quota is drained rapidly. | **High** | Denormalize novel details (Title/Cover) into the `progress` document or use `Promise.all` for parallel fetching. |
| **Chapter Reference Mismatch** | A novel's chapter is deleted, but the user's progress still points to it. | **Expected:** Graceful "Chapter not found" or skip. <br>**Likely:** `chapterSnapshot.exists()` returns false, and the library shows "Unknown Chapter", which is a poor UX. | **Medium** | Add a cleanup job or verify chapter existence during progress update; if missing, fall back to the novel's first chapter. |

### 3. Creator/Archivist Feature Logic
| Scenario Name | Example Test Input | Expected vs. Likely Behavior | Risk Level | Suggested Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Zero-Length Chapter Order** | Creating a novel draft with no defined chapters. | **Expected:** Progress 0%. <br>**Likely:** `totalChapters > 0` check handles the division by zero, but user's first "read" might fail if `chapterOrder` is missing. | **Low** | Default `totalChapters` to 1 in the schema to avoid empty divisions and ensure progress always calculates. |
| **File Import Buffer Overflow** | Importing a 5MB text file. | **Expected:** Error: "File too large". <br>**Likely:** Web browser hangs during `readAsText`, or Firestore `addDoc` fails with `InvalidArgument` because the 1MiB document limit is exceeded. | **High** | Hard-cap file uploads at 800KB at the input level (`file.size`). |

### 4. UI/UX & Routing
| Scenario Name | Example Test Input | Expected vs. Likely Behavior | Risk Level | Suggested Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Redirect Loop** | User visits `/creator/dashboard` but auth is disconnected. | **Expected:** Immediate redirect to `/login`. <br>**Likely:** `DashboardLayout` checks auth, redirects to `/login`. If `/login` redirects to home, but home redirects back to dashboard (unlikely but possible during state transitions), a loop occurs. | **Medium** | Use `router.replace` consistently and verify all login/logout redirect paths in a state machine. |

---

## Priority Ranking of Top 3 Critical Issues

1. **[PERFORMANCE] Firestore Read Cascades in Library**: The `getUserLibrary` logic (sequential fetches in a `for` loop) is the single biggest threat to performance and cost scalability. This will fail dramatically as the userbase grows.
2. **[RELIABILITY] Missing Try-Catch in Firestore Operation (NewDraftPage)**: Async writes in the creator tools lack proper error boundaries. Network failures during novel creation will leave the UI in a "pending" state forever with no feedback.
3. **[DATA VALIDATION] Missing Max Document Size Checks**: The File Import feature lacks size guards. Exceeding Firebase's 1 MiB limit will cause silent write failures, leading to data loss for authors importing long works.

---

## Actionable Mitigation Strategy:
*   **For Performance:** Upgrade `progressTracking.ts` to use denormalization (store novel metadata in progress records) to reduce library fetches from `O(N*2)` to `O(1)`.
*   **For Reliability:** Implement a global `ErrorBoundary` and ensure all Firestore service calls (`addDoc`, `setDoc`) are wrapped in `try/catch` with `toast` notifications.
*   **For Data Integrity:** Add client-side validation for all file imports and text inputs to enforce Firestore limits before initiating a write.

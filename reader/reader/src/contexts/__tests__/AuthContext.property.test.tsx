/**
 * Property-Based Tests for AuthContext
 * Feature: reader-engagement-enhancements
 */

import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import * as fc from 'fast-check';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

// Mock Firebase modules
jest.mock('@/lib/firebase', () => ({
    auth: {
        currentUser: null,
    },
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    User: jest.fn(),
}));

describe('AuthContext Property-Based Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Property 3: Authentication state persists across sessions
     * Validates: Requirements 1.7
     * 
     * This property verifies that when a user is authenticated and the component
     * is remounted (simulating a browser session reload), the authentication state
     * persists and the user remains authenticated.
     */
    test('Property 3: Authentication state persists across sessions', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    uid: fc.uuid(),
                    email: fc.emailAddress(),
                    displayName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
                }),
                async (userData) => {
                    // Create a mock user object
                    const mockUser: Partial<User> = {
                        uid: userData.uid,
                        email: userData.email,
                        displayName: userData.displayName,
                    };

                    // Mock onAuthStateChanged to simulate persisted auth state
                    let authCallback: ((user: User | null) => void) | null = null;
                    (onAuthStateChanged as jest.Mock).mockImplementation((authInstance, callback) => {
                        authCallback = callback;
                        // Immediately call with the persisted user (simulating Firebase restoring session)
                        callback(mockUser as User);
                        return jest.fn(); // Return unsubscribe function
                    });

                    // First render - simulates initial page load with persisted session
                    const wrapper1 = ({ children }: { children: ReactNode }) => (
                        <AuthProvider>{children}</AuthProvider>
                    );

                    const { result: result1, unmount: unmount1 } = renderHook(() => useAuth(), {
                        wrapper: wrapper1,
                    });

                    // Wait for auth state to be loaded
                    await waitFor(() => {
                        expect(result1.current.loading).toBe(false);
                    });

                    // Verify user is authenticated after initial load
                    expect(result1.current.user).not.toBeNull();
                    expect(result1.current.user?.uid).toBe(userData.uid);
                    expect(result1.current.user?.email).toBe(userData.email);
                    expect(result1.current.user?.displayName).toBe(userData.displayName);

                    // Unmount to simulate closing the browser/tab
                    unmount1();

                    // Reset the mock to simulate a fresh page load
                    jest.clearAllMocks();
                    (onAuthStateChanged as jest.Mock).mockImplementation((authInstance, callback) => {
                        authCallback = callback;
                        // Firebase should restore the same user on the new session
                        callback(mockUser as User);
                        return jest.fn();
                    });

                    // Second render - simulates reopening the browser/tab (new session)
                    const wrapper2 = ({ children }: { children: ReactNode }) => (
                        <AuthProvider>{children}</AuthProvider>
                    );

                    const { result: result2 } = renderHook(() => useAuth(), {
                        wrapper: wrapper2,
                    });

                    // Wait for auth state to be loaded in the new session
                    await waitFor(() => {
                        expect(result2.current.loading).toBe(false);
                    });

                    // Property assertion: User should still be authenticated with same data
                    expect(result2.current.user).not.toBeNull();
                    expect(result2.current.user?.uid).toBe(userData.uid);
                    expect(result2.current.user?.email).toBe(userData.email);
                    expect(result2.current.user?.displayName).toBe(userData.displayName);

                    // Verify that the authentication state persisted across the "session reload"
                    expect(result1.current.user?.uid).toBe(result2.current.user?.uid);
                }
            ),
            { numRuns: 20 }
        );
    });

    /**
     * Additional test: Verify that unauthenticated state also persists
     * This ensures that if a user is not authenticated, they remain unauthenticated
     * across session reloads.
     */
    test('Property 3 (variant): Unauthenticated state persists across sessions', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.constant(null), // No user data - unauthenticated state
                async () => {
                    // Mock onAuthStateChanged to simulate no persisted auth state
                    (onAuthStateChanged as jest.Mock).mockImplementation((authInstance, callback) => {
                        // Call with null to indicate no authenticated user
                        callback(null);
                        return jest.fn();
                    });

                    // First render - initial page load
                    const wrapper1 = ({ children }: { children: ReactNode }) => (
                        <AuthProvider>{children}</AuthProvider>
                    );

                    const { result: result1, unmount: unmount1 } = renderHook(() => useAuth(), {
                        wrapper: wrapper1,
                    });

                    await waitFor(() => {
                        expect(result1.current.loading).toBe(false);
                    });

                    // Verify user is not authenticated
                    expect(result1.current.user).toBeNull();

                    unmount1();

                    // Reset and simulate new session
                    jest.clearAllMocks();
                    (onAuthStateChanged as jest.Mock).mockImplementation((authInstance, callback) => {
                        callback(null);
                        return jest.fn();
                    });

                    // Second render - new session
                    const wrapper2 = ({ children }: { children: ReactNode }) => (
                        <AuthProvider>{children}</AuthProvider>
                    );

                    const { result: result2 } = renderHook(() => useAuth(), {
                        wrapper: wrapper2,
                    });

                    await waitFor(() => {
                        expect(result2.current.loading).toBe(false);
                    });

                    // Property assertion: User should still be unauthenticated
                    expect(result2.current.user).toBeNull();
                }
            ),
            { numRuns: 20 }
        );
    });
});

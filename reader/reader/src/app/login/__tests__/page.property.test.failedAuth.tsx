/**
 * Property-Based Tests for Login Page - Failed Authentication
 * Feature: reader-engagement-enhancements
 * Property 2: Failed authentication displays error
 * Validates: Requirements 1.6
 */

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as fc from 'fast-check';
import LoginPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { AuthError } from 'firebase/auth';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('LoginPage Property-Based Tests - Failed Authentication', () => {
    const mockPush = jest.fn();
    const mockSignIn = jest.fn();
    const mockSearchParams = {
        get: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cleanup();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        mockSearchParams.get.mockReturnValue(null);
    });

    afterEach(() => {
        cleanup();
    });

    /**
     * Property 2: Failed authentication displays error
     * Validates: Requirements 1.6
     * 
     * This property verifies that for any invalid credentials, when authentication fails,
     * an error message describing the failure reason should be displayed to the user.
     */
    test('Property 2: Failed authentication displays error message', async () => {
        // Define all possible Firebase Auth error codes and their expected messages
        const authErrorCodes = [
            { code: 'auth/invalid-email', expectedMessage: 'Please enter a valid email address' },
            { code: 'auth/user-disabled', expectedMessage: 'This account has been disabled' },
            { code: 'auth/user-not-found', expectedMessage: 'No account found with this email' },
            { code: 'auth/wrong-password', expectedMessage: 'Incorrect password' },
            { code: 'auth/too-many-requests', expectedMessage: 'Too many failed attempts. Please try again later' },
            { code: 'auth/network-request-failed', expectedMessage: 'Network error. Please check your connection' },
            { code: 'auth/invalid-credential', expectedMessage: 'Invalid email or password' },
        ];

        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    email: fc.emailAddress(),
                    password: fc.string({ minLength: 1, maxLength: 128 }),
                    errorCode: fc.constantFrom(...authErrorCodes.map(e => e.code)),
                }),
                async ({ email, password, errorCode }) => {
                    // Clean up any previous renders
                    cleanup();

                    // Reset mocks for this iteration
                    mockSignIn.mockClear();
                    mockPush.mockClear();

                    // Find the expected error message for this error code
                    const errorMapping = authErrorCodes.find(e => e.code === errorCode);
                    const expectedMessage = errorMapping?.expectedMessage || 'An error occurred. Please try again';

                    // Setup: Mock failed authentication with specific error code
                    // Create a proper Error object with the expected message
                    const authError = new Error(expectedMessage) as Error & { code: string };
                    authError.code = errorCode;
                    authError.name = 'FirebaseError';

                    // Mock signIn to reject with the auth error
                    mockSignIn.mockRejectedValueOnce(authError);

                    // Setup useAuth initial state (no error yet)
                    (useAuth as jest.Mock).mockReturnValue({
                        signIn: mockSignIn,
                        user: null,
                        loading: false,
                        error: null,
                    });

                    // Render the login page
                    render(<LoginPage />);

                    // Find form elements
                    const emailInput = screen.getByPlaceholderText('ARCHIVIST MAIL');
                    const passwordInput = screen.getByPlaceholderText('ACCESS CODE');
                    const submitButton = screen.getByRole('button', { name: /enter archives/i });

                    // Fill in the form with generated credentials
                    fireEvent.change(emailInput, { target: { value: email } });
                    fireEvent.change(passwordInput, { target: { value: password } });

                    // Submit the form
                    fireEvent.click(submitButton);

                    // Wait for authentication to be attempted
                    await waitFor(() => {
                        expect(mockSignIn).toHaveBeenCalledWith(email, password);
                    });

                    // Property assertion: Error message should be displayed
                    await waitFor(() => {
                        const errorElement = screen.queryByText(expectedMessage);
                        expect(errorElement).toBeInTheDocument();
                    }, { timeout: 3000 });

                    // Verify that user was NOT redirected (should stay on login page)
                    expect(mockPush).not.toHaveBeenCalled();

                    // Verify that signIn was called exactly once
                    expect(mockSignIn).toHaveBeenCalledTimes(1);

                    // Clean up after this iteration
                    cleanup();
                }
            ),
            { numRuns: 20 }
        );
    }, 60000); // 60 second timeout for property-based test with 20 runs

    /**
     * Property 2 (variant): Unknown error codes display generic error message
     * 
     * This variant ensures that even for unknown/unmapped error codes,
     * a generic error message is always displayed.
     */
    test('Property 2 (variant): Unknown error codes display generic error', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    email: fc.emailAddress(),
                    password: fc.string({ minLength: 1, maxLength: 128 }),
                    unknownErrorCode: fc.string({ minLength: 10, maxLength: 50 })
                        .map(s => `auth/${s.replace(/[^a-z0-9-]/gi, '-')}`),
                }),
                async ({ email, password, unknownErrorCode }) => {
                    // Clean up any previous renders
                    cleanup();

                    // Reset mocks for this iteration
                    mockSignIn.mockClear();
                    mockPush.mockClear();

                    // Setup: Mock failed authentication with unknown error code
                    const authError: Partial<AuthError> = {
                        code: unknownErrorCode,
                        message: `Firebase: ${unknownErrorCode}`,
                        name: 'FirebaseError',
                    };
                    mockSignIn.mockRejectedValueOnce(authError);

                    // Setup useAuth
                    (useAuth as jest.Mock).mockReturnValue({
                        signIn: mockSignIn,
                        user: null,
                        loading: false,
                        error: null,
                    });

                    // Render the login page
                    render(<LoginPage />);

                    // Find form elements
                    const emailInput = screen.getByPlaceholderText('ARCHIVIST MAIL');
                    const passwordInput = screen.getByPlaceholderText('ACCESS CODE');
                    const submitButton = screen.getByRole('button', { name: /enter archives/i });

                    // Fill in and submit the form
                    fireEvent.change(emailInput, { target: { value: email } });
                    fireEvent.change(passwordInput, { target: { value: password } });
                    fireEvent.click(submitButton);

                    // Wait for authentication to be attempted
                    await waitFor(() => {
                        expect(mockSignIn).toHaveBeenCalled();
                    });

                    // Property assertion: Generic error message should be displayed
                    await waitFor(() => {
                        const errorElement = screen.queryByText('An error occurred. Please try again');
                        expect(errorElement).toBeInTheDocument();
                    }, { timeout: 3000 });

                    // Verify no redirect occurred
                    expect(mockPush).not.toHaveBeenCalled();

                    // Clean up after this iteration
                    cleanup();
                }
            ),
            { numRuns: 20 }
        );
    }, 60000); // 60 second timeout for property-based test with 20 runs

    /**
     * Property 2 (variant): Failed authentication never redirects
     * 
     * This variant ensures that authentication failures NEVER result in a redirect,
     * keeping the user on the login page to see the error and retry.
     */
    test('Property 2 (variant): Failed authentication never redirects', async () => {
        const authErrorCodes = [
            'auth/invalid-email',
            'auth/user-disabled',
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/too-many-requests',
            'auth/network-request-failed',
            'auth/invalid-credential',
        ];

        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    email: fc.emailAddress(),
                    password: fc.string({ minLength: 1, maxLength: 128 }),
                    errorCode: fc.constantFrom(...authErrorCodes),
                    hasReturnUrl: fc.boolean(),
                }),
                async ({ email, password, errorCode, hasReturnUrl }) => {
                    // Clean up any previous renders
                    cleanup();

                    // Reset mocks for this iteration
                    mockSignIn.mockClear();
                    mockPush.mockClear();

                    // Setup: Mock failed authentication
                    const authError: Partial<AuthError> = {
                        code: errorCode,
                        message: `Firebase: ${errorCode}`,
                        name: 'FirebaseError',
                    };
                    mockSignIn.mockRejectedValueOnce(authError);

                    // Setup returnUrl (should be ignored on failure)
                    const returnUrl = hasReturnUrl ? '/novels/test-novel' : null;
                    mockSearchParams.get.mockReturnValue(returnUrl);

                    // Setup useAuth
                    (useAuth as jest.Mock).mockReturnValue({
                        signIn: mockSignIn,
                        user: null,
                        loading: false,
                        error: null,
                    });

                    // Render the login page
                    render(<LoginPage />);

                    // Find form elements
                    const emailInput = screen.getByPlaceholderText('ARCHIVIST MAIL');
                    const passwordInput = screen.getByPlaceholderText('ACCESS CODE');
                    const submitButton = screen.getByRole('button', { name: /enter archives/i });

                    // Fill in and submit the form
                    fireEvent.change(emailInput, { target: { value: email } });
                    fireEvent.change(passwordInput, { target: { value: password } });
                    fireEvent.click(submitButton);

                    // Wait for authentication to be attempted
                    await waitFor(() => {
                        expect(mockSignIn).toHaveBeenCalled();
                    });

                    // Wait a bit to ensure no redirect happens
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Property assertion: Router push must NOT have been called
                    expect(mockPush).not.toHaveBeenCalled();

                    // Verify the form is still present (user is still on login page)
                    expect(emailInput).toBeInTheDocument();
                    expect(passwordInput).toBeInTheDocument();
                    expect(submitButton).toBeInTheDocument();

                    // Clean up after this iteration
                    cleanup();
                }
            ),
            { numRuns: 20 }
        );
    }, 60000); // 60 second timeout for property-based test with 20 runs

    /**
     * Property 2 (variant): Error message is always visible and non-empty
     * 
     * This variant ensures that error messages are always visible to the user
     * and contain meaningful text (not empty or whitespace).
     */
    test('Property 2 (variant): Error message is visible and non-empty', async () => {
        const authErrorCodes = [
            'auth/invalid-email',
            'auth/user-disabled',
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/too-many-requests',
            'auth/network-request-failed',
            'auth/invalid-credential',
        ];

        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    email: fc.emailAddress(),
                    password: fc.string({ minLength: 1, maxLength: 128 }),
                    errorCode: fc.constantFrom(...authErrorCodes),
                }),
                async ({ email, password, errorCode }) => {
                    // Clean up any previous renders
                    cleanup();

                    // Reset mocks for this iteration
                    mockSignIn.mockClear();
                    mockPush.mockClear();

                    // Setup: Mock failed authentication
                    const authError: Partial<AuthError> = {
                        code: errorCode,
                        message: `Firebase: ${errorCode}`,
                        name: 'FirebaseError',
                    };
                    mockSignIn.mockRejectedValueOnce(authError);

                    // Setup useAuth
                    (useAuth as jest.Mock).mockReturnValue({
                        signIn: mockSignIn,
                        user: null,
                        loading: false,
                        error: null,
                    });

                    // Render the login page
                    render(<LoginPage />);

                    // Find form elements
                    const emailInput = screen.getByPlaceholderText('ARCHIVIST MAIL');
                    const passwordInput = screen.getByPlaceholderText('ACCESS CODE');
                    const submitButton = screen.getByRole('button', { name: /enter archives/i });

                    // Fill in and submit the form
                    fireEvent.change(emailInput, { target: { value: email } });
                    fireEvent.change(passwordInput, { target: { value: password } });
                    fireEvent.click(submitButton);

                    // Wait for authentication to be attempted
                    await waitFor(() => {
                        expect(mockSignIn).toHaveBeenCalled();
                    });

                    // Property assertion: Error container should exist and be visible
                    await waitFor(() => {
                        const errorContainer = screen.getByRole('alert', { hidden: false });
                        expect(errorContainer).toBeVisible();

                        // Error message should be non-empty
                        const errorText = errorContainer.textContent || '';
                        expect(errorText.trim().length).toBeGreaterThan(0);

                        // Error message should not be just whitespace
                        expect(errorText.trim()).not.toBe('');
                    }, { timeout: 3000 });

                    // Clean up after this iteration
                    cleanup();
                }
            ),
            { numRuns: 20 }
        );
    }, 60000); // 60 second timeout for property-based test with 20 runs
});

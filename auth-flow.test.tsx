import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import SignInPage from './contentcreator-app/src/app/auth/signin/page';

// Mock server to intercept API requests
const server = setupServer(
  // Mock CSRF token endpoint
  rest.get('/api/auth/csrf', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ csrfToken: 'mock-csrf-token' })
    );
  }),
  
  // Mock providers endpoint
  rest.get('/api/auth/providers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        google: {
          id: 'google',
          name: 'Google',
          type: 'oauth',
          signinUrl: '/api/auth/signin/google',
          callbackUrl: '/api/auth/callback/google',
        },
      })
    );
  })
);

// Start the mock server before tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

// Mock next-auth functions
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(),
  };
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset mocks
    (signIn as jest.Mock).mockReset();
    (signOut as jest.Mock).mockReset();
    (useSession as jest.Mock).mockReset();
  });

  it('renders sign in page with Google provider', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <SessionProvider session={null}>
        <SignInPage />
      </SessionProvider>
    );

    // Check if sign in page is rendered
    expect(screen.getByText('Sign in to Content Creator')).toBeInTheDocument();
    
    // Check if Google sign in button is rendered
    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });
  });

  it('calls signIn when Google button is clicked', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    // Setup user event
    const user = userEvent.setup();

    render(
      <SessionProvider session={null}>
        <SignInPage />
      </SessionProvider>
    );

    // Wait for the Google sign in button to appear
    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    // Click on the Google sign in button
    await user.click(screen.getByText('Sign in with Google'));
    
    // Check if signIn was called with the correct provider
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });

  it('redirects to dashboard if already authenticated', async () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com', id: '1' },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Mock router
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(
      <SessionProvider session={{
        user: { name: 'Test User', email: 'test@example.com', id: '1' },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      }}>
        <SignInPage />
      </SessionProvider>
    );

    // Check if redirected to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles sign out', async () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com', id: '1' },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Create a test component with sign out button
    const TestComponent = () => {
      return (
        <button onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
          Sign Out
        </button>
      );
    };

    // Setup user event
    const user = userEvent.setup();

    render(
      <SessionProvider session={{
        user: { name: 'Test User', email: 'test@example.com', id: '1' },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      }}>
        <TestComponent />
      </SessionProvider>
    );

    // Click on the sign out button
    await user.click(screen.getByText('Sign Out'));
    
    // Check if signOut was called with the correct callback URL
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/signin' });
  });

  it('handles authentication errors', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    // Mock signIn to return an error
    (signIn as jest.Mock).mockResolvedValue({
      error: 'Authentication failed',
      status: 401,
    });

    // Setup user event
    const user = userEvent.setup();

    render(
      <SessionProvider session={null}>
        <SignInPage />
      </SessionProvider>
    );

    // Wait for the Google sign in button to appear
    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    // Click on the Google sign in button
    await user.click(screen.getByText('Sign in with Google'));
    
    // Check if signIn was called
    expect(signIn).toHaveBeenCalled();
    
    // Wait for error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });
});

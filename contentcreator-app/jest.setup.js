// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(() => {
      return {
        data: {
          user: { name: 'Test User', email: 'test@example.com', id: '1' },
          expires: new Date(Date.now() + 2 * 86400).toISOString(),
        },
        status: 'authenticated',
      };
    }),
  };
});

// Mock next-auth server session
jest.mock('next-auth', () => {
  const originalModule = jest.requireActual('next-auth');
  return {
    __esModule: true,
    ...originalModule,
    getServerSession: jest.fn(() => {
      return {
        user: { name: 'Test User', email: 'test@example.com', id: '1' },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      };
    }),
  };
});

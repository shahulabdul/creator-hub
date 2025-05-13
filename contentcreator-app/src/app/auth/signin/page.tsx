'use client';

import { useState, FormEvent } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error = searchParams?.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  const handleDevSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For development login, we'll use redirect: true to let NextAuth handle the redirect
      // This helps avoid issues with the session not being properly established
      console.log('Attempting development login with username:', username);
      
      await signIn('dev-credentials', {
        username,
        password,
        callbackUrl: '/',
        redirect: true,
      });
      
      // Note: The code below won't execute because redirect: true will cause a page navigation
      console.log('If you see this, redirect did not occur');
    } catch (error) {
      console.error('Sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Content Creator Workflow</h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your content creation workflow in one place
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">
              {error === 'OAuthSignin' && 'Error starting the sign in process. Please try again.'}
              {error === 'OAuthCallback' && 'Error during the sign in process. Please try again.'}
              {error === 'OAuthAccountNotLinked' && 'This email is already associated with another account.'}
              {error === 'AccessDenied' && 'Access denied. You do not have permission to sign in.'}
              {!['OAuthSignin', 'OAuthCallback', 'OAuthAccountNotLinked', 'AccessDenied'].includes(error) && 
                'An error occurred during sign in. Please try again.'}
            </p>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image 
              src="/google-logo.svg" 
              alt="Google Logo" 
              width={20} 
              height={20} 
              className="mr-2"
            />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowDevLogin(!showDevLogin)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {showDevLogin ? 'Hide Development Login' : 'Use Development Login'}
            </button>
          </div>
          
          {showDevLogin && (
            <form onSubmit={handleDevSignIn} className="mt-4 space-y-4">
              <div className="p-3 bg-blue-50 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Development Login:</strong> You can use any username and password. This is for development purposes only.
                </p>
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="demo"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="(any password works)"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in (Development)'}
              </button>
            </form>
          )}
          
          <div className="text-center">
            <p className="text-xs text-gray-600">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

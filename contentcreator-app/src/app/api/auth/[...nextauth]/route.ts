import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Set a default URL for development to avoid the NEXTAUTH_URL warning
  ...(process.env.NEXTAUTH_URL ? {} : { url: 'http://localhost:3000' }),
  providers: [
    // Use Google Provider when environment variables are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
              },
            },
          }),
        ]
      : [
          // Fallback to Credentials provider for development
          CredentialsProvider({
            id: "dev-credentials",
            name: "Development Credentials",
            credentials: {
              username: { label: "Username", type: "text", placeholder: "demo" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              // In development mode, any credentials will work
              if (credentials) {
                // Create a mock user for development
                const user = {
                  id: "dev-user-1",
                  name: credentials.username || "Demo User",
                  email: `${credentials.username || "demo"}@example.com`,
                  image: "https://via.placeholder.com/150",
                };
                
                // Log the user for debugging
                console.log("Development login successful with user:", user);
                
                return user;
              }
              return null;
            },
          }),
        ]),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // For OAuth sign-ins, user.id comes from the database
        // For credential sign-ins, we need to get it from the token
        session.user.id = token.sub || 'dev-user-1';
        
        // Ensure these properties are always set
        session.user.name = session.user.name || token.name || 'Demo User';
        session.user.email = session.user.email || token.email || 'demo@example.com';
        session.user.image = session.user.image || token.picture || 'https://via.placeholder.com/150';
      }
      
      // Log the session for debugging
      console.log('Session callback returning:', session);
      
      return session;
    },
    async jwt({ token, user, account }) {

      // Persist the OAuth access_token to the token right after sign in
      if (account) {
        token.accessToken = account.access_token;
      }
      
      // If this is the first sign in, add the user info to the token
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      
      // Log the token for debugging
      console.log('JWT callback returning token with sub:', token.sub);
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "DEVELOPMENT_SECRET_KEY_DO_NOT_USE_IN_PRODUCTION",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

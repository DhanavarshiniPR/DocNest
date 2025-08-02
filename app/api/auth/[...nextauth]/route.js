import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, debugUsers, findUser } from '../../../lib/auth-utils';
import { validateEnvironment, getEnvVar } from '../../../lib/env-check';

// Validate environment on module load
const envCheck = validateEnvironment();

export const authOptions = {
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  providers: [
    GitHubProvider({
      clientId: getEnvVar('GITHUB_ID', 'your-github-client-id'),
      clientSecret: getEnvVar('GITHUB_SECRET', 'your-github-client-secret'),
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('NextAuth authorize called with:', { username: credentials?.username });
          
          if (!credentials?.username || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const user = findUser(credentials.username);

          if (!user) {
            console.log('User not found:', credentials.username);
            return null;
          }

          console.log('User found:', { username: user.username, hasPassword: !!user.password });

          try {
            const isValidPassword = await bcrypt.compare(credentials.password, user.password);
            if (!isValidPassword) {
              console.log('Invalid password for user:', credentials.username);
              return null;
            }

            console.log('Authentication successful for user:', credentials.username);

            return {
              id: user.username,
              name: user.username,
              email: user.email || `${user.username}@docnest.local`,
            };
          } catch (error) {
            console.error('Password comparison error:', error);
            return null;
          }
        } catch (error) {
          console.error('Error in authorize function:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        console.log('JWT callback called:', { hasToken: !!token, hasUser: !!user, hasAccount: !!account });
        if (account && user) {
          // Handle GitHub OAuth
          if (account.provider === 'github') {
            console.log('Processing GitHub OAuth');
            const users = readUsers();
            const existingUser = users.find(u => u.githubId === user.id);
            
            if (!existingUser) {
              // Create new user from GitHub
              const newUser = {
                username: user.login || user.name,
                email: user.email,
                githubId: user.id,
                avatar: user.image,
                createdAt: new Date().toISOString()
              };
              users.push(newUser);
              writeUsers(users);
            }
            
            token.username = user.login || user.name;
            token.githubId = user.id;
            token.avatar = user.image;
          } else {
            // Handle credentials login
            console.log('Processing credentials login');
            token.username = user.name;
          }
        }
        
        // Ensure username is always set in token
        if (!token.username) {
          console.error('No username found in token after processing:', token);
        }
        
        console.log('JWT callback returning token:', { username: token.username });
        return token;
      } catch (error) {
        console.error('Error in JWT callback:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        console.log('Session callback called:', { hasSession: !!session, hasToken: !!token });
        if (session?.user && token) {
          // Ensure username is always set
          if (token.username) {
            session.user.username = token.username;
          } else {
            console.error('No username found in token:', token);
            // Fallback to a default username or return null to force re-authentication
            session.user.username = null;
          }
          session.user.githubId = token.githubId;
          session.user.avatar = token.avatar;
        }
        console.log('Session callback returning session:', { username: session?.user?.username });
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback called:', { hasUser: !!user, hasAccount: !!account });
        if (account?.provider === 'github') {
          // Ensure user has a username
          if (!user.login && !user.name) {
            console.log('GitHub user missing username');
            return false;
          }
        }
        console.log('SignIn callback returning true');
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: getEnvVar('NEXTAUTH_SECRET', getEnvVar('JWT_SECRET', 'dev_secret_key')),
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
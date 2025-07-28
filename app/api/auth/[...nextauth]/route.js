import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, debugUsers, findUser } from '../../../lib/auth-utils';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || 'your-github-client-id',
      clientSecret: process.env.GITHUB_SECRET || 'your-github-client-secret',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
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
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Handle GitHub OAuth
        if (account.provider === 'github') {
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
          token.username = user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.username = token.username;
      session.user.githubId = token.githubId;
      session.user.avatar = token.avatar;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        // Ensure user has a username
        if (!user.login && !user.name) {
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev_secret_key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
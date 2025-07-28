# GitHub OAuth Setup Guide

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the following details:
   - **Application name**: DocNest
   - **Homepage URL**: `http://localhost:3001` (for development)
   - **Authorization callback URL**: `http://localhost:3001/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## Step 2: Set Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3001

# GitHub OAuth (Replace with your actual GitHub OAuth app credentials)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# JWT Secret (for backward compatibility)
JWT_SECRET=your-jwt-secret-key-here
```

## Step 3: For Production Deployment

When deploying to Vercel or other platforms:

1. Update the GitHub OAuth App settings:
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

2. Set the environment variables in your deployment platform:
   - `NEXTAUTH_SECRET`
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `NEXTAUTH_URL` (should be your production URL)

## Step 4: Generate Secure Secrets

You can generate secure secrets using:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32
```

## Features Added

✅ **GitHub OAuth Integration**: Users can now sign in with their GitHub account
✅ **NextAuth.js Integration**: Secure authentication with JWT sessions
✅ **Backward Compatibility**: Existing username/password authentication still works
✅ **Automatic User Creation**: GitHub users are automatically created in the system
✅ **Session Management**: Secure session handling with automatic logout

## Authentication Flow

1. **GitHub OAuth**: Users click "Continue with GitHub" → Redirected to GitHub → Authorize → Return to dashboard
2. **Username/Password**: Traditional login with existing credentials
3. **Registration**: New users can register with username/password
4. **Auto-login**: After registration, users are automatically logged in

## Security Features

- HTTP-only cookies for session storage
- Secure token handling
- Automatic session expiration (7 days)
- CSRF protection
- Secure redirect handling 
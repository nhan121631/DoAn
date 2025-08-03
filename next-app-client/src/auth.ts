/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Call your remote API to verify credentials
          const headers = new Headers();
          headers.append('Content-Type', 'application/json');

          const raw = JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          });

          const requestOptions = {
            method: 'POST',
            headers: headers,
            body: raw,
            redirect: 'follow' as RequestRedirect,
          };

          const response = await fetch('http://localhost:3333/api/auth/login', requestOptions);

          if (response.ok) {
            const result = await response.json();

            // Based on the actual API response structure
            const user = {
              id: result.loggedInUser?.id?.toString() || credentials?.username,
              username: result.loggedInUser?.username || credentials?.username,
              email: result.loggedInUser?.email || credentials?.username,
              roles: result.loggedInUser?.roles || [],
              accessToken: result.access_token,
              refreshToken: result.refresh_token,
            };

            return user;
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.sub) {
        session.user.name = token.sub;
        // Add custom properties
        (session.user as any).roles = token.roles;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist user data to the token right after signin
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.roles = (user as any).roles;
      }
      return token;
    },
  },
});
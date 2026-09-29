import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { backendHeaders } from './lib/api-key';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account'
  },

  callbacks: {
    jwt({ token, user}) {
      if ( user) {
        token.data = user;
      }
      return token;
    },

    session ({session, token}) {
      session.user = token.data as any;
      return session;
    }
  },

  providers: [
    Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (!parsedCredentials.success) return null;

          const { email, password } = parsedCredentials.data;

          const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

          try {
            const res = await fetch(`${backendUrl}/api/auth/verify`, {
              method: 'POST',
              headers: backendHeaders(),
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) return null;

            const user = await res.json();
            return user ?? null;
          } catch (error) {
            console.error('Error al verificar credenciales con el backend:', error);
            return null;
          }
        },
      }),
  ]
};


export const { signIn, signOut, auth, handlers } = NextAuth( authConfig );
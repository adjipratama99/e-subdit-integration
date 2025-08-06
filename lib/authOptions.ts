import CredentialsProvider from 'next-auth/providers/credentials'
import { getUnixTime } from 'date-fns'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { supabase } from './supabaseClient';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "signin",
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        try {
          const { username, password } = credentials as {
            username: string;
            password: string;
          };

          if (!username || !password) return null;

          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

          if (error || !user) {
            console.error(error);
            throw new Error("Username atau password salah.");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            throw new Error("Username atau password salah.");
          }

          return {
            id: user.id,
            name: user.username,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
          } as any;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, session, trigger }: { token: JWT; user?: any; session?: Session; trigger?: string }) {
      if (user) {
        token = {
          ...token,
          id: user.id,
          username: user.name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          caseId: null,
          exp: getUnixTime(new Date()) + 5 * 365 * 24 * 60 * 60, // 5 years
        };
      }

      if (trigger === "update") {
        token = {
          ...token,
          ...user,
          caseId: (session?.user as any)?.caseId,
        };
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      const range_year = getUnixTime(new Date()) + 5 * 365 * 24 * 60 * 60;
      token.exp = range_year;
      session.user = token as any;

      if (token?.exp) {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const remainingTime = (token.exp as number) - currentTimeInSeconds;

        session.expires = new Date((token.exp as number) * 1000).toISOString();
        (session as any).maxAge = remainingTime > 0 ? remainingTime : 0;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        const valid = url && url.startsWith(baseUrl);
        return valid ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    updateAge: 7 * 24 * 60 * 60,
  }
}
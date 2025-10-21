import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  workspaces,
  memberships,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })] : []),
    // Optional demo credentials provider for development ONLY (disabled by default)
    ...((process.env.NODE_ENV === "development" && process.env.ENABLE_DEMO_LOGIN === "true") ? [{
      id: "demo",
      name: "Demo Login",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find the user in the database
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!existingUser) {
          return null;
        }

        // If user has a password (created via signup), verify it
        if (existingUser.password) {
          const isValidPassword = await compare(credentials.password, existingUser.password);
          if (!isValidPassword) {
            return null;
          }
        } else {
          // For users without passwords (e.g., Google OAuth), require demo password
          if (process.env.DEMO_PASSWORD && credentials.password !== process.env.DEMO_PASSWORD) {
            return null;
          }
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          image: existingUser.image,
        };
      }
    }] : []),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    signUp: "/signup",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  callbacks: {
    jwt: ({ token, user }) => {
      console.log("JWT callback - token:", token, "user:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      console.log("Session callback - session:", session, "token:", token);
      if (token) {
        return {
          ...session,
          user: {
            id: token.id as string,
            email: token.email as string,
            name: token.name as string,
            image: session.user?.image,
          },
        };
      }
      return session;
    },
    redirect: ({ url, baseUrl }) => {
      console.log("Redirect callback - url:", url, "baseUrl:", baseUrl);
      // Always redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
} satisfies NextAuthConfig;

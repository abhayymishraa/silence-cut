import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { eq } from "drizzle-orm";

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
    // Add a demo provider for development
    ...(process.env.NODE_ENV === "development" ? [{
      id: "demo",
      name: "Demo Login",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if user exists in database
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (existingUser) {
          // User exists, return their data
          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            image: existingUser.image,
          };
        } else {
          // Create new user in database
          const newUser = await db.insert(users).values({
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            image: null,
            createdAt: new Date(),
          }).returning();

          if (newUser[0]) {
            // Create membership for default workspace
            const defaultWorkspace = await db.query.workspaces.findFirst({
              where: eq(workspaces.slug, "default"),
            });

            if (defaultWorkspace) {
              await db.insert(memberships).values({
                userId: newUser[0].id,
                workspaceId: defaultWorkspace.id,
                role: "owner",
              });
            }

            return {
              id: newUser[0].id,
              email: newUser[0].email,
              name: newUser[0].name,
              image: newUser[0].image,
            };
          }
        }

        return null;
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt: ({ token, user }) => {
      console.log("JWT callback - token:", token, "user:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: ({ session, token }) => {
      console.log("Session callback - session:", session, "token:", token);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
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

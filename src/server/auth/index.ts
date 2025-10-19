import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

// Add secret to auth config
const config = {
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(config);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };

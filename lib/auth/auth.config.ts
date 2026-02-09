import type { NextAuthConfig } from "next-auth";

import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

import { serverEnv } from "@/lib/env/server";

export default {
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!username || !password) {
          return null;
        }

        if (username !== serverEnv.ADMIN_USERNAME) {
          return null;
        }

        const isValid = await bcrypt.compare(password, serverEnv.ADMIN_PASSWORD_HASH);

        if (!isValid) {
          return null;
        }

        // Single-user admin — return a static user object
        return {
          id: "admin",
          name: "Admin",
          email: `${serverEnv.ADMIN_USERNAME}@localhost`,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

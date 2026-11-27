"use client";

import { createAuthClient } from "better-auth/react";

/** Client-side Better Auth (sign in / sign up / sign out / session). */
export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut } = authClient;

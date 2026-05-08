"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AuthProvider({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // Fail loudly in development — never silently use a hardcoded value.
    // Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your frontend/.env.local file.
    throw new Error(
      "[AuthProvider] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. " +
        "Add it to frontend/.env.local (local dev) or your deployment environment variables."
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AuthProvider({ children }) {
  // Use a fallback client ID for local testing if the env var isn't set
  // This is a dummy client ID that looks real but isn't.
  // In production, this MUST be a valid Google Client ID.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "123456789012-dummyclientid123456789012.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

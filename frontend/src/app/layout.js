import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "VoteSarthi — Your Guide to Indian Elections",
  description:
    "Understand the Indian election process with an interactive, personalized guide. Check eligibility, learn voting steps, track election timeline, and get answers to your questions.",
  keywords: "India elections, voter guide, VoteSarthi, voting steps, eligibility checker",
};

import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

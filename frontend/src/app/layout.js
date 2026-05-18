import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "VoteSarthi — Your Guide to Indian Elections",
  description:
    "Understand the Indian election process with an interactive, personalized guide. Check eligibility, learn voting steps, track election timeline, and get answers to your questions.",
  keywords: "India elections, voter guide, VoteSarthi, voting steps, eligibility checker",
};

import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Navbar />
        {/* Hidden translate element that our Navbar button will trigger */}
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

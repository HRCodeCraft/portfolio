import type { Metadata } from "next";
import "./globals.css";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  title: "Harshita Rajput — AI Engineer & Full Stack Developer",
  description:
    "AI-focused Software Engineer building intelligent systems with NLP, Computer Vision, and Generative AI. Currently in R&D at CertifyMe.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "NLP",
    "Computer Vision",
    "Generative AI",
    "Flask",
    "Python",
    "Full Stack",
    "Harshita Rajput",
  ],
  authors: [{ name: "Harshita Rajput" }],
  openGraph: {
    title: "Harshita Rajput — AI Engineer",
    description:
      "Building intelligent systems that learn, adapt, and scale.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="animated-gradient-bg min-h-screen" suppressHydrationWarning>
        <Preloader />
        {children}
      </body>
    </html>
  );
}

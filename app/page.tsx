"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import AILab from "@/components/AILab";
import Blog from "@/components/Blog";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <Navigation />
      <Hero />
      <TechMarquee />
      <About />
      <Skills />
      <TechMarquee />
      <Experience />
      <Projects />
      <AILab />
      <Blog />
      <Certifications />
      <Contact />
      <Footer />
    </main>
  );
}

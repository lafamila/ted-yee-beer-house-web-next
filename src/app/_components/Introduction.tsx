"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Code2,
  Cpu,
  Globe,
  ArrowRight,
  Github,
  Mail,
  Linkedin
} from "lucide-react";
import LocationMap from "./LocationMap";
import TerminalOverlay from "./TerminalOverlay";

const Introduction = () => {
  const [mounted, setMounted] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen overflow-hidden relative font-sans">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3994ef] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors mb-8 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3994ef] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3994ef]"></span>
              </span>
              Available for new projects
            </div>

            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-8">
              Hello, <br />
              I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3994ef] to-purple-500">Alex</span>.
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-lg leading-relaxed">
              Full-Stack Developer building scalable web applications and mentoring the next generation of coders. Expert in React, Node.js, and Cloud Architecture.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-black font-semibold rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors group"
                onClick={() => window.open('mailto:hello@example.com')}
              >
                Contact Me
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm"
                onClick={() => window.open('https://github.com/teddy-yee', '_blank')}
              >
                View Work
              </motion.button>
            </div>

            <div className="mt-16 flex gap-6 text-gray-500">
              <SocialLink href="https://github.com" icon={<Github className="w-6 h-6" />} label="Github" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin className="w-6 h-6" />} label="LinkedIn" />
              <SocialLink href="mailto:hello@example.com" icon={<Mail className="w-6 h-6" />} label="Email" />
            </div>
          </motion.div>

          {/* Right Content - Map & Grid */}
          <div className="flex flex-col gap-8">
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <LocationMap />
            </motion.div>

            {/* Interactive Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <GridCard
                  title="History"
                  icon={<Terminal className="w-6 h-6 text-[#3994ef]" />}
                  description="7+ years of experience in software development"
                  delay={0.5}
                />
                <GridCard
                  title="Tech Stack"
                  icon={<Code2 className="w-6 h-6 text-purple-500" />}
                  description="Modern web technologies and cloud infrastructure"
                  delay={0.6}
                />
                <GridCard
                  title="Projects"
                  icon={<Cpu className="w-6 h-6 text-pink-500" />}
                  description="Showcase of scalable applications"
                  delay={0.7}
                />
                <GridCard
                  title="Tutoring"
                  icon={<Globe className="w-6 h-6 text-green-500" />}
                  description="Mentoring developers and sharing knowledge"
                  delay={0.8}
                />
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Terminal Toggle Button (Fixed Bottom Right) */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setIsTerminalOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-[#3994ef] text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 group"
      >
        <Terminal className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Terminal Overlay */}
      <TerminalOverlay isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  );
};

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3, color: "#fff" }}
    className="hover:text-white transition-colors"
    aria-label={label}
  >
    {icon}
  </motion.a>
);

const GridCard = ({ title, icon, description, delay }: { title: string; icon: React.ReactNode; description: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
  >
    <div className="mb-4 bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default Introduction;

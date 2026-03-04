import React from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-navy-light)] text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div>
          <a href="#" className="flex items-center gap-2 text-3xl font-serif font-bold text-white mb-6">
            <span>🎓</span> Crisis Classroom
          </a>
          <p className="text-[var(--color-muted)] max-w-sm">
            An AI-powered, offline-first adaptive learning platform for students in crisis-affected or under-resourced communities.
          </p>
          <div className="flex gap-4 mt-8">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--color-amber)] hover:text-[var(--color-navy)] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--color-amber)] hover:text-[var(--color-navy)] transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--color-amber)] hover:text-[var(--color-navy)] transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-serif font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><a href="#problem" className="text-[var(--color-muted)] hover:text-white transition-colors">The Problem</a></li>
            <li><a href="#solution" className="text-[var(--color-muted)] hover:text-white transition-colors">Our Solution</a></li>
            <li><a href="#how-it-works" className="text-[var(--color-muted)] hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#impact" className="text-[var(--color-muted)] hover:text-white transition-colors">Impact & Personas</a></li>
            <li><a href="#contact" className="text-[var(--color-muted)] hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-serif font-semibold mb-6">Built For</h4>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-amber)] flex items-center justify-center font-bold text-[var(--color-navy)]">
                RB
              </div>
              <div>
                <h5 className="font-bold">Red Bull Basement</h5>
                <p className="text-sm text-[var(--color-muted)]">2025 Submission</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              By SparkLearn Studio. Empowering the next generation of learners, everywhere.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[var(--color-muted)] text-sm">
          &copy; {new Date().getFullYear()} Crisis Classroom. All rights reserved.
        </p>
        <p className="text-sm font-medium text-[var(--color-amber)]">
          Designed for every child who deserves to learn.
        </p>
      </div>
    </footer>
  );
}

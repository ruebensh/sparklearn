import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserCircle2, Download, RefreshCw } from 'lucide-react';
const steps = [
  {
    icon: <UserPlus size={32} />,
    title: 'Parent Registration',
    desc: 'Only parents or guardians create the primary account to manage the educational journey[cite: 5, 6].',
  },
  {
    icon: <UserCircle2 size={32} />,
    title: 'Create Student ID',
    desc: 'Parents generate unique, non-duplicating usernames for each child within their secure dashboard.',
  },
  {
    icon: <Download size={32} />,
    title: 'Offline Learning',
    desc: 'Students log in using their credentials to download Al-powered micro-lessons for offline use.',
  },
  {
    icon: <RefreshCw size={32} />, // Bu yerda ham RefreshCw bo'lsin
    title: 'Progress Sync',
    desc: 'Adaptive feedback and assessment data sync back to the parent dashboard when reconnected.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-[var(--color-navy)] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-[var(--color-amber)] font-black uppercase tracking-[0.3em] text-xs mb-4 block">The Ecosystem</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">How It Works</h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
            A secure, AI-powered bridge between parents, students, and quality education in crisis zones[cite: 4, 9].
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 border-t-2 border-dashed border-[var(--color-amber)]/20 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Circle */}
                <div className="w-24 h-24 rounded-full bg-[var(--color-navy-light)] border-4 border-[var(--color-navy)] shadow-[0_0_0_2px_var(--color-amber)] flex items-center justify-center text-[var(--color-amber)] relative z-10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-[var(--color-navy)] font-black flex items-center justify-center text-sm shadow-lg">
                    {i + 1}
                  </div>
                  {step.icon}
                </div>
                
                {/* Step Text */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--color-amber)] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed px-2">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Logic Highlight */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex-1">
            <h4 className="text-amber-400 font-bold mb-2">Unique Access Security</h4>
            <p className="text-white/60 text-sm">
              Our system ensures every Student ID is unique across the global Crisis Classroom network, preventing login conflicts and ensuring accurate AI tracking[cite: 11].
            </p>
          </div>
          <div className="h-px md:w-px md:h-12 bg-white/10" />
          <div className="flex-1">
            <h4 className="text-amber-400 font-bold mb-2">Parental Authority</h4>
            <p className="text-white/60 text-sm">
              Account creation is restricted to Parents/Admins to maintain a safe, supervised environment for young learners in fragile regions[cite: 5, 7].
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
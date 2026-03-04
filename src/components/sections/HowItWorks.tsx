import React from 'react';
import { motion } from 'motion/react';
import { Download, BookOpen, PenTool, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: <Download size={32} />,
    title: 'Download',
    desc: 'Connect briefly to download highly compressed lesson packs.',
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Learn',
    desc: 'Study offline with interactive, AI-adapted content.',
  },
  {
    icon: <PenTool size={32} />,
    title: 'Assess',
    desc: 'Take quizzes that auto-grade and adjust your next lesson.',
  },
  {
    icon: <RefreshCw size={32} />,
    title: 'Sync',
    desc: 'Reconnect to sync progress and fetch new materials.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-[var(--color-navy)] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">How It Works</h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
            A seamless cycle designed for environments where internet access is a luxury, not a given.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 border-t-2 border-dashed border-[var(--color-amber)]/30 z-0"></div>
          
          {/* Connecting Line (Mobile) */}
          <div className="md:hidden absolute top-0 bottom-0 left-12 w-0.5 border-l-2 border-dashed border-[var(--color-amber)]/30 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-8"
              >
                <div className="w-24 h-24 rounded-full bg-[var(--color-navy-light)] border-4 border-[var(--color-navy)] shadow-[0_0_0_2px_var(--color-amber)] flex items-center justify-center text-[var(--color-amber)] relative z-10 shrink-0">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--color-amber)] text-[var(--color-navy)] font-bold flex items-center justify-center text-sm">
                    {i + 1}
                  </div>
                  {step.icon}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

export default function Hero() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[var(--color-navy)]">
      {/* Background Gradient & Grain */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,166,35,0.15)_0%,transparent_50%)]"></div>
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Floating Shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-16 h-16 rounded-full border border-[var(--color-amber)]/30 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-20 w-24 h-24 bg-[var(--color-coral)]/10 rounded-lg backdrop-blur-sm rotate-12"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="max-w-2xl">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="mb-6"
          >
            <Badge variant="amber" className="mb-4">🏆 Red Bull Basement 2025</Badge>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6"
          >
            Learning Shouldn't Stop in a <span className="text-[var(--color-amber)] italic">Crisis</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="text-lg md:text-xl text-[var(--color-muted)] mb-10 max-w-xl leading-relaxed"
          >
            An AI-powered, offline-first adaptive learning platform designed for students in crisis-affected and under-resourced communities worldwide.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="flex flex-wrap gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              className="gap-2"
              onClick={() => navigate('/auth')}
            >
              Get Early Access <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={scrollToHowItWorks}
            >
              <PlayCircle size={20} /> See How It Works
            </Button>
          </motion.div>
        </div>

        {/* Tablet Mockup */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="relative mx-auto w-full max-w-md lg:max-w-full"
        >
          <div className="relative rounded-[2rem] border-8 border-[var(--color-navy-light)] bg-[var(--color-navy)] shadow-2xl overflow-hidden aspect-[3/4] md:aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3]">
            {/* Fake UI */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy-light)] to-[var(--color-navy)] p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-[var(--color-amber)]/20 flex items-center justify-center text-[var(--color-amber)] font-bold">A</div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="h-8 w-3/4 bg-white/10 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-white/5 rounded-lg mb-8"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col justify-end">
                    <div className="h-4 w-2/3 bg-[var(--color-amber)]/50 rounded"></div>
                  </div>
                  <div className="h-32 bg-[var(--color-amber)]/10 rounded-xl border border-[var(--color-amber)]/30 p-4 flex flex-col justify-end relative overflow-hidden">
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-amber)] flex items-center justify-center text-[var(--color-navy)]">
                      <PlayCircle size={16} />
                    </div>
                    <div className="h-4 w-full bg-[var(--color-amber)] rounded"></div>
                  </div>
                </div>

                <div className="mt-auto h-16 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-coral)]/20"></div>
                  <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-[var(--color-coral)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-[var(--color-amber)]/20 blur-3xl -z-10 rounded-full"></div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[var(--color-muted)] cursor-pointer"
        onClick={scrollToHowItWorks}
      >
        <div className="w-6 h-10 border-2 border-[var(--color-muted)] rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-[var(--color-amber)] rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
}
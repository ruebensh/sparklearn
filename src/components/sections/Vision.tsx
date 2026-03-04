import React from 'react';
import { motion } from 'motion/react';

export default function Vision() {
  return (
    <section className="py-40 bg-[var(--color-navy)] relative overflow-hidden">
      {/* Decorative Map Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover">
          <path d="M450,200 Q480,180 500,220 T550,250 T600,200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="450" cy="200" r="4" fill="var(--color-amber)" />
          <circle cx="500" cy="220" r="4" fill="var(--color-amber)" />
          <circle cx="550" cy="250" r="4" fill="var(--color-amber)" />
          <circle cx="600" cy="200" r="4" fill="var(--color-amber)" />
          
          <path d="M300,150 Q350,180 400,160 T450,200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="300" cy="150" r="4" fill="var(--color-coral)" />
          <circle cx="400" cy="160" r="4" fill="var(--color-coral)" />
        </svg>
      </div>

      {/* Pulsing Dots */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-[40%] left-[45%] w-8 h-8 bg-[var(--color-amber)] rounded-full blur-md"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute top-[50%] left-[55%] w-6 h-6 bg-[var(--color-coral)] rounded-full blur-md"
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative inline-block"
        >
          <span className="absolute -top-16 -left-12 text-9xl text-[var(--color-amber)] opacity-20 font-serif leading-none">"</span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold italic leading-tight mb-12">
            Every child deserves to learn — crisis or not.
          </h2>
          <span className="absolute -bottom-24 -right-12 text-9xl text-[var(--color-amber)] opacity-20 font-serif leading-none rotate-180">"</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          We are partnering with global NGOs and local educators to deploy Crisis Classroom to the regions that need it most. Our vision is a world where education is truly interruption-proof.
        </motion.p>
      </div>
    </section>
  );
}

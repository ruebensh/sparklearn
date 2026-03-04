import React from 'react';
import { motion } from 'motion/react';
import { WifiOff, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: <WifiOff className="w-8 h-8 text-[var(--color-amber)]" />,
    title: 'Offline First',
    desc: 'Download compressed lesson bundles when connected. Learn entirely offline for weeks.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-[var(--color-coral)]" />,
    title: 'AI Adaptive',
    desc: 'Smart algorithms adjust difficulty based on performance, even without an internet connection.',
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-navy)]" />,
    title: 'Smart Assessment',
    desc: 'Auto-grading and progress tracking sync back to teachers when connectivity is restored.',
  },
];

export default function Solution() {
  return (
    <section id="solution" className="py-32 bg-[var(--color-cream)] text-[var(--color-navy)] relative clip-diagonal-top">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1"
        >
          <div className="w-16 h-1 bg-[var(--color-amber)] mb-8"></div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            A resilient platform for fragile environments.
          </h2>
          <p className="text-lg text-[var(--color-navy-light)]/80 mb-8 leading-relaxed">
            Crisis Classroom isn't just another learning app. It's a lightweight, offline-capable engine designed specifically for low-bandwidth, intermittent-connectivity scenarios.
          </p>
          <p className="text-lg text-[var(--color-navy-light)]/80 leading-relaxed">
            By combining edge AI with smart caching, we deliver personalized education to the hardest-to-reach students, ensuring learning continues when the world stops.
          </p>
        </motion.div>

        {/* Right Cards */}
        <div className="order-1 lg:order-2 relative h-[500px] md:h-[600px] lg:h-[700px]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="absolute w-full max-w-md left-1/2 -translate-x-1/2"
              style={{ top: `${i * 120}px`, zIndex: 10 - i }}
            >
              <Card glass={false} className="bg-white shadow-xl hover:shadow-2xl border border-gray-100">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-[var(--color-cream)] rounded-xl">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-[var(--color-navy-light)]/70 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

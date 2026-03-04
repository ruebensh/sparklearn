import React from 'react';
import { motion } from 'motion/react';
import { WifiOff, BrainCircuit, BarChart3, Zap } from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: <WifiOff className="w-8 h-8 text-[var(--color-amber)]" />,
    title: 'Offline-First Engine',
    desc: 'Downloadable micro-lesson packs designed for low-bandwidth and intermittent-connectivity scenarios.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-[var(--color-coral)]" />,
    title: 'Adaptive AI Assessment',
    desc: 'Edge AI algorithms deliver personalized feedback and adjust difficulty without needing an active internet connection.',
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[var(--color-navy)]" />,
    title: 'Measurable Outcomes',
    desc: 'Aggregated progress tracking syncs back to teachers and NGOs to identify learning gaps in real-time.',
  },
];

export default function Solution() {
  return (
    <section id="solution" className="py-32 bg-[var(--color-cream)] text-[var(--color-navy)] relative clip-diagonal-top overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content: The Vision */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={14} fill="currentColor" /> Powered by SparkLearn Studio
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Personalized Education for Every Environment.
          </h2>
          
          <p className="text-lg text-[var(--color-navy-light)]/80 mb-6 leading-relaxed">
            Crisis Classroom is an AI-powered, offline-first learning platform that delivers personalized micro-lessons to students in under-resourced or crisis-affected communities.
          </p>
          
          <p className="text-lg text-[var(--color-navy-light)]/80 mb-8 leading-relaxed">
            By combining adaptive feedback with smart local caching, we address learning loss and provide scalable tools to improve learning outcomes where the world needs it most.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-bold opacity-70">AI-Powered MVP</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-bold opacity-70">Scalable for NGOs</span>
            </div>
          </div>
        </motion.div>

        {/* Right Content: Feature Stack */}
        <div className="order-1 lg:order-2 relative h-[500px] md:h-[550px]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="absolute w-full max-w-md left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0"
              style={{ top: `${i * 140}px`, zIndex: 10 - i }}
            >
              <Card glass={false} className="bg-white shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-[var(--color-cream)] rounded-2xl shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-[var(--color-navy-light)]/70 text-sm leading-relaxed">{feature.desc}</p>
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
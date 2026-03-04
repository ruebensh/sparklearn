import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';

const personas = [
  {
    emoji: '👧🏽',
    color: 'bg-purple-500',
    name: 'Amina',
    role: 'Student, 12',
    challenge: 'Displaced by conflict, living in a camp with no school access.',
    solution: 'Uses a shared tablet to continue math and literacy lessons offline, progressing at her own pace.',
  },
  {
    emoji: '👨🏾‍🏫',
    color: 'bg-blue-500',
    name: 'Mr. Hassan',
    role: 'Teacher',
    challenge: 'Overwhelmed with 80+ students of varying levels in one makeshift classroom.',
    solution: 'Receives synced progress reports to identify which students need 1-on-1 help the most.',
  },
  {
    emoji: '🌍',
    color: 'bg-green-500',
    name: 'UNHCR',
    role: 'NGO Partner',
    challenge: 'Struggles to deploy effective, measurable education in emergency zones.',
    solution: 'Distributes pre-loaded devices and tracks aggregated learning outcomes via dashboard.',
  },
];

export default function Impact() {
  return (
    <section id="impact" className="py-32 bg-[var(--color-cream)] text-[var(--color-navy)] clip-diagonal-bottom">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Who We Serve</h2>
          <p className="text-lg text-[var(--color-navy-light)]/80 max-w-2xl mx-auto">
            Designed for the humans at the center of the crisis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card glass={false} className="bg-white h-full shadow-lg hover:shadow-2xl border border-gray-100 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full ${persona.color} flex items-center justify-center text-3xl shadow-inner`}>
                    {persona.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{persona.name}</h3>
                    <p className="text-sm font-medium text-[var(--color-amber)] uppercase tracking-wider">{persona.role}</p>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-muted)] uppercase mb-1">The Challenge</h4>
                    <p className="text-[var(--color-navy-light)]/80">{persona.challenge}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[var(--color-amber)] uppercase mb-1">How We Help</h4>
                    <p className="text-[var(--color-navy-light)] font-medium">{persona.solution}</p>
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

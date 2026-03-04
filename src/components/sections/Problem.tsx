import React from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

const stats = [
  { value: 250, suffix: 'M+', label: 'Children Out of School', desc: 'Globally due to conflict, climate, and poverty.' },
  { value: 70, suffix: '%', label: 'Lack Internet Access', desc: 'In crisis-affected regions, making online learning impossible.' },
  { value: 2, suffix: ' Years', label: 'Average Learning Loss', desc: 'For students displaced by emergencies.' },
];

export default function Problem() {
  return (
    <section id="problem" className="py-32 bg-[var(--color-navy)] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-[var(--color-amber)] font-bold tracking-widest uppercase text-sm mb-4 block">The Reality</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold max-w-3xl mx-auto leading-tight">
            Education is a lifeline, but millions are disconnected.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="group relative border-b border-white/10 pb-8 hover:border-[var(--color-amber)] transition-colors duration-300"
            >
              <div className="text-6xl md:text-7xl font-serif font-bold text-[var(--color-amber)] mb-4 flex items-baseline">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <h3 className="text-xl font-bold mb-2">{stat.label}</h3>
              <p className="text-[var(--color-muted)]">{stat.desc}</p>
              
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--color-amber)] transition-all duration-500 group-hover:w-full"></div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 max-w-3xl mx-auto text-center"
        >
          <p className="text-xl text-[var(--color-muted)] leading-relaxed">
            When disaster strikes, schools close first and open last. Traditional ed-tech assumes high-speed internet and modern devices. We don't.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

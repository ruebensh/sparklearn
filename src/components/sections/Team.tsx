import React from 'react';
import { motion } from 'motion/react';
import { Linkedin } from 'lucide-react';
import { Card } from '../ui/Card';

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    initials: 'SC',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    name: 'David Okafor',
    role: 'Head of AI Engineering',
    initials: 'DO',
    color: 'from-amber-400 to-orange-600',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Education Lead',
    initials: 'ER',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    name: 'Tariq Al-Fayed',
    role: 'Field Operations',
    initials: 'TA',
    color: 'from-purple-400 to-pink-600',
  },
];

export default function Team() {
  return (
    <section id="team" className="py-32 bg-[var(--color-cream)] text-[var(--color-navy)] relative clip-diagonal-top">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-[var(--color-amber)] font-bold tracking-widest uppercase text-sm mb-4 block">The Team</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Built by SparkLearn Studio</h2>
          <p className="text-lg text-[var(--color-navy-light)]/80 max-w-2xl mx-auto">
            A diverse team of educators, engineers, and humanitarians dedicated to solving the hardest problems in ed-tech.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card glass={false} className="bg-white text-center shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 group">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-6">{member.role}</p>
                
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-amber)] hover:text-white transition-colors">
                  <Linkedin size={18} />
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

// Sample data - This will eventually come from your PostgreSQL/FastAPI backend
const topThree = [
  { name: 'Ilhomjon', score: 98, region: 'Samarkand', rank: 2, avatar: '🥈', color: 'bg-slate-300' },
  { name: 'Jaloliddin', score: 99, region: 'Tashkent', rank: 1, avatar: '🥇', color: 'bg-amber-400' },
  { name: 'Jasur', score: 95, region: 'Fergana', rank: 3, avatar: '🥉', color: 'bg-orange-400' },
];

const others = Array.from({ length: 20 }, (_, i) => ({
  name: `Student ${i + 4}`,
  score: 92 - i,
  region: 'Uzbekistan',
  rank: i + 4
}));

export default function Impact() {
  return (
    <section id="impact" className="py-32 bg-[var(--color-cream)] text-[var(--color-navy)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            <TrendingUp size={14} />
            Live AI Insights
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Weekly Global Leaderboard</h2>
          <p className="text-lg text-[var(--color-navy-light)]/80 max-w-2xl mx-auto">
            Recognizing the most dedicated learners across the region based on AI-driven progress analysis.
          </p>
        </div>

        {/* Podium Section */}
        <div className="flex items-end justify-center gap-4 mb-12 h-80 max-w-3xl mx-auto">
          {/* 2nd Place */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            whileInView={{ height: '70%', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-1/3 bg-white rounded-t-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-end pb-8 relative"
          >
            <div className="absolute -top-12 text-4xl">{topThree[0].avatar}</div>
            <p className="font-bold text-[var(--color-navy)]">{topThree[0].name}</p>
            <p className="text-amber-600 font-bold">{topThree[0].score}%</p>
            <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase">Runner Up</div>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            whileInView={{ height: '100%', opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-1/3 bg-[var(--color-navy)] rounded-t-2xl shadow-2xl flex flex-col items-center justify-end pb-10 relative border-x-4 border-t-4 border-amber-400"
          >
            <div className="absolute -top-16"><Trophy size={64} className="text-amber-400" /></div>
            <p className="font-bold text-white text-xl">{topThree[1].name}</p>
            <p className="text-amber-400 font-black text-2xl">{topThree[1].score}%</p>
            <div className="mt-4 px-4 py-1 bg-amber-400 rounded-full text-[10px] font-black uppercase text-navy-900">Weekly Champ</div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            whileInView={{ height: '55%', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-1/3 bg-white rounded-t-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-end pb-8 relative"
          >
            <div className="absolute -top-12 text-4xl">{topThree[2].avatar}</div>
            <p className="font-bold text-[var(--color-navy)]">{topThree[2].name}</p>
            <p className="text-amber-600 font-bold">{topThree[2].score}%</p>
            <div className="mt-4 px-3 py-1 bg-orange-50 rounded-full text-[10px] font-bold uppercase text-orange-600">Rising Star</div>
          </motion.div>
        </div>

        {/* Top 20 Scrollable List */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-gray-500 tracking-widest">Regional Rankings</span>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Sync
            </span>
          </div>
          <div className="h-80 overflow-y-auto">
            {others.map((student) => (
              <div key={student.rank} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="w-6 text-sm font-bold text-gray-300">#{student.rank}</span>
                  <div>
                    <p className="font-bold text-sm text-[var(--color-navy)]">{student.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{student.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${student.score}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-[var(--color-navy)] w-8">{student.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
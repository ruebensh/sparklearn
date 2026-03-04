import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PlayCircle, WifiOff, BrainCircuit, ShieldCheck, Globe, Zap } from 'lucide-react';
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
      {/* Background: Grain & Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,166,35,0.12)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: The Mission & Vision */}
        <div className="max-w-2xl">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUpVariant} className="mb-6">
            <Badge variant="amber" className="mb-4 tracking-[0.2em] py-1.5 uppercase font-black">
              🚀 Red Bull Basement 2026 Global Stage
            </Badge>
          </motion.div>

          <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUpVariant}
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.05] mb-8 text-white"
          >
            Empowering Minds Where <span className="text-[var(--color-amber)] italic">Tradition</span> Meets <span className="text-[var(--color-amber)]">Innovation</span>
          </motion.h1>

          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUpVariant}
            className="text-lg md:text-xl text-[var(--color-muted)] mb-12 max-w-xl leading-relaxed font-medium"
          >
            Crisis Classroom is a resilient, AI-powered engine designed to ensure that quality education remains a human right, even in the most fragile environments on Earth.
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUpVariant} className="flex flex-wrap gap-5">
            <Button variant="primary" size="lg" className="gap-3 shadow-xl shadow-amber-400/10" onClick={() => navigate('/auth')}>
              Get Early Access <ArrowRight size={20} />
            </Button>
            <Button variant="outline" size="lg" className="gap-3 text-white border-white/20 hover:bg-white/5" onClick={scrollToHowItWorks}>
              <PlayCircle size={20} /> Explore Ecosystem
            </Button>
          </motion.div>
        </div>

        {/* Right Side: Global Resilient Engine Mockup */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUpVariant} className="relative mx-auto w-full max-w-md lg:max-w-full">
          <div className="relative rounded-[3rem] border-[14px] border-[var(--color-navy-light)] bg-[#0a0b14] shadow-2xl overflow-hidden aspect-[3/4] shadow-amber-400/5">
            
            {/* Tablet Content: System Intelligence UI */}
            <div className="absolute inset-0 p-8 flex flex-col text-white bg-gradient-to-br from-[#1a1c2e] via-[#0a0b14] to-[#0a0b14]">
              
              {/* UI Top Header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <Zap size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-amber-400 font-black">SparkLearn Studio</p>
                    <p className="text-sm font-bold opacity-80 italic text-white/90 leading-none">Crisis Classroom Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <WifiOff size={14} className="text-coral-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Offline-First</span>
                </div>
              </div>

              {/* Central Visual: Resilient AI Engine */}
              <div className="flex-1 bg-gradient-to-br from-amber-400/5 to-transparent border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm relative overflow-hidden group">
                {/* Decorative pulse effect */}
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-400/5 rounded-full blur-[60px]"
                />
                
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-amber-400/20 flex items-center justify-center mb-8 relative"
                >
                  <BrainCircuit size={48} className="text-amber-400 relative z-10" />
                </motion.div>
                
                <h3 className="text-2xl font-serif font-bold mb-3 tracking-wide">Resilient AI Core</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] mb-6">Status: Adaptive & Operational</p>
                
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold border border-white/10 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" /> 100% Offline Secured
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold border border-white/10 flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" /> Edge Deployment Ready
                  </div>
                </div>
              </div>

              {/* Bottom Metrics */}
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Global Reach</p>
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0b14] bg-white/10 flex items-center justify-center text-[8px] font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Impact Analysis</p>
                   <div className="flex items-center gap-2">
                     <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          whileInView={{ width: '85%' }} 
                          className="h-full bg-amber-400"
                        />
                     </div>
                     <span className="text-[10px] font-bold text-amber-400">85%</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large Outer Glow */}
          <div className="absolute -inset-10 bg-[var(--color-amber)]/5 blur-[120px] -z-10 rounded-full"></div>
        </motion.div>
      </div>

      {/* Scroll Down Hint */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 cursor-pointer hidden md:block"
        onClick={scrollToHowItWorks}
      >
        <div className="w-5 h-9 border-2 border-white rounded-full flex justify-center pt-2">
          <motion.div className="w-1 h-1 bg-amber-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
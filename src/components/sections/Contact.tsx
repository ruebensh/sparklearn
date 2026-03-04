import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Failed to submit');
      
      setStatus('success');
      setFormData({ name: '', email: '', organization: '', message: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 bg-[var(--color-navy)] relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-16 h-1 bg-[var(--color-coral)] mb-8"></div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Let's build the future of resilient education.
          </h2>
          <p className="text-lg text-[var(--color-muted)] mb-12 leading-relaxed max-w-md">
            Whether you're an NGO looking to deploy, an educator with feedback, or an investor who believes in our mission — we want to hear from you.
          </p>
          
          <div className="flex items-center gap-4 text-white mb-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Mail className="text-[var(--color-amber)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted)] font-bold uppercase tracking-wider">Email Us</p>
              <a href="mailto:hello@crisisclassroom.org" className="text-lg hover:text-[var(--color-amber)] transition-colors font-medium">
                hello@crisisclassroom.org
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[var(--color-navy-light)] p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-coral)]/10 blur-3xl rounded-full pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)] transition-all"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)] transition-all"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="organization" className="block text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Organization (Optional)</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)] transition-all"
                placeholder="UNHCR, Save the Children, etc."
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)] transition-all resize-none"
                placeholder="How can we partner together?"
              ></textarea>
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full md:w-auto"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Sending...</span>
              ) : (
                'Send Message'
              )}
            </Button>

            {/* Status Messages */}
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-400 mt-4 bg-green-400/10 p-4 rounded-xl border border-green-400/20">
                <CheckCircle2 size={20} />
                <p>Message sent successfully! We'll be in touch soon.</p>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 mt-4 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                <AlertCircle size={20} />
                <p>Failed to send message. Please try again later.</p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}

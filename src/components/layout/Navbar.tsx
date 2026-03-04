import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Problem', href: '#problem' },
    { name: 'Solution', href: '#solution' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Impact', href: '#impact' },
  ];

  const scrollTo = (href: string) => {
    setIsMobileMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Token bor bo'lsa "Dashboard" ko'rsatamiz
  const isLoggedIn = !!localStorage.getItem('accessToken');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-[var(--color-navy)]/80 py-4 shadow-lg' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-white">
          <span>🎓</span> Crisis Classroom
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-[var(--color-muted)] hover:text-white transition-colors relative group bg-transparent border-none cursor-pointer"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-amber)] transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}

          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="bg-[var(--color-amber)] hover:bg-[var(--color-coral)] text-[var(--color-navy)] font-bold py-2 px-6 rounded-full transition-colors"
            >
              Dashboard →
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="bg-[var(--color-amber)] hover:bg-[var(--color-coral)] text-[var(--color-navy)] font-bold py-2 px-6 rounded-full transition-colors"
            >
              Get Early Access
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-navy)] border-t border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
        >
          {navLinks.map((link, i) => (
            <motion.button
              key={link.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => scrollTo(link.href)}
              className="text-lg font-medium text-white hover:text-[var(--color-amber)] py-2 border-b border-white/5 text-left bg-transparent border-x-0 border-t-0 cursor-pointer w-full"
            >
              {link.name}
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: navLinks.length * 0.1 }}
            onClick={() => { setIsMobileMenuOpen(false); navigate(isLoggedIn ? '/dashboard' : '/auth'); }}
            className="mt-4 bg-[var(--color-amber)] text-[var(--color-navy)] font-bold py-3 px-6 rounded-full w-full"
          >
            {isLoggedIn ? 'Dashboard →' : 'Get Early Access'}
          </motion.button>
        </motion.div>
      )}
    </nav>
  );
}
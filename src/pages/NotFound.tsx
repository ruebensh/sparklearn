import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <h1 className="text-9xl font-serif font-bold text-[var(--color-amber)] mb-6">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-[var(--color-muted)] mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={20} /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

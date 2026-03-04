import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Problem from '../components/sections/Problem';
import Solution from '../components/sections/Solution';
import HowItWorks from '../components/sections/HowItWorks';
import Impact from '../components/sections/Impact';
import Vision from '../components/sections/Vision';
import Team from '../components/sections/Team';
import Contact from '../components/sections/Contact';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Impact />
        <Vision />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

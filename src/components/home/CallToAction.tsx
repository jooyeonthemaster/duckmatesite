"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section id="contact" className="py-32 bg-kpop-purple relative overflow-hidden flex items-center justify-center text-center">
      {/* Moving Text Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-0 flex items-center justify-center transform -rotate-12 scale-150">
          <div className="text-[15vw] font-display font-black text-white leading-none whitespace-nowrap">
            JOIN THE HYPE JOIN THE HYPE JOIN THE HYPE
          </div>
        </div>
      </div>

      <div className="container-custom relative z-10 text-white">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-8xl font-display font-bold mb-8 tracking-tighter"
        >
          READY TO STAN?
        </motion.h2>
        <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-12 text-white/90">
          Limited spots available for the upcoming comeback season.
          <br />
          Secure your Duckmate now before it's too late.
        </p>
        
        <form className="max-w-md mx-auto flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full px-6 py-4 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-kpop-lime focus:bg-white/20 transition-all text-lg text-center backdrop-blur-sm"
          />
          <button className="w-full px-8 py-4 bg-kpop-lime text-black rounded-full font-bold text-xl hover:bg-white hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
            Get Early Access <ArrowRight className="w-6 h-6" />
          </button>
        </form>
      </div>
    </section>
  );
}


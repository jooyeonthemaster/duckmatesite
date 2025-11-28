"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, MapPin, Music } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kpop-pink/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-kpop-blue/20 rounded-full blur-[100px]" />

      <div className="container-custom relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-kpop-lime animate-pulse"></span>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-500">
            Beta Access Open
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-6"
        >
          REAL K-POP <br />
          <span className="text-gradient">REAL KOREA</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-600 max-w-2xl font-medium leading-relaxed mb-10"
        >
          Stop visiting tourist traps. Experience the K-pop courses currated by{" "}
          <span className="font-bold text-foreground underline decoration-kpop-pink decoration-4 underline-offset-2">
            Korean Fandoms
          </span>.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <button className="group relative px-8 py-4 bg-black text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-kpop-pink to-kpop-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Explore Courses <ArrowRight className="w-5 h-5" />
            </span>
          </button>
          <button className="px-8 py-4 bg-white border-2 border-gray-100 text-foreground rounded-full font-bold text-lg hover:bg-gray-50 transition-colors hover:border-kpop-blue">
            View Sample Plan
          </button>
        </motion.div>

        {/* Floating Elements (Decorations) */}
        <FloatingBadge 
          icon={<Star className="fill-kpop-lime text-kpop-lime" />} 
          text="100% Fan Verified" 
          className="absolute -left-4 top-20 md:left-10 md:top-1/3 rotate-[-12deg]"
          delay={0.5}
        />
         <FloatingBadge 
          icon={<MapPin className="fill-kpop-blue text-kpop-blue" />} 
          text="Hidden Spots" 
          className="absolute -right-4 bottom-20 md:right-10 md:bottom-1/3 rotate-[12deg]"
          delay={0.6}
        />
      </div>
    </section>
  );
}

function FloatingBadge({ icon, text, className, delay }: { icon: React.ReactNode, text: string, className?: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay 
      }}
      className={`hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${className}`}
    >
      {icon}
      <span className="font-bold font-mono text-sm uppercase">{text}</span>
    </motion.div>
  )
}


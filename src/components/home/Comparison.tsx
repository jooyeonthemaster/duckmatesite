"use client";

import { motion } from "framer-motion";
import { X, Check, Skull, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Comparison() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
            WHY DUCKMATE?
          </h2>
          <p className="text-xl text-gray-500">Don't waste your precious time in Korea.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 max-w-5xl mx-auto">
          
          {/* VS Badge (Absolute Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-20 h-20 bg-black text-white rounded-full font-display font-black text-3xl border-4 border-white shadow-xl transform rotate-12">
            VS
          </div>

          {/* Left: Generic Tour */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-200 p-8 md:p-12 rounded-3xl md:rounded-l-3xl md:rounded-r-none grayscale text-gray-600 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Skull className="w-32 h-32" />
            </div>
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="bg-gray-400 text-white px-3 py-1 text-sm rounded font-mono">OTHER</span>
              Generic Tours
            </h3>
            <ul className="space-y-6 text-lg font-medium">
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <span>Boring shopping centers you didn't ask for</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <span>"K-pop" spots from 10 years ago</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <span>Guides who don't know your bias</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <span>Awkward group photos</span>
              </li>
            </ul>
          </motion.div>

          {/* Right: Duckmate Tour */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border-4 border-kpop-pink p-8 md:p-12 rounded-3xl md:rounded-r-3xl md:rounded-l-none shadow-[12px_12px_0px_0px_rgba(255,0,128,0.2)] relative overflow-hidden z-10"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
              <Heart className="w-32 h-32 text-kpop-pink fill-kpop-pink" />
            </div>
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-3 text-kpop-pink">
              <span className="bg-kpop-pink text-white px-3 py-1 text-sm rounded font-mono">DUCKMATE</span>
              Real Fan Tour
            </h3>
            <ul className="space-y-6 text-lg font-bold">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-kpop-blue shrink-0 mt-1" />
                <span>Only spots relevant to YOUR FANDOM</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-kpop-blue shrink-0 mt-1" />
                <span>Latest trending cafes & pop-ups</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-kpop-blue shrink-0 mt-1" />
                <span>Guides who are actual fans (Duckmates)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-kpop-blue shrink-0 mt-1" />
                <span>High-quality aesthetic photos provided</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}


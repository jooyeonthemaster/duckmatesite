"use client";

import { motion } from "framer-motion";

const GROUPS = [
  "BTS", "SEVENTEEN", "NEWJEANS", "STRAY KIDS", "AESPA", "NCT", "BLACKPINK", "TWICE", "IVE", "TXT", "LE SSERAFIM", "ATEEZ", "ENHYPEN"
];

export default function Marquee() {
  return (
    <div className="w-full bg-kpop-lime border-y-2 border-black py-4 overflow-hidden -rotate-1 relative z-20">
      <div className="flex whitespace-nowrap">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
          className="flex gap-8 pr-8"
        >
          {[...GROUPS, ...GROUPS, ...GROUPS, ...GROUPS].map((group, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-4xl font-display font-bold text-black tracking-tight">
                {group}
              </span>
              <span className="w-3 h-3 bg-black rounded-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}


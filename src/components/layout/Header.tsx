"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md py-3 border-b border-gray-100" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link href="/" className="relative group">
          <span className="text-3xl font-display tracking-tighter text-foreground group-hover:text-kpop-pink transition-colors duration-300">
            DUCKMATE
          </span>
          <motion.div 
            className="absolute -bottom-1 left-0 w-0 h-1 bg-kpop-pink"
            whileHover={{ width: "100%" }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {["About", "Courses", "Reviews", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="hover:text-kpop-purple transition-colors text-sm uppercase tracking-widest"
            >
              {item}
            </Link>
          ))}
          <button className="bg-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-kpop-pink hover:scale-105 transition-all duration-300 active:scale-95">
            Join Waitlist
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 md:hidden flex flex-col gap-4 shadow-xl"
        >
          {["About", "Courses", "Reviews", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-lg font-bold hover:text-kpop-pink"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}


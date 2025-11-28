"use client";

import { motion } from "framer-motion";
import { Search, Map, UserCheck, Sparkles } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Pick Your Fandom",
    description: "Tell us who you stan. We curate the world based on your bias.",
    icon: <Search className="w-6 h-6" />,
    color: "bg-kpop-pink",
    rotate: "-rotate-2",
  },
  {
    id: "02",
    title: "Choose a Course",
    description: "Birthday cafe crawl? MV filming spots? Music show commute? We have it all.",
    icon: <Map className="w-6 h-6" />,
    color: "bg-kpop-blue",
    rotate: "rotate-1",
  },
  {
    id: "03",
    title: "Meet Fan Guide",
    description: "Connect with a local Korean fan who speaks your language and shares your passion.",
    icon: <UserCheck className="w-6 h-6" />,
    color: "bg-kpop-lime",
    rotate: "-rotate-1",
  },
  {
    id: "04",
    title: "Real Experience",
    description: "No shopping scams. Just pure fangirling/fanboying with your new bestie.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "bg-kpop-purple",
    rotate: "rotate-2",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold leading-none"
          >
            HOW TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kpop-lime to-kpop-blue">DUCKMATE</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 max-w-sm text-right"
          >
            Your journey from "Online Fan" to "Local Insider" in 4 simple steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative group ${step.rotate}`}
            >
              {/* Connector Line (Desktop only) */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-1 bg-white/20 z-0" />
              )}

              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl h-full hover:bg-gray-800 transition-colors relative overflow-hidden group-hover:border-gray-600">
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${step.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500`}>
                    {step.id}
                  </span>
                  <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-black`}>
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


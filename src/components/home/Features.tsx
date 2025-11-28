"use client";

import { motion } from "framer-motion";
import { Camera, Coffee, Music4, Ticket } from "lucide-react";

const features = [
  {
    title: "Music Show Commute",
    description: "See your idols on their way to work. The real fan culture experience.",
    icon: <Music4 className="w-8 h-8" />,
    color: "bg-kpop-pink",
  },
  {
    title: "Birthday Cafes",
    description: "Visit the cup-sleeve events organized by Korean fans tailored for your bias.",
    icon: <Coffee className="w-8 h-8" />,
    color: "bg-kpop-purple",
  },
  {
    title: "MV Locations",
    description: "Take the perfect photo at the exact spot where the music video was filmed.",
    icon: <Camera className="w-8 h-8" />,
    color: "bg-kpop-blue",
  },
  {
    title: "Pop-up Stores",
    description: "Fast pass access strategies for the hottest K-pop pop-up stores in Seoul.",
    icon: <Ticket className="w-8 h-8" />,
    color: "bg-kpop-lime",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="container-custom">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            CURATED BY <br />
            <span className="text-kpop-blue inline-block transform -rotate-2 decoration-wavy underline decoration-kpop-pink">KOREAN FANS</span>
          </h2>
          <p className="text-gray-500 text-lg">
            We don&apos;t do generic "Gangnam Style" tours. We do the deep cuts. 
            The places that actually matter to the fandom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl border-2 border-black bg-white hover:-translate-y-2 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-6 border-2 border-black`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


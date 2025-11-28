"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Star, ExternalLink, Heart } from "lucide-react";
import Image from "next/image";
import crawledData from "@/data/crawled_courses.json";

// Static Mock Data (Fallbacks or Curated)
const STATIC_COURSES = [
  {
    id: 'woonhak-static',
    title: "WOONHAK'S 18th BIRTHDAY TOUR",
    curator: "ONEDOOR Global",
    date: "2024.11.29 - 12.04",
    description: "The ultimate course for Woonhak's birthday. Includes main cafe events in Hongdae and the subway ad route.",
    likes: 1204,
    spots: [
      {
        name: "Cafe Lovher",
        type: "Main Birthday Cafe",
        location: "Mapo-gu, Seoul",
        time: "10:00 AM - 8:00 PM",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
      },
      {
        name: "Photoism Box Hongdae",
        type: "Limited Frame Event",
        location: "Hongdae Street",
        time: "24 Hours",
        image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=1000&auto=format&fit=crop",
      },
      {
        name: "Hapjeong Station Ad",
        type: "Subway CM Board",
        location: "Exit 5, Hapjeong Stn",
        time: "All Day",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop",
      }
    ]
  }
];

// Combine Static + Crawled
const COURSES = [...STATIC_COURSES, ...crawledData];

export default function CourseList() {
  return (
    <section id="courses" className="py-24 bg-background relative">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-4 text-kpop-pink">
              LIVE COURSES
            </h2>
            <p className="text-xl text-gray-500">
              Real-time courses uploaded by verified fandoms.
              <span className="ml-2 px-2 py-1 bg-black text-white text-xs rounded-full">
                {crawledData.length > 0 ? 'LIVE DATA CONNECTED' : 'MOCK DATA'}
              </span>
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-lg font-bold border-b-2 border-black pb-1 hover:text-kpop-pink hover:border-kpop-pink transition-colors">
            View All {1200 + crawledData.reduce((acc, c) => acc + c.spots.length, 0)} Spots <ExternalLink className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-12">
          {COURSES.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Course Header */}
              <div className="bg-black text-white p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-kpop-lime mb-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> Curated by {course.curator}
                    </span>
                    {"date" in course && course.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {course.date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Heart className="w-5 h-5 fill-kpop-pink text-kpop-pink" />
                  <span className="font-bold">{course.likes}</span>
                </div>
              </div>

              {/* Course Body (Timeline) */}
              <div className="p-8">
                <p className="text-gray-600 mb-8 font-medium text-lg">
                  {course.description}
                </p>

                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200" />

                  <div className="space-y-8">
                    {course.spots.map((spot, idx) => (
                      <div key={idx} className="relative flex gap-6 group">
                        {/* Dot */}
                        <div className="relative z-10 w-10 h-10 rounded-full bg-white border-4 border-black flex items-center justify-center shrink-0 group-hover:border-kpop-blue transition-colors">
                          <span className="font-bold text-sm">{idx + 1}</span>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex gap-4 hover:bg-kpop-bg transition-colors border border-transparent hover:border-kpop-blue/20">
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-200 relative">
                             {spot.image ? (
                               <Image
                                 src={spot.image}
                                 alt={spot.name}
                                 fill
                                 className="object-cover group-hover:scale-110 transition-transform duration-500"
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400">
                                 <MapPin className="w-8 h-8" />
                               </div>
                             )}
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-xs font-bold text-kpop-purple uppercase tracking-wide mb-1">
                              {spot.type}
                            </span>
                            <h4 className="text-xl font-bold mb-1">{spot.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {spot.location}
                              </span>
                              {"time" in spot && spot.time && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{spot.time}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
}

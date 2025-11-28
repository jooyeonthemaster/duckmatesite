"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import crawledData from "@/data/crawled_courses.json";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop";

export default function FeaturedCourses() {
  // Use first 3 items from crawled data
  const featured = crawledData.slice(0, 3);

  return (
    <section id="courses" className="py-24 bg-white border-b-2 border-black">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-none">
              TRENDING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kpop-pink to-kpop-blue">COURSES</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Don't know where to start? Check out what other fans are visiting right now.
            </p>
          </div>
          
          <Link href="/courses">
            <button className="hidden md:flex group items-center gap-3 text-xl font-bold px-8 py-4 bg-black text-white rounded-full hover:bg-kpop-pink transition-colors">
              View All Courses 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {featured.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="min-w-[320px] md:min-w-[400px] bg-gray-50 border-2 border-black rounded-3xl overflow-hidden relative group cursor-pointer hover:-translate-y-2 transition-transform duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="h-64 relative bg-gray-200">
                <Image
                  src={course.spots?.[0]?.image || FALLBACK_IMAGE}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 left-4 bg-kpop-lime text-black px-3 py-1 rounded-full text-xs font-bold uppercase border border-black">
                  Trending
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Star className="w-4 h-4 fill-kpop-pink text-kpop-pink" /> 
                  <span>{course.likes || 0} Fans liked this</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 leading-tight">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-400">
                  Curated by {course.curator || "Duckmate"}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* 'See More' Card */}
          <Link href="/courses" className="min-w-[200px] flex flex-col items-center justify-center bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 hover:border-kpop-pink hover:bg-kpop-bg/20 transition-colors group">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-gray-200 mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-kpop-pink" />
            </div>
            <span className="font-bold text-gray-400 group-hover:text-kpop-pink">Explore All</span>
          </Link>
        </div>

        <div className="mt-8 md:hidden">
          <Link href="/courses">
            <button className="w-full py-4 bg-black text-white rounded-xl font-bold">
              View All Courses
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}


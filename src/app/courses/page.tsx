"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseGrid from "@/components/courses/CourseGrid";

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-16 container-custom text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-display font-bold mb-6"
        >
          ALL COURSES
        </motion.h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
          Explore thousands of fan-curated courses. From birthday cafes to MV locations.
        </p>
      </div>
      
      <CourseGrid />
      
      <Footer />
    </main>
  );
}


import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Marquee from "@/components/home/Marquee";
import HowItWorks from "@/components/home/HowItWorks";
import Comparison from "@/components/home/Comparison";
import Reviews from "@/components/home/Reviews";
import CallToAction from "@/components/home/CallToAction";
import FeaturedCourses from "@/components/home/FeaturedCourses";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <Marquee />
      <FeaturedCourses /> {/* Simplified teaser section */}
      <Features />
      <Comparison />
      <HowItWorks />
      <Reviews />
      <CallToAction />
      <Footer />
    </main>
  );
}

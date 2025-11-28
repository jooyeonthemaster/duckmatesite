"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, Share2 } from "lucide-react";

const reviews = [
  {
    username: "@hannie_luv",
    avatar: "bg-kpop-pink",
    content: "I literally cried at the birthday cafe. The guide helped me write a letter in Korean to leave there. Best experience ever! 😭💖 #Duckmate #Seventeen",
    likes: "12.4K",
    type: "twitter"
  },
  {
    username: "skz_stay_forever",
    avatar: "bg-black",
    content: "Thought it was just a tour, but we ended up doing the random play dance at Hongdae lol. My Duckmate guide has moves!!",
    likes: "8.2K",
    type: "insta"
  },
  {
    username: "newjeans_bunnies",
    avatar: "bg-kpop-blue",
    content: "They took me to the exact spot where Minji took that selfie. Photo quality is insane. WORTH IT.",
    likes: "5.1K",
    type: "twitter"
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-center mb-16">
          FAN REVIEWS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white border-2 border-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${review.avatar}`} />
                <div>
                  <p className="font-bold text-sm">{review.username}</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
              </div>
              <p className="text-gray-800 mb-4 font-medium leading-relaxed">
                {review.content}
              </p>
              <div className="flex items-center gap-6 text-gray-400 text-sm border-t pt-4 border-gray-50">
                <div className="flex items-center gap-1 hover:text-kpop-pink cursor-pointer transition-colors">
                  <Heart className="w-4 h-4" /> {review.likes}
                </div>
                <div className="flex items-center gap-1 hover:text-kpop-blue cursor-pointer transition-colors">
                  <MessageCircle className="w-4 h-4" /> Reply
                </div>
                <div className="flex items-center gap-1 hover:text-kpop-lime cursor-pointer transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


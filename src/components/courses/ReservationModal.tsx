"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, Users, Calendar, MapPin, MessageSquare, Check, Loader2 } from "lucide-react";
import Image from "next/image";

interface EventData {
  id: string;
  title: string;
  location: string;
  date: string;
  imageUrl: string;
  localImageUrl?: string;
  idolName: string;
  idolGroup: string;
  eventTypes?: string[];
  goods?: string[];
  detailUrl: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
}

export default function ReservationModal({ isOpen, onClose, event }: ReservationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    people: "1",
    selectedGoods: [] as string[],
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    // 3초 후 모달 닫기
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        people: "1",
        selectedGoods: [],
        message: "",
      });
      onClose();
    }, 2500);
  };

  const toggleGood = (good: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGoods: prev.selectedGoods.includes(good)
        ? prev.selectedGoods.filter((g) => g !== good)
        : [...prev.selectedGoods, good],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden flex flex-col"
          >
            {/* 성공 오버레이 */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">예약 접수 완료!</h3>
                  <p className="text-gray-600">확인 메시지가 곧 발송됩니다.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 헤더 */}
            <div className="relative bg-gradient-to-r from-kpop-pink to-purple-500 p-4 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-4">
                {/* 이벤트 썸네일 */}
                <div className="relative w-20 h-28 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
                  <Image
                    src={event.localImageUrl || event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-bold mb-1">
                    {event.idolName} · {event.idolGroup}
                  </div>
                  <h2 className="font-bold text-lg leading-tight line-clamp-2 mb-2">
                    {event.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm opacity-90">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date || "날짜 미정"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location || "위치 미정"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 폼 내용 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 이름 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <User className="w-4 h-4 text-kpop-pink" />
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-kpop-pink focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] transition-all"
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Phone className="w-4 h-4 text-kpop-pink" />
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-kpop-pink focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] transition-all"
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Mail className="w-4 h-4 text-kpop-pink" />
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-kpop-pink focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] transition-all"
                />
              </div>

              {/* 인원 수 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Users className="w-4 h-4 text-kpop-pink" />
                  방문 인원 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {["1", "2", "3", "4", "5+"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, people: num })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        formData.people === num
                          ? "bg-kpop-pink text-white border-kpop-pink shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black border-black hover:border-kpop-pink"
                      }`}
                    >
                      {num}명
                    </button>
                  ))}
                </div>
              </div>

              {/* 굿즈 선택 */}
              {event.goods && event.goods.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <span className="text-kpop-pink">🎁</span>
                    관심 굿즈 선택 (복수 선택 가능)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {event.goods.map((good) => (
                      <button
                        key={good}
                        type="button"
                        onClick={() => toggleGood(good)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          formData.selectedGoods.includes(good)
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {formData.selectedGoods.includes(good) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {good}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 메시지 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-2">
                  <MessageSquare className="w-4 h-4 text-kpop-pink" />
                  요청사항
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="특별히 요청하실 사항이 있으시면 적어주세요."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-kpop-pink focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)] transition-all resize-none"
                />
              </div>

              {/* 안내 */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-bold text-black mb-1">📢 안내사항</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>예약 접수 후 확인 연락을 드립니다.</li>
                  <li>현장 상황에 따라 대기가 있을 수 있습니다.</li>
                  <li>취소는 방문 하루 전까지 가능합니다.</li>
                </ul>
              </div>
            </form>

            {/* 하단 버튼 */}
            <div className="p-4 border-t-2 border-black bg-gray-50">
              <div className="flex gap-3">
                <a
                  href={event.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 text-center font-bold border-2 border-black rounded-xl hover:bg-gray-100 transition-colors"
                >
                  상세 정보 보기
                </a>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name || !formData.phone}
                  className="flex-1 py-3 bg-kpop-pink text-white font-bold border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      접수 중...
                    </>
                  ) : (
                    "예약 접수하기"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

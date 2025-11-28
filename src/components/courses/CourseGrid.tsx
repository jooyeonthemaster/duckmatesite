"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import Image from "next/image";
import ReservationModal from "./ReservationModal";

// 모든 아이돌 이벤트 데이터 임포트
import events65 from "@/data/crawled_events.json";
import events62 from "@/data/events_62.json";
import events27 from "@/data/events_27.json";
import events355 from "@/data/events_355.json";
import events34 from "@/data/events_34.json";
import events24 from "@/data/events_24.json";

// 아이돌 목록
const IDOL_DATA = [
  { id: 65, name: "운학", group: "BOYNEXTDOOR", data: events65 },
  { id: 62, name: "명재현", group: "BOYNEXTDOOR", data: events62 },
  { id: 27, name: "수빈", group: "TXT", data: events27 },
  { id: 355, name: "도영", group: "TREASURE", data: events355 },
  { id: 34, name: "성훈", group: "ENHYPEN", data: events34 },
  { id: 24, name: "진", group: "BTS", data: events24 },
];

export default function CourseGrid() {
  const [selectedIdolId, setSelectedIdolId] = useState<number | "all">("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 클라이언트 사이드 마운트 후 로드
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 선택된 아이돌에 따른 이벤트 필터링
  const { events, selectedIdol, totalEvents } = useMemo(() => {
    if (selectedIdolId === "all") {
      // 모든 아이돌 이벤트 합치기
      const allEvents = IDOL_DATA.flatMap((idol) =>
        (idol.data.events || []).map((event: any) => ({
          ...event,
          idolName: idol.name,
          idolGroup: idol.group,
        }))
      );
      return {
        events: allEvents,
        selectedIdol: null,
        totalEvents: allEvents.length,
      };
    }

    const idol = IDOL_DATA.find((i) => i.id === selectedIdolId);
    if (!idol) return { events: [], selectedIdol: null, totalEvents: 0 };

    return {
      events: (idol.data.events || []).map((event: any) => ({
        ...event,
        idolName: idol.name,
        idolGroup: idol.group,
      })),
      selectedIdol: idol,
      totalEvents: idol.data.events?.length || 0,
    };
  }, [selectedIdolId]);

  // 총 이벤트 수 계산
  const totalAllEvents = IDOL_DATA.reduce(
    (sum, i) => sum + (i.data.events?.length || 0),
    0
  );

  return (
    <section className="container-custom pb-32">
      {/* 아이돌 필터 버튼들 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-kpop-pink" />
          <span className="font-bold text-lg">아이돌 선택</span>
          <span className="text-sm text-gray-500">
            ({totalEvents}개 이벤트)
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* 전체 버튼 */}
          <button
            onClick={() => setSelectedIdolId("all")}
            className={`px-5 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${
              selectedIdolId === "all"
                ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(236,72,153,1)]"
                : "bg-white text-black border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
            }`}
          >
            전체
            <span className="ml-2 text-xs opacity-70">{totalAllEvents}</span>
          </button>

          {/* 아이돌 버튼들 */}
          {IDOL_DATA.map((idol) => (
            <button
              key={idol.id}
              onClick={() => setSelectedIdolId(idol.id)}
              className={`px-5 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${
                selectedIdolId === idol.id
                  ? "bg-kpop-pink text-white border-kpop-pink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black border-black hover:border-kpop-pink hover:shadow-[4px_4px_0px_0px_rgba(236,72,153,0.5)] hover:-translate-y-1"
              }`}
            >
              <span>{idol.name}</span>
              <span className={`ml-2 text-xs ${
                selectedIdolId === idol.id ? "opacity-70" : "text-kpop-pink"
              }`}>
                {idol.group}
              </span>
              <span className="ml-2 text-xs opacity-70">
                {idol.data.events?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 아이돌 정보 */}
      {selectedIdol && (
        <div className="mb-8 p-4 bg-gradient-to-r from-kpop-pink/10 to-purple-100/50 rounded-xl border-2 border-kpop-pink/30">
          <p className="font-bold text-lg">
            {selectedIdol.name}
            <span className="ml-2 text-kpop-pink">{selectedIdol.group}</span>
          </p>
          <p className="text-sm text-gray-600">
            {totalEvents}개의 생일카페 이벤트 • 업데이트:{" "}
            {new Date(selectedIdol.data.crawledAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      )}

      {/* 이벤트 그리드 */}
      {isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any, index: number) => (
            <motion.div
              key={`${event.idolName}-${event.id}`}
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.3 }}
              className="group bg-white border-2 border-black rounded-2xl overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
              {/* 이미지 */}
              <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden border-b-2 border-black">
                <Image
                  src={event.localImageUrl || event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* 아이돌 배지 (전체 보기 시) */}
                {selectedIdolId === "all" && (
                  <div className="absolute top-4 right-4 bg-kpop-pink text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                    {event.idolName}
                  </div>
                )}

                {/* 지역 배지 */}
                {event.region && (
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                    {event.region}
                  </div>
                )}

                {/* 하단 정보 (이미지 위) */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-display font-bold mb-1 leading-tight line-clamp-2 drop-shadow-lg">
                    {event.title}
                  </h3>
                  <p className="text-sm opacity-90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.location || "위치 미정"}
                  </p>
                </div>
              </div>

              {/* 카드 바디 */}
              <div className="p-4">
                {/* 날짜 */}
                {event.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                )}

                {/* 이벤트 타입 태그 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.eventTypes?.slice(0, 3).map((type: string) => (
                    <span
                      key={type}
                      className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* 굿즈 리스트 */}
                {event.goods && event.goods.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.goods.slice(0, 4).map((item: string) => (
                      <span
                        key={item}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {item}
                      </span>
                    ))}
                    {event.goods.length > 4 && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        +{event.goods.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* 하단 */}
                <div className="flex items-center justify-between text-sm font-bold border-t border-gray-100 pt-3">
                  <span className="text-kpop-pink text-xs">예약하기</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 로딩 상태 */}
      {!isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 border-2 border-gray-200 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {isLoaded && events.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">이벤트가 없습니다.</p>
        </div>
      )}

      {/* 예약 모달 */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </section>
  );
}

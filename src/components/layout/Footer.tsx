import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-foreground text-background py-12 md:py-20 overflow-hidden relative">
      {/* Decorative big text background - optional kitschy element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <div className="text-[20vw] font-display leading-none whitespace-nowrap">
          DUCKMATE KPOP TOUR
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <h2 className="text-6xl font-display text-kpop-lime tracking-tighter">
              DUCKMATE
            </h2>
            <p className="text-xl max-w-md font-medium text-gray-400">
              The only K-pop tour platform curated by real fandoms.
              <br />
              Don&apos;t just watch, experience it.
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-4 text-sm text-gray-400">
            <div className="font-display text-2xl text-white mb-4">
              CONTACT
            </div>
            <div className="text-right">
              <p>2025 일해라 컴퍼니 (Ilhaera Company)</p>
              <p>CEO: Kim Joo-yeon</p>
              <p>Business Registration: 715-13-02963</p>
              <p className="mt-2">Seoul, Republic of Korea</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; 2025 DUCKMATE. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-kpop-pink transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-kpop-pink transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


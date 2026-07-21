import React from "react";

interface SocialDevProps {
  variant?: "compact" | "full" | "footer-column";
}

// Highly precise brand SVGs matching the official logos
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.004 2C6.48 2 2.004 6.48 2.004 12c0 1.73.44 3.36 1.21 4.79L2 22l5.35-1.39c1.4.74 2.98 1.17 4.65 1.17 5.52 0 10-4.48 10-10s-4.48-10-10-10zm6.18 14.21c-.25.7-.1.95-.56 1.5-.43.52-1.32 1.05-1.92 1.1-.55.05-1.12.1-3.66-.92-3.15-1.27-5.12-4.52-5.28-4.73-.16-.21-1.28-1.7-1.28-3.24s.8-2.3 1.08-2.6c.28-.3.61-.38.82-.38.21 0 .43.01.62.02.2.01.46-.08.72.54.27.65.92 2.25 1 2.41.08.16.13.35.03.56-.1.21-.21.36-.42.59-.21.23-.44.52-.63.7-.21.21-.43.44-.19.85.24.41.97 1.6 2.08 2.59 1.43 1.28 2.63 1.68 3.04 1.88.41.2.65.17.9-.12.25-.29 1.08-1.26 1.37-1.69.29-.43.58-.36.98-.21.41.15 2.59 1.22 2.75 1.3.16.08.27.12.33.22.06.1.06.57-.19 1.27z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.96-1.72-.01 2.92 0 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.93-1.31 1.92-3.58 3.14-5.91 3.11-2.58-.04-5.05-1.52-6.23-3.81-1.32-2.44-1.12-5.63.55-7.88 1.4-1.95 3.82-3 6.22-2.7v4.11c-1.25-.13-2.53.31-3.32 1.29-.98 1.14-1.04 2.87-.2 4.09.84 1.27 2.45 1.97 3.95 1.72 1.42-.17 2.61-1.25 2.91-2.65.1-.47.11-.95.1-1.43V.02h-.02z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.59-3.27 3.61-1.5 4.36-1.76 4.85-1.77.11 0 .35.03.5.15.13.1.16.23.18.33.02.1-.01.3-.02.4z" />
  </svg>
);

export default function SocialDev({ variant = "full" }: SocialDevProps) {
  const profileImg = "https://www.rhmt.biz.id/gambar/pp-dev.png";
  const whatsappUrl = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
  const instagramUrl = "https://www.instagram.com/rahmt_nhw?igsh=MWQwcnB3bTA2ZnVidg==";
  const tiktokUrl = "https://www.tiktok.com/@r_hmtofc?_r=1&_t=ZS-94KRfWQjeUu";
  const telegramUrl = "https://t.me/rAi_engine";
  const personalWebUrl = "https://www.rhmt.biz.id/";

  // Social Dev Layout matching the requested mockup screenshot precisely
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 bg-[#0a0b0d] rounded-3xl border border-zinc-900/40">
      {/* 1. Sleek Rounded Dark Card - Precise proportions */}
      <div className="max-w-[350px] w-full bg-[#111214] border border-zinc-800/60 rounded-[1.8rem] p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#00a884]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Profile Avatar with exact styling */}
        <div className="relative mx-auto w-[76px] h-[76px] rounded-full flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border border-zinc-700/60 animate-pulse" />
          <img
            src={profileImg}
            alt="[𝙍]𝙝𝙢𝙏 Profile"
            referrerPolicy="no-referrer"
            className="w-[70px] h-[70px] rounded-full object-cover border-2 border-[#111214]"
          />
          {/* Active Online Indicator Pulse */}
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-[2px] border-[#111214]" />
        </div>

        {/* Developer Custom Star Name */}
        <h3 className="text-white font-extrabold text-[14px] sm:text-[14.5px] tracking-wide flex items-center justify-center gap-1.5 mb-2.5">
          <span className="text-zinc-400">✨•° :</span>
          <span className="text-white font-black">[𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡</span>
          <span className="text-zinc-400">:•° ✨</span>
        </h3>

        {/* Beautiful Description Text */}
        <p className="text-[11px] sm:text-[11.5px] text-zinc-400 leading-relaxed font-normal max-w-xs mx-auto mb-5 px-1">
          Gabung saluran WhatsApp resmi sekarang untuk update script, engine AI, template desain, dan diskusi pemrograman gratis.
        </p>

        {/* Custom Green WhatsApp Channel Button with direct cursor and smooth hover */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#008f72] active:scale-95 text-white font-extrabold text-[11.5px] px-6 py-2.5 rounded-full transition-all duration-200 shadow-md cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-white flex-shrink-0" />
          <span>Join Channel WA</span>
        </a>
      </div>

      {/* 2. Media Links & Credit Section Below Card */}
      <div className="w-full flex flex-col items-center mt-10">
        <h4 className="text-[9.5px] font-black text-zinc-500 font-mono tracking-[0.25em] text-center mb-5 uppercase">
          SOCIAL MEDIA DEVELOPER
        </h4>

        {/* Row of centered circular icons with hover brand effects */}
        <div className="flex items-center gap-3.5 justify-center">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Channel"
            className="w-[44px] h-[44px] rounded-full border border-zinc-800/80 bg-[#111214] hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <WhatsAppIcon className="w-4.5 h-4.5" />
          </a>

          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-[44px] h-[44px] rounded-full border border-zinc-800/80 bg-[#111214] hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-pink-500 hover:border-pink-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <InstagramIcon className="w-4.5 h-4.5" />
          </a>

          {/* TikTok */}
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
            className="w-[44px] h-[44px] rounded-full border border-zinc-800/80 bg-[#111214] hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-purple-400 hover:border-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <TikTokIcon className="w-4.5 h-4.5" />
          </a>

          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram"
            className="w-[44px] h-[44px] rounded-full border border-zinc-800/80 bg-[#111214] hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-sky-400 hover:border-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <TelegramIcon className="w-4.5 h-4.5" />
          </a>
        </div>

        {/* Divider Line precisely matching the design */}
        <div className="w-full max-w-[320px] border-t border-zinc-900/80 my-7" />

        {/* Beautiful footer branding credits */}
        <p className="text-[11px] text-zinc-500 font-mono tracking-wide text-center">
          Credit by{" "}
          <a
            href={personalWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-extrabold hover:underline transition-colors"
          >
            rhmt
          </a>{" "}
          &amp; source by{" "}
          <span className="text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors">
            ditzz
          </span>
          {" "}.
        </p>

        {/* WhatsApp Direct Link text with arrow */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 transition-colors mt-3 font-mono cursor-pointer"
        >
          <span>WhatsApp Rhmt</span>
          <span className="text-[11px] font-sans">➔</span>
        </a>
      </div>
    </div>
  );
}

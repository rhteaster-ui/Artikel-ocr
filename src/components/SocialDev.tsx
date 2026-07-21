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
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

  if (variant === "footer-column") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <img
            src={profileImg}
            alt="Profile Dev"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-brand-primary/60 object-cover"
          />
          <div>
            <h4 className="text-[11px] font-black text-brand-text truncate leading-tight">
              [𝙍]𝙝𝙢𝙏
            </h4>
            <p className="text-[8px] text-brand-muted font-mono truncate tracking-wider mt-0.5">
              CODE &amp; AI DEVELOPER
            </p>
          </div>
        </div>
        <p className="text-[10px] text-brand-muted leading-relaxed">
          Platform Veritas dikembangkan oleh [𝙍]𝙝𝙢𝙏 untuk memajukan integritas literasi ilmiah berbasis AI.
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-3 pt-3 border-t border-brand-bg">
        <div className="flex items-center gap-2">
          <img
            src={profileImg}
            alt="Profile Dev"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full border border-brand-primary/40 object-cover"
          />
          <div>
            <h4 className="text-[10px] font-bold text-brand-text">[𝙍]𝙝𝙢𝙏</h4>
            <p className="text-[8px] text-brand-muted font-mono">CODE &amp; AI DEVELOPER</p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold transition-all"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>Join WhatsApp Channel</span>
        </a>
      </div>
    );
  }

  // Social Dev Layout matching the requested mockup precisely - NO CARD WRAPPER
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-transparent text-center select-none">
      {/* 1. Main Avatar, Title, Description, and Channel Button (No card block around them) */}
      <div className="max-w-[420px] w-full flex flex-col items-center">
        {/* Circular Profile Avatar with glowing neon-emerald backdrop/halo circle */}
        <div className="relative mx-auto w-[84px] h-[84px] rounded-full flex items-center justify-center mb-5 bg-gradient-to-tr from-emerald-400 to-teal-400 p-[3.5px] shadow-[0_0_22px_rgba(52,211,153,0.65)]">
          <img
            src={profileImg}
            alt="[𝙍]𝙝𝙢𝙏 Profile"
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover border-[3px] border-black"
          />
          {/* Active Online Indicator Pulse */}
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black" />
        </div>

        {/* Developer Custom Star Name */}
        <h3 className="text-white font-extrabold text-[15px] sm:text-[16px] tracking-wide flex items-center justify-center gap-1.5 mb-3">
          <span className="text-emerald-400">✨•° :</span>
          <span className="text-white font-black tracking-wide">[𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡</span>
          <span className="text-emerald-400">:•° ✨</span>
        </h3>

        {/* Beautiful Description Text - Bright and High Contrast */}
        <p className="text-[12px] sm:text-[12.5px] text-zinc-200 leading-relaxed font-normal max-w-sm mx-auto mb-6 px-2">
          Gabung saluran WhatsApp resmi sekarang untuk update script, engine AI, template desain, dan diskusi pemrograman gratis.
        </p>

        {/* Custom Green WhatsApp Channel Button with smooth hover and bright contrast */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 bg-[#00e676] hover:bg-[#00c853] active:scale-95 text-black font-extrabold text-[12.5px] tracking-wide px-9 py-3 rounded-full transition-all duration-200 shadow-[0_4px_15px_rgba(0,230,118,0.35)] cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-black flex-shrink-0" />
          <span>Join Channel WA</span>
        </a>
      </div>

      {/* 2. Media Links & Credit Section */}
      <div className="w-full flex flex-col items-center mt-12">
        <h4 className="text-[10px] font-black text-zinc-400 font-mono tracking-[0.25em] text-center mb-5 uppercase">
          SOCIAL MEDIA DEVELOPER
        </h4>

        {/* Row of centered circular icons with high contrast bright white icons */}
        <div className="flex items-center gap-4.5 justify-center">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Channel"
            className="w-[46px] h-[46px] rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white hover:text-emerald-400 hover:border-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
          >
            <WhatsAppIcon className="w-5 h-5 text-white hover:text-emerald-400 transition-colors" />
          </a>

          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-[46px] h-[46px] rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white hover:text-pink-500 hover:border-pink-500 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
          >
            <InstagramIcon className="w-5 h-5 text-white hover:text-pink-500 transition-colors" />
          </a>

          {/* TikTok */}
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
            className="w-[46px] h-[46px] rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white hover:text-purple-400 hover:border-purple-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
          >
            <TikTokIcon className="w-5 h-5 text-white hover:text-purple-400 transition-colors" />
          </a>

          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram"
            className="w-[46px] h-[46px] rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white hover:text-sky-400 hover:border-sky-400 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
          >
            <TelegramIcon className="w-5 h-5 text-white hover:text-sky-400 transition-colors" />
          </a>
        </div>

        {/* Divider Line precisely matching the design - brightened */}
        <div className="w-full max-w-[340px] border-t border-zinc-800/60 my-9" />

        {/* WhatsApp Direct Link text with arrow - shifted slightly down with extra margin */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-zinc-300 hover:text-emerald-400 transition-colors mt-2 font-mono cursor-pointer"
        >
          <span>WhatsApp Rhmt</span>
          <span className="text-[12px] font-sans">➔</span>
        </a>
      </div>
    </div>
  );
}

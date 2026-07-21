import React from "react";
import { Globe, Cpu } from "lucide-react";

interface SocialDevProps {
  variant?: "compact" | "full";
}

// High-fidelity official brand SVG icons
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
    strokeWidth="2"
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
  const devName = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";
  
  const socialLinks = [
    {
      name: "WhatsApp Channel",
      label: "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧",
      url: "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p",
      icon: WhatsAppIcon,
      color: "hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5",
      brandColor: "text-emerald-500",
    },
    {
      name: "Instagram",
      label: "@rahmt_nhw",
      url: "https://www.instagram.com/rahmt_nhw?igsh=MWQwcnB3bTA2ZnVidg==",
      icon: InstagramIcon,
      color: "hover:text-pink-500 hover:border-pink-500/30 hover:bg-pink-500/5",
      brandColor: "text-pink-500",
    },
    {
      name: "TikTok",
      label: "@r_hmtofc",
      url: "https://www.tiktok.com/@r_hmtofc?_r=1&_t=ZS-94KRfWQjeUu",
      icon: TikTokIcon,
      color: "hover:text-purple-500 hover:border-purple-500/30 hover:bg-purple-500/5",
      brandColor: "text-purple-400",
    },
    {
      name: "Telegram",
      label: "rAi_engine",
      url: "https://t.me/rAi_engine",
      icon: TelegramIcon,
      color: "hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5",
      brandColor: "text-sky-400",
    },
    {
      name: "Profil Dev",
      label: "rhmt.biz.id",
      url: "https://www.rhmt.biz.id/",
      icon: Globe,
      color: "hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5",
      brandColor: "text-brand-primary",
    }
  ];

  if (variant === "compact") {
    return (
      <div className="space-y-3 pt-3 border-t border-brand-bg">
        <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-black uppercase tracking-wider font-mono">
          <Cpu className="w-3.5 h-3.5 text-brand-primary" />
          <span>Hubungi Pengembang (Dev)</span>
        </div>
        
        <div className="bg-brand-bg/40 p-3 rounded-2xl border border-brand-surface space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={profileImg}
                alt="Profile Dev"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-brand-primary object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-brand-surface" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-brand-text truncate leading-tight">
                [𝙍]𝙝𝙢𝙏
              </h4>
              <p className="text-[9px] text-brand-muted font-mono truncate tracking-wider mt-0.5">
                CODE &amp; AI DEVELOPER
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {socialLinks.map((social) => {
              const IconComp = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between gap-2.5 p-2 rounded-xl bg-brand-surface/70 border border-brand-surface/40 text-xs font-semibold text-brand-text transition-all ${social.color}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComp className={`w-3.5 h-3.5 flex-shrink-0 ${social.brandColor}`} />
                    <span className="truncate text-[10px] text-brand-muted">{social.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold truncate ${social.brandColor}`}>
                    {social.label.replace("✧･ﾟ: ", "").replace(" :･ﾟ✧", "")}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full developer profile card
  return (
    <div className="w-full bg-brand-surface border border-brand-surface/80 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-brand-bg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-md animate-pulse" />
            <img
              src={profileImg}
              alt="Profile Dev"
              referrerPolicy="no-referrer"
              className="relative w-14 h-14 rounded-full border-2 border-brand-primary object-cover shadow-md"
            />
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-brand-surface" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-brand-text">
                {devName}
              </h3>
            </div>
            <p className="text-xs font-mono font-bold text-brand-primary uppercase tracking-widest mt-1">
              Social Developer &amp; AI Engineer
            </p>
          </div>
        </div>
        <div className="bg-brand-primary/5 border border-brand-primary/10 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-brand-primary font-mono uppercase tracking-wider">
            Verified Creator
          </span>
        </div>
      </div>

      <p className="text-xs text-brand-muted leading-relaxed">
        Silakan ikuti pembaruan terkini seputar rekayasa kode, pengembangan AI, serta sintesis sistem cerdas melalui kanal-kanal sosial resmi di bawah ini.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {socialLinks.map((social) => {
          const IconComp = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center text-center p-4 rounded-xl bg-brand-bg/30 border border-brand-surface hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${social.color}`}
            >
              <div className="p-2.5 rounded-full bg-brand-surface shadow-xs mb-2.5">
                <IconComp className={`w-5 h-5 ${social.brandColor}`} />
              </div>
              <span className="text-xs font-black text-brand-text mb-0.5 block">
                {social.name}
              </span>
              <span className="text-[10px] text-brand-muted truncate max-w-full font-semibold">
                {social.label.length > 24 ? social.label.substring(0, 22) + "..." : social.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

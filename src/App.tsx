import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, FileText, Newspaper, ShieldAlert, Zap, Layers, Menu, X, Settings, Info, Trash2, RefreshCw } from "lucide-react";
import ArticleInput from "./components/ArticleInput";
import Dashboard from "./components/Dashboard";
import AiParsingConsole from "./components/AiParsingConsole";
import { ArticleData, ChatMessage } from "./types";
import LZString from "lz-string";
import { getHistory, saveToHistory, deleteFromHistory, HistoryItem } from "./lib/history";
import SocialDev from "./components/SocialDev";

export default function App() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("veritas-theme") || "theme-custom");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customBg, setCustomBg] = useState<string>(() => localStorage.getItem("veritas-custom-bg") || "#F3F4F6");
  const [customAccent, setCustomAccent] = useState<string>(() => localStorage.getItem("veritas-custom-accent") || "#D4AF37");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "theme-custom") {
      root.className = "theme-custom";
      
      const hex = customBg.replace("#", "");
      const r = parseInt(hex.substring(0, 2) || "0", 16);
      const g = parseInt(hex.substring(2, 4) || "0", 16);
      const b = parseInt(hex.substring(4, 6) || "0", 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isLight = luminance > 0.5;

      let surface = "#FFFFFF";
      let text = "#1E293B";
      let muted = "#64748B";
      let border = "#E2E8F0";
      let secondary = "#0F172A";

      if (!isLight) {
        surface = "#161F35";
        text = "#F8FAFC";
        muted = "#94A3B8";
        border = "#202C45";
        secondary = "#FAF0D4";
      } else {
        surface = "#FFFFFF";
        text = "#0F172A";
        muted = "#475569";
        border = "#E2E8F0";
        secondary = "#1E293B";
      }

      const accHex = customAccent.replace("#", "");
      const ar = parseInt(accHex.substring(0, 2) || "0", 16);
      const ag = parseInt(accHex.substring(2, 4) || "0", 16);
      const ab = parseInt(accHex.substring(4, 6) || "0", 16);
      const accLuminance = (0.299 * ar + 0.587 * ag + 0.114 * ab) / 255;
      const btnText = accLuminance > 0.5 ? "#0F172A" : "#FFFFFF";

      root.style.setProperty("--brand-bg", customBg);
      root.style.setProperty("--brand-surface", surface);
      root.style.setProperty("--brand-primary", customAccent);
      root.style.setProperty("--brand-secondary", secondary);
      root.style.setProperty("--brand-text", text);
      root.style.setProperty("--brand-muted", muted);
      root.style.setProperty("--brand-border", border);
      root.style.setProperty("--brand-btn-bg", customAccent);
      root.style.setProperty("--brand-btn-text", btnText);
    } else {
      root.className = theme;
      root.style.removeProperty("--brand-bg");
      root.style.removeProperty("--brand-surface");
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-secondary");
      root.style.removeProperty("--brand-text");
      root.style.removeProperty("--brand-muted");
      root.style.removeProperty("--brand-border");
      root.style.removeProperty("--brand-btn-bg");
      root.style.removeProperty("--brand-btn-text");
    }
  }, [theme, customBg, customAccent]);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ url?: string; text?: string; title?: string; query?: string; file?: string; filename?: string; mimeType?: string } | null>(null);
  const [peekData, setPeekData] = useState<{ title?: string; thumbnail?: string; favicon?: string } | null>(null);
  const [analyzedData, setAnalyzedData] = useState<ArticleData | null>(null);
  const [keyIndexUsed, setKeyIndexUsed] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initial load effect for history and check shared link
  useEffect(() => {
    setHistory(getHistory());

    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("data");
    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (parsed && parsed.title && parsed.analysis) {
            setAnalyzedData(parsed);
            setKeyIndexUsed(parsed.keyIndexUsed || 1);
            setChatHistory([]);
            setShowSplash(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to restore shared analysis data:", err);
      }
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClearCacheAndReset = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua cache, riwayat analisis, dan mereset aplikasi? Halaman akan disegarkan secara penuh.")) {
      localStorage.clear();
      sessionStorage.clear();
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch {}
      }

      // Delete all cache storage
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
        } catch {}
      }

      // Hard reload with cache buster parameter
      window.location.href = window.location.origin + window.location.pathname + "?v=" + Date.now();
    }
  };

  // Triggered when a URL, pasted text, or search query is analyzed
  const handleAnalyze = async (payload: { url?: string; text?: string; title?: string; query?: string }) => {
    setPendingPayload(payload);
    setPeekData(null);
    setIsLoading(true);

    // If it's a URL, launch an instantaneous peek fetch for title & thumbnail
    if (payload.url) {
      fetch("/api/peek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: payload.url }),
      })
        .then((res) => res.json())
        .then((meta) => {
          if (meta && !meta.error) {
            setPeekData(meta);
          }
        })
        .catch((err) => console.error("Error peeking URL metadata:", err));
    } else if (payload.text) {
      // Manual text fallback
      setPeekData({
        title: payload.title || "Teks Manual",
        thumbnail: "",
      });
    } else if (payload.query) {
      // Search query peek
      setPeekData({
        title: `Menelusuri & Memverifikasi Isu: "${payload.query}"`,
        thumbnail: "",
      });
    }

    try {
      const endpoint = payload.query ? "/api/search" : "/api/analyze";
      const bodyPayload = payload.query ? { query: payload.query } : payload;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textStr = await response.text();
        throw new Error(textStr || `Kesalahan Server: Status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan analisis artikel.");
      }

      setAnalyzedData(data);
      const updatedHist = saveToHistory(data);
      setHistory(updatedHist);
      setKeyIndexUsed(data.keyIndexUsed || 1);
      setChatHistory([]); // Reset conversation for new article
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Triggered when a new chat message is sent
  const handleSendMessage = async (messageText: string) => {
    if (!analyzedData) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setIsSendingChat(true);

    try {
      // Map chat history format to send only necessary text properties
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatHistory: formattedHistory,
          message: messageText,
          articleText: analyzedData.text,
          articleTitle: analyzedData.title,
          keyIndexUsed: keyIndexUsed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan respons AI.");
      }

      if (data.keyIndexUsed) {
        setKeyIndexUsed(data.keyIndexUsed);
      }

      const modelMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: data.text,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: "Maaf, terjadi masalah koneksi atau kesalahan internal saat mencoba menjawab pertanyaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleReset = () => {
    setAnalyzedData(null);
    setChatHistory([]);
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  if (showSplash) {
    return (
      <div id="veritas-splash-screen" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-bg transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="text-center space-y-6 max-w-sm px-6"
        >
          {/* Logo container with favicon.jpg and custom smooth animation */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 flex items-center justify-center text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <motion.img
              src="/favicon.jpg?v=2"
              alt="Veritas Favicon"
              className="absolute inset-0 w-full h-full object-cover"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-widest text-brand-text uppercase font-sans">
              VERITAS
            </h1>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest font-mono">
              Academic Reasoning Engine v3.5
            </p>
          </div>

          <div className="w-48 h-1 bg-brand-surface mx-auto rounded-full overflow-hidden relative border border-brand-surface">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-brand-primary to-transparent"
            />
          </div>

          <p className="text-[10px] text-brand-muted/70 leading-relaxed max-w-xs font-medium">
            Memverifikasi data ilmiah & keabsahan argumen bebas halusinasi
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-primary selection:text-brand-bg text-brand-text transition-colors duration-300">
      {/* Navigation Header - Beautiful Premium Solid Design with Theme Compatibility */}
      <header id="main-nav-header" className="sticky top-0 z-50 bg-brand-surface border-b border-brand-surface px-4 py-3 select-none transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Elegant dark background container with icon.jpg */}
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white border border-slate-800 flex-shrink-0 shadow-sm relative overflow-hidden">
                <img
                  src="/icon.jpg?v=2"
                  alt="Veritas Icon"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  <span className="text-sm sm:text-base font-black tracking-wider text-brand-text font-sans uppercase">VERITAS</span>
                  <span className="text-brand-muted/40 select-none text-xs">|</span>
                  <h2 className="text-xs sm:text-sm font-bold text-brand-muted uppercase leading-none">Analisis Artikel</h2>
                </div>
                <p className="text-[8px] sm:text-[9px] font-semibold text-brand-primary uppercase tracking-widest font-mono mt-0.5">
                  Grounded Context Engine v3.5
                </p>
              </div>
            </div>

            {/* Hamburger Menu Toggle on top right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Direct Refresh & Clear Cache Button */}
              <button
                id="header-force-reload-btn"
                type="button"
                onClick={handleClearCacheAndReset}
                title="Hapus Cache & Refresh Aplikasi"
                className="p-2 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-surface text-brand-primary hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center focus:outline-none cursor-pointer"
                aria-label="Refresh Aplikasi"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                id="header-menu-toggle-btn"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-surface text-brand-text hover:text-brand-primary transition-all shadow-xs flex items-center justify-center focus:outline-none cursor-pointer"
                aria-label="Menu Utama"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Elegant Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                id="header-menu-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-3 w-72 bg-brand-surface border border-brand-surface rounded-2xl shadow-xl p-4 z-50 space-y-4"
              >
                {/* Theme Selector Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-black uppercase tracking-wider font-mono">
                    <Settings className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Pilih Tema Tampilan</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-brand-bg p-1 rounded-xl border border-brand-surface">
                    {[
                      { id: "theme-light", label: "Terang", icon: "☀️" },
                      { id: "theme-dark", label: "Gelap", icon: "🌙" },
                      { id: "theme-sepia", label: "Sepia", icon: "📜" },
                      { id: "theme-custom", label: "Kustom", icon: "🎨" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          localStorage.setItem("veritas-theme", t.id);
                        }}
                        className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                          theme === t.id
                            ? "bg-brand-surface text-brand-primary shadow-xs border border-brand-surface scale-[1.03] font-bold"
                            : "hover:bg-brand-surface/30 text-brand-muted hover:text-brand-text text-xs"
                        }`}
                      >
                        <span className="text-sm">{t.icon}</span>
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Theme Controls */}
                  {theme === "theme-custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-brand-bg/60 rounded-xl border border-brand-surface space-y-3 overflow-hidden text-xs"
                    >
                      {/* Background Color Picker */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider font-mono">Warna Latar</span>
                          <span className="font-mono text-[10px] text-brand-primary font-bold">{customBg}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customBg}
                            onChange={(e) => {
                              setCustomBg(e.target.value);
                              localStorage.setItem("veritas-custom-bg", e.target.value);
                            }}
                            className="w-7 h-7 rounded-lg border border-brand-surface cursor-pointer bg-transparent"
                          />
                          <div className="flex gap-1.5 flex-wrap">
                            {["#0B1020", "#1E1E2F", "#0F172A", "#1A1A1A", "#F3F4F6", "#FFFBEB"].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  setCustomBg(color);
                                  localStorage.setItem("veritas-custom-bg", color);
                                }}
                                className="w-5 h-5 rounded-full border border-brand-surface hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Accent Color Picker */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider font-mono">Warna Aksen</span>
                          <span className="font-mono text-[10px] text-brand-primary font-bold">{customAccent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customAccent}
                            onChange={(e) => {
                              setCustomAccent(e.target.value);
                              localStorage.setItem("veritas-custom-accent", e.target.value);
                            }}
                            className="w-7 h-7 rounded-lg border border-brand-surface cursor-pointer bg-transparent"
                          />
                          <div className="flex gap-1.5 flex-wrap">
                            {["#D4AF37", "#3B82F6", "#10B981", "#EF4444", "#EC4899", "#8B5CF6"].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  setCustomAccent(color);
                                  localStorage.setItem("veritas-custom-accent", color);
                                }}
                                className="w-5 h-5 rounded-full border border-brand-surface hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Local History Section inside Hamburger */}
                <div className="border-t border-brand-bg pt-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-black uppercase tracking-wider font-mono">
                    <Layers className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Koleksi Pengetahuan ({history.length})</span>
                  </div>

                  {history.length === 0 ? (
                    <p className="text-[10px] text-brand-muted/70 italic p-3 text-center bg-brand-bg/40 rounded-xl border border-brand-surface">
                      Belum ada riwayat dokumen yang dianalisis
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {history.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-brand-bg/50 border border-brand-surface hover:border-brand-primary/30 transition-all group">
                          <button
                            type="button"
                            onClick={() => {
                              setAnalyzedData(item.data);
                              setKeyIndexUsed(item.data.keyIndexUsed || 1);
                              setChatHistory([]);
                              setIsMenuOpen(false); // Close dropdown
                            }}
                            className="flex-1 text-left min-w-0"
                          >
                            <h4 className="text-[11px] font-bold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[9px] text-brand-muted italic truncate leading-relaxed">
                              "{item.takeaway}"
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = deleteFromHistory(item.id);
                              setHistory(updated);
                            }}
                            className="p-1 rounded-lg text-brand-muted/40 hover:text-brand-error hover:bg-brand-error/10 transition-colors flex-shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* System Status Indicators */}
                <div className="border-t border-brand-bg pt-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-black uppercase tracking-wider font-mono">
                    <Info className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Status Sistem</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-brand-bg/50 border border-brand-surface">
                      <span className="text-brand-muted">Grounded Engine</span>
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-brand-success px-2 py-0.5 rounded-full font-bold text-[9px] border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-brand-bg/50 border border-brand-surface">
                      <span className="text-brand-muted">iLovePDF API</span>
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-brand-success px-2 py-0.5 rounded-full font-bold text-[9px] border border-emerald-500/20">
                        CONNECTED
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-brand-bg/50 border border-brand-surface">
                      <span className="text-brand-muted">CORS Verification</span>
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-brand-success px-2 py-0.5 rounded-full font-bold text-[9px] border border-emerald-500/20">
                        SAFE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clear Cache & Hard Reset */}
                <div className="border-t border-brand-bg pt-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-black uppercase tracking-wider font-mono">
                    <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Pemeliharaan &amp; Reset</span>
                  </div>
                  <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-surface space-y-2">
                    <p className="text-[10px] text-brand-muted leading-normal">
                      Mengalami masalah refresh atau data tersangkut? Bersihkan cache lokal untuk memuat ulang semua modul sistem secara bersih.
                    </p>
                    <button
                      type="button"
                      id="clear-cache-reset-btn"
                      onClick={handleClearCacheAndReset}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 text-xs font-black transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Cache &amp; Reset Data</span>
                    </button>
                  </div>
                </div>

                {/* Quick Info text */}
                <div className="bg-brand-bg/30 p-2.5 rounded-xl border border-brand-surface text-[10px] text-brand-muted leading-relaxed">
                  Veritas adalah asisten analisis artikel ilmiah yang aman, cepat, dan didesain ramah pengguna.
                </div>

                <SocialDev variant="compact" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content-layout" className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-console"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-12"
            >
              <AiParsingConsole
                url={pendingPayload?.url}
                text={pendingPayload?.text}
                file={pendingPayload?.file}
                filename={pendingPayload?.filename}
                peekData={peekData}
              />
            </motion.div>
          ) : !analyzedData ? (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Landing Jumbotron */}
              <div className="text-center space-y-4 max-w-xl mx-auto mt-4 md:mt-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-brand-secondary bg-brand-surface/60 border border-brand-primary/25 shadow-xs">
                  <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                  Grounded Fact-Checker & Academic Intelligence
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text tracking-tight leading-tight font-display">
                  Saring Artikel & Jurnal Ilmiah Menjadi Wawasan Kredibel
                </h1>
                <p className="text-sm text-brand-muted leading-relaxed max-w-md mx-auto">
                  Unggah berkas artikel atau tautkan URL berita. AI kami akan mem-bypass CORS, memproses OCR pindaian secara native, serta menganalisis keabsahan klaim logis tanpa halusinasi.
                </p>
              </div>

              {/* Input Component */}
              <ArticleInput onAnalyze={handleAnalyze} isLoading={isLoading} />

              {/* Local History Panel (Riwayat Analisis Anda) */}
              {history.length > 0 && (
                <div id="history-panel" className="max-w-2xl mx-auto bg-brand-surface border border-brand-surface/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-bg">
                    <div className="flex items-center gap-2 text-brand-text font-extrabold uppercase text-xs font-mono tracking-wider">
                      <Layers className="w-4 h-4 text-brand-primary" />
                      <span>Koleksi Pengetahuan Anda ({history.length})</span>
                    </div>
                    <span className="text-[9px] text-brand-muted/70 font-mono bg-brand-bg px-2 py-0.5 rounded border border-brand-surface">TERFORMAT DI STORAGE LOKAL</span>
                  </div>

                  <div className="divide-y divide-brand-bg max-h-[350px] overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div
                        id={`history-item-${item.id}`}
                        key={item.id}
                        className="py-3 flex items-start justify-between gap-4 group transition-all first:pt-0 last:pb-0"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAnalyzedData(item.data);
                            setKeyIndexUsed(item.data.keyIndexUsed || 1);
                            setChatHistory([]);
                          }}
                          className="flex-1 text-left space-y-1 focus:outline-none min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors truncate">
                              {item.title}
                            </h4>
                            <span className="text-[9px] text-brand-muted font-mono bg-brand-bg px-1.5 py-0.5 rounded flex-shrink-0">
                              {new Date(item.timestamp).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted line-clamp-1 italic leading-relaxed">
                            "{item.takeaway}"
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = deleteFromHistory(item.id);
                            setHistory(updated);
                          }}
                          className="p-1.5 rounded-lg text-brand-muted/50 hover:text-brand-error hover:bg-brand-error/10 transition-colors"
                          title="Hapus dari Riwayat"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Informational Grid (About & Tech) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-brand-surface/80">
                {/* Column 1: Tentang Veritas */}
                <div className="space-y-3 bg-brand-surface/30 p-5 rounded-2xl border border-brand-surface/40 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-text font-black text-xs font-mono tracking-wider uppercase">
                      <Info className="w-4 h-4 text-brand-primary" />
                      <span>Mengenal Veritas</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-brand-muted">
                      Veritas adalah asisten pintar berbasis akademik yang memfasilitasi analisis cepat artikel ilmiah, jurnalisme, dan dokumen PDF. Dilengkapi dengan deteksi bias, ekstraksi metodologi, dan verifikasi klaim grounded tanpa halusinasi.
                    </p>
                  </div>
                  <span className="text-[9px] text-brand-muted/50 font-mono tracking-widest uppercase mt-4 block">PLATFORM VERSI 2.4.0</span>
                </div>

                {/* Column 2: Integritas & Fitur */}
                <div className="space-y-3 bg-brand-surface/30 p-5 rounded-2xl border border-brand-surface/40 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-brand-text font-black text-xs font-mono tracking-wider uppercase">
                      <Cpu className="w-4 h-4 text-brand-primary" />
                      <span>Integritas Sistem</span>
                    </div>
                    <ul className="text-[11px] space-y-2 text-brand-muted font-medium">
                      <li className="flex items-center gap-2">
                        <span className="text-brand-primary font-black">✓</span> Grounded AI Fact-Checker
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-brand-primary font-black">✓</span> Native CORS URL Fetcher
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-brand-primary font-black">✓</span> OCR Scanner Integrasi
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-brand-primary font-black">✓</span> Keamanan Data 100% Lokal
                      </li>
                    </ul>
                  </div>
                  <span className="text-[9px] text-emerald-500/80 font-mono tracking-widest uppercase mt-4 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SISTEM AMAN &amp; AKTIF
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard
                data={analyzedData}
                onReset={handleReset}
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                isSendingChat={isSendingChat}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Full-width seamless pure black lower layout (Always visible) */}
      <div className="w-full bg-[#000000] border-t border-zinc-900/60 mt-12 pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <SocialDev variant="full" />
        </div>
        
        <footer id="app-footer" className="bg-[#000000] border-t border-zinc-900/40 py-8 px-4 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 select-none">
            <p className="font-medium text-zinc-400">© 2026 VERITAS Knowledge Platform. Diperkuat dengan Grounded Prompting & Terintegrasi iLovePDF API.</p>
            <div className="flex gap-5 font-semibold text-zinc-300">
              <span className="hover:text-emerald-400 transition-colors cursor-help">Syarat Layanan</span>
              <span className="hover:text-emerald-400 transition-colors cursor-help">Kebijakan Privasi</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

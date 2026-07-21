import React, { useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquare,
  ShieldCheck,
  Globe,
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Compass,
  Activity,
  Layers,
  HelpCircle,
  Award,
  BookOpen,
  Share2,
  Camera,
  Check,
  Copy,
  Loader2,
  Download
} from "lucide-react";
import { ArticleData, ChatMessage } from "../types";
import VisualMetrics from "./VisualMetrics";
import InteractiveChat from "./InteractiveChat";
import { toPng } from "html-to-image";
import LZString from "lz-string";
import { generateAnalysisPDF } from "../utils/pdfGenerator";

interface DashboardProps {
  data: ArticleData;
  onReset: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isSendingChat: boolean;
}

export default function Dashboard({
  data,
  onReset,
  chatHistory,
  onSendMessage,
  isSendingChat,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "claims" | "topics" | "original">("summary");
  const [expandedClaim, setExpandedClaim] = useState<number | null>(0); // Default expand first claim
  
  const [isSharingLink, setIsSharingLink] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const handleCopyText = (textStr: string, id: string) => {
    navigator.clipboard.writeText(textStr);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const { title, text, analysis } = data;
  const { summary, metrics, claims, tone, questions, discussionTopics } = analysis;

  const handleShareLink = async () => {
    setIsSharingLink(true);
    try {
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal menyalin tautan:", err);
    } finally {
      setIsSharingLink(false);
    }
  };

  const handleExportImage = async () => {
    const element = document.getElementById("share-target-container");
    if (!element) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: "var(--brand-surface)",
        style: {
          borderRadius: "0px",
        },
        quality: 0.95,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `veritas_analisis_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal membuat gambar:", err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      generateAnalysisPDF(data);
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getValidityColor = (validity: string) => {
    const valLower = validity.toLowerCase();
    if (valLower.includes("kuat") || valLower.includes("terbukti")) {
      return "bg-brand-success/15 text-brand-success border-brand-success/30";
    }
    if (valLower.includes("campuran") || valLower.includes("mixed")) {
      return "bg-brand-warning/15 text-brand-warning border-brand-warning/30";
    }
    if (valLower.includes("opini")) {
      return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    }
    return "bg-brand-error/15 text-brand-error border-brand-error/30";
  };

  return (
    <div id="dashboard-root" className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-surface/60">
        <div className="space-y-2.5 max-w-3xl">
          <button
            id="back-to-input-btn"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-text transition-colors bg-brand-surface/40 hover:bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-surface/80 uppercase font-mono tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-primary" />
            Mulai Ulang / Analisis Lainnya
          </button>
          
          <h1 className="text-xl md:text-2xl font-extrabold text-brand-text tracking-tight leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {data.isSearchMode ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full border border-brand-primary/20 animate-pulse uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-brand-primary" />
                Mode Verifikasi Real-Time (Live Search)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-brand-surface text-brand-muted px-3 py-1 rounded-full border border-brand-surface/80 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                {text.length} Karakter Terbaca
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-emerald-500/10 text-brand-success px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-brand-success animate-pulse" />
              Selesai Menganalisis
            </span>
          </div>
        </div>

        {/* Action Share Buttons on the right side */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            id="export-pdf-btn"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 bg-brand-surface text-brand-text hover:text-brand-primary border border-brand-surface/80 hover:border-brand-primary/30 shadow-md hover:shadow-lg transition-all rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-60"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-brand-primary" />
            )}
            <span>Unduh Laporan (PDF)</span>
          </button>

          <button
            id="share-as-image-btn"
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="inline-flex items-center gap-2 bg-brand-surface text-brand-text hover:text-brand-primary border border-brand-surface/80 hover:border-brand-primary/30 shadow-md hover:shadow-lg transition-all rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-60"
          >
            {isExportingImage ? (
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-brand-primary" />
            )}
            <span>Share as Image (PNG)</span>
          </button>

          <button
            id="share-link-btn"
            onClick={handleShareLink}
            disabled={isSharingLink}
            className="inline-flex items-center gap-2 bg-brand-btn-bg text-brand-btn-text hover:opacity-90 shadow-md hover:shadow-lg transition-all rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer relative"
          >
            {shareSuccess ? (
              <>
                <Check className="w-4 h-4 text-brand-success" />
                <span className="text-brand-success">Link Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Bagikan Tautan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 units): Analysis Tabs */}
        <div className="lg:col-span-8 space-y-6">
          <div id="share-target-container" className="bg-brand-surface border border-brand-surface/80 rounded-2xl shadow-xl overflow-hidden p-0.5">
            
            {/* Tab Navigation with elegant horizontal scrolling on small viewports */}
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-b border-brand-bg bg-brand-bg/40 p-1.5 gap-1.5">
              <button
                id="dashboard-tab-summary"
                onClick={() => setActiveTab("summary")}
                className={`flex-1 min-w-[140px] py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "summary"
                    ? "bg-brand-surface text-brand-primary shadow-md border border-brand-primary/25"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/40"
                }`}
              >
                <Compass className="w-4 h-4 text-brand-primary" />
                Ringkasan & Gaya
              </button>
              <button
                id="dashboard-tab-claims"
                onClick={() => setActiveTab("claims")}
                className={`flex-1 min-w-[150px] py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "claims"
                    ? "bg-brand-surface text-brand-primary shadow-md border border-brand-primary/25"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/40"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-success" />
                Klaim & Bukti
              </button>
              <button
                id="dashboard-tab-topics"
                onClick={() => setActiveTab("topics")}
                className={`flex-1 min-w-[150px] py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "topics"
                    ? "bg-brand-surface text-brand-primary shadow-md border border-brand-primary/25"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/40"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-brand-primary" />
                Bahan Diskusi
              </button>
              <button
                id="dashboard-tab-original"
                onClick={() => setActiveTab("original")}
                className={`flex-1 min-w-[120px] py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "original"
                    ? "bg-brand-surface text-brand-primary shadow-md border border-brand-primary/25"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface/40"
                }`}
              >
                <FileText className="w-4 h-4 text-brand-muted" />
                Teks Asli
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {activeTab === "summary" && (
                <div id="summary-tab-content" className="space-y-6">
                  {/* Takeaway */}
                  <div className="bg-brand-primary/5 border border-brand-primary/15 p-5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase font-mono flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-primary animate-pulse" />
                        Kesimpulan Inti (Executive Summary)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(summary.takeaway, "takeaway")}
                        className="text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-brand-surface/80 border border-brand-surface/50 px-2 py-1 rounded-md shadow-xs active:scale-95"
                      >
                        {copiedTextId === "takeaway" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-success" />
                            <span className="text-brand-success font-extrabold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-brand-text leading-relaxed selectable-text">
                      {summary.takeaway}
                    </p>
                  </div>

                  {/* Sources List (Real-Time Search Citations) */}
                  {data.isSearchMode && data.sources && data.sources.length > 0 && (
                    <div className="space-y-3.5 pt-2">
                      <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-brand-primary" />
                        Sumber Referensi Utama ({data.sources.length} Portal Terbaca)
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {data.sources.map((source, idx) => (
                          <a
                            id={`source-link-${idx}`}
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-brand-surface bg-brand-surface/30 hover:border-brand-primary/30 hover:bg-brand-surface/75 transition-all text-left"
                          >
                            <div className="space-y-1.5 max-w-[85%]">
                              <span className="text-[9px] font-bold text-brand-primary tracking-widest uppercase font-mono block">
                                Rujukan Ilmiah #{idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-brand-text leading-snug group-hover:text-brand-primary transition-colors">
                                {source.title}
                              </h4>
                              {source.snippet && (
                                <p className="text-xs text-brand-muted/75 line-clamp-1">
                                  {source.snippet}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-brand-primary font-bold mt-3 sm:mt-0 opacity-90 group-hover:opacity-100 transition-opacity">
                              <span>Buka Sumber</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights Bullet Points */}
                  <div className="space-y-3.5 pt-2">
                    <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-mono">
                      Poin-Poin Utama Penelitian
                    </h3>
                    <ul className="space-y-3">
                      {summary.highlights.map((hl, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-brand-text leading-relaxed selectable-text">
                          <CheckCircle2 className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full summary text */}
                  <div className="pt-6 border-t border-brand-bg space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-mono">
                        Deskripsi Sintesis Pengetahuan
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopyText(summary.fullText, "fulltext")}
                        className="text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-brand-surface/80 border border-brand-surface/50 px-2 py-1 rounded-md shadow-xs active:scale-95"
                      >
                        {copiedTextId === "fulltext" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-success" />
                            <span className="text-brand-success font-extrabold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Sintesis</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-brand-text/90 leading-relaxed whitespace-pre-wrap selectable-text">
                      {summary.fullText}
                    </p>
                  </div>

                  {/* Tone Profiler (Visual Bars) */}
                  <div className="pt-6 border-t border-brand-bg space-y-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-mono">
                        Analisis Gaya & Objektivitas Penulisan
                      </h3>
                      <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                        {tone.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {[
                        { label: "Analitis / Akademik", value: tone.profile.analytical, color: "bg-brand-primary" },
                        { label: "Objektif / Netral", value: tone.profile.objective, color: "bg-brand-success" },
                        { label: "Opini Subjektif", value: tone.profile.opinionated, color: "bg-brand-warning" },
                        { label: "Sensasional / Click-bait", value: tone.profile.sensationalist, color: "bg-brand-error" },
                        { label: "Promosional / Iklan", value: tone.profile.promotional, color: "bg-purple-600" },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-brand-text">{item.label}</span>
                            <span className="font-bold text-brand-primary font-mono">{item.value}%</span>
                          </div>
                          <div className="h-2 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-surface/40">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "claims" && (
                <div id="claims-tab-content" className="space-y-4">
                  <div className="bg-brand-surface/60 p-4.5 rounded-xl border border-brand-surface">
                    <p className="text-xs text-brand-muted leading-relaxed">
                      <strong>Claims Inspector</strong> memetakan argumen struktural dalam artikel, menguji kelayakan logis terhadap data internal, serta mengisolasi kutipan verbatim aslinya untuk akurasi optimal.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {claims.map((claim, idx) => (
                      <div
                        id={`claim-accordion-${idx}`}
                        key={idx}
                        className="border border-brand-surface rounded-xl overflow-hidden hover:border-brand-primary/20 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedClaim(expandedClaim === idx ? null : idx)}
                          className="w-full p-4.5 text-left flex items-start justify-between gap-4 bg-brand-surface/40 hover:bg-brand-surface/85 transition-colors"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-surface text-brand-primary font-mono border border-brand-surface/80">
                                Klaim {idx + 1}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getValidityColor(claim.validity)}`}>
                                {claim.validity}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-brand-text leading-snug">
                              {claim.claim}
                            </h4>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-brand-primary mt-1 flex-shrink-0 transition-transform duration-200 ${
                              expandedClaim === idx ? "transform rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedClaim === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="border-t border-brand-bg bg-brand-bg/25 p-5 space-y-4 text-xs md:text-sm"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase font-mono block">
                                  Analisis Validitas Veritas:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(`Klaim: ${claim.claim}\n\nAnalisis: ${claim.evidence}\n\nKutipan: "${claim.quote}"`, `claim-${idx}`)}
                                  className="text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-brand-surface/85 border border-brand-surface/50 px-2 py-0.5 rounded-md shadow-xs active:scale-95"
                                >
                                  {copiedTextId === `claim-${idx}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-brand-success" />
                                      <span className="text-brand-success font-extrabold">Tersalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Salin Klaim</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-brand-muted leading-relaxed selectable-text">
                                {claim.evidence}
                              </p>
                            </div>

                            <div className="bg-brand-surface/60 border border-brand-surface/80 p-4 rounded-xl border-l-4 border-l-brand-primary space-y-1.5">
                              <span className="text-[9px] font-bold text-brand-primary/70 tracking-wider uppercase font-mono block">
                                Kutipan Verbatim Artikel:
                              </span>
                              <blockquote className="text-xs text-brand-secondary leading-relaxed font-serif italic selectable-text">
                                &ldquo;{claim.quote}&rdquo;
                              </blockquote>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "topics" && (
                <div id="topics-tab-content" className="space-y-6">
                  <div className="bg-brand-primary/5 border border-brand-primary/10 p-5 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-brand-primary animate-pulse" />
                      Ide & Topik Diskusi Akademis
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-brand-text leading-relaxed">
                      Sistem telah merangkum beberapa topik penting dari tulisan ini. Klik tombol "Tanyakan AI" pada pertanyaan pemantik di bawah untuk langsung berdiskusi dengan Chatbot interaktif di sisi kanan!
                    </p>
                  </div>

                  <div className="space-y-4.5">
                    {discussionTopics && discussionTopics.length > 0 ? (
                      discussionTopics.map((topicItem, idx) => (
                        <div
                          key={idx}
                          className="bg-brand-surface/40 border border-brand-surface/80 rounded-xl p-5.5 hover:border-brand-primary/30 hover:bg-brand-surface/60 transition-all duration-200 space-y-4 text-left"
                        >
                          <div className="space-y-2">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-mono border border-brand-primary/20">
                              Topik Kajian #{idx + 1}
                            </span>
                            <h4 className="text-base font-bold text-brand-text leading-snug">
                              {topicItem.topic}
                            </h4>
                            <p className="text-xs text-brand-muted leading-relaxed">
                              {topicItem.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-brand-surface/60 space-y-3">
                            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block font-mono">
                              Pertanyaan Pemantik Sesi Diskusi:
                            </span>
                            <div className="grid grid-cols-1 gap-2.5">
                              {topicItem.starterQuestions.map((q, qIdx) => (
                                <div
                                  key={qIdx}
                                  className="flex items-start justify-between gap-3.5 p-3.5 rounded-lg bg-brand-surface/60 hover:bg-brand-surface transition-colors border border-brand-surface"
                                >
                                  <p className="text-xs font-semibold text-brand-text leading-relaxed flex-1">
                                    {q}
                                  </p>
                                  <button
                                    onClick={() => onSendMessage(q)}
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold bg-brand-surface text-brand-primary border border-brand-primary/35 px-2.5 py-1.5 rounded-md hover:bg-brand-primary hover:text-brand-bg hover:border-brand-primary transition-all active:scale-[0.97]"
                                    title="Diskusikan langsung dengan AI"
                                  >
                                    <span>Tanyakan AI</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-brand-surface/20 rounded-xl border border-dashed border-brand-surface space-y-2.5">
                        <HelpCircle className="w-8 h-8 text-brand-primary/60 mx-auto" />
                        <h4 className="text-sm font-bold text-brand-text">Bahan Kajian Tidak Tersedia</h4>
                        <p className="text-xs text-brand-muted max-w-xs mx-auto">
                          Gunakan rujukan data yang lebih lengkap untuk mendapatkan analisis materi diskusi terstruktur.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "original" && (
                <div id="original-tab-content" className="space-y-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider font-mono">
                      Naskah Hasil Ekstraksi
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(text, "original_text")}
                      className="text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-brand-surface/80 border border-brand-surface/50 px-2 py-1 rounded-md shadow-xs active:scale-95"
                    >
                      {copiedTextId === "original_text" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-brand-success" />
                          <span className="text-brand-success font-extrabold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Naskah</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-5 bg-brand-surface/30 border border-brand-surface rounded-xl max-h-[480px] overflow-y-auto text-xs text-brand-text/80 font-mono leading-relaxed whitespace-pre-wrap selectable-text">
                    {text}
                  </div>
                  <p className="text-[10px] text-brand-muted/60 italic leading-normal">
                    * Informasi: Teks di atas dibersihkan dari kerangka situs (CORS-cleaned script, footer, menu, styling CSS) untuk memastikan fokus Gemini AI pada data rujukan primer tulisan.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Bento Row */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-bold text-brand-muted tracking-widest uppercase font-mono">
              Parameter Kredibilitas Artikel
            </h3>
            <VisualMetrics metrics={metrics} />
          </div>
        </div>

        {/* Right Column (4 units): Interactive Chat */}
        <div className="lg:col-span-4">
          <InteractiveChat
            chatHistory={chatHistory}
            suggestedQuestions={questions}
            onSendMessage={onSendMessage}
            isSending={isSendingChat}
          />
        </div>

      </div>
    </div>
  );
}

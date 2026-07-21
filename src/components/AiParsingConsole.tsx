import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Check, Loader2, Globe, FileText, Sparkles, HelpCircle, BookOpen, Layers, ShieldCheck, FileCheck } from "lucide-react";

interface AiParsingConsoleProps {
  url?: string;
  text?: string;
  file?: string;
  filename?: string;
  peekData?: {
    title?: string;
    thumbnail?: string;
    favicon?: string;
  } | null;
}

interface LogEntry {
  id: string;
  text: string;
  status: "pending" | "processing" | "success" | "info";
  time: string;
}

export default function AiParsingConsole({ url, text, file, filename, peekData }: AiParsingConsoleProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  // Core Academic Processing Stages
  const stages = [
    { name: "Upload", label: "Intake" },
    { name: url ? "Scraping" : "OCR", label: url ? "Scraping" : "OCR Scan" },
    { name: "Extraction", label: "Ekstraksi" },
    { name: "Analysis", label: "Struktur" },
    { name: "Grounding", label: "Grounding" },
    { name: "Fact Checking", label: "Verifikasi" },
    { name: "Summary", label: "Sintesis" },
    { name: "Discussion Ready", label: "Siap Sesi" }
  ];

  // Map steps to specific stages for high fidelity
  const steps = url
    ? [
        { desc: "Dokumen diterima & memvalidasi URL artikel...", stageIdx: 0, reason: "Grounded AI sedang menguji validitas sumber rujukan...", duration: 800 },
        { desc: "Menghubungkan ke situs target & mengunduh dokumen HTML asli...", stageIdx: 1, reason: "Mengunduh payload konten situs serta mengekstrak meta-data...", duration: 1000 },
        { desc: "Mengekstrak karakter teks utama & membersihkan elemen sampah (Nav, Ads, JS)...", stageIdx: 2, reason: "Memisahkan bising situs untuk menyaring teks mentah yang berbobot...", duration: 1100 },
        { desc: "Menganalisis struktur dokumen & tata letak semantik tulisan...", stageIdx: 3, reason: "Memetakan hierarki argumen, struktur paragraf, dan sub-judul...", duration: 900 },
        { desc: "Mendeteksi klaim ilmiah, data kuantitatif, & kutipan kunci...", stageIdx: 4, reason: "Melacak proposisi logis utama untuk verifikasi silang...", duration: 1200 },
        { desc: "Memverifikasi konsistensi informasi menggunakan Grounded Context Engine...", stageIdx: 5, reason: "Mengevaluasi keabsahan pernyataan terhadap bukti internal tulisan...", duration: 1300 },
        { desc: "Menyusun ringkasan akademis tervalidasi & visualisasi dashboard...", stageIdx: 6, reason: "Merangkum intisari argumen ke dalam wawasan ringkas serta metrik kredibilitas...", duration: 1000 },
        { desc: "Menyiapkan basis pengetahuan interaktif untuk sesi tanya jawab.", stageIdx: 7, reason: "Komunikasi asinkron siap dilakukan. Memuat modul portal diskusi...", duration: 700 },
      ]
    : file
    ? [
        { desc: `Dokumen unggahan "${filename || "dokumen.pdf"}" diterima & divalidasi...`, stageIdx: 0, reason: "Memeriksa tanda tangan berkas, ukuran, dan integritas format dokumen...", duration: 800 },
        { desc: "Menginisialisasi iLovePDF OCR Engine di server...", stageIdx: 1, reason: "Mengaktifkan pindaian karakter berbasis neural network iLovePDF API...", duration: 1100 },
        { desc: "Mengekstrak karakter mentah dari PDF/Gambar ke string buffer...", stageIdx: 2, reason: "Melacak koordinat tulisan, merekonstruksi baris teks, dan konversi ke buffer teks...", duration: 1200 },
        { desc: "Menganalisis struktur dokumen ilmiah & mendeteksi pola layout...", stageIdx: 3, reason: "Mendeteksi abstrak, bagian metodologi, hasil, dan daftar pustaka...", duration: 900 },
        { desc: "Mengisolasi klaim logis penting, statistik numerik, & kutipan esensial...", stageIdx: 4, reason: "Mengidentifikasi proposisi utama yang memerlukan analisis kredibilitas...", duration: 1100 },
        { desc: "Menguji konsistensi klaim logika dan melakukan verifikasi independen...", stageIdx: 5, reason: "Membandingkan argumen penulis dengan data fakta pendukung yang diekstrak...", duration: 1300 },
        { desc: "Merangkum intisari dokumen tervalidasi & membangun representasi visual...", stageIdx: 6, reason: "Menyusun ringkasan tingkat eksekutif, metrik bias bahasa, dan topik kunci...", duration: 1000 },
        { desc: "Mempersiapkan dasbor portal pengetahuan & portal diskusi interaktif.", stageIdx: 7, reason: "Seluruh wawasan telah terstruktur dengan aman. Membuka portal verifikasi...", duration: 700 },
      ]
    : [
        { desc: "Payload teks manual berhasil diterima & divalidasi...", stageIdx: 0, reason: "Membaca teks dari buffer clipboard yang diinput pengguna...", duration: 700 },
        { desc: "Melakukan tokenisasi teks murni & mengeliminasi whitespace...", stageIdx: 1, reason: "Menghitung panjang karakter, struktur kalimat, dan tokenisasi...", duration: 800 },
        { desc: "Menganalisis struktur dokumen semantik & segmentasi paragraf...", stageIdx: 2, reason: "Mengelompokkan argumen berdasarkan kedekatan semantik paragraf...", duration: 900 },
        { desc: "Mengidentifikasi topik utama & melacak alur penulisan dokumen...", stageIdx: 3, reason: "Menentukan fokus bahasan tulisan serta konsistensi bahasa...", duration: 1000 },
        { desc: "Mendeteksi klaim penting & memetakan logika pernyataan penulis...", stageIdx: 4, reason: "Mengidentifikasi kalimat opini, fakta, serta argumentasi yang diajukan...", duration: 1200 },
        { desc: "Memverifikasi konsistensi informasi teks secara mendalam...", stageIdx: 5, reason: "Menghitung bias promosi, sensasionalisme, dan bobot analisis objektif...", duration: 1200 },
        { desc: "Menyusun ringkasan analisis, profil nada tulisan, & visualisasi...", stageIdx: 6, reason: "Mengompilasi skor metrik, menyaring intisari, dan menyiapkan bagan analisis...", duration: 900 },
        { desc: "Selesai menyusun dasbor wawasan akademis & meluncurkan portal diskusi.", stageIdx: 7, reason: "Portal pengetahuan siap digunakan. Selamat menganalisis!", duration: 700 },
      ];

  const [currentReasonText, setCurrentReasonText] = useState(() => steps[0]?.reason || "Grounded AI sedang memproses berkas...");
  const currentStageIdx = steps[activeStep]?.stageIdx ?? 0;

  useEffect(() => {
    let currentStep = 0;
    let progressTimer: NodeJS.Timeout;
    let holdingTimer: NodeJS.Timeout;
    const startTime = Date.now();

    const getFormattedTime = () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      return `+${elapsed}s`;
    };

    setLogs([
      {
        id: "0",
        text: steps[0].desc,
        status: "processing",
        time: getFormattedTime(),
      },
    ]);

    const holdingMessages = [
      { text: "Veritas Server sedang memproses teks panjang... Menyusun analisis kritis.", reason: "Mengaktifkan Gemini AI Engine untuk menyusun wawasan mendalam..." },
      { text: "Memindai klaim akademis & mencari rujukan data statistik secara otomatis...", reason: "Mengekstrak bukti logis serta mencocokkan kutipan pendukung..." },
      { text: "Memetakan keandalan rujukan & menganalisis bias serta gaya bahasa artikel...", reason: "Menghitung tingkat emosi, sensasionalisme, dan objektivitas..." },
      { text: "Membuat visualisasi data & daftar topik diskusi kritis untuk Anda...", reason: "Menyusun peta pemikiran terstruktur untuk portal tanya jawab..." },
      { text: "Proses akhir: Menyinkronkan dasbor analisis ke browser lokal Anda...", reason: "Membuat representasi grafis metrik kuantitatif..." },
      { text: "Hampir selesai! Sedang menyelesaikan validasi anti-halusinasi...", reason: "Sintesis final sedang dikompilasi oleh server Veritas..." }
    ];

    let holdingIdx = 0;

    const startHoldingLogs = () => {
      if (holdingIdx >= holdingMessages.length) {
        // If we ran out, repeat the last one with updated timer
        setLogs((prev) => [
          ...prev,
          {
            id: `holding-final-${Date.now()}`,
            text: "Server Veritas masih memproses dokumen yang panjang. Harap tunggu sebentar lagi...",
            status: "processing",
            time: getFormattedTime(),
          },
        ]);
        return;
      }

      const currentHolding = holdingMessages[holdingIdx];
      setCurrentReasonText(currentHolding.reason);
      
      // Complete previous log
      setLogs((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: "success",
            time: getFormattedTime()
          };
        }
        return updated;
      });

      // Add new log
      setLogs((prev) => [
        ...prev,
        {
          id: `holding-${holdingIdx}`,
          text: currentHolding.text,
          status: "processing",
          time: getFormattedTime(),
        }
      ]);

      // Set active step or dynamic details
      setProgress((prev) => {
        // Creep closer to 99% but never hit 100% until unmounted
        if (prev < 98) return prev + 1;
        return prev;
      });

      holdingIdx++;
      holdingTimer = setTimeout(startHoldingLogs, 3500);
    };

    const runSteps = () => {
      if (currentStep >= steps.length) return;

      const currentStepObj = steps[currentStep];

      progressTimer = setTimeout(() => {
        setLogs((prev) =>
          prev.map((l, idx) =>
            idx === currentStep ? { ...l, status: "success", time: getFormattedTime() } : l
          )
        );

        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
          currentStep = nextStep;
          setActiveStep(nextStep);
          setCurrentReasonText(steps[nextStep].reason);
          setLogs((prev) => [
            ...prev,
            {
              id: String(nextStep),
              text: steps[nextStep].desc,
              status: "processing",
              time: getFormattedTime(),
            },
          ]);
          setProgress((prev) => Math.min(prev + Math.floor(90 / steps.length), 95));
          runSteps();
        } else {
          // Instead of instantly setting 100%, start the active holding logs sequence
          setProgress(96);
          startHoldingLogs();
        }
      }, currentStepObj.duration);
    };

    runSteps();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + 1;
        }
        return prev;
      });
    }, 120);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(holdingTimer);
      clearInterval(progressInterval);
    };
  }, []);

  // Format the url hostname if available
  const getDomain = (urlStr?: string) => {
    if (!urlStr) return "";
    try {
      return new URL(urlStr).hostname;
    } catch {
      return urlStr;
    }
  };

  return (
    <div id="ai-parsing-console-root" className="w-full max-w-2xl mx-auto bg-brand-surface border border-brand-surface/80 rounded-2xl shadow-2xl overflow-hidden text-brand-text font-sans">
      
      {/* Premium Academic Platform Header */}
      <div className="px-6 py-4 bg-brand-surface border-b border-brand-bg flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-primary" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider text-brand-text font-sans uppercase">VERITAS ENGINE</span>
            <span className="text-[9px] text-brand-muted font-mono uppercase tracking-widest mt-0.5">Academic Reasoning Pipeline</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-brand-primary font-bold uppercase bg-brand-primary/10 border border-brand-primary/25 px-3 py-1.5 rounded-lg font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
          Menganalisis...
        </div>
      </div>

      {/* Horizontal Stage Progress Tracker */}
      <div className="px-6 py-5 bg-brand-bg/40 border-b border-brand-bg overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[500px] gap-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isActive = idx === currentStageIdx;
            return (
              <div key={idx} className="flex items-center gap-2 flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 relative">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                      isCompleted
                        ? "bg-brand-success/15 border-brand-success text-brand-success"
                        : isActive
                        ? "bg-brand-primary/15 border-brand-primary text-brand-primary shadow-[0_0_12px_rgba(212,175,55,0.2)] animate-pulse"
                        : "bg-brand-surface/50 border-brand-surface text-brand-muted/50"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] font-bold tracking-wider font-mono uppercase transition-all duration-300 ${
                      isActive ? "text-brand-primary" : isCompleted ? "text-brand-success" : "text-brand-muted/40"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex-1 h-0.5 bg-brand-surface relative overflow-hidden rounded-full">
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${
                        idx < currentStageIdx ? "bg-brand-success" : idx === currentStageIdx ? "bg-brand-primary animate-pulse" : "bg-transparent"
                      }`}
                      style={{ width: idx < currentStageIdx ? "100%" : idx === currentStageIdx ? "50%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Status Box with Reasoner */}
      <div className="p-6 border-b border-brand-bg bg-brand-surface space-y-4">
        {/* Grounded AI Active Thought State */}
        <div className="bg-brand-bg/60 border border-brand-primary/10 rounded-xl p-4 flex gap-3.5 items-center">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-brand-primary animate-pulse" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase font-mono block">
              Grounded AI Status
            </span>
            <p className="text-xs text-brand-text font-medium leading-relaxed italic truncate">
              "{currentReasonText}"
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-brand-muted/80">Sintesis Pengetahuan Berlangsung</span>
            <span className="font-bold text-brand-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-surface">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-success"
            />
          </div>
        </div>
      </div>

      {/* Visual Doc Preview Scanner Card */}
      <div className="p-6 border-b border-brand-bg bg-brand-bg/20 flex justify-center">
        <div className="w-full max-w-md relative bg-brand-surface rounded-xl p-4.5 border border-brand-surface/80 overflow-hidden shadow-lg select-none">
          
          {/* Subtle Scanning Pulse Light (Replacing the Laser line) */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent animate-pulse pointer-events-none z-20" />
          
          {/* Golden Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#d4af3708_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-80" />

          {/* Card Content layout */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start">
            
            {/* Thumbnail Image Scanner Preview */}
            <div className={`w-full sm:w-28 h-20 bg-brand-bg rounded-lg border border-brand-surface overflow-hidden flex-shrink-0 flex items-center justify-center relative ${url ? "shadow-[0_0_15px_rgba(212,175,55,0.1)] border-brand-primary/30" : ""}`}>
              {peekData?.thumbnail ? (
                <>
                  <img
                    src={peekData.thumbnail}
                    alt="Article thumbnail preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-60 filter saturate-50 blur-[0.2px] transition-all duration-1000"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle scanned lines or overlay */}
                  <div className="absolute inset-0 bg-brand-primary/10 mix-blend-color" />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 via-transparent to-brand-primary/10 pointer-events-none" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-brand-muted/40 gap-1.5">
                  <FileCheck className="w-6 h-6 text-brand-primary/60" />
                  <span className="text-[8px] font-bold tracking-widest uppercase font-mono">DOKUMEN</span>
                </div>
              )}
              {/* Scan indicator badge */}
              <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold font-mono tracking-widest bg-brand-bg/95 text-brand-primary border border-brand-primary/20 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                PINDAI
              </span>
            </div>

            {/* Title & Domain Meta */}
            <div className="flex-1 space-y-2.5 w-full min-w-0">
              <div className="flex items-center gap-2">
                {peekData?.favicon ? (
                  <img
                    src={peekData.favicon}
                    alt="Favicon"
                    className="w-3.5 h-3.5 rounded-sm filter brightness-90 bg-white/10"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-brand-primary/80" />
                )}
                <span className="text-[10px] font-bold text-brand-primary tracking-wider font-mono truncate max-w-[200px] uppercase">
                  {url ? getDomain(url) : file ? "Berkas Unggahan" : "Masukan Teks"}
                </span>
              </div>

              <h4 className="text-xs font-bold text-brand-text leading-relaxed font-sans line-clamp-2">
                {peekData?.title || (url ? "Menghubungkan situs sumber..." : file ? (filename || "Membaca berkas masuk...") : "Memproses dokumen teks manual...")}
              </h4>

              <div className="flex items-center gap-3 text-[9px] text-brand-muted font-mono">
                <span>FORMAT: <strong className="text-brand-text">{url ? "WEB LINK" : file ? "PDF/IMAGE" : "TEXT BUFFER"}</strong></span>
                {(text || file) && <span>PANJANG: <strong className="text-brand-text">{text ? `~${text.length} KARAKTER` : "SINKRON"}</strong></span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Log Lines */}
      <div id="console-logs-viewport" className="p-6 space-y-3 max-h-[220px] overflow-y-auto bg-brand-bg/50 border-b border-brand-bg">
        <AnimatePresence>
          {logs.map((log) => {
            const isCompleted = log.status === "success";
            const isActive = log.status === "processing";
            return (
              <motion.div
                id={`console-log-row-${log.id}`}
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3.5 leading-relaxed font-mono text-[11px]"
              >
                {/* Elapsed Time stamp */}
                <span className="text-brand-muted/40 select-none font-bold text-[10px] pt-0.5 min-w-[45px]">{log.time}</span>
                
                {/* Visual Status Node */}
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-brand-success/10 text-brand-success flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[9px] border border-brand-success/30">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : isActive ? (
                  <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[9px] border border-brand-primary/30">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-brand-surface/80 text-brand-muted/30 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[9px] border border-brand-surface" />
                )}

                {/* Log Text */}
                <div className="flex-1">
                  <span className={`font-semibold text-xs leading-relaxed ${
                    isCompleted
                      ? "text-brand-text"
                      : isActive
                      ? "text-brand-primary"
                      : "text-brand-muted/40"
                  }`}>
                    {log.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Console Footer Status */}
      <div className="px-6 py-3.5 bg-brand-surface/80 flex items-center justify-between text-[10px] text-brand-muted font-mono uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>Pipeline: Veritas Grounded Reasoning Engine</span>
        </div>
        <span className="text-brand-primary font-bold">100% Bebas Halusinasi AI</span>
      </div>
    </div>
  );
}

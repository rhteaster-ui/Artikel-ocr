import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, AlertCircle, Globe, ArrowRight, Cpu, FileText, UploadCloud, Trash2, CheckCircle2 } from "lucide-react";

interface ArticleInputProps {
  onAnalyze: (payload: { url?: string; text?: string; title?: string; query?: string; file?: string; filename?: string; mimeType?: string }) => Promise<void>;
  isLoading: boolean;
}

export default function ArticleInput({ onAnalyze, isLoading }: ArticleInputProps) {
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // File Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === "url") {
      if (!url.trim()) {
        setError("Silakan masukkan URL artikel terlebih dahulu.");
        return;
      }
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        setError("Format URL tidak valid. Pastikan diawali dengan http:// atau https://");
        return;
      }
      try {
        await onAnalyze({ url: url.trim() });
      } catch (err: any) {
        setError(err.message || "Gagal menganalisis artikel dari URL tersebut.");
      }
    } else {
      // File upload mode
      if (!selectedFile) {
        setError("Silakan pilih atau seret file PDF/Gambar terlebih dahulu.");
        return;
      }

      try {
        const base64Data = await readFileAsBase64(selectedFile);
        await onAnalyze({
          file: base64Data,
          filename: selectedFile.name,
          mimeType: selectedFile.type
        });
      } catch (err: any) {
        setError(err.message || "Gagal membaca atau memproses dokumen.");
      }
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSampleClick = (sampleUrl: string) => {
    setActiveTab("url");
    setUrl(sampleUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validMimeTypes.includes(file.type)) {
      setError("Jenis file tidak didukung. Harap pilih file PDF atau Gambar (PNG/JPG).");
      return;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal ukuran file adalah 10 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const samples = [
    {
      title: "Wikipedia - Kecerdasan Buatan (AI)",
      url: "https://id.wikipedia.org/wiki/Kecerdasan_buatan",
    },
    {
      title: "Mozilla Blog - AI Future",
      url: "https://blog.mozilla.org/en/internet-culture/mozilla-explains/what-is-artificial-intelligence-ai/",
    },
    {
      title: "Wikipedia - Google",
      url: "https://id.wikipedia.org/wiki/Google",
    }
  ];

  return (
    <div id="article-input-container" className="w-full max-w-2xl mx-auto space-y-6">
      {/* Visual Extraction & Analysis Pipeline Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-surface bg-brand-surface p-6 shadow-md">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-brand-surface">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-primary animate-pulse" />
              <span className="text-xs font-black tracking-widest text-brand-text font-mono uppercase">VERITAS PROCESSING PIPELINE</span>
            </div>
            <span className="text-[9px] font-black tracking-widest font-mono text-brand-primary bg-brand-bg border border-brand-surface px-2.5 py-1 rounded-md uppercase">
              100% Client-Safe OCR & CORS
            </span>
          </div>

          {/* Minimal Process Pipeline Roadmap */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {[
              { step: "01", name: "Intake", desc: "URL atau PDF", icon: <Globe className="w-3.5 h-3.5" /> },
              { step: "02", name: "OCR Scan", desc: "Native Extractor", icon: <FileText className="w-3.5 h-3.5" /> },
              { step: "03", name: "Analysis", desc: "Grounded Reasoning", icon: <Cpu className="w-3.5 h-3.5" /> },
              { step: "04", name: "Synthesize", desc: "Discussion Dashboard", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative bg-brand-bg border border-brand-surface rounded-xl p-3 flex flex-col justify-between hover:border-brand-primary transition-all duration-200"
              >
                <div className="flex items-center justify-between text-brand-primary mb-2">
                  <span className="text-[10px] font-bold font-mono tracking-wider">{item.step}</span>
                  <div className="p-1 rounded bg-brand-surface border border-brand-surface text-brand-primary/80">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text leading-tight">{item.name}</h4>
                  <p className="text-[9px] text-brand-muted leading-normal mt-0.5 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-brand-surface p-1.5 rounded-xl border border-brand-surface shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("url");
            setError(null);
          }}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "url"
              ? "bg-brand-bg text-brand-primary shadow-xs border border-brand-surface"
              : "text-brand-muted hover:text-brand-text hover:bg-brand-bg/50 disabled:opacity-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          Alamat Tautan (URL)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("file");
            setError(null);
          }}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "file"
              ? "bg-brand-bg text-brand-primary shadow-xs border border-brand-surface"
              : "text-brand-muted hover:text-brand-text hover:bg-brand-bg/50 disabled:opacity-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Unggah File (PDF / Gambar)
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === "url" ? (
          <div className="space-y-2">
            <label htmlFor="url-field" className="block text-xs font-bold text-brand-muted uppercase tracking-wider font-mono">
              Alamat Tautan (URL) Artikel / Jurnal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-primary">
                <Link className="w-4 h-4" />
              </div>
              <input
                id="url-field"
                type="url"
                placeholder="https://contoh-website.com/artikel-atau-jurnal-terbaru"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-11 pr-4 py-3.5 border border-brand-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/50 text-sm bg-brand-surface text-brand-text"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider font-mono">
              Berkas Artikel / Jurnal (Akan dipindai OCR)
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading}
              accept="application/pdf,image/png,image/jpeg,image/jpg"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-brand-primary bg-brand-bg shadow-sm"
                    : "border-brand-surface hover:border-brand-primary bg-brand-surface hover:bg-brand-bg/30"
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-primary border border-brand-surface">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">Seret & taruh berkas di sini, atau klik untuk memilih</p>
                    <p className="text-xs text-brand-muted mt-1">Mendukung PDF, PNG, JPG, JPEG (Maks. 10 MB)</p>
                  </div>
                  <span className="inline-block bg-brand-bg text-brand-primary font-bold text-[9px] px-3 py-1 rounded-md border border-brand-surface tracking-wider font-mono">
                    TERINTEGRASI iLOVEPDF API
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-brand-surface rounded-xl p-4 bg-brand-surface flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center text-brand-primary border border-brand-surface flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-brand-text truncate">{selectedFile.name}</p>
                    <p className="text-xs text-brand-muted">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-brand-success font-bold px-2 py-1 rounded-md border border-emerald-500/20 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> SIAP EKSTRAK
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isLoading}
                    className="p-2 text-brand-muted hover:text-brand-error rounded-lg hover:bg-brand-bg transition-colors disabled:opacity-50"
                    title="Hapus file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider font-mono mr-1">Kesalahan:</span> {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          id="analyze-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-btn-bg hover:opacity-90 text-brand-btn-text rounded-xl font-bold text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider font-sans border border-brand-surface"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-brand-btn-text border-t-transparent rounded-full"
              />
              Mengekstrak Dokumen & Menganalisis...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-brand-btn-text/80 animate-pulse" />
              <span>{activeTab === "url" ? "Mulai Ekstraksi & Analisis AI" : "Unggah & Ekstrak Teks OCR Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Suggested URL Samples */}
      {activeTab === "url" && !isLoading && (
        <div id="url-samples" className="mt-8 pt-6 border-t border-brand-surface">
          <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase block mb-3 font-mono">
            Pilih Contoh Artikel Untuk Demonstrasi
          </span>
          <div className="flex flex-col gap-2">
            {samples.map((sample, idx) => (
              <button
                id={`sample-item-${idx}`}
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.url)}
                className="flex items-center justify-between p-3.5 rounded-lg border border-brand-surface bg-brand-surface hover:border-brand-primary hover:bg-brand-bg transition-all text-left text-xs md:text-sm shadow-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <span className="font-semibold text-brand-text truncate">{sample.title}</span>
                </div>
                <span className="text-[10px] text-brand-muted flex items-center gap-1 font-mono uppercase font-bold">
                  Gunakan <ArrowRight className="w-3 h-3 text-brand-primary" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

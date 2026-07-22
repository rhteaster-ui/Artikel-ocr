import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rate limiter implementation to prevent API misuse and secure the endpoints
interface RateLimitData {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitData>();

function checkRateLimit(ip: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let data = rateLimits.get(ip);
  if (!data || now > data.resetTime) {
    data = { count: 0, resetTime: now + windowMs };
  }
  
  if (data.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  data.count++;
  rateLimits.set(ip, data);
  return { allowed: true, remaining: limit - data.count };
}

// Extract the two keys for auto-rotation
const KEY_1 = process.env.GEMINII_API_KEY || process.env.GEMINI_API_KEY;
const KEY_2 = process.env.GEMINI_API_KEY_SECONDARY || process.env.GEMINI_API_KEY_BACKUP;

// Keep track of analysis counts to auto-rotate
let analysisSessionCounter = 0;

// Helper to get active Gemini client based on rotation index
function getGeminiClient(keyIndex: number): GoogleGenAI {
  // If keyIndex is 2 and we actually have Key 2 configured, use it! Otherwise fallback to Key 1
  const selectedKey = (keyIndex === 2 && KEY_2) ? KEY_2 : (KEY_1 || KEY_2);
  
  return new GoogleGenAI({
    apiKey: selectedKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for promise delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for API requests to mitigate 429 quota/rate limits
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getCachedData(key: string): any | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedData(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

// Helper to run generating content with retries and exponential backoff
async function runWithRetry(
  keyIndex: number,
  options: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 2
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const client = getGeminiClient(keyIndex);
      const response = await client.models.generateContent(options);
      return response;
    } catch (error: any) {
      const errorStr = JSON.stringify(error) + " " + String(error.message || "") + " " + String(error.status || "");
      const isQuotaError = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") || 
        errorStr.includes("Quota") ||
        errorStr.includes("exhausted") ||
        errorStr.includes("Exceeded") ||
        errorStr.includes("limit");
      
      const isHardQuotaExceeded = 
        errorStr.includes("exceeded your current quota") || 
        errorStr.includes("plan and billing") ||
        errorStr.includes("billing details");

      // If it is a hard quota error, do not retry with backoff on this key, fail fast to rotate keys/models
      if (isHardQuotaExceeded) {
        throw error;
      }

      if (isQuotaError && attempt < maxRetries - 1) {
        attempt++;
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500; // exponential backoff with jitter
        console.warn(`[Quota Limit] Kunci API ke-${keyIndex} terkena batasan kuota (429). Percobaan ulang ${attempt}/${maxRetries} dalam ${waitTime.toFixed(0)}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
}

// Helper to generate content with automatic failover to the alternative key if 429 quota is hit
async function generateContentWithFallback(
  initialKeyIndex: number,
  options: {
    model: string;
    contents: any;
    config?: any;
  }
): Promise<{ response: any; finalKeyIndex: number }> {
  let currentKeyIndex = initialKeyIndex;
  
  // Define sequence of models we want to try to bypass specific model limits/quotas
  const modelsToTry = [options.model, "gemini-3.1-flash-lite"];
  
  // We want to try both keys (if configured)
  const keysToTry = [currentKeyIndex];
  const alternativeKeyIndex = currentKeyIndex === 1 ? 2 : 1;
  const hasAlternativeKey = alternativeKeyIndex === 2 ? !!KEY_2 : !!KEY_1;
  if (hasAlternativeKey) {
    keysToTry.push(alternativeKeyIndex);
  }

  let lastError: any = null;

  for (const keyIndex of keysToTry) {
    for (const model of modelsToTry) {
      try {
        console.log(`[Gemini Call] Menghubungi API dengan Kunci ke-${keyIndex} menggunakan model: ${model}...`);
        const response = await runWithRetry(keyIndex, {
          ...options,
          model: model
        }, 1); // 1 retry per model per key to avoid hanging forever
        return { response, finalKeyIndex: keyIndex };
      } catch (error: any) {
        lastError = error;
        const errorStr = JSON.stringify(error) + " " + String(error.message || "") + " " + String(error.status || "");
        console.warn(`[Gemini Warn] Percobaan gagal dengan Kunci ke-${keyIndex} & model ${model}. Error: ${error.message || error}`);
        
        // If it's a structural error (like invalid schema, invalid arguments), do NOT fall back, fail fast!
        const isStructuralError = errorStr.includes("INVALID_ARGUMENT") || errorStr.includes("400") || errorStr.includes("schema");
        if (isStructuralError && !errorStr.includes("quota") && !errorStr.includes("limit")) {
          throw error;
        }

        const isQuotaError = 
          errorStr.includes("429") || 
          errorStr.includes("RESOURCE_EXHAUSTED") || 
          errorStr.includes("quota") || 
          errorStr.includes("Quota") ||
          errorStr.includes("exhausted") ||
          errorStr.includes("Exceeded") ||
          errorStr.includes("limit");

        // If the original request used googleSearch grounding and we hit a quota error,
        // let's try calling it WITHOUT googleSearch grounding tool as a fallback!
        const hasSearchGrounding = options.config?.tools?.some((t: any) => t.googleSearch !== undefined);
        if (isQuotaError && hasSearchGrounding && options.config) {
          console.warn(`[Gemini Grounding Failover] Mendeteksi batas kuota pada model ${model} dengan Google Search. Mencoba ulang TANPA fitur Google Search agar tetap mendapatkan respons...`);
          try {
            // Strip the googleSearch tool from config
            const cleanTools = options.config.tools ? options.config.tools.filter((t: any) => t.googleSearch === undefined) : [];
            const cleanConfig = {
              ...options.config,
              tools: cleanTools.length > 0 ? cleanTools : undefined
            };
            
            const response = await runWithRetry(keyIndex, {
              ...options,
              model: model,
              config: cleanConfig
            }, 1);
            
            return { response, finalKeyIndex: keyIndex };
          } catch (fallbackError: any) {
            lastError = fallbackError;
            console.warn(`[Gemini Grounding Failover Fail] Mencoba ulang tanpa Search gagal juga dengan Kunci ke-${keyIndex} & model ${model}: ${fallbackError.message || fallbackError}`);
          }
        }
      }
    }
  }

  // If we reached here, both keys and all fallback models failed
  throw lastError;
}

// Initialize default AI client
const ai = getGeminiClient(1);

// Helper to format Gemini API errors specifically for unauthenticated service account issue or quota
function formatGeminiError(error: any): string {
  const errMsg = error.stack || error.message || String(error);
  if (
    errMsg.includes("429") || 
    errMsg.includes("RESOURCE_EXHAUSTED") || 
    errMsg.includes("quota") || 
    errMsg.includes("Quota") ||
    errMsg.includes("limit") ||
    errMsg.includes("exhausted")
  ) {
    return "Batas kuota API Gemini telah terlampaui (429 Resource Exhausted / Quota Exceeded). Harap tunggu beberapa saat sebelum mencoba lagi, atau pastikan Anda telah memasukkan kunci API cadangan kedua Anda (GEMINI_API_KEY_SECONDARY atau GEMINI_API_KEY_BACKUP) di panel Settings/Secrets AI Studio agar rotasi kunci otomatis dapat berjalan!";
  }
  
  if (
    errMsg.includes("bound service account") || 
    errMsg.includes("deleted or disabled") || 
    errMsg.includes("UNAUTHENTICATED") || 
    errMsg.includes("ACCOUNT_STATE_INVALID") ||
    errMsg.includes("401")
  ) {
    return "Kunci API Gemini yang dikonfigurasi saat ini tidak valid atau dibatasi oleh Google Cloud Service Account. Silakan periksa kunci API Anda di menu Settings -> Secrets panel AI Studio. Pastikan Anda telah memasukkan kunci API eksternal yang aktif di variabel GEMINII_API_KEY (dengan dua huruf 'i').";
  }
  return error.message || "Terjadi kesalahan internal server.";
}

// Helper to scrape and clean HTML from a URL
async function scrapeUrl(url: string): Promise<{ title: string; text: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil halaman: HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract Title
    let title = "Artikel Tanpa Judul";
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/\s+/g, " ").trim();
    } else {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        title = h1Match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      }
    }

    // Clean up title (remove branding suffixes if common)
    title = title.split(" - ")[0].split(" | ")[0].trim();

    // Isolate body or main tag
    let body = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      body = bodyMatch[1];
    }

    // Strip unneeded components
    body = body.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    body = body.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    body = body.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, "");
    body = body.replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, "");
    body = body.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, "");
    body = body.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, "");
    body = body.replace(/<!--([\s\S]*?)-->/g, ""); // comments

    // Extract text from paragraphs if possible, otherwise strip all tags
    // Let's replace common block tags with newlines
    body = body.replace(/<\/p>|<\/div>|<\/h\d>|<\/li>|<\/tr>/gi, "\n");
    body = body.replace(/<[^>]+>/g, " ");

    // Decode HTML entities
    body = body
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&ldquo;/gi, '"')
      .replace(/&rdquo;/gi, '"');

    // Clean up spacing
    body = body.replace(/\n\s*\n+/g, "\n\n");
    body = body.replace(/[ \t]+/g, " ");
    body = body.trim();

    // Take max 30000 characters to prevent token overflows but preserve content
    if (body.length > 30000) {
      body = body.substring(0, 30000) + "... [Artikel dipotong karena terlalu panjang]";
    }

    if (!body || body.length < 100) {
      throw new Error("Konten teks artikel terlalu pendek atau gagal diekstrak.");
    }

    return { title, text: body };
  } catch (error: any) {
    console.error("Scraping error:", error);
    throw new Error(error.message || "Gagal menghubungkan ke URL artikel.");
  }
}

// Helper to quickly peek metadata (title, thumbnail, favicon)
async function peekUrl(url: string): Promise<{ title: string; thumbnail: string; favicon: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(5000), // Fast 5s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract Title
    let title = "Artikel Tanpa Judul";
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/\s+/g, " ").trim();
    } else {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        title = h1Match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      }
    }
    title = title.split(" - ")[0].split(" | ")[0].trim();

    // Extract Thumbnail (og:image)
    let thumbnail = "";
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      thumbnail = ogImageMatch[1];
    } else {
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        thumbnail = twitterImageMatch[1];
      }
    }

    // Try to get domain favicon
    let favicon = "";
    try {
      const urlObj = new URL(url);
      favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      // ignore
    }

    return { title, thumbnail, favicon };
  } catch (error) {
    console.error("Peek error:", error);
    let fallbackFavicon = "";
    try {
      const urlObj = new URL(url);
      fallbackFavicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {}
    return { title: "Menganalisis URL...", thumbnail: "", favicon: fallbackFavicon };
  }
}

// Endpoint 0: Peek URL Metadata
app.post("/api/peek", async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const limitCheck = checkRateLimit(ip, 15, 60000); // 15 requests per minute
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: "Terlalu banyak permintaan peek URL. Harap tunggu beberapa saat." });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL wajib diisi" });
    }
    const metadata = await peekUrl(url);
    res.json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gagal mengintip metadata URL." });
  }
});

// Helper to process uploaded file with iLovePDF OCR API or fallback
async function performILovePdfOCR(base64Data: string, filename: string, mimeType: string): Promise<{ pdfBase64?: string; method: "ilovepdf" | "gemini-fallback" }> {
  const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
  const secretKey = process.env.ILOVEPDF_SECRET_KEY;
  
  if (!publicKey || !secretKey) {
    console.log("[OCR Config] Kunci API iLovePDF tidak ditemukan. Menggunakan Fallback Gemini OCR.");
    return { method: "gemini-fallback" };
  }

  try {
    // Lazy import of the libraries to avoid crashes if keys are missing
    const { default: ILovePDF } = await import("@ilovepdf/ilovepdf-nodejs");
    const { default: ILovePDFFile } = await import("@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js");
    const ilovepdf = new ILovePDF(publicKey, secretKey);

    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Clean filename to prevent path traversal
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const tempFilePath = path.join(tempDir, `ocr_upload_${Date.now()}_${safeFilename}`);
    fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

    console.log(`[iLovePDF OCR] Memulai task 'pdfocr' untuk file: ${safeFilename}`);
    
    const task = (ilovepdf as any).newTask("pdfocr");
    await task.start();
    
    const file = new (ILovePDFFile as any)(tempFilePath);
    await task.addFile(file);
    
    // Process with default languages
    await task.process({ ocr_languages: ["ind", "eng"] });
    
    // Download the processed file as buffer
    const outputBuffer = await task.download();
    const processedBase64 = Buffer.from(outputBuffer).toString("base64");

    // Cleanup local files
    try {
      fs.unlinkSync(tempFilePath);
    } catch (err) {
      console.warn("Cleanup error:", err);
    }

    return {
      pdfBase64: processedBase64,
      method: "ilovepdf"
    };
  } catch (error: any) {
    console.error("[iLovePDF OCR Error] Gagal menggunakan iLovePDF OCR, beralih ke Fallback Gemini OCR. Error:", error.message || error);
    return { method: "gemini-fallback" };
  }
}

// Helper to extract text from a PDF or image file using Gemini's native multimodal capabilities
async function extractTextFromDocument(
  base64Data: string,
  mimeType: string,
  keyIndexUsed: number
): Promise<string> {
  console.log(`[Gemini OCR] Mengekstrak teks dari dokumen menggunakan Gemini dengan tipe: ${mimeType}`);
  
  let cleanMimeType = mimeType;
  if (!cleanMimeType) {
    cleanMimeType = "application/pdf";
  }

  const prompt = "Ekstrak seluruh teks penting secara utuh dan terstruktur dari dokumen/gambar ini tanpa mengubah maknanya. JANGAN berikan komentar pembuka, penutup, atau analisis tambahan. Jawab HANYA isi teks bersih dari artikel/jurnal/dokumen tersebut agar bisa dianalisis lebih lanjut.";

  const { response } = await generateContentWithFallback(keyIndexUsed, {
    model: "gemini-3.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    ]
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new Error("Gagal mengekstrak teks dari dokumen menggunakan AI.");
  }

  return text;
}

// Endpoint 1: Analyze URL or Text
app.post("/api/analyze", async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const limitCheck = checkRateLimit(ip, 5, 60000); // 5 analyses per minute
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: "Batas penganalisisan terlampaui. Anda hanya diizinkan menganalisis maksimal 5 artikel per menit." });
    }

    const { url, text: manualText, title: manualTitle, file, filename, mimeType } = req.body;
    let articleTitle = manualTitle || "Teks Manual";
    let articleText = manualText || "";
    let ocrMethodUsed: "ilovepdf" | "gemini-fallback" | "none" = "none";

    // Increment analysis session counter for key rotation early
    analysisSessionCounter++;
    // Alternates between Key index 1 and index 2
    const keyIndexUsed = (analysisSessionCounter % 2 === 0) ? 2 : 1;

    if (url) {
      const scraped = await scrapeUrl(url);
      articleTitle = scraped.title;
      articleText = scraped.text;
    } else if (file) {
      articleTitle = filename || "Dokumen Unggahan";
      try {
        const ocrResult = await performILovePdfOCR(file, filename || "document.pdf", mimeType || "application/pdf");
        ocrMethodUsed = ocrResult.method;
        
        const fileToExtract = ocrResult.pdfBase64 || file;
        const extractedMimeType = ocrResult.pdfBase64 ? "application/pdf" : (mimeType || "application/pdf");
        
        articleText = await extractTextFromDocument(fileToExtract, extractedMimeType, keyIndexUsed);
      } catch (ocrErr: any) {
        console.error("OCR / Extraction failed:", ocrErr);
        return res.status(500).json({ error: `Gagal mengekstrak teks dari dokumen: ${ocrErr.message || ocrErr}` });
      }
    }

    if (!articleText || articleText.trim().length === 0) {
      return res.status(400).json({ error: "Konten artikel tidak boleh kosong atau gagal diekstrak." });
    }

    // Caching check to prevent redundant API calls and 429 quota errors
    const cacheKey = url 
      ? `analyze_url_${url.trim().toLowerCase()}` 
      : file 
        ? `analyze_file_${filename}_${articleText.length}`
        : `analyze_text_${articleText.length}_${articleText.substring(0, 100)}`;
    
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log(`[Cache Hit] Mengembalikan hasil analisis dari cache untuk kunci: ${cacheKey}`);
      return res.json(cachedResult);
    }

    const activeAiClient = getGeminiClient(keyIndexUsed);

    // Call Gemini with Structured Schema
    const prompt = `Analisis artikel berikut dengan seksama. 
Judul: ${articleTitle}
Konten:
${articleText}

Instruksi Analisis:
1. Buat ringkasan yang solid, takeaways, dan highlights.
2. Temukan data numerik, statistik, metrik penting atau tanggal bersejarah di dalam artikel dan sertakan konteksnya.
3. Ekstrak 3-5 klaim utama yang dibuat di artikel ini, dan analisis kevalidan/dukungan bukti (validity) di dalam teks serta kutip poin kalimat yang mendukungnya.
4. Profil nada/gaya penulisan (tone) dalam bentuk persentase (analytical, opinionated, promotional, sensationalist, objective). Pastikan total nilai masuk akal (tidak harus berjumlah tepat 100%, tetapi merepresentasikan bobot masing-masing).
5. Buat 3 pertanyaan tindak lanjut cerdas berdasarkan artikel untuk memicu interaksi lanjutan.
6. Buat 3-4 saran topik pembicaraan/diskusi terbuka (discussionTopics) yang mendalam, menarik, dan relevan berdasarkan isi artikel/jurnal sebagai bahan diskusi hangat.`;

    const { response, finalKeyIndex } = await generateContentWithFallback(keyIndexUsed, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: {
              type: Type.OBJECT,
              properties: {
                takeaway: { type: Type.STRING, description: "Ringkasan super singkat 1-2 kalimat" },
                highlights: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "3-5 poin penting" 
                },
                fullText: { type: Type.STRING, description: "Ringkasan lengkap terstruktur" }
              },
              required: ["takeaway", "highlights", "fullText"]
            },
            metrics: {
              type: Type.ARRAY,
              description: "Angka, data statistik, metrik penting, atau tahun/tanggal penting beserta konteksnya",
              items: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING, description: "Angka atau nilai metrik (contoh: 85%, USD 10M, 2026)" },
                  label: { type: Type.STRING, description: "Nama metrik / label (contoh: Pertumbuhan target, Anggaran, Tahun Rilis)" },
                  context: { type: Type.STRING, description: "Konteks kalimat di mana angka ini muncul di artikel" }
                },
                required: ["value", "label", "context"]
              }
            },
            claims: {
              type: Type.ARRAY,
              description: "Klaim/argumen utama artikel beserta bukti pendukung",
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING, description: "Isi klaim utama" },
                  validity: { 
                    type: Type.STRING, 
                    description: "Status kevalidan: Terbukti Kuat / Campuran / Tidak Didukung / Opini Penulis" 
                  },
                  evidence: { type: Type.STRING, description: "Analisis singkat bukti pendukung yang ada di dalam teks" },
                  quote: { type: Type.STRING, description: "Kutipan langsung atau poin kalimat pendukung dari teks asli" }
                },
                required: ["claim", "validity", "evidence", "quote"]
              }
            },
            tone: {
              type: Type.OBJECT,
              properties: {
                profile: {
                  type: Type.OBJECT,
                  properties: {
                    analytical: { type: Type.INTEGER, description: "Bobot nada analitis/ilmiah (0-100)" },
                    opinionated: { type: Type.INTEGER, description: "Bobot opini subjektif (0-100)" },
                    promotional: { type: Type.INTEGER, description: "Bobot promosi/iklan/pemasaran (0-100)" },
                    sensationalist: { type: Type.INTEGER, description: "Bobot sensasional/klik-umpan (0-100)" },
                    objective: { type: Type.INTEGER, description: "Bobot objektif/netral/berita (0-100)" }
                  },
                  required: ["analytical", "opinionated", "promotional", "sensationalist", "objective"]
                },
                description: { type: Type.STRING, description: "Deskripsi singkat mengenai gaya bahasa dan target pembaca" }
              },
              required: ["profile", "description"]
            },
            questions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 pertanyaan cerdas lanjutan mengenai artikel"
            },
            discussionTopics: {
              type: Type.ARRAY,
              description: "3-4 saran topik diskusi terbuka yang mendalam dan menarik berdasarkan artikel sebagai bahan diskusi hangat",
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "Judul topik diskusi" },
                  description: { type: Type.STRING, description: "Latar belakang singkat atau alasan mengapa topik ini menarik dibahas" },
                  starterQuestions: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "2-3 pertanyaan pemantik diskusi untuk memicu tukar pikiran"
                  }
                },
                required: ["topic", "description", "starterQuestions"]
              }
            }
          },
          required: ["title", "summary", "metrics", "claims", "tone", "questions", "discussionTopics"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal menerima analisis terstruktur dari model AI.");
    }

    const analysis = JSON.parse(resultText);

    const responsePayload = {
      title: articleTitle,
      text: articleText,
      analysis,
      keyIndexUsed: finalKeyIndex, // Client preserves this to maintain same key for chat session
    };

    setCachedData(cacheKey, responsePayload);

    res.json(responsePayload);
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ error: formatGeminiError(error) });
  }
});

// Endpoint 2: Safe chat grounded in the article text (no hallucinations)
app.post("/api/chat", async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const limitCheck = checkRateLimit(ip, 15, 60000); // 15 chats per minute per IP
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: "Batas pengiriman chat terlampaui. Harap tunggu beberapa detik." });
    }

    const { chatHistory, message, articleText, articleTitle, keyIndexUsed } = req.body;

    if (!articleText || !message) {
      return res.status(400).json({ error: "Konten artikel dan pesan tidak boleh kosong." });
    }

    const systemInstruction = `Anda adalah asisten analisis artikel yang cerdas, objektif, dan sangat patuh.
Anda sedang berdiskusi mengenai artikel berjudul: "${articleTitle}".
Berikut adalah teks UTUH/ASLI dari artikel tersebut:
"""
${articleText}
"""

ATURAN PERCAKAPAN YANG SANGAT KETAT:
1. Anda HARUS menjawab pertanyaan pengguna HANYA berdasarkan fakta, data, dan informasi yang tertera dalam teks artikel di atas.
2. Jika informasi atau jawaban dari pertanyaan pengguna TIDAK ADA atau TIDAK TERCANTUM dalam teks artikel, Anda harus menjawab secara tegas dan sopan: "Informasi ini tidak tercantum dalam artikel." Jangan mengarang jawaban!
3. Jika pengguna menyuruh Anda berpendapat atau berasumsi ("menurut Anda", "bagaimana pendapatmu"), Anda BOLEH memberikan pendapat/asumsi namun harus di-anchor (dikaitkan langsung) dengan data atau premis yang ada di artikel tersebut. Beritahu pengguna secara jelas bahwa ini adalah ekstapolasi logis berdasarkan teks.
4. Hindari halusinasi informasi sama sekali. Berikan poin paragraf atau bagian dari teks jika pengguna menanyakan "poin dimana informasi tersebut".
5. Jawablah menggunakan bahasa yang sama dengan bahasa pertanyaan pengguna (secara default Bahasa Indonesia).`;

    // Map chat history to match the Gemini contents parameter structure
    const contents: any[] = [];
    
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const { response, finalKeyIndex } = await generateContentWithFallback(keyIndexUsed || 1, {
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature to minimize creative hallucinations
      }
    });

    res.json({ 
      text: response.text,
      keyIndexUsed: finalKeyIndex 
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: formatGeminiError(error) });
  }
});

// Endpoint 3: Real-Time News & Topic Search with Google Search Grounding
app.post("/api/search", async (req, res) => {
  try {
    const ip = req.ip || "unknown";
    const limitCheck = checkRateLimit(ip, 5, 60000); // 5 search queries per minute
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: "Batas pencarian terlampaui. Harap tunggu beberapa saat." });
    }

    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Isi kueri pencarian tidak boleh kosong." });
    }

    // Caching check to prevent redundant API calls and 429 quota errors
    const cacheKey = `search_${query.trim().toLowerCase()}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log(`[Cache Hit] Mengembalikan hasil pencarian dari cache untuk kunci: ${cacheKey}`);
      return res.json(cachedResult);
    }

    // Increment analysis session counter for key rotation
    analysisSessionCounter++;
    const keyIndexUsed = (analysisSessionCounter % 2 === 0) ? 2 : 1;
    const activeAiClient = getGeminiClient(keyIndexUsed);

    // Prompt Gemini with Google Search Grounding to find, analyze, and format
    const prompt = `Lakukan pencarian web real-time tentang isu atau tren berikut: "${query}"
Cari minimal 3 sumber berita atau situs terpercaya yang membahas isu ini secara mendalam.
Analisis data dan kompilasi temuan Anda menjadi output terstruktur berikut:
1. Berikan judul ringkas yang mencerminkan topik pencarian.
2. Buat ringkasan yang solid (takeaway, highlights, dan ringkasan lengkap) mengenai status isu/berita ini sekarang.
3. Cantumkan minimal 3 sumber berita yang Anda temukan (sumber asli yang valid beserta URL dan judul artikel/portal beritanya) ke dalam daftar "sources".
4. Temukan data angka, statistik, atau tanggal penting yang relevan di dalam temuan pencarian tersebut.
5. Ekstrak klaim-klaim utama dari isu/berita tersebut, analisis kevalidan klaim tersebut (apakah terbukti fakta, rumor, hoax, atau opini), jelaskan buktinya, dan sertakan kutipan penjelasannya.
6. Profil nada bahasa atau gaya pemberitaan media mengenai isu ini (apakah cenderung analitis, subjektif, promosional, sensasional/klik-bait, atau objektif/netral).
7. Buat 3 pertanyaan lanjutan cerdas yang relevan dengan topik ini.`;

    const { response, finalKeyIndex } = await generateContentWithFallback(keyIndexUsed, {
      model: "gemini-3.5-flash", // gemini-3.5-flash supports Google Search tool grounding
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Judul analisis topik tren" },
            sources: {
              type: Type.ARRAY,
              description: "Daftar minimal 3 sumber berita/web asli yang ditemukan dalam pencarian Google Search",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Judul berita atau nama portal media (contoh: Detikcom - Pocong Bawa Parang Ditangkap)" },
                  url: { type: Type.STRING, description: "URL lengkap situs web sumber (contoh: https://news.detik.com/...)" },
                  snippet: { type: Type.STRING, description: "Ringkasan singkat informasi dari sumber tersebut" }
                },
                required: ["title", "url"]
              }
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                takeaway: { type: Type.STRING, description: "Ringkasan super singkat 1-2 kalimat" },
                highlights: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "3-5 poin penting" 
                },
                fullText: { type: Type.STRING, description: "Sintesis lengkap dari berbagai sumber mengenai isu ini" }
              },
              required: ["takeaway", "highlights", "fullText"]
            },
            metrics: {
              type: Type.ARRAY,
              description: "Angka, data statistik, metrik penting, atau tahun/tanggal penting beserta konteksnya",
              items: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING, description: "Angka atau nilai metrik (contoh: 3 Tersangka, 11 Juli 2026, Rp 50 Juta)" },
                  label: { type: Type.STRING, description: "Nama metrik / label (contoh: Pelaku ditangkap, Tanggal kejadian, Kerugian)" },
                  context: { type: Type.STRING, description: "Konteks kalimat di mana angka atau tanggal ini muncul di berita" }
                },
                required: ["value", "label", "context"]
              }
            },
            claims: {
              type: Type.ARRAY,
              description: "Klaim/argumen utama yang beredar mengenai isu ini beserta analisis kebenaran/kevalidannya",
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING, description: "Isi klaim atau berita yang beredar" },
                  validity: { 
                    type: Type.STRING, 
                    description: "Status kevalidan: Terbukti Fakta / Rumor / Hoax & Disinformasi / Opini Publik" 
                  },
                  evidence: { type: Type.STRING, description: "Analisis singkat bukti dari sumber-sumber tepercaya mengenai klaim tersebut" },
                  quote: { type: Type.STRING, description: "Pernyataan klarifikasi dari kepolisian, otoritas, atau kutipan media kredibel" }
                },
                required: ["claim", "validity", "evidence", "quote"]
              }
            },
            tone: {
              type: Type.OBJECT,
              properties: {
                profile: {
                  type: Type.OBJECT,
                  properties: {
                    analytical: { type: Type.INTEGER, description: "Bobot nada analitis/ilmiah (0-100)" },
                    opinionated: { type: Type.INTEGER, description: "Bobot opini subjektif (0-100)" },
                    promotional: { type: Type.INTEGER, description: "Bobot promosi/iklan/pemasaran (0-100)" },
                    sensationalist: { type: Type.INTEGER, description: "Bobot sensasional/klik-umpan (0-100)" },
                    objective: { type: Type.INTEGER, description: "Bobot objektif/netral/berita (0-100)" }
                  },
                  required: ["analytical", "opinionated", "promotional", "sensationalist", "objective"]
                },
                description: { type: Type.STRING, description: "Deskripsi singkat mengenai suasana pemberitaan di media" }
              },
              required: ["profile", "description"]
            },
            questions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 pertanyaan cerdas lanjutan mengenai topik ini"
            }
          },
          required: ["title", "sources", "summary", "metrics", "claims", "tone", "questions"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal menerima analisis terstruktur dari pencarian Google.");
    }

    const analysis = JSON.parse(resultText);

    const responsePayload = {
      title: analysis.title || `Analisis Tren: ${query}`,
      text: analysis.summary.fullText, // Use synthesized full text as text
      analysis: analysis,
      isSearchMode: true,
      sources: analysis.sources || [],
      keyIndexUsed: finalKeyIndex,
    };

    setCachedData(cacheKey, responsePayload);

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Search API error:", error);
    res.status(500).json({ error: formatGeminiError(error) });
  }
});

// Setup Vite Dev Server / Static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite dev server middleware.");
  } else if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from dist.");
  }

  // Only listen on port if not running in a serverless environment like Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`AI Article Analyzer running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;

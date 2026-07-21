import { jsPDF } from "jspdf";
import { ArticleData } from "../types";

export function generateAnalysisPDF(data: ArticleData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { title, text, analysis } = data;
  const { summary, metrics, claims, tone, discussionTopics } = analysis;

  let pageCount = 1;
  let y = 25;
  const margin = 20;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw Header on each page
  function drawHeader() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("VERITAS KNOWLEDGE PLATFORM - GROUNDED REASONING REPORT", margin, 12);
    
    // Thin gold accent line
    doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  }

  // Helper to draw Footer on each page
  function drawFooter() {
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Sintesis & Validasi AI oleh Veritas Grounded Context Engine v3.5", margin, pageHeight - 10);
    doc.text(`Halaman ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Page break checker
  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageCount++;
      y = 25; // Reset y for the new page
      drawHeader();
    }
  }

  // Multi-line text drawing helper with automatic page breaks
  function printParagraph(
    paragraphText: string,
    options: {
      fontSize?: number;
      style?: "normal" | "bold" | "italic" | "bolditalic";
      textColor?: [number, number, number];
      lineSpacing?: number;
      indent?: number;
    } = {}
  ) {
    const {
      fontSize = 10,
      style = "normal",
      textColor = [30, 41, 59], // Slate-800
      lineSpacing = 5.5,
      indent = 0,
    } = options;

    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const availableWidth = contentWidth - indent;
    const lines = doc.splitTextToSize(paragraphText, availableWidth);
    
    for (const line of lines) {
      checkPageBreak(lineSpacing);
      doc.text(line, margin + indent, y);
      y += lineSpacing;
    }
  }

  // DRAW THE FIRST PAGE HEADER
  drawHeader();

  // COVER / DOCUMENT TITLE BANNER
  y = 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55); // Gold Accent
  doc.text("DOKUMEN HASIL ANALISIS ILMIAH", margin, y);
  y += 5;

  // Title of the report
  printParagraph(`LAPORAN VERIFIKASI: ${title}`, {
    fontSize: 16,
    style: "bold",
    textColor: [15, 23, 42], // Slate-900
    lineSpacing: 7,
  });
  y += 2;

  // Timestamp & Metadata Row
  const nowStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Waktu Analisis: ${nowStr} WIB`, margin, y);
  
  const modeText = data.isSearchMode ? "Mode Verifikasi Real-Time (Live Search)" : "Analisis Ekstraksi Dokumen";
  doc.text(`Tipe Pipeline: ${modeText}`, pageWidth - margin, y, { align: "right" });
  y += 6;

  // Thick accent line separating title and content
  doc.setDrawColor(15, 23, 42); // Slate-900
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // 1. EXECUTIVE SUMMARY (KESIMPULAN INTI)
  printParagraph("1. KESIMPULAN INTI (EXECUTIVE SUMMARY)", {
    fontSize: 12,
    style: "bold",
    textColor: [15, 23, 42],
  });
  y += 2;

  // Draw Takeaway as an indented gold card quote block
  const startYTakeaway = y;
  printParagraph(summary.takeaway, {
    fontSize: 10,
    style: "bolditalic",
    textColor: [15, 23, 42],
    indent: 6,
    lineSpacing: 5.5,
  });
  
  // Draw the vertical gold accent bar alongside the takeaway
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.line(margin + 1, startYTakeaway - 3, margin + 1, y - 2);
  y += 4;

  // Highlights Bullets
  printParagraph("POIN-POIN UTAMA PENELITIAN:", {
    fontSize: 9,
    style: "bold",
    textColor: [100, 116, 139],
  });
  y += 2;

  for (const hl of summary.highlights) {
    printParagraph(`-  ${hl}`, {
      fontSize: 9.5,
      style: "normal",
      textColor: [30, 41, 59],
      indent: 4,
      lineSpacing: 5,
    });
  }
  y += 5;

  // Full Summary Text
  printParagraph("DESKRIPSI SINTESIS PENGETAHUAN:", {
    fontSize: 9,
    style: "bold",
    textColor: [100, 116, 139],
  });
  y += 2;

  printParagraph(summary.fullText, {
    fontSize: 9.5,
    style: "normal",
    textColor: [51, 65, 85],
    lineSpacing: 5.5,
  });
  y += 8;

  // 2. CREDIBILITY METRICS (PARAMETER KREDIBILITAS)
  checkPageBreak(35);
  printParagraph("2. PARAMETER KREDIBILITAS ARTIKEL", {
    fontSize: 12,
    style: "bold",
    textColor: [15, 23, 42],
  });
  y += 3;

  for (const m of metrics) {
    checkPageBreak(18);
    // Print label and percentage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(212, 175, 55); // Gold for label
    doc.text(m.label, margin, y);
    
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, pageWidth - margin, y, { align: "right" });
    y += 5;

    // Context description
    printParagraph(m.context, {
      fontSize: 9,
      style: "normal",
      textColor: [100, 116, 139],
      indent: 4,
      lineSpacing: 4.5,
    });
    y += 3;
  }
  y += 5;

  // 3. CLAIMS INSPECTOR (ANALISIS KLAIM & BUKTI UTAMA)
  checkPageBreak(30);
  printParagraph("3. CLAIMS INSPECTOR (VERIFIKASI ARGUMEN UTAMA)", {
    fontSize: 12,
    style: "bold",
    textColor: [15, 23, 42],
  });
  y += 3;

  claims.forEach((claim, index) => {
    checkPageBreak(35);
    
    // Claim Title + Index
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Klaim #${index + 1}:`, margin, y);
    
    // Validity Tag to the right
    doc.setTextColor(212, 175, 55);
    doc.text(`[${claim.validity.toUpperCase()}]`, pageWidth - margin, y, { align: "right" });
    y += 5;

    // Claim Text
    printParagraph(claim.claim, {
      fontSize: 10,
      style: "bold",
      textColor: [30, 41, 59],
      indent: 4,
      lineSpacing: 5,
    });
    y += 1.5;

    // Veritas analysis evidence
    printParagraph(`Analisis Validitas: ${claim.evidence}`, {
      fontSize: 9,
      style: "normal",
      textColor: [71, 85, 105],
      indent: 6,
      lineSpacing: 4.5,
    });
    y += 1.5;

    // Verbatim Quote in Italic Quote Card
    const startQuoteY = y;
    printParagraph(`"${claim.quote}"`, {
      fontSize: 8.5,
      style: "italic",
      textColor: [100, 116, 139],
      indent: 10,
      lineSpacing: 4,
    });

    // Vertical line beside quote
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.6);
    doc.line(margin + 7, startQuoteY - 2.5, margin + 7, y - 2);
    y += 4;
  });
  y += 4;

  // 4. STYLE & OBJECTIVITY ANALYSIS (GAYA PENULISAN)
  checkPageBreak(30);
  printParagraph("4. GAYA & OBJEKTIVITAS PENULISAN", {
    fontSize: 12,
    style: "bold",
    textColor: [15, 23, 42],
  });
  y += 3;

  printParagraph(tone.description, {
    fontSize: 9.5,
    style: "normal",
    textColor: [51, 65, 85],
    lineSpacing: 5,
  });
  y += 3;

  const toneMetrics = [
    { label: "Analitis / Akademik", value: `${tone.profile.analytical}%` },
    { label: "Objektif / Netral", value: `${tone.profile.objective}%` },
    { label: "Opini Subjektif", value: `${tone.profile.opinionated}%` },
    { label: "Sensasional / Click-bait", value: `${tone.profile.sensationalist}%` },
    { label: "Promosional / Iklan", value: `${tone.profile.promotional}%` },
  ];

  for (const tm of toneMetrics) {
    checkPageBreak(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tm.label, margin, y);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.text(tm.value, pageWidth - margin, y, { align: "right" });
    y += 4.5;
  }
  y += 6;

  // 5. DISCUSSION TOPICS & QUESTIONS
  if (discussionTopics && discussionTopics.length > 0) {
    checkPageBreak(30);
    printParagraph("5. BAHAN KAJIAN & TOPIK DISKUSI AKADEMIS", {
      fontSize: 12,
      style: "bold",
      textColor: [15, 23, 42],
    });
    y += 3;

    discussionTopics.forEach((topicItem, index) => {
      checkPageBreak(25);
      printParagraph(`Topik Diskusi #${index + 1}: ${topicItem.topic}`, {
        fontSize: 10,
        style: "bold",
        textColor: [15, 23, 42],
      });
      y += 1;

      printParagraph(topicItem.description, {
        fontSize: 9,
        style: "normal",
        textColor: [71, 85, 105],
        indent: 4,
        lineSpacing: 4.5,
      });
      y += 2;

      // Starter questions
      printParagraph("Pertanyaan Pemantik Sesi Diskusi:", {
        fontSize: 8.5,
        style: "bold",
        textColor: [100, 116, 139],
        indent: 4,
      });
      y += 1;

      topicItem.starterQuestions.forEach((q) => {
        printParagraph(`- ${q}`, {
          fontSize: 9,
          style: "normal",
          textColor: [51, 65, 85],
          indent: 8,
          lineSpacing: 4.5,
        });
      });
      y += 3;
    });
  }

  // Draw the footer on the final page
  drawFooter();

  // Save the document using safe, formatted naming
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .substring(0, 40);
  doc.save(`veritas_analisis_${sanitizedTitle || "artikel"}_${Date.now()}.pdf`);
}

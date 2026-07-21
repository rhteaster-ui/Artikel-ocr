import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, MessageSquare, ShieldCheck, Copy, Check, MessageCircle, ArrowRight } from "lucide-react";
import { ChatMessage } from "../types";

interface InteractiveChatProps {
  chatHistory: ChatMessage[];
  suggestedQuestions: string[];
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

export default function InteractiveChat({
  chatHistory,
  suggestedQuestions,
  onSendMessage,
  isSending,
}: InteractiveChatProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const message = input.trim();
    setInput("");
    onSendMessage(message);
  };

  const handleSuggestedClick = (q: string) => {
    if (isSending) return;
    onSendMessage(q);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const safeFormatDate = (timestamp: any): string => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Custom Markdown & Link parser helper
  const renderFormattedMessage = (text: string) => {
    if (!text) return null;

    // Split content by code blocks: ```code```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // If it's a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeLines = part.slice(3, -3).trim().split("\n");
        let language = "";
        let codeContent = codeLines.join("\n");
        if (codeLines.length > 0 && /^[a-zA-Z0-9+#-]+$/.test(codeLines[0])) {
          language = codeLines[0];
          codeContent = codeLines.slice(1).join("\n");
        }

        return (
          <div key={index} className="my-2.5 rounded-xl overflow-hidden border border-brand-surface bg-brand-bg font-mono text-[11px]">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-brand-surface/85 border-b border-brand-surface text-brand-muted text-[9px] font-bold select-none uppercase tracking-wider">
              <span>{language || "code block"}</span>
              <button
                type="button"
                onClick={() => handleCopyText(codeContent, `code-${index}`)}
                className="hover:text-brand-primary transition-colors flex items-center gap-1 active:scale-95"
              >
                {copiedId === `code-${index}` ? (
                  <>
                    <Check className="w-3 h-3 text-brand-success" />
                    <span className="text-brand-success">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-brand-text/90 whitespace-pre">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Process normal text lines (bold, links, lists)
      const lines = part.split("\n");
      return lines.map((line, lineIdx) => {
        const trimmedLine = line.trim();
        // Check if list item
        const isListItem = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
        const listContent = isListItem ? line.replace(/^[-*]\s+/, "") : line;

        // Custom inline formatter for bold **text** and raw URLs
        const formatInline = (str: string) => {
          // Tokenize by bold tags first **text**
          const boldParts = str.split(/(\*\*.*?\*\*)/g);

          return boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith("**") && bPart.endsWith("**")) {
              const boldText = bPart.slice(2, -2);
              return (
                <strong key={bIdx} className="font-bold text-brand-primary">
                  {boldText}
                </strong>
              );
            }

            // Split by URLs
            const urlParts = bPart.split(/(https?:\/\/[^\s()[\]{}'"]+)/g);
            return urlParts.map((uPart, uIdx) => {
              if (uPart.startsWith("http://") || uPart.startsWith("https://")) {
                return (
                  <a
                    key={uIdx}
                    href={uPart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-secondary underline font-semibold inline-flex items-center break-all"
                  >
                    {uPart}
                  </a>
                );
              }
              return uPart;
            });
          });
        };

        if (isListItem) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1">
              <span className="text-brand-primary font-bold select-none">•</span>
              <span className="flex-1 text-brand-text/95">{formatInline(listContent)}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className={trimmedLine === "" ? "h-2" : "my-0.5 leading-relaxed text-brand-text/95"}>
            {formatInline(line)}
          </p>
        );
      });
    });
  };

  return (
    <div id="interactive-chat-panel" className="bg-brand-surface border border-brand-surface/80 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-brand-bg flex items-center justify-between bg-brand-bg/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-brand-text">Diskusi Pintar AI</h3>
            <p className="text-[10px] text-brand-muted flex items-center gap-1 mt-0.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
              Grounded Verification Active
            </p>
          </div>
        </div>
        <span className="text-[8px] font-bold font-mono bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-md border border-brand-primary/25 uppercase">
          Safe Mode
        </span>
      </div>

      {/* Messages List */}
      <div id="chat-messages-viewport" className="flex-1 overflow-y-auto p-5 space-y-4 bg-brand-bg/30">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mb-3.5">
              <MessageCircle className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-brand-text">Mulai Obrolan Verifikasi</p>
            <p className="text-xs text-brand-muted max-w-xs mt-1.5 leading-relaxed">
              Tanyakan klaim spesifik, saring pembuktian data rujukan, atau lacak keaslian kesimpulan langsung pada bot penelaah kami.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                id={`chat-msg-${msg.id}`}
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-lg border relative group ${
                    msg.role === "user"
                      ? "bg-brand-surface border-brand-primary/20 text-brand-text rounded-tr-none"
                      : "bg-brand-bg border-brand-surface/80 text-brand-text rounded-tl-none"
                  }`}
                >
                  <div className="pb-1.5 selectable-text">{renderFormattedMessage(msg.text)}</div>
                  
                  {/* Footer metadata & Copy button */}
                  <div className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[9px] font-mono uppercase tracking-wider ${
                    msg.role === "user" ? "border-brand-primary/10 text-brand-muted/50" : "border-brand-surface text-brand-muted/50"
                  }`}>
                    <span>{safeFormatDate(msg.timestamp)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="hover:text-brand-primary transition-colors flex items-center gap-1 active:scale-95 px-1 py-0.5 rounded"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-brand-success" />
                          <span className="text-brand-success font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-brand-muted/60" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading AI reply */}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-brand-bg border border-brand-surface rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              <span className="text-xs text-brand-muted font-bold font-mono uppercase tracking-wider">Veritas sedang menelaah...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions && suggestedQuestions.length > 0 && chatHistory.length === 0 && (
        <div id="suggested-questions-panel" className="px-5 py-3.5 border-t border-brand-bg bg-brand-surface/40">
          <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest block mb-2 font-mono">
            Saran Pertanyaan Pemantik:
          </span>
          <div className="flex flex-col gap-1.5">
            {suggestedQuestions.slice(0, 3).map((q, idx) => (
              <button
                id={`suggested-q-${idx}`}
                key={idx}
                type="button"
                onClick={() => handleSuggestedClick(q)}
                disabled={isSending}
                className="text-left text-xs text-brand-text bg-brand-surface/60 hover:bg-brand-surface hover:text-brand-primary transition-all px-3.5 py-2.5 rounded-xl border border-brand-surface hover:border-brand-primary/20 truncate active:scale-[0.99] font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-brand-bg bg-brand-surface flex gap-2">
        <input
          id="chat-input-field"
          type="text"
          placeholder="Tanyakan analisis bukti atau validitas klaim..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-3 border border-brand-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/50 transition-all text-xs bg-brand-bg/60 text-brand-text placeholder:text-brand-muted/30"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || isSending}
          className="w-11 h-11 rounded-xl bg-brand-primary text-brand-bg flex items-center justify-center hover:bg-brand-primary/95 disabled:opacity-40 disabled:pointer-events-none transition-all flex-shrink-0 border border-brand-secondary/20 shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

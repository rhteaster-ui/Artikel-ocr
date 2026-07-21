import React from "react";
import { motion } from "motion/react";
import { BarChart3, HelpCircle } from "lucide-react";
import { ArticleMetric } from "../types";

interface VisualMetricsProps {
  metrics: ArticleMetric[];
}

export default function VisualMetrics({ metrics }: VisualMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div id="no-metrics-card" className="bg-brand-surface border border-brand-surface/80 rounded-2xl p-6 text-center shadow-lg">
        <div className="mx-auto w-10 h-10 rounded-xl bg-brand-surface/80 flex items-center justify-center text-brand-primary border border-brand-surface mb-3">
          <BarChart3 className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-brand-text">Tidak Ada Data Numerik Signifikan</p>
        <p className="text-xs text-brand-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
          Artikel ini cenderung bersifat kualitatif atau tidak mencantumkan data statistik atau angka numerik yang signifikan.
        </p>
      </div>
    );
  }

  return (
    <div id="metrics-bento-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((metric, idx) => (
        <motion.div
          id={`metric-card-${idx}`}
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="bg-brand-surface border border-brand-surface/80 p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:border-brand-primary/30 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xl font-black text-brand-primary tracking-tight font-mono group-hover:text-brand-secondary transition-colors">
                {metric.value}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-brand-bg text-brand-primary/90 font-mono border border-brand-surface">
                Metrik
              </span>
            </div>
            <p className="text-xs font-bold text-brand-text mt-3 line-clamp-2 leading-snug">
              {metric.label}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-surface/60 text-xs text-brand-muted/80 italic line-clamp-3 leading-relaxed">
            &ldquo;{metric.context}&rdquo;
          </div>
        </motion.div>
      ))}
    </div>
  );
}

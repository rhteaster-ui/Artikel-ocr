import { ArticleData } from "../types";

export interface HistoryItem {
  id: string;
  title: string;
  takeaway: string;
  timestamp: number;
  data: ArticleData;
}

const HISTORY_KEY = "veritas_analysis_history";

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading history from localStorage:", error);
    return [];
  }
}

export function saveToHistory(data: ArticleData): HistoryItem[] {
  try {
    const history = getHistory();
    // Prevent duplicate entries by title
    const filteredHistory = history.filter(
      (item) => item.title.trim().toLowerCase() !== data.title.trim().toLowerCase()
    );

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: data.title,
      takeaway: data.analysis?.summary?.takeaway || "Analisis Berhasil",
      timestamp: Date.now(),
      data,
    };

    const updated = [newItem, ...filteredHistory].slice(0, 10); // keep max 10 entries
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Error saving to history:", error);
    return getHistory();
  }
}

export function deleteFromHistory(id: string): HistoryItem[] {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Error deleting history item:", error);
    return getHistory();
  }
}

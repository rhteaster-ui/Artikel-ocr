import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Client-Side Security Shield: Mitigate reverse-engineering, inspecting, and content copying
(() => {
  if (typeof window === "undefined") return;

  // 1. Disable Right-Click Context Menu
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Disable Key Shortcuts (F12, DevTools, View Source, Print, Save)
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // F12
    if (key === "F12") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspect Element)
    // Ctrl+Shift+J / Cmd+Opt+J (Console)
    // Ctrl+Shift+C / Cmd+Opt+C (Element Selector)
    if (isCtrlOrCmd && isShift && (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c")) {
      e.preventDefault();
      return false;
    }
    if (isCtrlOrCmd && isAlt && (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c")) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U / Cmd+Opt+U (View Source)
    if (isCtrlOrCmd && (key === "U" || key === "u")) {
      e.preventDefault();
      return false;
    }
    if (isCtrlOrCmd && isAlt && (key === "U" || key === "u")) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S / Cmd+S (Save)
    if (isCtrlOrCmd && (key === "S" || key === "s")) {
      e.preventDefault();
      return false;
    }

    // Ctrl+P / Cmd+P (Print)
    if (isCtrlOrCmd && (key === "P" || key === "p")) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 3. Disable Dragging of Images or Links to prevent easy assets harvesting
  document.addEventListener("dragstart", (e) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "IMG" || target.tagName === "A")) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 4. Clean and neutralize standard Console to stop code injection attempts
  const warningMsg = "Keamanan Veritas: Akses konsol dan debugging dinonaktifkan.";
  const clearConsole = () => {
    try {
      console.clear();
    } catch {}
  };

  // Override logging mechanisms
  const dummyLog = () => {
    clearConsole();
    return warningMsg;
  };

  window.console.log = dummyLog;
  window.console.info = dummyLog;
  window.console.warn = dummyLog;
  window.console.error = dummyLog;
  window.console.debug = dummyLog;

  // Clear console initially and on interval
  setInterval(clearConsole, 1000);

  // 5. Anti-Debugger Trap: Run infinite debugging loops to freeze browser dev tools if opened
  const antiDebugTrap = function() {
    function trap(i: number) {
      if (("" + i / i).length !== 1 || i % 20 === 0) {
        (function() {}.constructor("debugger")());
      } else {
        (function() {}.constructor("debugger")());
      }
      trap(++i);
    }
    try {
      trap(0);
    } catch {}
  };

  // Run the trap in a non-blocking background worker interval or direct interval
  setInterval(() => {
    try {
      antiDebugTrap();
    } catch {}
  }, 1500);
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Clean service worker and caches to ensure latest updates are loaded immediately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

if ('caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}

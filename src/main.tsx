import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import { LanguageProvider } from "./context/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

if (import.meta.env.DEV) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Dev ServiceWorker registration skipped or failed:", error);
    });
  }
} else {
  try {
    registerSW({
      immediate: true,
      onRegisterError(error) {
        console.warn("ServiceWorker registration skipped or failed:", error);
      },
    });
  } catch (e) {
    console.warn("Could not register ServiceWorker:", e);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
